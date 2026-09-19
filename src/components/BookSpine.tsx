"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { ShelfItem } from "./shelf-data";
import { FootEmblem } from "./FootEmblem";

const SPINE_TILT = -9; // degrees of resting perspective tilt

type Props = {
  item: ShelfItem;
  index: number;
  onOpen: (slug: string) => void;
  onFocusItem: (index: number) => void;
};

/**
 * An upright, spine-out book on the shelf.
 * Featured books are richer and carry a Framer `layoutId` so they can pull
 * forward into a face-out cover. Behance books are quieter, narrower, spine
 * only, and open in a new tab.
 */
export const BookSpine = forwardRef<HTMLElement, Props>(function BookSpine(
  { item, index, onOpen, onFocusItem },
  ref
) {
  if (item.kind === "external") {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        data-book
        data-index={index}
        onFocus={() => onFocusItem(index)}
        aria-label={`${item.title} — opens the case study on Behance in a new tab`}
        className="group relative block shrink-0 snap-center outline-none"
        style={{ perspective: "1400px" }}
      >
        <div
          className="relative flex h-[272px] w-[34px] flex-col items-center justify-between rounded-[3px] border border-edge bg-shelf py-3 shadow-[0_10px_22px_-16px_rgba(0,0,0,0.5)] transition-all duration-200 ease-out will-change-transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_30px_-18px_rgba(0,0,0,0.55)] group-focus-visible:-translate-y-2"
          style={{ transform: `rotateY(${SPINE_TILT}deg)` }}
        >
          <span className="mt-1 h-4 w-[2px] rounded bg-[color-mix(in_srgb,var(--ink)_35%,transparent)]" />
          <span
            className="flex-1 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {item.title}
          </span>
          <span className="flex flex-col items-center gap-1 text-ink-soft">
            <ExternalArrow />
            <FootEmblem variant={index} />
          </span>
        </div>
      </a>
    );
  }

  const { study } = item;
  const p = study.palette;

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      layoutId={`book-${study.slug}`}
      data-book
      data-index={index}
      onFocus={() => onFocusItem(index)}
      onClick={() => onOpen(study.slug)}
      aria-label={`${study.title}: ${study.subtitle}. Open this book.`}
      className="group relative shrink-0 cursor-pointer snap-center rounded-[4px] outline-none"
      style={{ perspective: "1600px" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div
        className="relative flex h-[344px] w-[54px] flex-col items-center justify-between rounded-[4px] py-4 shadow-[0_16px_30px_-18px_rgba(0,0,0,0.65)] transition-all duration-200 ease-out will-change-transform group-hover:-translate-y-3 group-hover:shadow-[0_30px_44px_-20px_rgba(0,0,0,0.6)] group-focus-visible:-translate-y-3"
        style={{
          transform: `rotateY(${SPINE_TILT}deg)`,
          background: `linear-gradient(90deg, ${p.spine} 0%, color-mix(in srgb, ${p.spine} 82%, #000) 100%)`,
        }}
      >
        {/* head band */}
        <span
          className="h-5 w-[3px] rounded-full"
          style={{ background: p.accent }}
        />
        {/* printed title */}
        <span
          className="flex-1 py-3 text-center font-display text-[15px] leading-tight tracking-tight"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            color: "#F5F2E9",
          }}
        >
          {study.title}
        </span>
        {/* year + emblem at the foot */}
        <span
          className="flex flex-col items-center gap-2"
          style={{ color: "color-mix(in srgb, #F5F2E9 78%, transparent)" }}
        >
          <span className="font-mono text-[9px] tracking-widest">
            {study.year}
          </span>
          <FootEmblem variant={index} />
        </span>
      </div>
    </motion.button>
  );
});

function ExternalArrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
