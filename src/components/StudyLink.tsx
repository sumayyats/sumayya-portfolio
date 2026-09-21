"use client";

import type { CaseStudy } from "@/content/types";
import { useSound } from "@/lib/sound";

/**
 * "Where the work lives" link (store listing, live site, prototype).
 * Opens in a new tab; renders nothing when the study has no link.
 */
export function StudyLink({
  study,
  className = "",
}: {
  study: CaseStudy;
  className?: string;
}) {
  const { click } = useSound();
  if (!study.link) return null;
  return (
    <a
      href={study.link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={click}
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.14em] text-accent underline decoration-[color-mix(in_srgb,var(--accent)_45%,transparent)] underline-offset-4 hover:decoration-accent ${className}`}
    >
      {study.link.label}
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
