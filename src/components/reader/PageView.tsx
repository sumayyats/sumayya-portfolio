import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "@/content/types";
import { caseStudies } from "@/content/case-studies";
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
      {study.cover.mockup ? (
        <div className="relative mt-[4%] min-h-0 flex-1">
          <Image
            src={study.cover.mockup}
            alt=""
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-contain object-bottom"
            priority
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1" />
      )}
    </div>
  );
}

/** The study link (store / live site / prototype) at the top of the Overview page. */
function MetaBlock({ study }: { study: CaseStudy }) {
  return <StudyLink study={study} className="book-small mb-[1.4em]" />;
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
      <div
        className="relative mt-[1.5em] flex w-full items-center justify-center overflow-hidden rounded-[6%] bg-cover bg-center py-[6%]"
        style={{
          aspectRatio: "16 / 11",
          backgroundImage: study.prototype?.background
            ? `url(${study.prototype.background})`
            : undefined,
          backgroundColor: "color-mix(in srgb, var(--ink) 6%, var(--paper))",
        }}
      >
        {study.prototype?.poster && (
          <div
            className="relative h-full overflow-hidden rounded-[9%] shadow-[0_18px_36px_-16px_rgba(0,0,0,0.6)]"
            style={{ aspectRatio: "393 / 852" }}
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
      </div>
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
