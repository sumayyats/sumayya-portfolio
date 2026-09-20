"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { paginate, sectionPageIndex, type Page } from "./paginate";
import { PageView } from "./PageView";

const TURN = 0.64; // seconds
const EASE = [0.22, 0.61, 0.36, 1] as const;
const PERSPECTIVE = 2200;

export function ReaderFlip({
  study,
  scale,
  soundOn,
}: {
  study: CaseStudy;
  scale: number;
  soundOn: boolean;
}) {
  const reduce = useReducedMotion();
  const pages = useMemo(() => paginate(study, scale), [study, scale]);
  const pageOf = useMemo(() => sectionPageIndex(pages), [pages]);

  const [twoPage, setTwoPage] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 760px)");
    const apply = () => setTwoPage(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const step = twoPage ? 2 : 1;
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<null | { dir: "next" | "prev"; n: number }>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const turnCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // keep index valid + aligned to spread when pagination or mode changes
  useEffect(() => {
    setIndex((i) => {
      let n = Math.min(i, pages.length - 1);
      if (twoPage) n = n - (n % 2);
      return Math.max(0, n);
    });
    setTurn(null);
  }, [pages.length, twoPage]);

  const canNext = index + step < pages.length;
  const canPrev = index - step >= 0;

  const playSound = useCallback(() => {
    if (!soundOn || !audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
    } catch {
      /* ignore */
    }
  }, [soundOn]);

  const go = useCallback(
    (dir: "next" | "prev") => {
      if (turn) return; // no double-trigger mid-animation
      if (dir === "next" && !canNext) return;
      if (dir === "prev" && !canPrev) return;
      playSound();
      if (reduce) {
        setIndex((i) => i + (dir === "next" ? step : -step));
        return;
      }
      turnCount.current += 1;
      setTurn({ dir, n: turnCount.current });
    },
    [turn, canNext, canPrev, reduce, step, playSound]
  );

  const commit = useCallback(() => {
    setTurn((t) => {
      if (!t) return null;
      setIndex((i) => i + (t.dir === "next" ? step : -step));
      return null;
    });
  }, [step]);

  const jumpTo = useCallback(
    (target: number) => {
      let n = Math.max(0, Math.min(target, pages.length - 1));
      if (twoPage) n = n - (n % 2);
      setTurn(null);
      setIndex(n);
      setTocOpen(false);
    },
    [pages.length, twoPage]
  );

  // deep link to a section (#id) → its page
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && pageOf[hash] !== undefined) jumpTo(pageOf[hash]);
    // run once per study
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [study.slug]);

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

  // swipe / drag
  const drag = useRef({ x: 0, active: false });
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, active: true };
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    drag.current.active = false;
    if (Math.abs(dx) > 60) go(dx < 0 ? "next" : "prev");
  };

  const pageNum = (i: number) =>
    pages[i]?.kind === "section" ? i + 1 : undefined;

  // base slots depend on whether a turn is in progress
  let baseLeft = index;
  let baseRight = index + 1;
  if (turn && twoPage) {
    if (turn.dir === "next") baseRight = index + 3; // reveal new right
    else baseLeft = index - 2; // reveal new left
  }
  const baseSingle = turn
    ? turn.dir === "next"
      ? index + 1
      : index - 1
    : index;

  return (
    <div className="flex flex-col items-center px-[max(1rem,4vw)]">
      {/* Sound is off by default; file loads only when a turn plays it. */}
      <audio ref={audioRef} src="/audio/page-turn.mp3" preload="none" />

      {/* the book */}
      <div
        className="relative w-full select-none"
        style={{ perspective: PERSPECTIVE, maxWidth: twoPage ? 1000 : 480 }}
        onPointerDown={onDown}
        onPointerUp={onUp}
      >
        <div
          className="relative mx-auto"
          style={{
            width: `min(100%, calc(min(74vh, 660px) * ${twoPage ? 1.46 : 0.72}))`,
            aspectRatio: twoPage ? "1.46" : "0.72",
          }}
        >
          {reduce ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Spread
                  twoPage={twoPage}
                  left={pages[index]}
                  right={pages[index + 1]}
                  single={pages[index]}
                  study={study}
                  leftNum={pageNum(index)}
                  rightNum={pageNum(index + 1)}
                  singleNum={pageNum(index)}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              {/* base (revealed) layer */}
              <div className="absolute inset-0">
                <Spread
                  twoPage={twoPage}
                  left={pages[baseLeft]}
                  right={pages[baseRight]}
                  single={pages[baseSingle]}
                  study={study}
                  leftNum={pageNum(baseLeft)}
                  rightNum={pageNum(baseRight)}
                  singleNum={pageNum(baseSingle)}
                />
              </div>

              {/* turning leaf */}
              {turn && (
                <Leaf
                  key={turn.n}
                  dir={turn.dir}
                  twoPage={twoPage}
                  index={index}
                  pages={pages}
                  study={study}
                  onDone={commit}
                />
              )}
            </>
          )}

          {/* spine / gutter shadow (two-page) */}
          {twoPage && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-10 -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,0,0,0.14), transparent)",
              }}
            />
          )}

          {/* edge click zones */}
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => go("prev")}
            disabled={!canPrev}
            className="absolute inset-y-0 left-0 z-30 w-[12%] cursor-w-resize disabled:cursor-default"
          />
          <button
            type="button"
            aria-label="Next page"
            onClick={() => go("next")}
            disabled={!canNext}
            className="absolute inset-y-0 right-0 z-30 w-[12%] cursor-e-resize disabled:cursor-default"
          />
        </div>
      </div>

      {/* live region */}
      <p className="sr-only" aria-live="polite">
        Page {index + 1} of {pages.length}
      </p>

      {/* progress + TOC */}
      <div className="mt-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        <button
          type="button"
          onClick={() => setTocOpen(true)}
          className="rounded-full border border-edge px-3 py-1.5 hover:text-ink"
        >
          Contents
        </button>
        <span className="tabular-nums">
          Page {index + 1}
          {twoPage && index + 1 < pages.length ? `–${index + 2}` : ""} of{" "}
          {pages.length}
        </span>
        <span className="relative h-[3px] w-40 overflow-hidden rounded-full bg-edge">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-ink-soft transition-[width] duration-300"
            style={{
              width: `${
                pages.length > 1 ? (index / (pages.length - 1)) * 100 : 0
              }%`,
            }}
          />
        </span>
      </div>

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

