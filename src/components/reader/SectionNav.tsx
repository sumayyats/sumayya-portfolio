"use client";

import type { CaseStudySection } from "@/content/types";

/** Section list with scroll-spy highlighting; used in the rail and the drawer. */
export function SectionNav({
  sections,
  activeId,
  onSelect,
}: {
  sections: CaseStudySection[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Sections">
      <ol className="flex flex-col gap-1">
        {sections.map((s, i) => {
          const active = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(s.id);
                }}
                className={`group flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-[13px] leading-snug transition-colors ${
                  active
                    ? "text-ink"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    active ? "text-accent" : "text-ink-soft"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative">
                  {s.title}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-200 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
