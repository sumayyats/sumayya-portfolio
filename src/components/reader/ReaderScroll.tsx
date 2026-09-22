"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { Markdown } from "@/components/Markdown";
import { StudyLink } from "@/components/StudyLink";
import { FigureGallery } from "./Figure";
import { SectionNav } from "./SectionNav";
import { NextOnShelf } from "./NextOnShelf";
import { PrototypeEmbed } from "./PrototypeEmbed";

export function ReaderScroll({ study }: { study: CaseStudy }) {
  const [activeId, setActiveId] = useState(study.sections[0]?.id ?? "");
  const els = useRef(new Map<string, HTMLElement>());
  const reduce = useReducedMotion();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("data-section");
            if (id) setActiveId(id);
          }
        }
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0 }
    );
    els.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [study.slug]);

  const goTo = (id: string) => {
    const el = els.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActiveId(id);
  };

  const activeVisuals = study.visuals.filter((v) => v.sectionId === activeId);

  return (
    <div className="mx-auto max-w-[1400px] px-[max(1.25rem,5vw)] pb-24 xl:grid xl:grid-cols-[minmax(220px,250px)_minmax(0,1fr)_minmax(290px,340px)] xl:gap-12">
      {/* ── left rail (xl) ── */}
      <aside className="hidden self-start xl:sticky xl:top-24 xl:block">
        <RailMeta study={study} />
        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Contents
          </p>
          <SectionNav sections={study.sections} activeId={activeId} onSelect={goTo} />
        </div>
      </aside>

      {/* ── centre ── */}
      <div className="min-w-0">
        {/* compact meta + contents (below xl) */}
        <div className="mb-10 xl:hidden">
          <RailMeta study={study} />
          <details className="mt-5 rounded-xl border border-[color-mix(in_srgb,var(--ink)_14%,transparent)] px-4 py-3">
            <summary className="cursor-pointer list-none font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft marker:content-['']">
              Contents ↓
            </summary>
            <div className="mt-3">
              <SectionNav
                sections={study.sections}
                activeId={activeId}
                onSelect={goTo}
              />
            </div>
          </details>
        </div>

        {study.sections.map((s) => {
          const visuals = study.visuals.filter((v) => v.sectionId === s.id);
          return (
            <section
              key={s.id}
              id={s.id}
              data-section={s.id}
              ref={(el) => {
                if (el) els.current.set(s.id, el);
              }}
              className="scroll-mt-24 border-t border-[color-mix(in_srgb,var(--ink)_10%,transparent)] py-10 first:border-t-0 first:pt-0"
            >
              <h2 className="mb-5 font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight text-ink">
                {s.title}
              </h2>
              <Markdown source={s.body} />

              {/* figures below xl; the side rail carries them at xl */}
              <div className="xl:hidden">
                <FigureGallery visuals={visuals} />
              </div>
            </section>
          );
        })}

        <PrototypeEmbed study={study} />
        <NextOnShelf currentSlug={study.slug} />
      </div>

      {/* ── right visuals (xl) ── */}
      <aside className="hidden self-start xl:sticky xl:top-24 xl:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: reduce ? 0 : 0.28 }}
            className="flex flex-col gap-6"
          >
            {activeVisuals.length > 0 ? (
              <FigureGallery visuals={activeVisuals} compactColumns />
            ) : (
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                {study.sections.find((s) => s.id === activeId)?.title}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </aside>
    </div>
  );
}

/* Year, title, subtitle and the study link. Role / Team / Scope are not
   repeated here: the Overview section already states them. */
function RailMeta({ study }: { study: CaseStudy }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {study.year}
      </p>
      <h1 className="mt-2 font-display text-2xl leading-tight tracking-tight text-ink">
        {study.title}
      </h1>
      <p className="mt-1 text-[15px] text-ink-soft">{study.subtitle}</p>
      <StudyLink study={study} className="mt-3 text-[11px]" />
    </div>
  );
}
