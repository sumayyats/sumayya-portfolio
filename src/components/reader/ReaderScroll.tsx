"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { caseStudies } from "@/content/case-studies";
import { Markdown } from "@/components/Markdown";
import { StudyLink } from "@/components/StudyLink";
import { useSound } from "@/lib/sound";
import { FigureGallery } from "./Figure";
import { Segmented } from "./Reader";
import { PrototypeEmbed } from "./PrototypeEmbed";
import { MotionStage } from "@/components/stages/MotionStage";
import { splitBody } from "@/components/stages/splitBody";
import { useReveal } from "@/lib/reveal";

const PROTOTYPE_ID = "prototype";
const ARTIFACTS_ID = "artifacts";

/**
 * The whole case study on one scrolling page. A sticky rail (desktop) or a
 * sticky row of section chips (below lg) follows the reader's position;
 * prose keeps a reading measure while motion stages run wider.
 */
export function ReaderScroll({ study }: { study: CaseStudy }) {
  const { click } = useSound();
  const hasPrototype = Boolean(study.prototype?.type === "figma" && study.prototype.url);
  const items = [
    ...study.sections.map((s) => ({ id: s.id, title: s.title })),
    ...(study.visuals.length ? [{ id: ARTIFACTS_ID, title: "Artifacts" }] : []),
    ...(hasPrototype ? [{ id: PROTOTYPE_ID, title: "Try the prototype" }] : []),
  ];
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const chipsRef = useRef<HTMLOListElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useReveal(bodyRef, study.slug);

  // deep link: jump to #section once the page is laid out
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, [study.slug]);

  // scroll-spy: the section crossing the upper third of the viewport is current
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveId(e.target.id);
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [study.slug]);

  // keep the current chip in view on small screens
  useEffect(() => {
    chipsRef.current
      ?.querySelector<HTMLElement>(`[data-id="${activeId}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [activeId]);

  const go = useCallback(
    (id: string) => {
      click();
      history.replaceState(null, "", `#${id}`);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    },
    [click]
  );

  const nav = (variant: "rail" | "chips") => (
    <ol
      ref={variant === "chips" ? chipsRef : undefined}
      className={
        variant === "rail"
          ? "flex flex-col gap-0.5"
          : "no-scrollbar flex gap-1 overflow-x-auto px-[max(1rem,4vw)] py-2.5"
      }
    >
      {items.map((item, i) => {
        const active = item.id === activeId;
        return (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              data-id={item.id}
              aria-current={active ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(item.id);
              }}
              className={`flex items-baseline gap-2 whitespace-nowrap px-3 py-1.5 text-[13px] leading-snug transition-colors ${
                variant === "rail" ? "rounded-md" : "rounded-full"
              } ${
                active
                  ? "bg-[color-mix(in_srgb,var(--ink)_9%,transparent)] text-ink"
                  : "text-ink-soft hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:text-ink"
              }`}
            >
              {variant === "rail" && (
                <span className={`font-mono text-[10px] tabular-nums ${active ? "text-accent" : "text-ink-soft"}`}>
                  {item.id === PROTOTYPE_ID ? "→" : String(i + 1).padStart(2, "0")}
                </span>
              )}
              {item.title}
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(220px,270px)_minmax(0,1fr)]">
      {/* rail: the study, and where you are in it */}
      <aside className="hidden lg:block">
        <div className="no-scrollbar sticky top-14 flex h-[calc(100dvh-3.5rem)] flex-col gap-8 overflow-y-auto border-r border-edge px-6 py-9">
          <Orientation study={study} />
          <nav aria-label="Sections">
            <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">Contents</p>
            {nav("rail")}
          </nav>
          <NextBooks study={study} />
        </div>
      </aside>

      <div className="min-w-0">
        {/* small screens: the study up top, then chips that stick */}
        <div className="border-b border-edge px-[max(1.25rem,5vw)] py-8 lg:hidden">
          <Orientation study={study} />
        </div>
        <nav
          aria-label="Sections"
          className="sticky top-14 z-20 border-b border-edge bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur lg:hidden"
        >
          {nav("chips")}
        </nav>

        <div ref={bodyRef} className="mx-auto max-w-[1040px] px-[max(1.25rem,5vw)] pb-28 pt-10 lg:px-12 lg:pt-14">
          {study.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-b border-edge pb-16 pt-4 last:border-b-0 lg:scroll-mt-20 [&+section]:mt-14"
            >
              <h2 className="mb-6 max-w-[68ch] font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight tracking-tight text-ink">
                {section.title}
              </h2>
              {splitBody(study, section).map((part, i) =>
                part.kind === "md" ? (
                  <div key={i} className="max-w-[68ch]">
                    <Markdown source={part.source} cards />
                  </div>
                ) : (
                  <MotionStage key={part.spec.id} spec={part.spec} className="my-10" />
                )
              )}
              {section.media === "screenshots" && (
                <FigureGallery visuals={study.visuals.filter((v) => v.sectionId === section.id)} />
              )}
            </section>
          ))}

          {study.visuals.length > 0 && (
            <section id={ARTIFACTS_ID} className="mt-14 scroll-mt-28 border-t border-edge pt-14 lg:scroll-mt-20">
              <Artifacts study={study} />
            </section>
          )}
          {hasPrototype && (
            <section id={PROTOTYPE_ID} className="mt-14 scroll-mt-28 border-t border-edge pt-14 lg:scroll-mt-20">
              <PrototypeEmbed study={study} bare />
            </section>
          )}

          <div className="mt-16 border-t border-edge pt-8 lg:hidden">
            <NextBooks study={study} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Every figure in the study, grouped under the section it came from. */
function Artifacts({ study }: { study: CaseStudy }) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const groups = study.sections
    .map((s) => ({ title: s.title, visuals: study.visuals.filter((v) => v.sectionId === s.id) }))
    .filter((g) => g.visuals.length > 0);

  return (
    <article>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight tracking-tight text-ink">
          Artifacts
        </h2>
        <Segmented
          label="Artifact layout"
          compact
          value={layout}
          onChange={(v) => setLayout(v as "grid" | "list")}
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
        />
      </div>
      {groups.map((g) => (
        <FigureGallery key={g.title} visuals={g.visuals} label={g.title} layout={layout} spanWide={false} />
      ))}
    </article>
  );
}

/** What this study is: title, link, role / team / scope. */
function Orientation({ study }: { study: CaseStudy }) {
  const rows: { k: string; v: string; detail?: string[] }[] = [
    { k: "Role", v: study.role, detail: study.roleDetail },
    { k: "Team", v: study.team },
    { k: "Scope", v: study.scope, detail: study.scopeDetail },
  ];
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">{study.year}</p>
      <h1 className="mt-2 font-display text-2xl leading-tight tracking-tight text-ink">{study.title}</h1>
      <p className="mt-1 text-[15px] text-ink-soft">{study.subtitle}</p>
      <StudyLink study={study} className="mt-3 text-[11px]" />
      <dl className="mt-5 flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--ink)_12%,transparent)] pt-4">
        {rows.map(({ k, v, detail }) => (
          <div key={k}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{k}</dt>
            <dd className="mt-0.5 text-[13px] leading-snug text-ink">
              {detail ? <MetaDetail value={v} detail={detail} /> : v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function NextBooks({ study }: { study: CaseStudy }) {
  const others = caseStudies.filter((c) => c.slug !== study.slug);
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">Next on the shelf</p>
      <ul className="mt-3 flex flex-col gap-2">
        {others.map((c) => (
          <li key={c.slug}>
            <Link href={`/case/${c.slug}`} className="group flex items-baseline gap-2 text-[14px] text-ink">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 translate-y-[1px] rounded-full" style={{ background: c.palette.spine }} />
              <span className="font-display underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-accent">
                {c.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A short role or scope line that opens into what it covered. Hover on a
 * pointer, focus on a keyboard, tap on a phone.
 */
function MetaDetail({ value, detail }: { value: string; detail: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div onPointerEnter={() => setOpen(true)} onPointerLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-left underline decoration-dotted decoration-[color-mix(in_srgb,var(--ink)_35%,transparent)] underline-offset-4 transition-colors hover:decoration-accent"
      >
        {value}
      </button>
      {open && (
        <ul className="mt-2 flex flex-col gap-1">
          {detail.map((d) => (
            <li key={d} className="flex gap-2 text-[13px] leading-snug text-ink-soft">
              <span aria-hidden="true" className="text-accent">·</span>
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
