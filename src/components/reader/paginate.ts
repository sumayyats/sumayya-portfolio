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
  }

  // The title page is a stand-alone front cover and the end page a stand-alone
  // back cover; inner pages pair up into spreads, so pad to an even count.
  if ((pages.length - 1) % 2 === 1) pages.push({ kind: "blank" });
  pages.push({ kind: "end" });
  return pages;
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
