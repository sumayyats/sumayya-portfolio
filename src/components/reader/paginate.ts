import type { CaseStudy, CaseStudyVisual } from "@/content/types";
import { parseMarkdown, type Block } from "@/components/Markdown";

export type Page =
  | { kind: "title" }
  | {
      kind: "section";
      sectionId: string;
      title: string;
      showTitle: boolean;
      /** The study link (first page of the book's first section). */
      showMeta: boolean;
      blocks: Block[];
    }
  | { kind: "figure"; visual: CaseStudyVisual }
  | { kind: "prototype" }
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
  // Body text is 3.4% of the page width at line-height 1.65 (globals.css) on
  // a 500×650 page with 8% padding; both figures carry a small margin for
  // font hinting at phone sizes.
  const budget = 18.3 / scale; // line-units per page
  const cpl = 46 / scale; // characters per line

  const pages: Page[] = [{ kind: "title" }];

  study.sections.forEach((section, si) => {
    const blocks = parseMarkdown(section.body);
    let current: Block[] = [];
    let cost = 2.6; // heading
    if (si === 0) cost += metaCost(study);
    let first = true;

    const flush = () => {
      pages.push({
        kind: "section",
        sectionId: section.id,
        title: section.title,
        showTitle: first,
        showMeta: si === 0 && first,
        blocks: current,
      });
      first = false;
      current = [];
      cost = 0.8; // continued page: no heading, small top padding
    };

    for (const b of blocks) {
      // Tables and lists split across pages (by row / by item) rather than
      // overflowing when taller than a page.
      for (const part of splitBlock(b, budget - cost, budget, cpl)) {
        const c = blockCost(part, cpl);
        if (current.length > 0 && cost + c > budget) flush();
        current.push(part);
        cost += c;
      }
    }
    flush();

    // each of the section's exported figures gets a page of its own, after
    // its text (placeholders stay in Scroll view only)
    for (const v of study.visuals) {
      if (v.sectionId === section.id && (v.frames || v.width)) {
        pages.push({ kind: "figure", visual: v });
      }
    }
  });

  if (study.prototype?.type === "figma" && study.prototype.url) {
    pages.push({ kind: "prototype" });
  }

  // The title page is a stand-alone front cover and the end page a stand-alone
  // back cover; inner pages pair up into spreads, so pad to an even count.
  if ((pages.length - 1) % 2 === 1) pages.push({ kind: "blank" });
  pages.push({ kind: "end" });
  return pages;
}

/** Line cost of the study link row at the top of the Overview page. */
function metaCost(study: CaseStudy): number {
  return study.link ? 1.6 : 0;
}

/**
 * Break a table (by row, header repeated) or a list (by item, numbering kept)
 * into page-sized pieces. `remaining` is the room left on the current page;
 * later pieces get a fresh page (`budget` minus its top padding).
 */
function splitBlock(
  b: Block,
  remaining: number,
  budget: number,
  cpl: number
): Block[] {
  if (b.type === "p" || b.type === "quote") return [b];
  const fresh = budget - 0.8;
  const whole = blockCost(b, cpl);
  if (whole <= remaining || whole <= fresh) return [b];

  const units: string[][] | string[] =
    b.type === "table" ? b.rows : b.items;
  // rebuild a block of the same type from a run of units
  const make = (run: (string[] | string)[], offset: number): Block => {
    if (b.type === "table") return { ...b, rows: run as string[][] };
    if (b.type === "ol")
      return { ...b, items: run as string[], start: (b.start ?? 1) + offset };
    return { ...b, items: run as string[] };
  };

  const parts: Block[] = [];
  let run: (string[] | string)[] = [];
  let offset = 0;
  let target = remaining;
  units.forEach((u: string[] | string, i: number) => {
    if (run.length > 0 && blockCost(make([...run, u], offset), cpl) > target) {
      parts.push(make(run, offset));
      offset = i;
      run = [];
      target = fresh;
    }
    run.push(u);
    // a single unit too tall for the space it has: start it on a fresh page
    if (run.length === 1 && blockCost(make(run, offset), cpl) > target) {
      target = fresh;
    }
  });
  if (run.length) parts.push(make(run, offset));
  return parts;
}

function blockCost(b: Block, cpl: number): number {
  const lines = (chars: number) => Math.max(1, Math.ceil(chars / cpl));
  switch (b.type) {
    case "p":
      return lines(b.text.length) + 0.6;
    case "ul":
    case "ol": {
      // items wrap a little narrower than paragraphs (list indent)
      const itemCpl = cpl * 0.93;
      return (
        b.items.reduce(
          (n, it) => n + Math.max(1, Math.ceil(it.length / itemCpl)) + 0.3,
          0
        ) + 0.6
      );
    }
    case "quote":
      return b.paras.reduce((n, p) => n + lines(p.length), 0) + 1;
    case "table": {
      // Cells wrap within their column, so a row is as tall as its longest
      // cell at roughly (cpl / columns) characters per line.
      const cols = Math.max(1, b.head.length);
      const colCpl = Math.max(8, (cpl * 0.94) / cols); // 0.94: table text is smaller
      const rowLines = (cells: string[]) =>
        Math.max(1, ...cells.map((c) => Math.ceil(c.length / colCpl)));
      const rows = b.rows.reduce((n, r) => n + rowLines(r) + 0.7, 0);
      return rowLines(b.head) + 0.7 + rows + 0.8;
    }
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
