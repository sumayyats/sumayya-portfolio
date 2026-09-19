"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { ShelfItem } from "./shelf-data";
import { FootEmblem } from "./FootEmblem";
import { bookGeometry } from "./book-geometry";

type Props = {
  item: ShelfItem;
  index: number;
  onOpen: (slug: string) => void;
  onFocusItem: (index: number) => void;
};

/**
 * An upright, spine-out book on the shelf, with real thickness (a lighter
 * page-edge cap on top), an organic lean and a little perspective — so the row
 * reads like hand-shelved books rather than a chart. Featured books are richer
 * and carry a Framer `layoutId` so they can pull forward into a face-out cover.
 * Behance books are quieter, narrower, spine only, and open in a new tab.
 */
export const BookSpine = forwardRef<HTMLElement, Props>(function BookSpine(
  { item, index, onOpen, onFocusItem },
  ref
) {
  const geo = bookGeometry(index, item.kind);

  const transform =
    "translateY(var(--lift,0px)) perspective(1700px) rotateY(var(--roty)) rotateZ(var(--lean))";
  const vars = {
    ["--roty" as string]: `${geo.roty}deg`,
    ["--lean" as string]: `${geo.lean}deg`,
  } as React.CSSProperties;

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
        className="group relative block shrink-0 snap-center self-end outline-none"
        style={{ perspective: "1400px" }}
      >
        <div
          className="relative flex origin-bottom flex-col items-center justify-between rounded-[3px_5px_5px_3px] border-y border-r border-edge bg-shelf pb-3 pt-[10px] shadow-[0_12px_22px_-16px_rgba(0,0,0,0.55)] transition-transform duration-200 ease-out will-change-transform [--lift:0px] group-hover:[--lift:-9px] group-focus-visible:[--lift:-9px]"
          style={{
            ...vars,
            width: geo.width,
            height: geo.height,
            transform,
          }}
        >
          <PagesTop tone="light" />
          <span className="z-10 mt-1 h-3.5 w-[2px] rounded bg-[color-mix(in_srgb,var(--ink)_30%,transparent)]" />
          <span
            className="z-10 min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap py-2 text-center font-mono text-[10px] uppercase leading-none tracking-[0.14em] text-ink-soft"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {item.title}
          </span>
          <span className="z-10 flex flex-col items-center gap-1 text-ink-soft">
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
      className="group relative shrink-0 cursor-pointer snap-center self-end rounded-[4px_6px_6px_4px] outline-none"
      style={{ perspective: "1700px" }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div
        className="relative flex origin-bottom flex-col items-center justify-between overflow-hidden rounded-[4px_6px_6px_4px] pb-4 pt-3 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.65)] transition-transform duration-200 ease-out will-change-transform [--lift:0px] group-hover:[--lift:-12px] group-focus-visible:[--lift:-12px]"
        style={{
          ...vars,
          width: geo.width,
          height: geo.height,
          transform,
          background: `linear-gradient(95deg, color-mix(in srgb, ${p.spine} 88%, #000) 0%, ${p.spine} 26%, color-mix(in srgb, ${p.spine} 82%, #000) 100%)`,
        }}
      >
        <PagesTop tone="dark" />
        {/* head band */}
        <span
          className="z-10 h-4 w-[3px] rounded-full"
          style={{ background: p.accent }}
        />
        {/* printed title */}
        <span
          className="z-10 min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap py-3 text-center font-display leading-none tracking-tight"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            color: "#F5F2E9",
            fontSize: geo.width >= 56 ? 15 : 14,
          }}
        >
          {study.title}
        </span>
        {/* year + emblem at the foot */}
        <span
          className="z-10 flex flex-col items-center gap-2"
          style={{ color: "color-mix(in srgb, #F5F2E9 78%, transparent)" }}
        >
          <span className="font-mono text-[9px] tracking-widest">
            {study.year}
          </span>
          <FootEmblem variant={index} />
        </span>
        {/* fore-edge sheen for thickness */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[6px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, #000 34%, transparent))",
          }}
        />
      </div>
    </motion.button>
  );
});

/** A lighter block of page tops sitting on the head of the book. */
function PagesTop({ tone }: { tone: "light" | "dark" }) {
  const bg =
    tone === "dark"
      ? "color-mix(in srgb, #f5f2e9 84%, transparent)"
      : "color-mix(in srgb, var(--ink) 8%, var(--paper))";
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[2px] top-0 h-[6px] rounded-t-[4px]"
      style={{
        background: `repeating-linear-gradient(90deg, ${bg} 0 1px, color-mix(in srgb, ${
          tone === "dark" ? "#000" : "var(--ink)"
        } 18%, transparent) 1px 2px)`,
        boxShadow: "inset 0 -2px 3px -2px rgba(0,0,0,0.35)",
      }}
    />
  );
}

function ExternalArrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
