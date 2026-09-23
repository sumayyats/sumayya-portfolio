"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { caseStudies } from "@/content/case-studies";
import { Markdown } from "@/components/Markdown";
import { StudyLink } from "@/components/StudyLink";
import { useSound } from "@/lib/sound";
import { FigureGallery } from "./Figure";
import { PrototypeEmbed } from "./PrototypeEmbed";

const PROTOTYPE_ID = "prototype";

/**
 * Three surfaces: orientation (the study itself), an index of its sections,
 * and the content of the one section you're reading — each scrolling on its
 * own. Below lg the three stack: orientation, a sticky section picker, then
 * that section's content.
 */
export function ReaderScroll({ study }: { study: CaseStudy }) {
  const { click } = useSound();
  const hasPrototype = Boolean(
    study.prototype?.type === "figma" && study.prototype.url
  );
  const items = [
    ...study.sections.map((s) => ({ id: s.id, title: s.title })),
    ...(hasPrototype
      ? [{ id: PROTOTYPE_ID, title: "Try the prototype" }]
      : []),
  ];

  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const contentRef = useRef<HTMLDivElement>(null);

  // deep link (#section) on first load, and when the URL changes underneath us
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (id && items.some((i) => i.id === id)) setActiveId(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [study.slug]);

  const choose = useCallback(
    (id: string) => {
      click();
      setActiveId(id);
      history.replaceState(null, "", `#${id}`);
      contentRef.current?.scrollTo({ top: 0 });
      contentRef.current?.focus({ preventScroll: true });
    },
    [click]
  );

  const section = study.sections.find((s) => s.id === activeId);
  const visuals = study.visuals.filter((v) => v.sectionId === activeId);

  return (
    <div className="lg:grid lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(230px,290px)_minmax(190px,240px)_minmax(0,1fr)] lg:overflow-hidden">
      {/* ── 1 · orientation ── */}
      <aside
        // no-scrollbar: the reading pane is the one that visibly scrolls, but
        // a short window must not clip "Back to the shelf" off the bottom
        className="no-scrollbar border-b border-edge px-[max(1.25rem,5vw)] py-8 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-7 lg:py-9"
      >
        <Orientation study={study} />
      </aside>

      {/* ── 2 · index ── */}
      <nav
        aria-label="Sections"
        className="sticky top-14 z-20 border-b border-edge bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur lg:static lg:flex lg:flex-col lg:justify-end lg:overflow-hidden lg:border-b-0 lg:border-r lg:bg-transparent lg:px-5 lg:py-9 lg:backdrop-blur-none"
      >
        <p className="hidden px-2 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft lg:block">
          Contents
        </p>
        <ol className="no-scrollbar flex gap-1 overflow-x-auto px-[max(1rem,4vw)] py-2.5 lg:flex-col lg:overflow-visible lg:px-0 lg:py-0">
          {items.map((item, i) => {
            const active = item.id === activeId;
            return (
              <li key={item.id} className="shrink-0 lg:shrink">
                <a
                  href={`#${item.id}`}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    choose(item.id);
                  }}
                  className={`flex items-baseline gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] leading-snug transition-colors lg:whitespace-normal lg:rounded-md ${
                    active
                      ? "bg-[color-mix(in_srgb,var(--ink)_9%,transparent)] text-ink"
                      : "text-ink-soft hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:text-ink"
                  }`}
                >
                  <span
                    className={`hidden font-mono text-[10px] tabular-nums lg:inline ${
                      active ? "text-accent" : "text-ink-soft"
                    }`}
                  >
                    {item.id === PROTOTYPE_ID
                      ? "→"
                      : String(i + 1).padStart(2, "0")}
                  </span>
                  {item.title}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ── 3 · content ── */}
      <div
        ref={contentRef}
        tabIndex={-1}
        className="px-[max(1.25rem,5vw)] pb-24 pt-8 focus:outline-none lg:overflow-y-auto lg:px-10 lg:py-9"
      >
        <div className="mx-auto max-w-[68ch] lg:mx-0">
          {activeId === PROTOTYPE_ID ? (
            <PrototypeEmbed study={study} bare />
          ) : section ? (
            <article key={section.id}>
              <h2 className="mb-5 font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight text-ink">
                {section.title}
              </h2>
              <Markdown source={section.body} />
              <FigureGallery visuals={visuals} />
            </article>
          ) : null}

          <SectionPager items={items} activeId={activeId} onSelect={choose} />
        </div>
      </div>
    </div>
  );
}

/** Column 1: what this study is, and where to go next. */
function Orientation({ study }: { study: CaseStudy }) {
  const others = caseStudies.filter((c) => c.slug !== study.slug);
  const rows: [string, string][] = [
    ["Role", study.role],
    ["Team", study.team],
    ["Scope", study.scope],
  ];
  return (
    <div className="mx-auto max-w-[36rem] lg:mx-0">
      {study.cover.mockup && (
        <div className="relative mb-6 hidden h-40 w-full lg:block">
          <Image
            src={study.cover.mockup}
            alt=""
            fill
            sizes="290px"
            className="object-contain object-left"
            priority
          />
        </div>
      )}
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {study.year}
      </p>
      <h1 className="mt-2 font-display text-2xl leading-tight tracking-tight text-ink">
        {study.title}
      </h1>
      <p className="mt-1 text-[15px] text-ink-soft">{study.subtitle}</p>
      <StudyLink study={study} className="mt-3 text-[11px]" />

      <dl className="mt-6 flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--ink)_12%,transparent)] pt-5">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              {k}
            </dt>
            <dd className="mt-0.5 text-[13px] leading-snug text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 border-t border-[color-mix(in_srgb,var(--ink)_12%,transparent)] pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
          Next on the shelf
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {others.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/case/${c.slug}`}
                className="group flex items-baseline gap-2 text-[14px] text-ink"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 translate-y-[1px] rounded-full"
                  style={{ background: c.palette.spine }}
                />
                <span className="font-display underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-accent">
                  {c.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="mt-4 inline-block font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink"
        >
          ← Back to the shelf
        </Link>
      </div>
    </div>
  );
}

/** Previous / next section at the foot of the content pane. */
function SectionPager({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; title: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const i = items.findIndex((it) => it.id === activeId);
  const prev = i > 0 ? items[i - 1] : null;
  const next = i >= 0 && i < items.length - 1 ? items[i + 1] : null;
  if (!prev && !next) return null;
  return (
    <div className="mt-14 flex items-stretch justify-between gap-3 border-t border-[color-mix(in_srgb,var(--ink)_12%,transparent)] pt-5">
      {prev ? (
        <button
          type="button"
          onClick={() => onSelect(prev.id)}
          className="group flex max-w-[48%] flex-col items-start gap-0.5 text-left"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            ← Previous
          </span>
          <span className="text-[14px] text-ink group-hover:text-accent">
            {prev.title}
          </span>
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button
          type="button"
          onClick={() => onSelect(next.id)}
          className="group flex max-w-[48%] flex-col items-end gap-0.5 text-right"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Next →
          </span>
          <span className="text-[14px] text-ink group-hover:text-accent">
            {next.title}
          </span>
        </button>
      )}
    </div>
  );
}
