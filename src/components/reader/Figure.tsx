"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CaseStudyVisual } from "@/content/types";
import { useLightbox, type LightboxItem } from "@/components/Lightbox";
import { useSound } from "@/lib/sound";

// Screens share their device's canvas ratio (iPhone 15 / iPad).
const PHONE_RATIO = "393 / 852";
const PHONE_TALL = 852 / 393;
const TABLET_RATIO = "834 / 1194";
const TABLET_TALL = 1194 / 834;
const ratioOf = (shape?: string) =>
  shape === "tablet" ? TABLET_RATIO : PHONE_RATIO;
const tallOf = (shape?: string) =>
  shape === "tablet" ? TABLET_TALL : PHONE_TALL;

/**
 * On a book page, height is the scarce dimension: cap a figure's width so its
 * images fit. 1cqw = 1% of the page width (see .book-page in globals.css); the
 * content box is ~114cqw tall, and the "Figure" label, the caption (up to two
 * lines) and the page number take the rest.
 */
const BOOK_BUDGET = 82;

// Corner radii in px. A percentage radius stretches into an ellipse on a tall
// frame, which is why a phone screen looked nothing like a phone; these are
// the real thing at each size a screen is drawn.
const PHONE_RADIUS = 24; // a device screen at figure size (~170px wide)
const PHONE_RADIUS_SMALL = 12; // the same screen on a book page or a card
const SHOT_RADIUS = 6; // a website screenshot
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
          className="group mx-auto block w-full cursor-zoom-in overflow-hidden border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] shadow-[0_18px_36px_-24px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
          style={{
            borderRadius: visual.shape === "wide" ? SHOT_RADIUS : 12,
            // On a book page a tall screenshot would run off the paper, so it
            // is capped by its own height the way a stacked figure is.
            maxWidth: compact
              ? bookMaxWidth(
                  (visual.height ?? 1200) / (visual.width ?? 1800),
                  6
                )
              : 760,
          }}
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

/**
 * The screen recording. Plays once it scrolls into view (muted, looping) and
 * pauses when it leaves; `prefers-reduced-motion` keeps it still until played.
 * `crop` trims the capture's own backdrop.
 */
function VideoFigure({ visual }: { visual: CaseStudyVisual }) {
  const v = visual.video!;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  const autoplay = v.autoplay !== false;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !autoplay) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduce, autoplay]);

  const c = v.crop ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const scaleX = 100 / (100 - c.left - c.right);
  const scaleY = 100 / (100 - c.top - c.bottom);

  // a desktop capture fills the figure card; a phone one stays phone-sized
  const wide = v.width > v.height;

  return (
    <div
      className="relative mx-auto overflow-hidden shadow-[0_18px_36px_-22px_rgba(0,0,0,0.55)]"
      style={{
        // A phone capture is cropped to the device itself, so the frame is the
        // phone: its corner is 7.1% of the phone's width, which on this
        // aspect is 3.25% of its height — a circle, not an ellipse.
        borderRadius: wide ? SHOT_RADIUS : "7.1% / 3.25%",
        maxWidth: wide ? "100%" : 300,
        width: "100%",
        aspectRatio: `${v.width * (1 - (c.left + c.right) / 100)} / ${
          v.height * (1 - (c.top + c.bottom) / 100)
        }`,
      }}
    >
      <video
        ref={ref}
        src={v.src}
        poster={v.poster}
        controls
        muted
        loop
        playsInline
        // a heavy capture fetches nothing until the viewer asks for it
        preload={autoplay ? "metadata" : "none"}
        aria-label={visual.alt}
        // max-w-none: preflight caps video at 100%, which would undo the crop
        className="absolute max-w-none"
        style={{
          width: `${scaleX * 100}%`,
          height: `${scaleY * 100}%`,
          left: `${-c.left * scaleX}%`,
          top: `${-c.top * scaleY}%`,
        }}
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


/* ── figure gallery (reading view) ───────────────────────────────── */

/**
 * One figure as a card: a preview, a title and its caption. Clicking opens the
 * full set in the lightbox, so a section reads as a short, scannable list
 * instead of a run of loose screens.
 */
export function FigureCard({
  visual,
  span = true,
}: {
  visual: CaseStudyVisual;
  /** Off on the Artifacts page, where a wide figure keeps to one column. */
  span?: boolean;
}) {
  const { open } = useLightbox();
  const { click } = useSound();
  const items = lightboxItems(visual);
  const frames = visual.frames ?? [];
  const wide = visual.shape === "wide";
  const count = visual.video ? items.length - 1 : items.length;
  const noun = wide ? "image" : "screen";
  // nothing exported yet: show the marked placeholder rather than a broken image
  const ready = Boolean(visual.frames || visual.width || visual.video);

  const show = () => {
    click();
    open(items, 0);
  };

  return (
    <figure
      className={`flex flex-col ${wide && span ? "sm:col-span-2" : ""}`}
    >
      {!ready ? (
        <Placeholder alt={visual.alt} />
      ) : visual.video ? (
        <VideoFigure visual={visual} />
      ) : (
        <button
          type="button"
          onClick={show}
          aria-label={`${visual.title ?? visual.alt} — open ${count} ${noun}${count > 1 ? "s" : ""}`}
          className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--ink)_3%,var(--paper))] shadow-[0_14px_28px_-24px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-0.5"
          style={{ aspectRatio: wide ? "16 / 9" : "4 / 3" }}
        >
          {wide ? (
            <Image
              src={frames[0]?.src ?? visual.src}
              alt=""
              fill
              sizes="(min-width: 1280px) 340px, (min-width: 640px) 60vw, 100vw"
              className="object-contain p-3"
            />
          ) : (
            <span className="flex h-full items-center justify-center gap-2 p-4">
              {(frames.length ? frames : [{ src: visual.src }])
                .slice(0, 3)
                .map((f) => (
                  <span
                    key={f.src}
                    className="relative block h-full overflow-hidden border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] shadow-[0_10px_20px_-16px_rgba(0,0,0,0.5)]"
                    style={{
                      aspectRatio: ratioOf(visual.shape),
                      borderRadius: PHONE_RADIUS_SMALL,
                    }}
                  >
                    <Image
                      src={f.src}
                      alt=""
                      fill
                      sizes="140px"
                      className="object-cover object-top"
                    />
                  </span>
                ))}
            </span>
          )}
          {count > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft backdrop-blur-sm">
              {count} {noun}s
            </span>
          )}
        </button>
      )}

      <figcaption className="mt-3">
        {visual.title && (
          <p className="text-[14px] font-semibold leading-snug text-ink">
            {visual.title}
          </p>
        )}
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
          {visual.caption}
        </p>
      </figcaption>
    </figure>
  );
}

