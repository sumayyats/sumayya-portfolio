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
 * sliver of front cover + a page-block on top), with a hover/focus label and a
 * cast shadow. Featured books carry a Framer `layoutId` so they can pull
 * forward into a face-out cover. Behance books are quieter and open in a new
 * tab, flagged as an optional read.
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
        aria-label={`${item.title}${item.year ? `, ${item.year}` : ""} — optional read, opens the case study on Behance in a new tab`}
        className="group relative flex shrink-0 snap-center items-end justify-center self-end outline-none [--lift:0px] hover:[--lift:-9px] focus-visible:[--lift:-9px]"
        style={{ width: projW, height: geo.height + 10, perspective: PERSPECTIVE }}
      >
        <HoverLabel
          title={item.title}
          meta={item.year ? `Optional read ↗ · ${item.year}` : "Optional read ↗"}
        />
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
        <CastShadow />
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
      aria-label={`${study.title}, ${study.year}: ${study.subtitle}. Open this book.`}
      className="group relative flex shrink-0 cursor-pointer snap-center items-end justify-center self-end outline-none [--lift:0px] hover:[--lift:-14px] focus-visible:[--lift:-14px]"
      style={{ width: projW, height: geo.height + 12, perspective: PERSPECTIVE }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <HoverLabel title={study.title} meta={study.year} accent />
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
                fontSize: geo.spineW >= 60 ? 16 : 15,
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
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[1px]"
              style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${light} 16%, transparent)` }}
            />
            <span className="font-mono text-[6px] uppercase tracking-[0.16em]">
              {study.year}
            </span>
            <FootEmblem variant={index + 2} className="opacity-40" />
          </div>
        }
      />
      <CastShadow />
    </motion.button>
  );
});

/** Readable label that fades in above the book on hover / focus. */
function HoverLabel({
  title,
  meta,
  accent = false,
}: {
  title: string;
  meta: string;
  accent?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 max-w-[240px] -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border border-edge bg-paper px-3 py-1.5 opacity-0 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.5)] transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
    >
      <span className="font-display text-[13px] leading-none tracking-tight text-ink">
        {title}
      </span>
      <span
        className={`ml-2 font-mono text-[10px] uppercase tracking-wide ${
          accent ? "text-accent" : "text-ink-soft"
        }`}
      >
        {meta}
      </span>
    </span>
  );
}

/** Soft contact shadow on the shelf; grows when the book lifts on hover. */
function CastShadow() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-2 left-1/2 h-3 w-[76%] -translate-x-1/2 rounded-[50%] bg-black/25 opacity-30 blur-[6px] transition-all duration-200 ease-out group-hover:opacity-60 group-hover:blur-[9px] group-focus-visible:opacity-60"
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
