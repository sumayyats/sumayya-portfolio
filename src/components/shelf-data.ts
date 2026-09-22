import { caseStudies, externalBooks } from "@/content/case-studies";
import type { CaseStudy, ExternalBook } from "@/content/types";

export type ShelfItem =
  | {
      kind: "featured";
      slug: string;
      title: string;
      year?: string;
      study: CaseStudy;
    }
  | { kind: "external"; slug: string; title: string; url: string; year?: string };

/**
 * Sort key from a year label: the year the work finished, then the year it
 * started, so "2025–26" lands just behind a straight "2026".
 */
function yearKey(year?: string): [number, number] {
  const parts = year?.match(/\d{4}|\d{2}/g) ?? [];
  if (parts.length === 0) return [0, 0];
  const start = Number(parts[0]);
  let end = start;
  if (parts[1]) {
    const n = Number(parts[1]);
    // "2025–26" → 2026; "2021–2022" → 2022
    end = n < 100 ? Math.floor(start / 100) * 100 + n : n;
  }
  return [end, start];
}

/** Most recent first. */
function newestFirst(a: { year?: string }, b: { year?: string }): number {
  const [ae, as] = yearKey(a.year);
  const [be, bs] = yearKey(b.year);
  return be - ae || bs - as;
}

/**
 * Featured books first (so the eye lands on them), then the Behance spines —
 * each group ordered with the most recent work on the left.
 */
export const shelfItems: ShelfItem[] = [
  ...caseStudies
    .map(
      (study): ShelfItem => ({
        kind: "featured",
        slug: study.slug,
        title: study.title,
        year: study.year,
        study,
      })
    )
    .sort(newestFirst),
  ...externalBooks
    .map(
      (b: ExternalBook): ShelfItem => ({
        kind: "external",
        slug: b.slug,
        title: b.title,
        url: b.externalUrl,
        year: b.year,
      })
    )
    .sort(newestFirst),
];

export const featuredSlugs = shelfItems
  .filter((i) => i.kind === "featured")
  .map((i) => i.slug);
