import type { CaseStudy } from "@/content/types";
import { parseMarkdown, type Block } from "@/components/Markdown";

export type Page =
  | { kind: "title" }
  | {
      kind: "section";
      sectionId: string;
      title: string;
      showTitle: boolean;
      blocks: Block[];
    }
  | { kind: "end" }
  | { kind: "blank" };

/**
 * Deterministic pagination: the page breaks are computed purely from the
 * section data and the text-size scale using an abstract line-cost model —
 * never from runtime DOM measurement — so the same inputs always yield the same
 * spreads. Re-run when the scale changes.
 */
export function paginate(study: CaseStudy, scale: number): Page[] {
  // Larger text → fewer lines and fewer characters per line on a page.
  const budget = 20 / scale; // line-units per page
  const cpl = 44 / scale; // characters per line

  const pages: Page[] = [{ kind: "title" }];

  for (const section of study.sections) {
    const blocks = parseMarkdown(section.body);
    let current: Block[] = [];
    let cost = 2.6; // heading
    let first = true;

    const flush = () => {
      pages.push({
        kind: "section",
        sectionId: section.id,
        title: section.title,
        showTitle: first,
        blocks: current,
      });
      first = false;
      current = [];
      cost = 0.8; // continued page: no heading, small top padding
    };

    for (const b of blocks) {
      const c = blockCost(b, cpl);
      if (current.length > 0 && cost + c > budget) flush();
      current.push(b);
      cost += c;
    }
    flush();
  }

  pages.push({ kind: "end" });
  if (pages.length % 2 === 1) pages.push({ kind: "blank" });
  return pages;
}

function blockCost(b: Block, cpl: number): number {
  const lines = (chars: number) => Math.max(1, Math.ceil(chars / cpl));
  switch (b.type) {
    case "p":
      return lines(b.text.length) + 0.6;
    case "ul":
    case "ol":
      return b.items.reduce((n, it) => n + lines(it.length) + 0.3, 0) + 0.6;
    case "quote":
      return b.paras.reduce((n, p) => n + lines(p.length), 0) + 1;
    case "table":
      return 1.8 + b.rows.length * 1.7 + 0.8;
  }
}

/** First page index (0-based) for each section id, for the TOC. */
export function sectionPageIndex(pages: Page[]): Record<string, number> {
  const map: Record<string, number> = {};
  pages.forEach((p, i) => {
    if (p.kind === "section" && map[p.sectionId] === undefined) {
      map[p.sectionId] = i;
    }
  });
  return map;
}
