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
 * A media card whose scene is still until you hover it, and plays only
 * while you do. On touch, a tap plays and pauses; on a keyboard, focus
 * plays it and Enter/Space toggles. It also stops if it scrolls out of view.
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
  const [active, setActive] = useState(false); // hovered, tapped or focused
  const [showFinal, setShowFinal] = useState(false);

  // Mount the scene only near the viewport; stop it when it leaves.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
      rootMargin: "600px 0px",
    });
    const viewObs = new IntersectionObserver(([e]) => !e.isIntersecting && setActive(false), {
      threshold: 0.2,
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

  const playing = Boolean(entry) && !reduce && active;

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

  const toggle = useCallback(() => setActive((a) => !a), []);
  const canPlay = Boolean(entry) && !reduce;
  const Scene = entry?.Scene;
  // TODO(phase 4): scenes not built yet stay off the page rather than show an empty card
  if (!entry) return null;

  return (
    <figure className={`motion-stage ${className}`}>
      <div
        ref={frameRef}
        role="img"
        aria-label={`${spec.stillAlt} ${spec.summary}`}
        tabIndex={canPlay ? 0 : undefined}
        onPointerEnter={(e) => e.pointerType === "mouse" && canPlay && setActive(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setActive(false)}
        onClick={(e) => (e.nativeEvent as PointerEvent).pointerType !== "mouse" && canPlay && toggle()}
        onFocus={(e) => canPlay && e.currentTarget.matches(":focus-visible") && setActive(true)}
        onBlur={() => setActive(false)}
        onKeyDown={(e) => {
          if (!canPlay) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          } else if (e.key === "Escape") setActive(false);
        }}
        className={`stage-frame stage-frame--${spec.id.split("-")[0]} relative overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper`}
      >
        <div ref={sceneRef} className="stage-scene" aria-hidden="true">
          {Scene && near ? <Scene /> : <div className="stage-pending" />}
        </div>
        {canPlay && !compact && (
          <span
            aria-hidden="true"
            className={`stage-chip transition-opacity duration-300 ${playing ? "opacity-0" : "opacity-100"}`}
          >
            <span>▶</span>
            <span className="stage-chip__mouse">Hover to play</span>
            <span className="stage-chip__touch">Tap to play</span>
          </span>
        )}
      </div>

      {!compact && (
        <figcaption className="mt-3 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          <span>{spec.title}</span>
          {reduce && entry && (
            <button
              type="button"
              onClick={() => setShowFinal((v) => !v)}
              aria-pressed={showFinal}
              className="shrink-0 rounded underline decoration-dotted underline-offset-4 hover:text-ink"
            >
              {showFinal ? "Show still frame" : "Show final frame"}
            </button>
          )}
        </figcaption>
      )}
    </figure>
  );
}
