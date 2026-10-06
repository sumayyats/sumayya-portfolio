"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MotionStageSpec } from "@/content/types";
import { buildTimeline, type Timeline } from "./timeline";
import { scenes } from "./registry";
import "./stages.css";

type Props = {
  spec: MotionStageSpec;
  /** Thumbnail use (Next on the shelf): no caption, no controls. */
  compact?: boolean;
  className?: string;
};

/**
 * A media card that plays its scene while it's on screen, like a muted
 * looping video: it starts when half of it is in view and pauses when it
 * leaves. The pause button (and Space/Enter when focused) stops it for good
 * — motion that runs longer than five seconds needs a way to stop it.
 * Reduced motion shows the still frame, with the finished one on request.
 */
export function MotionStage({ spec, compact = false, className = "" }: Props) {
  const entry = scenes[spec.id];
  const reduce = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tl = useRef<Timeline | null>(null);
  const raf = useRef(0);

  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false); // by the reader
  const [showFinal, setShowFinal] = useState(false);

  // Mount the scene only near the viewport; play only while it's in view.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
      rootMargin: "600px 0px",
    });
    const viewObs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.5,
    });
    nearObs.observe(el);
    viewObs.observe(el);
    return () => {
      nearObs.disconnect();
      viewObs.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!near || !entry || !sceneRef.current) return;
    tl.current = buildTimeline(sceneRef.current, entry.def);
    // dev: let a debugger scrub the scene (`$0.__stage.seek(ms)`)
    if (process.env.NODE_ENV !== "production")
      (sceneRef.current as HTMLElement & { __stage?: Timeline }).__stage = tl.current;
    return () => {
      tl.current?.destroy();
      tl.current = null;
    };
  }, [near, entry]);

  const playing = Boolean(entry) && !reduce && inView && !paused;

  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    if (playing) {
      t.play();
      const loop = () => {
        t.sync();
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf.current);
    }
    t.pause();
  }, [playing, near]);

  useEffect(() => {
    if (!reduce || !entry) return;
    tl.current?.seek(showFinal ? entry.def.finalAt : 0);
  }, [reduce, showFinal, entry, near]);

  const toggle = useCallback(() => setPaused((p) => !p), []);
  const Scene = entry?.Scene;
  // TODO(phase 4): scenes not built yet stay off the page rather than show an empty card
  if (!entry) return null;

  return (
    <figure className={`motion-stage ${className}`}>
      <div
        ref={frameRef}
        role="img"
        aria-label={`${spec.stillAlt} ${spec.summary}`}
        className={`stage-frame stage-frame--${spec.id.split("-")[0]} relative overflow-hidden`}
      >
        <div ref={sceneRef} className="stage-scene" aria-hidden="true">
          {Scene && near ? <Scene /> : <div className="stage-pending" />}
        </div>
      </div>

      {!compact && (
        <figcaption className="mt-3 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          <span>{spec.title}</span>
          {entry &&
            (reduce ? (
              <button
                type="button"
                onClick={() => setShowFinal((v) => !v)}
                aria-pressed={showFinal}
                className="shrink-0 rounded underline decoration-dotted underline-offset-4 hover:text-ink"
              >
                {showFinal ? "Show still frame" : "Show final frame"}
              </button>
            ) : (
              <button
                type="button"
                onClick={toggle}
                aria-label={paused ? `Play: ${spec.title}` : `Pause: ${spec.title}`}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-edge text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
              >
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" fill="currentColor">
                  {paused ? <path d="M3 1.8v8.4L10 6z" /> : <path d="M2.5 1.5h2.4v9H2.5zM7.1 1.5h2.4v9H7.1z" />}
                </svg>
              </button>
            ))}
        </figcaption>
      )}
    </figure>
  );
}
