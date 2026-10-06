"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { MotionStageSpec } from "@/content/types";
import { buildTimeline, type Timeline } from "./timeline";
import { scenes } from "./registry";
import "./stages.css";

const PLAY_EVENT = "motionstage:play";

const noSub = () => () => {};
const subHover = (cb: () => void) => {
  const mq = window.matchMedia("(hover: none)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
/** True on touch-first devices (no hover). */
const useTouch = () =>
  useSyncExternalStore(subHover, () => window.matchMedia("(hover: none)").matches, () => false);
const useMounted = () => useSyncExternalStore(noSub, () => true, () => false);

type Props = {
  spec: MotionStageSpec;
  /** Jump back to the still frame on leave, instead of pausing where it is. */
  resetOnLeave?: boolean;
  /** Thumbnail use (Next on the shelf): no caption, no page dim. */
  compact?: boolean;
  className?: string;
};

/**
 * Wraps every scene and owns its behaviour, so a scene only describes its
 * animation. Still until hovered (tapped on touch, focused on a keyboard),
 * plays only while hovered, one stage at a time, never off-screen.
 */
export function MotionStage({ spec, resetOnLeave = false, compact = false, className = "" }: Props) {
  const entry = scenes[spec.id];
  const reduce = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const tl = useRef<Timeline | null>(null);
  const raf = useRef(0);

  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const touch = useTouch();
  const [showFinal, setShowFinal] = useState(false);

  // Mount the scene only when it comes near the viewport; pause it when it
  // leaves.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const nearObs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setNear(true),
      { rootMargin: "400px 0px" }
    );
    const visObs = new IntersectionObserver(
      ([e]) => !e.isIntersecting && setPlaying(false),
      { threshold: 0.2 }
    );
    nearObs.observe(el);
    visObs.observe(el);
    return () => {
      nearObs.disconnect();
      visObs.disconnect();
    };
  }, []);

  const drawProgress = useCallback(() => {
    const t = tl.current;
    if (!t || !entry || !progressRef.current) return;
    progressRef.current.style.transform = `scaleX(${t.time() / entry.def.duration})`;
  }, [entry]);

  // Build the timeline once the scene is in the DOM.
  useEffect(() => {
    if (!near || !entry || !sceneRef.current) return;
    tl.current = buildTimeline(sceneRef.current, entry.def);
    // dev: let a debugger scrub the scene (`$0.__stage.seek(ms)`)
    if (process.env.NODE_ENV !== "production")
      (sceneRef.current as HTMLElement & { __stage?: Timeline }).__stage = tl.current;
    drawProgress();
    return () => {
      tl.current?.destroy();
      tl.current = null;
    };
  }, [near, entry, drawProgress]);

  // Play / pause, with the text-driven bits and progress line on the same clock.
  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    if (playing && !reduce) {
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: spec.id }));
      t.play();
      const loop = () => {
        t.sync();
        drawProgress();
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf.current);
    }
    t.pause();
    if (resetOnLeave) t.seek(0);
    drawProgress();
  }, [playing, reduce, resetOnLeave, spec.id, drawProgress, near]);

  // Only one stage plays at a time.
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== spec.id) setPlaying(false);
    };
    window.addEventListener(PLAY_EVENT, onOther);
    return () => window.removeEventListener(PLAY_EVENT, onOther);
  }, [spec.id]);

  // Reduced motion: still frame, or the finished one on request.
  useEffect(() => {
    if (!reduce || !entry) return;
    tl.current?.seek(showFinal ? entry.def.finalAt : 0);
    drawProgress();
  }, [reduce, showFinal, entry, near, drawProgress]);

  const canPlay = Boolean(entry) && !reduce;
  const start = () => canPlay && setPlaying(true);
  const stop = () => setPlaying(false);
  const active = playing && canPlay;
  const Scene = entry?.Scene;

  return (
    <figure className={`motion-stage not-prose ${className}`}>
      <motion.div
        ref={frameRef}
        role="img"
        aria-label={`${spec.stillAlt} ${spec.summary}`}
        tabIndex={0}
        onPointerEnter={(e) => e.pointerType === "mouse" && start()}
        onPointerLeave={(e) => e.pointerType === "mouse" && stop()}
        onClick={() => touch && (active ? stop() : start())}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && start()}
        onBlur={stop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (active) stop();
            else start();
          } else if (e.key === "Escape") stop();
        }}
        animate={{ scale: active && !compact ? 1.015 : 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
        className={`stage-frame relative overflow-hidden rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
          active ? "z-[45]" : ""
        }`}
        style={{ cursor: canPlay ? (touch ? "pointer" : "default") : undefined }}
      >
        <div ref={sceneRef} className="stage-scene" aria-hidden="true">
          {Scene && near ? <Scene /> : <div className="stage-pending" />}
        </div>

        {!entry && (
          // TODO(phase 4): this scene isn't built yet.
          <span className="stage-chip">Scene in progress</span>
        )}
        {canPlay && (
          <span className={`stage-chip transition-opacity duration-300 ${active ? "opacity-0" : "opacity-100"}`}>
            <span aria-hidden="true">▶</span> {touch ? "Tap to play" : "Hover to play"}
          </span>
        )}
        {entry && (
          <span className="stage-progress" aria-hidden="true">
            <span ref={progressRef} />
          </span>
        )}
      </motion.div>

      {!compact && (
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          <span>{spec.title}</span>
          {reduce && entry && (
            <button
              type="button"
              onClick={() => setShowFinal((v) => !v)}
              aria-pressed={showFinal}
              className="rounded underline decoration-dotted underline-offset-4 hover:text-ink"
            >
              {showFinal ? "Show still frame" : "Show final frame"}
            </button>
          )}
        </figcaption>
      )}

      {!compact && <PageDim on={active} />}
    </figure>
  );
}

/** Dims the page around a playing stage, so attention moves into the scene. */
function PageDim({ on }: { on: boolean }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[44] bg-paper transition-opacity duration-500 ${
        on ? "opacity-[0.15]" : "opacity-0"
      }`}
      style={{ background: "color-mix(in srgb, var(--ink) 60%, var(--paper))" }}
    />,
    document.body
  );
}
