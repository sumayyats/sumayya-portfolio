import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/content/case-studies";

// Phase 2 will replace this with the full scroll + flip reading views.
export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <main className="mx-auto max-w-[68ch] px-6 py-16">
      <Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink">
        ← back to the shelf
      </Link>
      <p className="mt-8 font-mono text-[11px] uppercase tracking-widest text-accent">
        {study.cover.kicker ?? study.year}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink">
        {study.title}
      </h1>
      <p className="mt-2 text-lg text-ink-soft">{study.subtitle}</p>
      <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-ink">
        {study.summary}
      </p>
      <p className="mt-10 rounded-lg border border-edge px-4 py-3 font-mono text-xs uppercase tracking-wide text-ink-soft">
        Reading view (scroll + flip) — Phase 2.
      </p>
    </main>
  );
}
