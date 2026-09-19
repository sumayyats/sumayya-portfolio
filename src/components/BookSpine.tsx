"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { ShelfItem } from "./shelf-data";
import { FootEmblem } from "./FootEmblem";
import { Book3D } from "./Book3D";
import { bookGeometry, projectedWidth } from "./book-geometry";

type Props = {
  item: ShelfItem;
  index: number;
  onOpen: (slug: string) => void;
  onFocusItem: (index: number) => void;
};

const PERSPECTIVE = 1000;

/**
 * An upright, spine-out book on the shelf — a real CSS 3D cuboid (spine + a
 * sliver of front cover + a page-block on top). Featured books are richer and
 * carry a Framer `layoutId` so they can pull forward into a face-out cover.
 * Behance books are quieter, narrower, and open in a new tab.
 */
export const BookSpine = forwardRef<HTMLElement, Props>(function BookSpine(
  { item, index, onOpen, onFocusItem },
  ref
) {
  const geo = bookGeometry(index, item.kind);
  const projW = projectedWidth(geo);

  if (item.kind === "external") {
    const spineColor = "color-mix(in srgb, var(--ink) 13%, var(--paper))";
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
        className="group relative flex shrink-0 snap-center items-end justify-center self-end outline-none [--lift:0px] group-focus-visible:[--lift:-8px] hover:[--lift:-8px] focus-visible:[--lift:-8px]"
        style={{ width: projW, height: geo.height + 10, perspective: PERSPECTIVE }}
      >
        <Book3D
          geo={geo}
          spineColor={spineColor}
          coverColor={`color-mix(in srgb, ${spineColor} 86%, #000)`}
          pageColor="color-mix(in srgb, var(--ink) 6%, var(--paper))"
          spine={
            <div className="absolute inset-0 flex flex-col items-center justify-between py-3 text-ink-soft">
              <span className="h-3 w-[2px] rounded bg-[color-mix(in_srgb,var(--ink)_28%,transparent)]" />
              <span
                className="min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap py-2 text-center font-mono text-[10px] uppercase leading-none tracking-[0.14em]"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {item.title}
              </span>
              <span className="flex flex-col items-center gap-1">
                <ExternalArrow />
                <FootEmblem variant={index} />
              </span>
            </div>
          }
        />
      </a>
    );
  }

  const { study } = item;
  const p = study.palette;
  const light = "#F5F2E9";

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
      className="group relative flex shrink-0 cursor-pointer snap-center items-end justify-center self-end outline-none [--lift:0px] hover:[--lift:-14px] focus-visible:[--lift:-14px]"
      style={{ width: projW, height: geo.height + 12, perspective: PERSPECTIVE }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <Book3D
        geo={geo}
        spineColor={p.spine}
        coverColor={`color-mix(in srgb, ${p.spine} 88%, #000)`}
        pageColor="#efe9db"
        spine={
          <div className="absolute inset-0 flex flex-col items-center justify-between py-4">
            <span
              className="h-4 w-[3px] rounded-full"
              style={{ background: p.accent }}
            />
            <span
              className="min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap py-3 text-center font-display leading-none tracking-tight"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                color: light,
                fontSize: geo.spineW >= 52 ? 15 : 14,
              }}
            >
              {study.title}
            </span>
            <span
              className="flex flex-col items-center gap-2"
              style={{ color: `color-mix(in srgb, ${light} 78%, transparent)` }}
            >
              <span className="font-mono text-[9px] tracking-widest">
                {study.year}
              </span>
              <FootEmblem variant={index} />
            </span>
          </div>
        }
        cover={
          <div
            className="absolute inset-[3px] flex flex-col justify-between p-1.5"
            style={{ color: `color-mix(in srgb, ${light} 45%, transparent)` }}
          >
            {/* board impression / inset frame */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[1px]"
              style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${light} 16%, transparent)` }}
            />
            <span
              className="font-mono text-[6px] uppercase tracking-[0.16em]"
              style={{ color: `color-mix(in srgb, ${light} 52%, transparent)` }}
            >
              {study.year}
            </span>
            <FootEmblem
              variant={index + 2}
              className="opacity-40"
            />
          </div>
        }
      />
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
