import type { CaseStudyVisual } from "@/content/types";

/**
 * A figure that "pops out" slightly off the paper. Phase 2 renders a
 * clearly-marked placeholder with the real caption; Phase 4 swaps in the real
 * image and adds the lightbox.
 */
export function Figure({ visual }: { visual: CaseStudyVisual }) {
  return (
    <figure className="group my-2">
      <div
        className="relative overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] shadow-[0_18px_36px_-24px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:-translate-y-0.5"
        style={{
          background:
            "color-mix(in srgb, var(--accent) 8%, var(--paper))",
          aspectRatio: "4 / 3",
        }}
      >
        {/* placeholder — alt text stands in until the export lands */}
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            figure · TODO export
          </span>
          <span className="max-w-[36ch] text-sm text-ink-soft">{visual.alt}</span>
        </div>
      </div>
      <figcaption className="mt-2 font-mono text-[11px] leading-relaxed text-ink-soft">
        {visual.caption}
      </figcaption>
    </figure>
  );
}
