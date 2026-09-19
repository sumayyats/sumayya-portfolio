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
import { bookGeometry, projectedWidth } from "./book-geometry";

export function Shelf() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bookRefs = useRef<(HTMLElement | null)[]>([]);
  const triggerRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

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
          className="no-scrollbar touch-pan-y snap-x overflow-x-auto px-[max(1rem,4vw)] pb-6 pt-14 outline-none [scrollbar-width:none]"
          style={{ cursor: "grab" }}
        >
          <div
            role="list"
            className="mx-auto flex w-max items-end gap-[2px]"
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
        <div className="mx-[max(1rem,6vw)] h-6 rounded-b-xl bg-gradient-to-b from-[color-mix(in_srgb,var(--ink)_6%,transparent)] to-transparent" />

        {/* progress bar + page count */}
        <div className="mt-7 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
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
