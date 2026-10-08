"use client";

import { useEffect, type RefObject } from "react";

/**
 * What rises into place as the reader scrolls: section headings, each block
 * of prose (paragraphs, quotes, tables), every flip card in turn, and the
 * motion stages and figures. A list of cards is revealed card by card, not
 * as one block.
 */
const TARGETS = [
  "section > h2",
  ".prose-body > :not(.flip-grid)",
  ".flip-grid > li",
  "figure.motion-stage",
  "section > article",
].join(", ");

/** Cards in one list come in this far apart (ms), up to STAGGER_CAP. */
const STAGGER = 90;
const STAGGER_CAP = 6;

/**
 * Scroll-triggered reveal for everything under `root`. The hidden starting
 * state only applies once this has run (`html.reveal-on`), so the page reads
 * fine without JavaScript, and reduced motion skips it entirely.
 */
export function useReveal(root: RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>(TARGETS));
    items.forEach((item) => {
      item.classList.add("reveal");
      if (item.parentElement?.classList.contains("flip-grid")) {
        const i = Array.prototype.indexOf.call(item.parentElement.children, item);
        item.style.setProperty("--reveal-delay", `${Math.min(i, STAGGER_CAP) * STAGGER}ms`);
      }
    });
    document.documentElement.classList.add("reveal-on");

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          obs.unobserve(e.target); // once in, it stays
        }
      },
      // a little before the block reaches the viewport's lower edge
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    items.forEach((item) => obs.observe(item));

    return () => {
      obs.disconnect();
      items.forEach((item) => item.classList.remove("reveal", "is-in"));
    };
  }, [root, key]);
}
