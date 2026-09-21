import { Fragment, type ReactNode } from "react";

/**
 * A small Markdown renderer for the exact subset used in the case-study bodies:
 * paragraphs, **bold**, *italic*, unordered/ordered lists, blockquotes and GFM
 * tables. Kept deliberately minimal to avoid a Markdown dependency; the content
 * is authored in-repo so the supported syntax is known and fixed.
 */
export function Markdown({ source }: { source: string }) {
  return <Blocks blocks={parseMarkdown(source)} />;
}

/** Render a pre-parsed list of blocks (used by the flip paginator). */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-body">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}

/** Parse a Markdown string into the block list. */
export function parseMarkdown(source: string): Block[] {
  return parseBlocks(source.trim());
}

export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[]; start?: number }
  | { type: "quote"; paras: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

function parseBlocks(src: string): Block[] {
  const lines = src.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const isTableSep = (s: string) => /^\s*\|?[\s:|-]+\|?\s*$/.test(s) && s.includes("-");

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // table: a pipe row followed by a separator row
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", head, rows });
      continue;
    }

    // blockquote
    if (line.trimStart().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      // split into paragraphs on blank lines; join wrapped lines with a break
      const paras: string[] = [];
      let cur: string[] = [];
      for (const q of quoteLines) {
        if (q.trim() === "") {
          if (cur.length) paras.push(cur.join("\n"));
          cur = [];
        } else cur.push(q);
      }
      if (cur.length) paras.push(cur.join("\n"));
      blocks.push({ type: "quote", paras });
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // paragraph: gather consecutive plain lines
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trimStart().startsWith(">") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]))
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }

  return blocks;
}

function splitRow(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function Block({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p>{inline(block.text)}</p>;
    case "ul":
      return (
        <ul>
          {block.items.map((it, i) => (
            <li key={i}>{inline(it)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol start={block.start}>
          {block.items.map((it, i) => (
            <li key={i}>{inline(it)}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote>
          {block.paras.map((p, i) => (
            <p key={i}>{inlineMultiline(p)}</p>
          ))}
        </blockquote>
      );
    case "table":
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i}>{inline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci}>{inline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/** Inline **bold** and *italic*. */
function inline(text: string): ReactNode {
  const boldParts = text.split("**");
  return boldParts.map((part, bi) => {
    const node = bi % 2 === 1 ? <strong>{italic(part)}</strong> : italic(part);
    return <Fragment key={bi}>{node}</Fragment>;
  });
}

function italic(text: string): ReactNode {
  const parts = text.split("*");
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <Fragment key={i}>{i % 2 === 1 ? <em>{part}</em> : part}</Fragment>
  ));
}

/** Like inline() but keeps hard line breaks (for quote attributions). */
function inlineMultiline(text: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((ln, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {inline(ln)}
    </Fragment>
  ));
}
