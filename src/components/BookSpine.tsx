"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CaseStudy } from "@/content/types";
import type { ShelfItem } from "./shelf-data";
import { BookCover } from "./BookCover";
import { Book3D } from "./Book3D";
import {
  bookGeometry,
  projectedWidth,
  PERSPECTIVE,
  type BookGeometry,
} from "./book-geometry";

type Props = {
  item: ShelfItem;
  index: number;
  scale?: number;
  onOpen: (slug: string) => void;
  onFocusItem: (index: number) => void;
};

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
  const host = useRef<HTMLElement | null>(null);
  const { at, place, clear } = useShelfLabel(host);

  // keep the caller's ref working while we hold one of our own to measure
  const attach = useCallback(
    (el: HTMLElement | null) => {
      host.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.RefObject<HTMLElement | null>).current = el;
    },
    [host, ref]
  );
  const watch = {
    onPointerEnter: place,
    onPointerMove: place,
    onPointerLeave: clear,
    onBlur: clear,
  };

  if (item.kind === "external") {
    const spineColor = "color-mix(in srgb, var(--ink) 13%, var(--paper))";
    return (
      <a
        ref={attach as React.Ref<HTMLAnchorElement>}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        data-book
        data-index={index}
        onFocus={() => {
          onFocusItem(index);
          place();
        }}
        {...watch}
        aria-label={`${item.title}${item.year ? `, ${item.year}` : ""} — optional read, opens ${
          item.note ? "the publication" : "the case study on Behance"
        } in a new tab`}
        className="group relative z-0 mx-0 flex shrink-0 snap-center items-end justify-start self-end outline-none transition-[margin] duration-200 ease-out [--lift:0px] hover:z-20 hover:mx-2 hover:[--lift:-9px] focus-visible:z-20 focus-visible:mx-2 focus-visible:[--lift:-9px]"
        style={{ width: projW, height: geo.height + 10, perspective: PERSPECTIVE }}
      >
        <HoverLabel
          at={at}
          title={item.title}
          meta={item.year ? `Optional read ↗ · ${item.year}` : "Optional read ↗"}
          teaser={item.note}
          preview={item.preview}
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
                  // vertical-rl on its own reads top-to-bottom, the way a
                  // spine is lettered here
                  writingMode: "vertical-rl",
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
      ref={attach as React.Ref<HTMLButtonElement>}
      type="button"
      layoutId={`book-${study.slug}`}
      data-book
      data-index={index}
      onFocus={() => {
        onFocusItem(index);
        place();
      }}
      {...watch}
      onClick={() => onOpen(study.slug)}
      aria-label={`${study.title}, ${study.year}: ${study.subtitle}. Open this book.`}
      className="group relative z-0 mx-0 flex shrink-0 cursor-pointer snap-center items-end justify-start self-end outline-none transition-[margin] duration-200 ease-out [--lift:0px] hover:z-20 hover:mx-2.5 hover:[--lift:-14px] focus-visible:z-20 focus-visible:mx-2.5 focus-visible:[--lift:-14px]"
      style={{ width: projW, height: geo.height + 12, perspective: PERSPECTIVE }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <HoverLabel
        at={at}
        title={study.title}
        meta={study.year}
        teaser={study.teaser}
        preview={study.cover.mockup}
        // a mockup sits on transparency: fit it rather than crop the device
        previewFit="contain"
        slide
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
              className="relative h-4 w-[3px] rounded-full"
              style={{ background: p.spineTick ?? p.accent }}
            />
            <span
              className="relative min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap py-3 text-center font-display leading-none tracking-tight"
              style={{
                writingMode: "vertical-rl",
                color: light,
                fontSize: Math.round(geo.spineW * 0.28),
              }}
            >
              {study.title}
            </span>
            {study.mark ? (
              <span
                aria-hidden="true"
                className="relative shrink-0"
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
        cover={<CoverFace study={study} geo={geo} />}
      />
    </motion.button>
  );
});

// BookCover sizes its type from the viewport, so it has to be laid out at a
// real cover width and then scaled down onto the face — otherwise the title
// would come out wildly out of proportion at book size.
const JACKET_W = 480;
const JACKET_H = 640;

/**
 * The real cover, printed on the book's front-cover face. The book is turned
 * nearly spine-out, so the 3D transform foreshortens it to a sliver — the way
 * it would on a shelf — and it opens up as the book turns.
 */
function CoverFace({ study, geo }: { study: CaseStudy; geo: BookGeometry }) {
  const scale = geo.height / JACKET_H;
  return (
    <span aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <span
        className="absolute left-0 top-0 block origin-top-left"
        style={{ width: JACKET_W, height: JACKET_H, transform: `scale(${scale})` }}
      >
        <BookCover study={study} />
      </span>
    </span>
  );
}

/** The widest the label is allowed to get, so it can be kept on screen. */
const LABEL_MAX = 280;

/**
 * Tracks where a book is on screen, so its label can be drawn over the page.
 * The caller owns the ref: the component writes to it from a callback ref, and
 * a ref created here would look to the compiler like a captured local.
 */
function useShelfLabel(host: React.RefObject<HTMLElement | null>) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const place = useCallback(() => {
    const r = host.current?.getBoundingClientRect();
    if (!r) return;
    const next = { x: r.left + r.width / 2, y: r.top };
    // pointermove fires constantly; only re-render when the book has
    // actually moved (it does, while the shelf makes room for it)
    setAt((prev) =>
      prev && Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.y - next.y) < 0.5
        ? prev
        : next
    );
  }, [host]);
  const clear = useCallback(() => setAt(null), []);

  // the shelf can scroll under a resting cursor (wheel, snap, a neighbour
  // making room), so follow the book rather than leaving the label behind
  const shown = at !== null;
  useEffect(() => {
    if (!shown) return;
    const follow = () => place();
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [shown, place]);

  return { at, place, clear };
}

/**
 * The label that appears above a book on hover or focus. It is drawn into the
 * body rather than the book, because the shelf scrolls horizontally and any
 * book near an edge would otherwise have its label clipped — and it is held
 * inside the viewport, so the first and last books read as well as the rest.
 */
function HoverLabel({
  at,
  title,
  meta,
  teaser,
  preview,
  previewFit = "cover",
  slide = false,
  accent = false,
}: {
  at: { x: number; y: number } | null;
  title: string;
  meta: string;
  teaser?: string;
  /** Cover of the linked publication, so the click is not a leap of faith. */
  preview?: string;
  /** `contain` for a mockup on transparency, `cover` for a flat screenshot. */
  previewFit?: "cover" | "contain";
  /** Slide the preview into its frame as the label appears (featured books). */
  slide?: boolean;
  accent?: boolean;
}) {
  if (!at) return null;
  const edge = LABEL_MAX / 2 + 12;
  const x = Math.min(Math.max(at.x, edge), window.innerWidth - edge);
  return createPortal(
    <span
      aria-hidden="true"
      className="shelf-label pointer-events-none fixed z-[60] block rounded-2xl border border-edge bg-paper px-4 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.5)]"
      style={{
        left: x,
        top: at.y - 12,
        maxWidth: LABEL_MAX,
        transform: "translate(-50%,-100%)",
        paddingBlock: teaser ? "0.5rem" : "0.375rem",
      }}
    >
      <span className={preview ? "flex items-start gap-3" : "block"}>
        {preview && (
          <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-[6px] border border-edge bg-[color-mix(in_srgb,var(--ink)_4%,var(--paper))]">
            <Image
              src={preview}
              alt=""
              fill
              sizes="56px"
              className={`${previewFit === "contain" ? "object-contain p-1" : "object-cover"} ${slide ? "label-slide" : ""}`}
            />
          </span>
        )}
        <span className="block min-w-0">
          {/* meta sits above the title as a kicker, the way the detail card
              reads: long Behance titles wrap onto two lines, and inline meta
              would be left stranded beside them */}
          <span
            className={`block font-mono text-[10px] uppercase tracking-wide ${
              accent ? "text-accent" : "text-ink-soft"
            }`}
          >
            {meta}
          </span>
          <span className="mt-0.5 block font-display text-[13px] leading-snug tracking-tight text-ink">
            {title}
          </span>
          {teaser && (
            <span className="mt-1 block text-[12px] leading-snug text-ink-soft">
              {teaser}
            </span>
          )}
        </span>
      </span>
    </span>,
    document.body
  );
}

/**
 * Grounding shadow on the shelf. Hidden until the book is hovered or focused,
 * so the row reads clean and the shadow marks the one you are pointing at.
 */
function CastShadow() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[7px] left-1/2 h-5 w-[118%] -translate-x-1/2 rounded-[50%] opacity-0 blur-[12px] transition-opacity duration-200 ease-out group-hover:opacity-90 group-focus-visible:opacity-90"
        style={{ background: "rgba(24,20,15,0.28)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[3px] left-1/2 h-2 w-[86%] -translate-x-1/2 rounded-[50%] opacity-0 blur-[3px] transition-opacity duration-200 ease-out group-hover:opacity-60 group-focus-visible:opacity-60"
        style={{ background: "rgba(24,20,15,0.34)" }}
      />
    </>
  );
}
