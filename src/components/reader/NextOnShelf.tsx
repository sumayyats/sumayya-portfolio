import Link from "next/link";
import { caseStudies } from "@/content/case-studies";
import { ButtonLink } from "@/components/Button";

/** End-of-study block: the other two featured case studies + back to the shelf. */
export function NextOnShelf({ currentSlug }: { currentSlug: string }) {
  const others = caseStudies.filter((c) => c.slug !== currentSlug);

  return (
    <section className="mt-20 border-t border-[color-mix(in_srgb,var(--ink)_14%,transparent)] pt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        Next on the shelf
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {others.map((c) => {
          const dark = false;
          const p = c.palette;
          return (
            <Link
              key={c.slug}
              href={`/case/${c.slug}`}
              className="group flex items-stretch gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] p-4 transition-transform hover:-translate-y-0.5"
              style={{ background: "color-mix(in srgb, var(--ink) 3%, var(--paper))" }}
            >
              <span
                className="w-2 shrink-0 rounded-full"
                style={{ background: dark ? p.darkAccent : p.spine }}
                aria-hidden="true"
              />
              <span className="flex flex-1 flex-col">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  {c.year}
                </span>
                <span className="mt-1 font-display text-xl leading-tight tracking-tight text-ink">
                  {c.title}
                </span>
                <span className="mt-1 text-sm text-ink-soft">{c.subtitle}</span>
                <span className="mt-3 font-mono text-[12px] text-accent">
                  Read →
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-6">
        <ButtonLink href="/" variant="secondary" size="md">
          ← Back to the shelf
        </ButtonLink>
      </div>
    </section>
  );
}
