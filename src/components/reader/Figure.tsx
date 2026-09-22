"use client";

import Image from "next/image";
import type { CaseStudyVisual } from "@/content/types";
import { useLightbox, type LightboxItem } from "@/components/Lightbox";
import { useSound } from "@/lib/sound";

// Phone screens share the iPhone 15 canvas ratio (393 × 852).
const PHONE_RATIO = "393 / 852";
const PHONE_TALL = 852 / 393;

/**
 * On a book page, height is the scarce dimension: cap a figure's width so its
 * images fit. 1cqw = 1% of the page width (see .book-page in globals.css); the
 * content box is ~114cqw tall, and the "Figure" label, the caption (up to two
 * lines) and the page number take the rest.
 */
const BOOK_BUDGET = 82;
const bookMaxWidth = (heightPerWidth: number, extra: number) =>
  `min(100%, ${Math.floor((BOOK_BUDGET - extra) / heightPerWidth)}cqw)`;

/** Lightbox items for a visual: the video (if any), then one per frame. */
export function lightboxItems(visual: CaseStudyVisual): LightboxItem[] {
  const video: LightboxItem[] = visual.video
    ? [
        {
          src: visual.video.poster,
          video: visual.video.src,
          alt: visual.alt,
          caption: visual.caption,
        },
      ]
    : [];
  if (visual.frames) {
    return [
      ...video,
      ...visual.frames.map((f) => ({
        src: f.src,
        alt: visual.alt,
        caption: visual.caption,
        label: f.label,
      })),
    ];
  }
  return [
    ...video,
    { src: visual.src, alt: visual.alt, caption: visual.caption },
  ];
}

/**
 * A figure that "pops out" slightly off the paper. A strip of phone screens
 * (`frames`) or a single image; either way a click opens the lightbox. Until
 * the export lands (no `width`/`frames`) it renders a clearly-marked
 * placeholder with the real caption.
 */
export function Figure({
  visual,
  compact = false,
}: {
  visual: CaseStudyVisual;
  /** Tighter strip for the book page. */
  compact?: boolean;
}) {
  const { open } = useLightbox();
  const { click } = useSound();
  const items = lightboxItems(visual);
  const show = (i: number) => {
    click();
    open(items, i);
  };
  const ready = Boolean(visual.frames || visual.width);

  return (
    <figure className={compact ? "my-0 w-full" : "my-2 w-full"}>
      {visual.video && !compact ? (
        <VideoFigure visual={visual} />
      ) : visual.frames ? (
        visual.shape === "pairs" ? (
          <PairGrid visual={visual} onOpen={show} compact={compact} />
        ) : visual.shape === "wide" ? (
          <WideStack visual={visual} onOpen={show} compact={compact} />
        ) : (
          <>
            <ScreenStrip visual={visual} onOpen={show} compact={compact} />
            {visual.video && (
              <PlayButton compact={compact} onClick={() => show(0)} />
            )}
          </>
        )
      ) : ready ? (
        <button
          type="button"
          onClick={() => show(0)}
          aria-label={`Enlarge: ${visual.alt}`}
          className="group mx-auto block w-full max-w-[760px] cursor-zoom-in overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] shadow-[0_18px_36px_-24px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
        >
          <Image
            src={visual.src}
            alt={visual.alt}
            width={visual.width}
            height={visual.height}
            sizes="(min-width: 1280px) 340px, (min-width: 640px) 50vw, 100vw"
            className="block h-auto w-full"
          />
        </button>
      ) : (
        <Placeholder alt={visual.alt} />
      )}
      <figcaption
        className={`mt-2 font-mono leading-relaxed text-ink-soft ${
          compact ? "book-small" : "text-[11px]"
        }`}
      >
        {visual.caption}
      </figcaption>
    </figure>
  );
}