/** The section's figures, grouped under one heading. */
export function FigureGallery({
  visuals,
  compactColumns = false,
  label = "Figures",
  layout = "grid",
  spanWide = true,
}: {
  visuals: CaseStudyVisual[];
  /** Single column (the xl side rail). */
  compactColumns?: boolean;
  /** Names the group — the Artifacts page labels each one by its section. */
  label?: string;
  /** `list` swaps the cards for compact rows (the Artifacts page offers both). */
  layout?: "grid" | "list";
  /** Off on the Artifacts page, so the grid stays two columns throughout. */
  spanWide?: boolean;
}) {
  if (visuals.length === 0) return null;
  return (
    <section className="mt-10 border-t border-[color-mix(in_srgb,var(--ink)_10%,transparent)] pt-6">
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </p>
      {layout === "list" ? (
        <ul className="flex flex-col divide-y divide-[color-mix(in_srgb,var(--ink)_10%,transparent)] border-y border-[color-mix(in_srgb,var(--ink)_10%,transparent)]">
          {visuals.map((v) => (
            <li key={v.id}>
              <FigureRow visual={v} />
            </li>
          ))}
        </ul>
      ) : (
      <div
        className={`grid gap-x-5 gap-y-8 ${
          compactColumns ? "grid-cols-1" : "sm:grid-cols-2"
        }`}
      >
        {visuals.map((v) => (
          <FigureCard key={v.id} visual={v} span={spanWide} />
        ))}
      </div>
      )}
    </section>
  );
}

/**
 * One figure as a row: a thumbnail, its title and caption. The compact half of
 * the Artifacts page, for scanning a long set rather than browsing it.
 */
function FigureRow({ visual }: { visual: CaseStudyVisual }) {
  const { open } = useLightbox();
  const { click } = useSound();
  const items = lightboxItems(visual);
  const frames = visual.frames ?? [];
  const count = visual.video ? items.length - 1 : items.length;
  const noun = visual.shape === "wide" ? "image" : "screen";
  const ready = Boolean(visual.frames || visual.width || visual.video);
  const thumb = frames[0]?.src ?? visual.video?.poster ?? visual.src;

  return (
    <button
      type="button"
      onClick={() => {
        click();
        open(items, 0);
      }}
      aria-label={`${visual.title ?? visual.alt} — open ${count} ${noun}${count > 1 ? "s" : ""}`}
      className="group flex w-full cursor-zoom-in items-center gap-4 py-3 text-left"
    >
      <span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--ink)_3%,var(--paper))]">
        {ready && (
          <Image
            src={thumb}
            alt=""
            fill
            sizes="80px"
            className="object-cover object-top"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold leading-snug text-ink group-hover:text-accent">
          {visual.title ?? visual.alt}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
          {visual.caption}
        </span>
      </span>
      <span className="shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
        {visual.video ? "video" : `${count} ${noun}${count > 1 ? "s" : ""}`}
      </span>
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
  const tall = tallOf(visual.shape);
  const maxWidth = compact
    ? bookMaxWidth((rows * tall) / cols, rows * 4)
    : `min(100%, ${cols * (visual.shape === "tablet" ? 230 : 190)}px)`;
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
            className="relative block w-full cursor-zoom-in overflow-hidden border border-[color-mix(in_srgb,var(--ink)_14%,transparent)] bg-[color-mix(in_srgb,var(--ink)_4%,var(--paper))] shadow-[0_14px_28px_-20px_rgba(0,0,0,0.55)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
            style={{
              aspectRatio: ratioOf(visual.shape),
              borderRadius: compact ? PHONE_RADIUS_SMALL : PHONE_RADIUS,
            }}
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
            className="block w-full cursor-zoom-in overflow-hidden border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--ink)_3%,var(--paper))] shadow-[0_14px_28px_-22px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
            style={{ borderRadius: SHOT_RADIUS }}
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
  ratio = PHONE_RATIO,
}: {
  frame: { src: string; label?: string };
  index: number;
  total: number;
  alt: string;
  cols: number;
  compact: boolean;
  onOpen: (i: number) => void;
  ratio?: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={`Enlarge screen ${index + 1} of ${total}${frame.label ? `: ${frame.label}` : ""}`}
        className="relative block w-full cursor-zoom-in overflow-hidden border border-[color-mix(in_srgb,var(--ink)_14%,transparent)] bg-[color-mix(in_srgb,var(--ink)_4%,var(--paper))] shadow-[0_14px_28px_-20px_rgba(0,0,0,0.55)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
        style={{
          aspectRatio: ratio,
          borderRadius: compact ? PHONE_RADIUS_SMALL : PHONE_RADIUS,
        }}
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
