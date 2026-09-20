import Link from "next/link";
import type { CaseStudy } from "@/content/types";
import { caseStudies } from "@/content/case-studies";
import { Blocks } from "@/components/Markdown";
import type { Page } from "./paginate";

/** Renders one book page's content (title / section / end / blank). */
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
              <h2 className="mb-4 font-display text-[clamp(1.3rem,2.4vw,1.8rem)] leading-tight tracking-tight text-ink">
                {page.title}
              </h2>
            )}
            <Blocks blocks={page.blocks} />
          </div>
        )}
        {page.kind === "end" && <EndPage study={study} />}
      </div>
      {page.kind !== "blank" && pageNumber !== undefined && (
        <div className="shrink-0 pt-3 text-center font-mono text-[10px] text-ink-soft">
          {pageNumber}
        </div>
      )}
    </div>
  );
}

function TitlePage({ study }: { study: CaseStudy }) {
  return (
    <div className="flex h-full flex-col">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        {study.cover.kicker}
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.03] tracking-tight text-ink">
        {study.title}
      </h1>
      <p
        className="mt-2 text-[clamp(1rem,2vw,1.2rem)] leading-snug"
        style={{
          color: "color-mix(in srgb, var(--ink) 55%, transparent)",
          fontFamily: '"Arial Narrow", "Helvetica Neue Condensed", Arial, sans-serif',
        }}
      >
        {study.subtitle}
      </p>
      <div className="mt-4 h-px w-full bg-[color-mix(in_srgb,var(--ink)_22%,transparent)]" />

      <dl className="mt-auto grid grid-cols-1 gap-3 pt-6">
        {(
          [
            ["Role", study.role],
            ["Team", study.team],
            ["Scope", study.scope],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div key={k}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              {k}
            </dt>
            <dd className="mt-0.5 text-[13px] leading-snug text-ink">{v}</dd>
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
      <p className="font-display text-3xl tracking-tight text-ink">fin.</p>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        Next on the shelf
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {others.map((c) => (
          <Link
            key={c.slug}
            href={`/case/${c.slug}`}
            className="font-display text-lg text-ink underline decoration-[color-mix(in_srgb,var(--accent)_70%,transparent)] underline-offset-4 hover:decoration-accent"
          >
            {c.title}
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className="mt-8 font-mono text-[12px] uppercase tracking-widest text-ink-soft hover:text-ink"
      >
        ← Back to the shelf
      </Link>
    </div>
  );
}
