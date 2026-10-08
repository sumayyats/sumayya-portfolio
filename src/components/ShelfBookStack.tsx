"use client";

import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useState } from "react";
import type { CaseStudy } from "@/content/types";
import { useSound } from "@/lib/sound";
import { BookCover } from "./BookCover";
import { ShelfBookDetail } from "./ShelfBookDetail";

type Face = "cover" | "details";

type Props = {
  study: CaseStudy;
  position: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

/** How far a swipe has to travel (px), or how fast (px/s), to swap the cards. */
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 450;

/**
 * The picked-up book on a phone: the cover and its details as a stack of two
 * cards the size of the screen, instead of one tall column that runs off it.
 * The top card swipes (or taps) aside and tucks behind the other; the
 * Cover / Details switch below does the same for keyboards and screen readers.
 */
export function ShelfBookStack(props: Props) {
  const { study } = props;
  const [front, setFront] = useState<Face>("cover");
  const reduce = useReducedMotion();
  const { click } = useSound();

  const swap = (to?: Face) => {
    setFront((f) => to ?? (f === "cover" ? "details" : "cover"));
    click();
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) swap();
  };

  // the card behind peeks out above and to the right, slightly turned
  const place = (face: Face) =>
    front === face
      ? { scale: 1, x: 0, y: 0, rotate: 0, zIndex: 2, filter: "brightness(1)" }
      : { scale: 0.92, x: 26, y: -42, rotate: 3, zIndex: 1, filter: "brightness(0.82)" };
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 30 };

  const card = (face: Face) => ({
    className: "pointer-events-auto absolute inset-0",
    animate: place(face),
    transition: spring,
    drag: front === face && !reduce ? ("x" as const) : false,
    dragSnapToOrigin: true,
    dragElastic: 0.6,
    onDragEnd,
    style: { touchAction: "pan-y" as const },
    "aria-hidden": front !== face,
  });

  return (
    <div className="pointer-events-none flex flex-col items-center gap-5">
      <div className="relative aspect-[3/4] w-[min(80vw,340px)] max-h-[66dvh]">
        {/* the cover keeps the shared layout id, so it still lifts off the shelf */}
        <motion.div layoutId={`book-${study.slug}`} {...card("cover")} onTap={() => front === "cover" && swap("details")}>
          <BookCover study={study} />
        </motion.div>
        <motion.div {...card("details")}>
          <ShelfBookDetail {...props} stacked />
        </motion.div>
      </div>

      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <div role="group" aria-label="Show" className="inline-flex rounded-full border border-edge bg-paper p-0.5">
          {(["cover", "details"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={front === f}
              onClick={() => front !== f && swap(f)}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                front === f ? "bg-ink text-paper" : "text-ink-soft"
              }`}
            >
              {f === "cover" ? "Cover" : "Details"}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft" aria-hidden="true">
          swipe the card
        </p>
      </div>
    </div>
  );
}