/* ── the two-page (or single) spread of static pages ── */
function Spread({
  twoPage,
  left,
  right,
  single,
  study,
  leftNum,
  rightNum,
  singleNum,
}: {
  twoPage: boolean;
  left?: Page;
  right?: Page;
  single?: Page;
  study: CaseStudy;
  leftNum?: number;
  rightNum?: number;
  singleNum?: number;
}) {
  if (!twoPage) {
    return (
      <div className="absolute inset-0">
        <BookPage page={single} study={study} side="single" pageNumber={singleNum} />
      </div>
    );
  }
  return (
    <>
      <div className="absolute inset-y-0 left-0 w-1/2">
        <BookPage page={left} study={study} side="left" pageNumber={leftNum} />
      </div>
      <div className="absolute inset-y-0 right-0 w-1/2">
        <BookPage page={right} study={study} side="right" pageNumber={rightNum} />
      </div>
    </>
  );
}

/* ── the rotating leaf ── */
function Leaf({
  dir,
  twoPage,
  index,
  pages,
  study,
  onDone,
}: {
  dir: "next" | "prev";
  twoPage: boolean;
  index: number;
  pages: Page[];
  study: CaseStudy;
  onDone: () => void;
}) {
  // geometry per direction/mode
  const isNext = dir === "next";
  let sideClass: string;
  let origin: string;
  let from: number;
  let to: number;
  let front: Page | undefined;
  let back: Page | undefined;
  let frontSide: "left" | "right" | "single";
  let backSide: "left" | "right" | "single";
  let frontNum: number | undefined;
  let backNum: number | undefined;

  if (twoPage) {
    if (isNext) {
      sideClass = "right-0 w-1/2";
      origin = "left center";
      from = 0;
      to = -180;
      front = pages[index + 1];
      back = pages[index + 2];
      frontSide = "right";
      backSide = "left";
      frontNum = num(pages, index + 1);
      backNum = num(pages, index + 2);
    } else {
      sideClass = "left-0 w-1/2";
      origin = "right center";
      from = 0;
      to = 180;
      front = pages[index];
      back = pages[index - 1];
      frontSide = "left";
      backSide = "right";
      frontNum = num(pages, index);
      backNum = num(pages, index - 1);
    }
  } else {
    // single page
    sideClass = "left-0 w-full";
    origin = "left center";
    if (isNext) {
      from = 0;
      to = -180;
      front = pages[index];
      back = undefined; // blank paper backside
      frontNum = num(pages, index);
    } else {
      from = -180;
      to = 0;
      front = pages[index - 1];
      back = undefined;
      frontNum = num(pages, index - 1);
    }
    frontSide = "single";
    backSide = "single";
  }

  return (
    <motion.div
      className={`absolute inset-y-0 z-10 ${sideClass}`}
      style={{ transformStyle: "preserve-3d", transformOrigin: origin }}
      initial={{ rotateY: from }}
      animate={{ rotateY: to }}
      transition={{ duration: TURN, ease: EASE }}
      onAnimationComplete={onDone}
    >
      <div
        className="absolute inset-0"
        style={{ backfaceVisibility: "hidden" }}
      >
        <BookPage page={front} study={study} side={frontSide} pageNumber={frontNum} shadow />
      </div>
      <div
        className="absolute inset-0"
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <BookPage page={back} study={study} side={backSide} pageNumber={backNum} shadow />
      </div>
    </motion.div>
  );
}

function num(pages: Page[], i: number) {
  return pages[i]?.kind === "section" ? i + 1 : undefined;
}

/* ── a single page surface ── */
function BookPage({
  page,
  study,
  side,
  pageNumber,
  shadow = false,
}: {
  page?: Page;
  study: CaseStudy;
  side: "left" | "right" | "single";
  pageNumber?: number;
  shadow?: boolean;
}) {
  const gutter =
    side === "left"
      ? "linear-gradient(90deg, transparent 88%, rgba(0,0,0,0.1))"
      : side === "right"
        ? "linear-gradient(270deg, transparent 88%, rgba(0,0,0,0.1))"
        : "none";
  const radius =
    side === "left"
      ? "10px 3px 3px 10px"
      : side === "right"
        ? "3px 10px 10px 3px"
        : "8px";
  return (
    <div
      className="h-full w-full overflow-hidden bg-paper"
      style={{
        borderRadius: radius,
        boxShadow: shadow
          ? "0 20px 44px -20px rgba(0,0,0,0.45)"
          : "inset 0 0 0 1px color-mix(in srgb, var(--ink) 6%, transparent)",
        // whisper of paper texture
        backgroundImage:
          "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--ink) 2%, transparent), transparent 60%)",
      }}
    >
      <div className="relative h-full">
        <div className="h-full px-[8%] py-[8%]">
          {page && page.kind !== "blank" ? (
            <PageView page={page} study={study} pageNumber={pageNumber} />
          ) : null}
        </div>
        {gutter !== "none" && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: gutter }}
          />
        )}
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
                onClick={() => onJump(s.id)}
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
