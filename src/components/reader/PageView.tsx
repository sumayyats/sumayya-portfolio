import Link from "next/link";
import type { CaseStudy } from "@/content/types";
import { caseStudies } from "@/content/case-studies";
import { Blocks } from "@/components/Markdown";
import { StudyLink } from "@/components/StudyLink";
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

function TitlePage({ study }: { study: CaseStudy }) {
  return (
    <div className="flex h-full flex-col">
      <p className="book-small font-mono uppercase tracking-[0.18em] text-ink-soft">
        {study.cover.kicker}
      </p>
      <h1 className="book-h1 mt-[0.4em] font-display leading-[1.03] tracking-tight text-ink">
        {study.title}
      </h1>
      <p
        className="book-sub mt-[0.5em] leading-snug"
        style={{
          color: "color-mix(in srgb, var(--ink) 55%, transparent)",
          fontFamily: '"Arial Narrow", "Helvetica Neue Condensed", Arial, sans-serif',
        }}
      >
        {study.subtitle}
      </p>
      <div className="mt-4 h-px w-full bg-[color-mix(in_srgb,var(--ink)_22%,transparent)]" />
      {/* TODO: cover mockup goes here */}
      <div className="min-h-0 flex-1" />
    </div>
  );
}

/** Role / Team / Scope and the study link, at the top of the Overview page. */
function MetaBlock({ study }: { study: CaseStudy }) {
  const rows: [string, string][] = [
    ["Role", study.role],
    ["Team", study.team],
    ["Scope", study.scope],
  ];
  return (
    <div className="mb-[1.2em] border-b border-[color-mix(in_srgb,var(--ink)_14%,transparent)] pb-[1.2em]">
      <StudyLink study={study} className="book-small mb-[1em]" />
      <dl className="grid grid-cols-1 gap-[0.7em]">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="book-small font-mono uppercase tracking-[0.14em] text-ink-soft">
              {k}
            </dt>
            <dd className="book-meta mt-[0.15em] leading-snug text-ink">{v}</dd>
          </div>
        ))}
      </dl>
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
