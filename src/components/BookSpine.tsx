"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { ShelfItem } from "./shelf-data";
import { Book3D } from "./Book3D";
import { bookGeometry, projectedWidth } from "./book-geometry";

type Props = {
  item: ShelfItem;
  index: number;
  scale?: number;
  onOpen: (slug: string) => void;
  onFocusItem: (index: number) => void;
};

const PERSPECTIVE = 1200;

/**
 * An upright, spine-out book on the shelf — a real CSS 3D cuboid (spine + a
 * sliver of front cover + a page-block on top), with a hover/focus label and a
 * cast shadow. Featured books carry a Framer `layoutId` so they can pull
 * forward into a face-out cover. Behance books are quieter and open in a new
 * tab, flagged as an optional read.
 */
export const BookSpine = forwardRef<HTMLElement, Props>(function BookSpine(
  { item, index, scale = 1, onOpen, onFocusItem },
  ref
) {
  const geo = bookGeometry(index, item.kind, scale);
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
        <CastShadow />
        <Book3D
          geo={geo}
          spineColor={spineColor}
          coverColor={`color-mix(in srgb, ${spineColor} 86%, #000)`}
          pageColor="color-mix(in srgb, var(--ink) 6%, var(--paper))"
          spine={
            <div className="absolute inset-0 flex flex-col items-center justify-between py-4 text-ink-soft">
              <span className="h-3 w-[2px] rounded bg-[color-mix(in_srgb,var(--ink)_28%,transparent)]" />
              <span
                className="min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap py-2 text-center font-mono uppercase leading-none tracking-[0.14em]"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontSize: Math.max(9, Math.round(geo.spineW * 0.25)),
                }}
              >
                {item.title}
              </span>
              <span className="h-3 w-[2px] rounded bg-[color-mix(in_srgb,var(--ink)_18%,transparent)]" />
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
      aria-label={`${study.title}, ${study.year}: ${study.subtitle}. Open this book.`}
      className="group relative flex shrink-0 cursor-pointer snap-center items-end justify-center self-end outline-none [--lift:0px] hover:[--lift:-14px] focus-visible:[--lift:-14px]"
      style={{ width: projW, height: geo.height + 12, perspective: PERSPECTIVE }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <HoverLabel
        title={study.title}
        meta={study.year}
        teaser={study.teaser}
        accent
      />
      <CastShadow />
      <Book3D
        geo={geo}
        spineColor={p.spine}
        coverColor={`color-mix(in srgb, ${p.spine} 88%, #000)`}
        pageColor="#efe9db"
        spine={
          <div className="absolute inset-0 flex flex-col items-center justify-between py-5">
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
                fontSize: Math.round(geo.spineW * 0.28),
              }}
            >
              {study.title}
            </span>
            {study.mark ? (
              <span
                aria-hidden="true"
                className="shrink-0"
                style={{
                  width: Math.round(geo.spineW * 0.46),
                  height: Math.round(geo.spineW * 0.46),
                  background: `color-mix(in srgb, ${light} 92%, transparent)`,
                  WebkitMaskImage: `url(${study.mark})`,
                  maskImage: `url(${study.mark})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            ) : (
              <span
                className="font-mono text-[9px] tracking-widest"
                style={{ color: `color-mix(in srgb, ${light} 74%, transparent)` }}
              >
                {study.year}
              </span>
            )}
          </div>
        }
        cover={
          <div
            className="absolute inset-[3px] flex flex-col justify-start p-1.5"
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
          </div>
        }
      />
    </motion.button>
  );
});

/** Readable label that fades in above the book on hover / focus. */
function HoverLabel({
  title,
  meta,
  teaser,
  accent = false,
}: {
  title: string;
  meta: string;
  teaser?: string;
  accent?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-2xl border border-edge bg-paper px-4 opacity-0 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.5)] transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 ${
        teaser ? "py-2" : "py-1.5"
      }`}
    >
      <span className="flex items-baseline gap-2">
        <span className="font-display text-[13px] leading-none tracking-tight text-ink">
          {title}
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-wide ${
            accent ? "text-accent" : "text-ink-soft"
          }`}
        >
          {meta}
        </span>
      </span>
      {teaser && (
        <span className="mt-1 block text-[12px] leading-snug text-ink-soft">
          {teaser}
        </span>
      )}
    </span>
  );
}

/**
 * Soft grounding shadow on the shelf (aiwithremy-style): always present,
 * blurred and slightly forward, and it spreads as the book lifts on hover.
 */
function CastShadow() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[7px] left-1/2 h-4 w-[118%] -translate-x-1/2 rounded-[50%] opacity-70 blur-[9px] transition-all duration-200 ease-out group-hover:h-5 group-hover:opacity-90 group-hover:blur-[12px]"
        style={{ background: "rgba(24,20,15,0.28)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[3px] left-1/2 h-2 w-[86%] -translate-x-1/2 rounded-[50%] opacity-80 blur-[3px] transition-all duration-200 ease-out group-hover:opacity-60"
        style={{ background: "rgba(24,20,15,0.34)" }}
      />
    </>
  );
}
