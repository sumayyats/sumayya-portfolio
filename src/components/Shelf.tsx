"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BookSpine } from "./BookSpine";
import { BookCover } from "./BookCover";
import { ShelfBookDetail } from "./ShelfBookDetail";
import { ShelfBookStack } from "./ShelfBookStack";
import { shelfItems } from "./shelf-data";
import { bookGeometry, projectedWidth } from "./book-geometry";
import { useSound } from "@/lib/sound";

const PHONE = "(max-width: 767px)";
const subPhone = (cb: () => void) => {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
/** Phones get the picked-up book as a swipeable stack of two cards. */
const usePhone = () => useSyncExternalStore(subPhone, () => window.matchMedia(PHONE).matches, () => false);

/** The tallest a book gets (see bookGeometry), before `scale`. */
const SHELF_MAX_H = 528;

export function Shelf() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bookRefs = useRef<(HTMLElement | null)[]>([]);
  const triggerRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { click } = useSound();
  const phone = usePhone();

  const [centerIndex, setCenterIndex] = useState(0);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // Fit the books to the viewport height (tallest featured book ≈ base 520px).
  useEffect(() => {
    const measure = () => {
      const avail = window.innerHeight - 250; // header + progress + gutters
      setScale(Math.max(0.55, Math.min(1.28, avail / 620)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const total = shelfItems.length;
  const featuredIndexes = useMemo(
    () => shelfItems.map((it, i) => (it.kind === "featured" ? i : -1)).filter((i) => i >= 0),
    []
  );

  const activeIndex = activeSlug
    ? shelfItems.findIndex((it) => it.slug === activeSlug)
    : -1;
  const activeStudy =
    activeIndex >= 0 && shelfItems[activeIndex].kind === "featured"
      ? shelfItems[activeIndex].study
      : null;

  const position = (activeIndex >= 0 ? activeIndex : centerIndex) + 1;
  const progress = total > 1 ? (position - 1) / (total - 1) : 0;

  // ── open / close ──────────────────────────────────────────────
  const open = useCallback(
    (slug: string) => {
      click();
      triggerRef.current = (document.activeElement as HTMLElement) ?? null;
      setActiveSlug(slug);
    },
    [click]
  );

  const close = useCallback(() => {
    setActiveSlug(null);
    // return focus to the spine that opened the book
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const browseFeatured = useCallback(
    (dir: 1 | -1) => {
      setActiveSlug((cur) => {
        if (!cur) return cur;
        const curIdx = shelfItems.findIndex((it) => it.slug === cur);
        const pos = featuredIndexes.indexOf(curIdx);
        const next =
          featuredIndexes[
            (pos + dir + featuredIndexes.length) % featuredIndexes.length
          ];
        return shelfItems[next].slug;
      });
    },
    [featuredIndexes]
  );

  // lock body scroll while a book is open
  useEffect(() => {
    if (!activeSlug) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeSlug]);

  // keyboard while open
  useEffect(() => {
    if (!activeSlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        browseFeatured(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        browseFeatured(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlug, close, browseFeatured]);

  // ── shelf navigation (closed) ─────────────────────────────────
  const focusBook = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(shelfItems.length - 1, index));
    const el = bookRefs.current[clamped];
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  const onScrollerKeyDown = (e: React.KeyboardEvent) => {
    if (activeSlug) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const from = Number(
        (document.activeElement as HTMLElement)?.dataset?.index ?? centerIndex
      );
      focusBook(from + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const from = Number(
        (document.activeElement as HTMLElement)?.dataset?.index ?? centerIndex
      );
      focusBook(from - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusBook(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusBook(shelfItems.length - 1);
    }
  };

  // shift+wheel → horizontal (never trap plain vertical scroll)
  const onWheel = (e: React.WheelEvent) => {
    if (!e.shiftKey) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft += e.deltaY;
  };

  // pointer drag to scroll
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = {
      down: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const endDrag = () => {
    drag.current.down = false;
  };

  // track the book nearest the centre for the counter
  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    bookRefs.current.forEach((node, i) => {
      if (!node) return;
      const c = node.offsetLeft + node.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setCenterIndex(best);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        {/* the shelf row (centred when it fits, scrolls when it doesn't) */}
        <div
          ref={scrollerRef}
          tabIndex={0}
          onKeyDown={onScrollerKeyDown}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onScroll={onScroll}
          aria-label="Bookshelf of case studies"
          className="no-scrollbar touch-pan-y snap-x overflow-x-auto pb-16 pt-14 outline-none [scrollbar-width:none]"
          style={{ cursor: "grab" }}
        >
          <div
            role="list"
            // Shelved tight: the books touch, and only the one you point at
            // makes room for itself.
            className="mx-auto flex w-max items-end gap-0"
            // The side margin lives on the row, not the scroller: once the
            // row is wider than the viewport the scroller's padding stops
            // holding the first book off the edge. A leaning book paints up
            // to ~13% of its height left of its own box, so the left margin
            // is sized from the tallest book at the current scale — enough to
            // clear it on a phone, invisible on a desktop where the row is
            // centred anyway.
            style={{
              paddingLeft: Math.round(SHELF_MAX_H * 0.13 * scale) + 8,
              paddingRight: Math.round(24 * scale) + 8,
            }}
          >
            {shelfItems.map((item, i) => {
              const isActive = item.slug === activeSlug;
              // Same-width placeholder for the active featured book so the
              // shared-layout element lives only in the overlay (no dup id).
              if (isActive && item.kind === "featured") {
                const g = bookGeometry(i, "featured", scale);
                return (
                  <div
                    key={item.slug}
                    aria-hidden="true"
                    className="shrink-0 snap-center self-end"
                    style={{ width: projectedWidth(g), height: g.height + 12 }}
                  />
                );
              }
              return (
                <div key={item.slug} role="listitem" className="shrink-0">
                  <BookSpine
                    ref={(el: HTMLElement | null) => {
                      bookRefs.current[i] = el;
                    }}
                    item={item}
                    index={i}
                    scale={scale}
                    onOpen={open}
                    onFocusItem={setCenterIndex}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* soft surface — the cast shadows do the grounding, like the reference */}
        <div className="mx-[max(1rem,6vw)] mt-5 h-6 rounded-b-xl bg-gradient-to-b from-[color-mix(in_srgb,var(--ink)_6%,transparent)] to-transparent" />

        {/* step controls, position, progress, and how to move along */}
        <div className="mt-7 flex flex-col items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          <div className="flex items-center gap-3">
            <ShelfStep
              dir={-1}
              disabled={centerIndex <= 0}
              onStep={() => focusBook(centerIndex - 1)}
            />
            <span aria-live="polite" className="tabular-nums">
              {position} / {total}
            </span>
            <span
              className="relative h-[3px] w-40 overflow-hidden rounded-full bg-edge"
              aria-hidden="true"
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-ink-soft transition-[width] duration-300 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </span>
            <ShelfStep
              dir={1}
              disabled={centerIndex >= total - 1}
              onStep={() => focusBook(centerIndex + 1)}
            />
          </div>
          <p className="text-[10px] tracking-[0.2em] opacity-80">
            drag · scroll · arrow keys
          </p>
        </div>

        {/* ── open book overlay ── */}
        <AnimatePresence>
          {activeStudy && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
            >
              {/* backdrop over the shelf (shelf stays visible behind) */}
              <button
                type="button"
                aria-label="Put the book back"
                onClick={close}
                className="absolute inset-0 bg-[color-mix(in_srgb,var(--paper)_58%,transparent)] backdrop-blur-[2px]"
              />

              {phone ? (
                <div className="relative z-10">
                  {/* no key: browsing with ← → keeps whichever card is in front */}
                  <ShelfBookStack
                    study={activeStudy}
                    position={activeIndex + 1}
                    total={total}
                    onClose={close}
                    onPrev={() => browseFeatured(-1)}
                    onNext={() => browseFeatured(1)}
                  />
                </div>
              ) : (
                <div className="pointer-events-none relative z-10 flex w-full max-w-5xl flex-col items-center gap-6 px-4 md:flex-row md:items-center md:justify-center md:gap-10">
                  <motion.div
                    layoutId={`book-${activeStudy.slug}`}
                    className="pointer-events-auto aspect-[3/4] h-[46vh] max-h-[540px] shrink-0 md:h-[70vh]"
                    transition={{ type: "spring", stiffness: 220, damping: 30 }}
                  >
                    <BookCover study={activeStudy} />
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <ShelfBookDetail
                      key={activeStudy.slug}
                      study={activeStudy}
                      position={activeIndex + 1}
                      total={total}
                      onClose={close}
                      onPrev={() => browseFeatured(-1)}
                      onNext={() => browseFeatured(1)}
                    />
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

/** One step along the shelf: the ← / → either side of the counter. */
function ShelfStep({
  dir,
  disabled,
  onStep,
}: {
  dir: 1 | -1;
  disabled: boolean;
  onStep: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onStep}
      disabled={disabled}
      aria-label={dir < 0 ? "Previous book" : "Next book"}
      className="grid h-7 w-7 place-items-center rounded-full border border-edge text-[12px] text-ink-soft transition-colors hover:border-ink-soft hover:text-ink disabled:pointer-events-none disabled:opacity-35"
    >
      <span aria-hidden="true">{dir < 0 ? "←" : "→"}</span>
    </button>
  );
}
