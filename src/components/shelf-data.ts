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
  | {
      kind: "external";
      slug: string;
      title: string;
      url: string;
      year?: string;
      /** Where it lives, when it isn't Behance. */
      note?: string;
      /** Cover image from the publication, previewed on hover. */
      preview?: string;
      /** Replaces the default "opens the case study on Behance" label. */
      ariaLabel?: string;
      /** A cloth colour of its own, instead of the quiet grey. */
      cloth?: string;
    };

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
        note: b.note,
        preview: b.preview,
      })
    )
    .sort(newestFirst),
  // Not case studies: how to reach me, standing at the end of the shelf.
  {
    kind: "external",
    slug: "resume",
    title: "Résumé",
    url: "/Sumayya_Tsabitah_CV.pdf",
    note: "PDF · opens in a new tab",
    ariaLabel: "Résumé — opens Sumayya's CV as a PDF in a new tab",
    cloth: "#66702F", // olive
  },
  {
    kind: "external",
    slug: "linkedin",
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/sumayyatsabitah/",
    note: "linkedin.com/in/sumayyatsabitah",
    ariaLabel: "LinkedIn — opens Sumayya's LinkedIn profile in a new tab",
    cloth: "#2B5C9A", // LinkedIn's blue, muted to sit with the shelf
  },
];

export const featuredSlugs = shelfItems
  .filter((i) => i.kind === "featured")
  .map((i) => i.slug);
