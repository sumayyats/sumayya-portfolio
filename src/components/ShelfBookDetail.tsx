"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CaseStudy } from "@/content/types";

type Props = {
  study: CaseStudy;
  position: number; // 1-based across all shelf items
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * The card that slides in from the right when a book is picked up: date, title,
 * subtitle, metadata line, summary, and the Read / Put-the-book-back actions.
 */
export function ShelfBookDetail({
  study,
  position,
  total,
  onClose,
  onPrev,
  onNext,
}: Props) {
  return (
    <motion.aside
      key={study.slug}
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 32, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="pointer-events-auto w-[min(88vw,360px)] rounded-2xl border border-edge bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] backdrop-blur-sm"
      role="dialog"
      aria-label={`${study.title} — book details`}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        <span>{study.year}</span>
        <span>
          {position} / {total}
        </span>
      </div>

      <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight text-ink">
        {study.title}
      </h2>
      <p className="mt-1 text-[15px] text-ink-soft">{study.subtitle}</p>

      <p className="mt-4 border-y border-edge py-2 font-mono text-[11px] leading-relaxed tracking-wide text-ink-soft">
        {study.meta}
      </p>

      <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ink">
        {study.summary}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/case/${study.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[#fbf7ee] transition-transform hover:-translate-y-0.5"
        >
          Read
          <span aria-hidden="true">→</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-edge px-4 py-2.5 text-sm text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]"
        >
          Put the book back
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 font-mono text-[11px] text-ink-soft">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous book"
          className="rounded px-1 hover:text-ink"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next book"
          className="rounded px-1 hover:text-ink"
        >
          →
        </button>
        <span className="ml-1">esc to close · ← → to browse</span>
      </div>
    </motion.aside>
  );
}
