import { caseStudies, externalBooks } from "@/content/case-studies";
import type { CaseStudy, ExternalBook } from "@/content/types";

export type ShelfItem =
  | { kind: "featured"; slug: string; title: string; study: CaseStudy }
  | { kind: "external"; slug: string; title: string; url: string };

/** Featured books first (so the eye lands on them), then the Behance spines. */
export const shelfItems: ShelfItem[] = [
  ...caseStudies.map(
    (study): ShelfItem => ({
      kind: "featured",
      slug: study.slug,
      title: study.title,
      study,
    })
  ),
  ...externalBooks.map(
    (b: ExternalBook): ShelfItem => ({
      kind: "external",
      slug: b.slug,
      title: b.title,
      url: b.externalUrl,
    })
  ),
];

export const featuredSlugs = caseStudies.map((c) => c.slug);