/** The screen recording, with its own controls. Never autoplays. */
function VideoFigure({ visual }: { visual: CaseStudyVisual }) {
  const v = visual.video!;
  return (
    <div
      className="mx-auto overflow-hidden rounded-[9%/4%] border border-[color-mix(in_srgb,var(--ink)_14%,transparent)] bg-[color-mix(in_srgb,var(--ink)_4%,var(--paper))] shadow-[0_18px_36px_-22px_rgba(0,0,0,0.55)]"
      style={{ maxWidth: 300 }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={v.src}
        poster={v.poster}
        width={v.width}
        height={v.height}
        controls
        preload="none"
        playsInline
        aria-label={visual.alt}
        className="block h-auto w-full"
      />
    </div>
  );
}

/** Opens the recording in the lightbox (used on a book page). */
function PlayButton({
  compact,
  onClick,
}: {
  compact: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mx-auto mt-2 flex items-center gap-1.5 rounded-full border border-edge px-[1.2em] py-[0.5em] font-mono uppercase tracking-[0.14em] text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] ${
        compact ? "book-small" : "text-[10px]"
      }`}
    >
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.5v13l11-6.5z" />
      </svg>
      Play the flow
    </button>
  );
}

function ScreenStrip({
  visual,
  onOpen,
  compact,
}: {
  visual: CaseStudyVisual;
  onOpen: (i: number) => void;
  compact: boolean;
}) {
  const frames = visual.frames!;
  const n = frames.length;
  // up to four screens sit in one row; more wrap into two rows so each
  // screen stays legible in a narrow column
  const cols = n <= 4 ? n : Math.ceil(n / 2);
  const rows = Math.ceil(n / cols);
  const maxWidth = compact
    ? bookMaxWidth((rows * PHONE_TALL) / cols, rows * 3)
    : `min(100%, ${cols * 190}px)`;
  return (
    <div
      className="mx-auto grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth }}
    >
      {frames.map((f, i) => (
        <div key={f.src} className="min-w-0">
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Enlarge screen ${i + 1} of ${n}${f.label ? `: ${f.label}` : ""}`}
            className="relative block w-full cursor-zoom-in overflow-hidden rounded-[9%] border border-[color-mix(in_srgb,var(--ink)_14%,transparent)] bg-[color-mix(in_srgb,var(--ink)_4%,var(--paper))] shadow-[0_14px_28px_-20px_rgba(0,0,0,0.55)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
            style={{ aspectRatio: PHONE_RATIO }}
          >
            <Image
              src={f.src}
              alt={i === 0 ? visual.alt : ""}
              fill
              sizes={`(min-width: 1280px) ${Math.round(340 / cols)}px, (min-width: 640px) ${Math.round(50 / cols)}vw, ${Math.round(100 / cols)}vw`}
              className="object-cover object-top"
            />
          </button>
          {f.label && (
            <p
              className={`mt-1.5 truncate text-center font-mono uppercase tracking-[0.12em] text-ink-soft ${
                compact ? "book-small" : "text-[9px]"
              }`}
            >
              {f.label}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}


/** Before over after, one pair per column, with an arrow between the rows. */
function PairGrid({
  visual,
  onOpen,
  compact,
}: {
  visual: CaseStudyVisual;
  onOpen: (i: number) => void;
  compact: boolean;
}) {
  const frames = visual.frames!;
  const pairs: [number, number][] = [];
  for (let i = 0; i + 1 < frames.length; i += 2) pairs.push([i, i + 1]);
  // each column is two screens tall, plus the arrow and two labels
  const maxWidth = compact
    ? bookMaxWidth((2 * PHONE_TALL) / pairs.length, 9)
    : `min(100%, ${pairs.length * 190}px)`;
  return (
    <div
      className="mx-auto grid items-start gap-x-3 gap-y-1"
      style={{
        gridTemplateColumns: `repeat(${pairs.length}, minmax(0, 1fr))`,
        maxWidth,
      }}
    >
      {pairs.map(([a, b]) => (
        <div key={frames[a].src} className="flex min-w-0 flex-col items-center">
          <Screen
            frame={frames[a]}
            index={a}
            total={frames.length}
            alt={a === 0 ? visual.alt : ""}
            cols={pairs.length}
            compact={compact}
            onOpen={onOpen}
          />
          <span
            aria-hidden="true"
            className="my-0.5 leading-none text-ink-soft"
            style={{ fontSize: compact ? "3cqw" : "13px" }}
          >
            ↓
          </span>
          <Screen
            frame={frames[b]}
            index={b}
            total={frames.length}
            alt=""
            cols={pairs.length}
            compact={compact}
            onOpen={onOpen}
          />
        </div>
      ))}
    </div>
  );
}

/** Diagrams and boards: each image at its natural ratio, stacked. */
function WideStack({
  visual,
  onOpen,
  compact,
}: {
  visual: CaseStudyVisual;
  onOpen: (i: number) => void;
  compact: boolean;
}) {
  const frames = visual.frames!;
  // stacked at their natural ratios, so the tallest they can be is the sum
  const tall = frames.reduce(
    (n, f) => n + (f.height ?? 1200) / (f.width ?? 1800),
    0
  );
  const labels = frames.filter((f) => f.label).length * 3;
  return (
    <div
      className="mx-auto flex flex-col gap-2"
      style={{
        maxWidth: compact ? bookMaxWidth(tall, labels) : "min(100%, 760px)",
      }}
    >
      {frames.map((f, i) => (
        <div key={f.src}>
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Enlarge image ${i + 1} of ${frames.length}${f.label ? `: ${f.label}` : ""}`}
            className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--ink)_3%,var(--paper))] shadow-[0_14px_28px_-22px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
          >
            <Image
              src={f.src}
              alt={i === 0 ? visual.alt : ""}
              width={f.width ?? 1800}
              height={f.height ?? 1200}
              sizes="(min-width: 1280px) 340px, (min-width: 640px) 50vw, 100vw"
              className="block h-auto w-full"
            />
          </button>
          {f.label && <FrameLabel label={f.label} compact={compact} />}
        </div>
      ))}
    </div>
  );
}

/** One phone screen, cropped to the device canvas. */
function Screen({
  frame,
  index,
  total,
  alt,
  cols,
  compact,
  onOpen,
}: {
  frame: { src: string; label?: string };
  index: number;
  total: number;
  alt: string;
  cols: number;
  compact: boolean;
  onOpen: (i: number) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={`Enlarge screen ${index + 1} of ${total}${frame.label ? `: ${frame.label}` : ""}`}
        className="relative block w-full cursor-zoom-in overflow-hidden rounded-[9%] border border-[color-mix(in_srgb,var(--ink)_14%,transparent)] bg-[color-mix(in_srgb,var(--ink)_4%,var(--paper))] shadow-[0_14px_28px_-20px_rgba(0,0,0,0.55)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
        style={{ aspectRatio: PHONE_RATIO }}
      >
        <Image
          src={frame.src}
          alt={alt}
          fill
          sizes={`(min-width: 1280px) ${Math.round(340 / cols)}px, (min-width: 640px) ${Math.round(50 / cols)}vw, ${Math.round(100 / cols)}vw`}
          className="object-cover object-top"
        />
      </button>
      {frame.label && <FrameLabel label={frame.label} compact={compact} />}
    </>
  );
}

function FrameLabel({ label, compact }: { label: string; compact: boolean }) {
  return (
    <p
      className={`mt-1 w-full truncate text-center font-mono uppercase tracking-[0.12em] text-ink-soft ${
        compact ? "book-small" : "text-[9px]"
      }`}
    >
      {label}
    </p>
  );
}

function Placeholder({ alt }: { alt: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--ink)_12%,transparent)]"
      style={{
        background: "color-mix(in srgb, var(--accent) 8%, var(--paper))",
        aspectRatio: "4 / 3",
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
          figure · TODO export
        </span>
        <span className="max-w-[36ch] text-sm text-ink-soft">{alt}</span>
      </div>
    </div>
  );
}
