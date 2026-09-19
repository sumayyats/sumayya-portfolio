"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookSpine } from "./BookSpine";
import { BookCover } from "./BookCover";
import { ShelfBookDetail } from "./ShelfBookDetail";
import { shelfItems } from "./shelf-data";

export function Shelf() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bookRefs = useRef<(HTMLElement | null)[]>([]);
  const triggerRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  const [centerIndex, setCenterIndex] = useState(0);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

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

  // ── open / close ──────────────────────────────────────────────
  const open = useCallback((slug: string) => {
    triggerRef.current = (document.activeElement as HTMLElement) ?? null;
    setActiveSlug(slug);
  }, []);

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

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(420, el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        {/* the shelf row */}
        <div
          ref={scrollerRef}
          role="list"
          aria-label="Bookshelf of case studies"
          tabIndex={0}
          onKeyDown={onScrollerKeyDown}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onScroll={onScroll}
          className="no-scrollbar flex touch-pan-y snap-x snap-mandatory items-end gap-3 overflow-x-auto px-[max(1rem,8vw)] pb-6 pt-16 outline-none [scrollbar-width:none] sm:gap-4"
          style={{ cursor: "grab" }}
        >
          {shelfItems.map((item, i) => {
            const isActive = item.slug === activeSlug;
            // Render a same-width placeholder for the active featured book so the
            // shared-layout element lives only in the overlay (no duplicate id).
            if (isActive && item.kind === "featured") {
              return (
                <div
                  key={item.slug}
                  aria-hidden="true"
                  className="h-[344px] w-[54px] shrink-0 snap-center"
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
                  onOpen={open}
                  onFocusItem={setCenterIndex}
                />
              </div>
            );
          })}
        </div>

        {/* shelf ledge */}
        <div className="mx-[max(1rem,8vw)] h-[3px] rounded-full bg-[color-mix(in_srgb,var(--ink)_16%,transparent)]" />
        <div className="mx-[max(1rem,8vw)] h-4 rounded-b-md bg-gradient-to-b from-[color-mix(in_srgb,var(--ink)_9%,transparent)] to-transparent" />

        {/* controls: arrows, hint, counter */}
        <div className="mt-6 flex items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll shelf left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-edge hover:text-ink"
          >
            ←
          </button>
          <span className="hidden sm:inline">drag · scroll · arrow keys</span>
          <span aria-live="polite" className="tabular-nums">
            {position} / {total}
          </span>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll shelf right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-edge hover:text-ink"
          >
            →
          </button>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
