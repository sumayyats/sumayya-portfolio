"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { caseStudies } from "@/content/case-studies";
import { BookCover } from "@/components/BookCover";
import { Blocks } from "@/components/Markdown";
import { StudyLink } from "@/components/StudyLink";
import { useSound } from "@/lib/sound";
import { Figure } from "./Figure";
import type { Page } from "./paginate";

/**
 * Renders one book page's content (title / section / end / blank).
 * Type sizes are container-relative (see .book-page in globals.css) so the
 * deterministic pagination holds whatever size the book is drawn at.
 */
export function PageView({
  page,
  study,
  pageNumber,
}: {
  page: Page;
  study: CaseStudy;
  pageNumber?: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        {page.kind === "title" && <TitlePage study={study} />}
        {page.kind === "section" && (
          <div>
            {page.showTitle && (
              <h2 className="book-h2 mb-[0.8em] font-display leading-tight tracking-tight text-ink">
                {page.title}
              </h2>
            )}
            {page.showMeta && <MetaBlock study={study} />}
            <Blocks blocks={page.blocks} />
          </div>
        )}
        {page.kind === "figure" && <FigurePage page={page} />}
        {page.kind === "prototype" && <PrototypePage study={study} />}
        {page.kind === "end" && <EndPage study={study} />}
      </div>
      {page.kind !== "blank" && pageNumber !== undefined && (
        <div className="book-small shrink-0 pt-3 text-center font-mono text-ink-soft">
          {pageNumber}
        </div>
      )}
    </div>
  );
}

/** How far the cover leans away from the cursor, in degrees. */
const TILT = 7;

/**
 * The front cover: the same jacket the book wears on the shelf, which leans
 * towards the cursor as you move over it. Purely decorative — the tilt is
 * dropped for anyone who asks for reduced motion, and released on press so it
 * never fights a drag to turn the page.
 */
function TitlePage({ study }: { study: CaseStudy }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const follow = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const r = el.getBoundingClientRect();
    // page-flip keeps off-screen pages mounted at zero size
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * TILT * 2, y: px * TILT * 2 });
  };
  const rest = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="h-full" style={{ perspective: "1000px" }}>
      <div
        ref={ref}
        onPointerMove={follow}
        onPointerLeave={rest}
        onPointerDown={rest}
        className="h-full transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <BookCover study={study} />
      </div>
    </div>
  );
}

/**
 * Role, team and scope, plus the study link, at the top of the Overview page.
 * The Scroll view carries these in its orientation rail; the book has no rail,
 * so they live here instead of being repeated in the section copy.
 */
function MetaBlock({ study }: { study: CaseStudy }) {
  const rows: [string, string][] = [
    ["Role", study.role],
    ["Team", study.team],
    ["Scope", study.scope],
  ];
  return (
    <>
      <StudyLink study={study} className="book-small mb-[1.2em]" />
      <dl className="book-small mb-[1.4em] flex flex-col gap-[0.5em] text-ink-soft">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-[0.8em]">
            <dt className="shrink-0 font-mono uppercase tracking-[0.14em]">
              {k}
            </dt>
            <dd className="min-w-0 text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

/** A figure on a page of its own: the strip or image, then its caption. */
function FigurePage({ page }: { page: Extract<Page, { kind: "figure" }> }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="book-small mb-[1.2em] font-mono uppercase tracking-[0.18em] text-ink-soft">
        Figure
      </p>
      <Figure visual={page.visual} compact />
    </div>
  );
}

/** The book's pointer to the interactive prototype (embedded in Scroll view). */
function PrototypePage({ study }: { study: CaseStudy }) {
  const { click } = useSound();
  const url = study.prototype?.url ?? "#";
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <p className="book-small font-mono uppercase tracking-[0.18em] text-ink-soft">
        Try the prototype
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={click}
        aria-label="Open the prototype in Figma"
        className="group relative mt-[1.5em] flex w-full items-center justify-center overflow-hidden bg-cover bg-center py-[6%]"
        style={{
          borderRadius: 6,
          aspectRatio: "16 / 11",
          backgroundImage: study.prototype?.background
            ? `url(${study.prototype.background})`
            : undefined,
          backgroundColor: "color-mix(in srgb, var(--ink) 6%, var(--paper))",
        }}
      >
        {study.prototype?.poster && (
          <div
            className="relative h-full overflow-hidden shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:-translate-y-0.5"
            style={{ borderRadius: 6, aspectRatio: "393 / 852" }}
          >
            <Image
              src={study.prototype.poster}
              alt=""
              fill
              sizes="30vw"
              className="object-cover"
            />
          </div>
        )}
      </a>
      <p className="book-meta mt-[1.5em] max-w-[34ch] leading-snug text-ink-soft">
        Open the clickable Figma prototype, or switch to Scroll view to try it
        on the page.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={click}
        className="book-small mt-[1.5em] inline-flex items-center gap-1.5 rounded-full border border-edge px-[1.4em] py-[0.7em] font-mono uppercase tracking-[0.14em] text-ink hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
      >
        Open in Figma <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

function EndPage({ study }: { study: CaseStudy }) {
  const others = caseStudies.filter((c) => c.slug !== study.slug);
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <p className="book-h1 font-display tracking-tight text-ink">fin.</p>
      <p className="book-small mt-6 font-mono uppercase tracking-[0.18em] text-ink-soft">
        Next on the shelf
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {others.map((c) => (
          <Link
            key={c.slug}
            href={`/case/${c.slug}`}
            className="book-sub font-display text-ink underline decoration-[color-mix(in_srgb,var(--accent)_70%,transparent)] underline-offset-4 hover:decoration-accent"
          >
            {c.title}
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className="book-small mt-8 font-mono uppercase tracking-widest text-ink-soft hover:text-ink"
      >
        ← Back to the shelf
      </Link>
    </div>
  );
}
