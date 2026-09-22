"use client";

import Image from "next/image";
import type { CaseStudyVisual } from "@/content/types";
import { useLightbox, type LightboxItem } from "@/components/Lightbox";
import { useSound } from "@/lib/sound";

// Phone screens share the iPhone 15 canvas ratio (393 × 852).
const PHONE_RATIO = "393 / 852";

/** Lightbox items for a visual: one per frame, or the single image. */
export function lightboxItems(visual: CaseStudyVisual): LightboxItem[] {
  if (visual.frames) {
    return visual.frames.map((f) => ({
      src: f.src,
      alt: visual.alt,
      caption: visual.caption,
      label: f.label,
    }));
  }
  return [{ src: visual.src, alt: visual.alt, caption: visual.caption }];
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
    <figure className={compact ? "my-0" : "my-2"}>
      {visual.frames ? (
        <ScreenStrip visual={visual} onOpen={show} compact={compact} />
      ) : ready ? (
        <button
          type="button"
          onClick={() => show(0)}
          aria-label={`Enlarge: ${visual.alt}`}
          className="group block w-full cursor-zoom-in overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] shadow-[0_18px_36px_-24px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-0.5 [&>*]:pointer-events-none"
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
  // On a book page the strip must also fit the page height: cap its width
  // so `rows` screens (852/393 tall each) use at most ~80% of the page width
  // in height. 1cqw = 1% of the page (see .book-page in globals.css).
  const maxWidth = compact
    ? `min(100%, ${Math.round((cols * (80 / rows)) / 2.168)}cqw)`
    : undefined;
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
