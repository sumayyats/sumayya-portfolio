"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CaseStudy } from "@/content/types";
import { useSound } from "@/lib/sound";
import {
  PageFlip,
  type FlipOrientation,
  type FlipState,
} from "@/vendor/page-flip";
import { paginate, sectionPageIndex, type Page } from "./paginate";
import { PageView } from "./PageView";

// Base page proportions (the engine stretches to fit, keeping this ratio).
const PAGE_W = 500;
const PAGE_H = 650;
const MAX_PAGE_W = 720;
// Smallest page the engine will draw as a two-page spread; below twice this
// (phones) it falls back to one page at a time.
const MIN_PAGE_W = 240;
const CHROME = 160; // header + nav row + gutters, in px

/**
 * Flip reading view. The page curl, corner drag, swipe and shadows come from
 * the page-flip engine (vendored in src/vendor). React renders each page's
 * content through a portal into a host element the engine owns and moves.
 */
/** Shortest time between two of the same page sound, in ms. */
const SOUND_GAP = 300;

export function ReaderFlip({
  study,
  scale,
}: {
  study: CaseStudy;
  scale: number;
}) {
  const reduce = useReducedMotion();
  const phone = usePhone();
  const sound = useSound();
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const pages = useMemo(() => paginate(study, scale), [study, scale]);
  const pageOf = useMemo(() => sectionPageIndex(pages), [pages]);

  const mountRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const indexRef = useRef(0);
  const firstRun = useRef(true);
  const lastState = useRef<FlipState>("read");

  const [hosts, setHosts] = useState<HTMLDivElement[]>([]);
  const [index, setIndex] = useState(0);
  const [orientation, setOrientation] =
    useState<FlipOrientation>("landscape");
  const [tocOpen, setTocOpen] = useState(false);
  const [fitWidth, setFitWidth] = useState(2 * MAX_PAGE_W);

  // Cap the spread width so the book also fits the viewport height — but
  // never below the two-page threshold, so a short window shrinks the spread
  // rather than collapsing it to a single page.
  useEffect(() => {
    const measure = () => {
      const h = window.innerHeight - CHROME;
      const byHeight = 2 * h * (PAGE_W / PAGE_H);
      setFitWidth(Math.max(2 * MIN_PAGE_W, Math.min(2 * MAX_PAGE_W, byHeight)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Build the engine (and rebuild whenever pagination changes).
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const els = pages.map((p) => {
      const el = document.createElement("div");
      el.className = "stf-page select-none";
      if (p.kind === "title" || p.kind === "end") el.dataset.density = "hard";
      return el;
    });

    // deep link (#section) on first build; otherwise keep the reader's place
    let start = indexRef.current;
    if (firstRun.current) {
      firstRun.current = false;
      const hash = window.location.hash.slice(1);
      if (hash && pageOf[hash] !== undefined) start = pageOf[hash];
    }
    start = Math.max(0, Math.min(start, els.length - 1));

    // The engine takes over this element (and removes it on destroy), so give
    // it one of its own rather than a React-managed node.
    const block = document.createElement("div");
    mount.appendChild(block);

    const flip = new PageFlip(block, {
      width: PAGE_W,
      height: PAGE_H,
      size: "stretch",
      minWidth: MIN_PAGE_W,
      maxWidth: MAX_PAGE_W,
      minHeight: Math.round(MIN_PAGE_W * (PAGE_H / PAGE_W)),
      maxHeight: Math.round(MAX_PAGE_W * (PAGE_H / PAGE_W)),
      showCover: true,
      // phones read one page at a time; everything wider gets the spread
      usePortrait: phone,
      drawShadow: !reduce,
      maxShadowOpacity: 0.35,
      flippingTime: reduce ? 1 : 850,
      mobileScrollSupport: true,
      showPageCorners: !reduce,
      useMouseEvents: !reduce,
      startPage: start,
    });

    flip.on("init", (e) => {
      indexRef.current = e.data.page;
      setIndex(e.data.page);
      setOrientation(e.data.mode);
    });
    // The engine reports a fold in more cases than a real grab (and can repeat
    // a state), so the sounds are gated: a pickup needs a pointer actually
    // held on the book, and neither sound repeats within SOUND_GAP ms.
    let pressed = false;
    const down = () => (pressed = true);
    const up = () => (pressed = false);
    block.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    const last = { pickup: 0, flip: 0 };
    const once = (kind: "pickup" | "flip") => {
      const now = performance.now();
      if (now - last[kind] < SOUND_GAP) return;
      last[kind] = now;
      soundRef.current[kind]();
    };

    flip.on("flip", (e) => {
      indexRef.current = e.data;
      setIndex(e.data);
      // a dragged corner that was let go: the sound plays as it lands
      if (lastState.current === "user_fold") once("flip");
    });
    flip.on("changeState", (e) => {
      // fingers under the corner: the page is picked up before it turns
      if (e.data === "user_fold" && lastState.current !== "user_fold" && pressed) once("pickup");
      if (e.data === "flipping") once("flip");
      lastState.current = e.data;
    });
    flip.on("changeOrientation", (e) => setOrientation(e.data));

    flip.loadFromHTML(els);
    flipRef.current = flip;
    setHosts(els);

    return () => {
      block.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      flip.destroy();
      flipRef.current = null;
    };
  }, [pages, pageOf, reduce, phone]);

  // The engine only re-measures on window resize; nudge it when the mount's
  // width cap changes so the spread is sized to the real container.
  useEffect(() => {
    flipRef.current?.update();
  }, [fitWidth, hosts]);

  const canPrev = index > 0;
  const canNext = index < pages.length - 1;

  const go = useCallback(
    (dir: "next" | "prev") => {
      const flip = flipRef.current;
      if (!flip) return;
      if (dir === "next") flip.flipNext();
      else flip.flipPrev();
    },
    []
  );

  const jumpTo = useCallback((target: number) => {
    const flip = flipRef.current;
    setTocOpen(false);
    if (!flip) return;
    const n = Math.max(0, Math.min(target, flip.getPageCount() - 1));
    flip.flip(n);
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setTocOpen(false);
      if (tocOpen) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go("next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go("prev");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, tocOpen]);

  const twoUp =
    orientation === "landscape" && index > 0 && index + 1 < pages.length - 1;
  const pageLabel =
    index === 0
      ? "Cover"
      : index >= pages.length - 1
        ? "Back cover"
        : twoUp
          ? `Pages ${index}–${index + 1}`
          : `Page ${index}`;
  const innerCount = Math.max(1, pages.length - 2);

  return (
    <div className="flex flex-col items-center px-4">
      {/* the book */}
      <div
        ref={mountRef}
        className="book-mount mx-auto w-full"
        style={{ maxWidth: fitWidth }}
      />

      {/* page content, portalled into the engine's page elements */}
      {hosts.map((host, i) =>
        createPortal(
          <BookPage
            page={pages[i]}
            study={study}
            pageNumber={
              pages[i] && ["section", "figure", "prototype"].includes(pages[i].kind)
                ? i
                : undefined
            }
          />,
          host,
          `${study.slug}-${i}`
        )
      )}

      {/* live region */}
      <p className="sr-only" aria-live="polite">
        {pageLabel} of {innerCount}
      </p>

      {/* nav + progress + TOC */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        <NavButton
          label="Previous page"
          disabled={!canPrev}
          onClick={() => {
            sound.click();
            go("prev");
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </NavButton>
        <button
          type="button"
          onClick={() => {
            sound.click();
            setTocOpen(true);
          }}
          className="rounded-full border border-edge px-3 py-1.5 hover:text-ink"
        >
          Contents
        </button>
        <span className="tabular-nums">{pageLabel}</span>
        <span className="relative h-[3px] w-14 overflow-hidden rounded-full bg-edge sm:w-40">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-ink-soft transition-[width] duration-300"
            style={{
              width: `${
                pages.length > 1 ? (index / (pages.length - 1)) * 100 : 0
              }%`,
            }}
          />
        </span>
        <NavButton
          label="Next page"
          disabled={!canNext}
          onClick={() => {
            sound.click();
            go("next");
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </NavButton>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        {reduce ? "Use the arrows or ← →" : "Drag a corner, tap a page, or use ← →"}
      </p>

      {tocOpen && (
        <TocDialog
          study={study}
          onClose={() => setTocOpen(false)}
          onJump={(id) => jumpTo(pageOf[id] ?? 0)}
        />
      )}
    </div>
  );
}

/** True below the phone breakpoint (matches Tailwind's `sm`). */
function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return phone;
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-edge text-ink transition-[transform,opacity] hover:scale-105 active:scale-95 disabled:opacity-35 disabled:hover:scale-100"
    >
      {children}
    </button>
  );
}

/* ── a single page surface ── */
function BookPage({
  page,
  study,
  pageNumber,
}: {
  page?: Page;
  study: CaseStudy;
  pageNumber?: number;
}) {
  const hard = page?.kind === "title" || page?.kind === "end";
  return (
    <div
      className="book-page h-full w-full overflow-hidden bg-paper"
      style={{
        boxShadow: hard
          ? "inset 0 0 0 1px color-mix(in srgb, var(--ink) 14%, transparent)"
          : "inset 0 0 0 1px color-mix(in srgb, var(--ink) 6%, transparent)",
        // whisper of paper texture
        backgroundImage:
          "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--ink) 2%, transparent), transparent 60%)",
      }}
    >
      <div className="relative h-full">
        {/* the cover is the page: it runs to the edges, where text pages
            keep their margins */}
        <div className={page?.kind === "title" ? "h-full" : "h-full px-[8%] py-[8%]"}>
          {page && page.kind !== "blank" ? (
            <PageView page={page} study={study} pageNumber={pageNumber} />
          ) : null}
        </div>
        <div aria-hidden className="book-gutter pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
}

/* ── table of contents dialog ── */
function TocDialog({
  study,
  onClose,
  onJump,
}: {
  study: CaseStudy;
  onClose: () => void;
  onJump: (id: string) => void;
}) {
  const { click } = useSound();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Table of contents"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close contents"
        onClick={onClose}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_28%,transparent)] backdrop-blur-[2px]"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-edge bg-paper p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          Contents
        </p>
        <ol className="mt-4 flex flex-col gap-1">
          {study.sections.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  click();
                  onJump(s.id);
                }}
                className="flex w-full items-baseline gap-3 rounded-md px-2 py-2 text-left text-[15px] text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]"
              >
                <span className="font-mono text-[11px] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
