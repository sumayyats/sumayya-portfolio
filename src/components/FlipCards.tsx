"use client";

import { useState, type ReactNode } from "react";

/**
 * A list as a grid of flash cards: the bold lead-in on the front, the
 * explanation on the back. Tap, click, Enter or Space flips a card. Items
 * without a bold lead-in have nothing to reveal, so they sit as plain cards.
 */
export function FlipCards({
  items,
  ordered = false,
  render,
}: {
  items: string[];
  ordered?: boolean;
  /** The Markdown inline renderer, for **bold** and *italic* on the back. */
  render: (text: string) => ReactNode;
}) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className="flip-grid" role="list">
      {items.map((item, i) => (
        <li key={i}>
          <FlipCard item={item} index={i} render={render} />
        </li>
      ))}
    </List>
  );
}

/** Splits "**Lead.** rest" into the front and back of a card. */
export function splitLead(item: string): { lead: string; back: string } | null {
  const m = item.match(/^\*\*([\s\S]+?)\*\*\s*([\s\S]*)$/);
  if (!m) return null;
  const [, rawLead, rest] = m;
  if (!rest.trim()) return null;
  // "Lead." / "Lead:" ends a thought, so the back is just what follows; a
  // lead that runs on into the sentence ("**71%** already…") keeps it whole.
  const ends = /[.:]$/.test(rawLead.trim()) || /^[:–—-]/.test(rest);
  return {
    lead: rawLead.trim().replace(/[.:]$/, ""),
    back: ends ? rest.replace(/^[:–—-]\s*/, "") : item,
  };
}

function FlipCard({ item, index, render }: { item: string; index: number; render: (t: string) => ReactNode }) {
  const [flipped, setFlipped] = useState(false);
  const parts = splitLead(item);
  const num = String(index + 1).padStart(2, "0");

  if (!parts) {
    return (
      <div className="flip-card is-static">
        <div className="flip-face">
          <span className="flip-num">{num}</span>
          <p className="flip-back-text">{render(item)}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`flip-card ${flipped ? "is-flipped" : ""}`}
      aria-expanded={flipped}
      onClick={() => setFlipped((f) => !f)}
    >
      <span className="flip-inner">
        <span className="flip-face flip-front" aria-hidden={flipped}>
          <span className="flip-num">{num}</span>
          <span className="flip-lead">{render(parts.lead)}</span>
          <span className="flip-hint" aria-hidden="true">
            Tap for more <span>↻</span>
          </span>
        </span>
        <span className="flip-face flip-back" aria-hidden={!flipped}>
          <span className="flip-num">{num}</span>
          <span className="flip-back-text">{render(parts.back)}</span>
        </span>
      </span>
    </button>
  );
}
