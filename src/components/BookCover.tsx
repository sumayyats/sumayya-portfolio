"use client";

import Image from "next/image";
import { useState } from "react";
import type { CaseStudy } from "@/content/types";
import { useTheme } from "@/lib/theme";

/**
 * The face-out book cover, per the reference: a coloured spine strip down the
 * left edge, off-white paper, a large display title top-left with a rule under
 * it, device mockups centred, and a footer line (kicker left, year right).
 * Rounded outer corners, a page-stack edge and drop shadow on the right so it
 * reads as a physical object.
 */
export function BookCover({ study }: { study: CaseStudy }) {
  const { theme } = useTheme();
  const p = study.palette;
  const dark = theme === "dark";
  const paper = dark ? p.darkPaper : p.paper;
  const ink = dark ? p.darkInk : p.ink;
  const accent = dark ? p.darkAccent : p.accent;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[10px]"
      style={{
        background: paper,
        color: ink,
        boxShadow:
          "0 40px 80px -32px rgba(0,0,0,0.55), 0 8px 24px -12px rgba(0,0,0,0.4)",
      }}
    >
      {/* coloured spine strip */}
      <div
        className="absolute inset-y-0 left-0 w-[7%] min-w-[16px]"
        style={{
          background: `linear-gradient(180deg, ${p.spine}, color-mix(in srgb, ${p.spine} 84%, #000))`,
        }}
      />
      {/* page-stack edge on the right */}
      <div
        className="absolute inset-y-[3%] right-0 w-[6px] rounded-r-[10px]"
        style={{
          background:
            "repeating-linear-gradient(90deg, color-mix(in srgb, currentColor 12%, transparent) 0 1px, transparent 1px 3px)",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div className="flex h-full flex-col pl-[11%] pr-[7%] pt-[7%] pb-[6%]">
        {/* title + rule */}
        <div className="shrink-0">
          {study.cover.kicker && (
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
              {study.cover.kicker}
            </p>
          )}
          <h2 className="font-display text-[clamp(1.6rem,4.2vw,2.6rem)] leading-[1.02] tracking-tight">
            {study.title}
          </h2>
          <div className="mt-3 h-px w-full" style={{ background: `color-mix(in srgb, ${ink} 26%, transparent)` }} />
        </div>

        {/* centred device mockups */}
        <div className="flex flex-1 items-center justify-center py-4">
          <MockupPair
            slug={study.slug}
            hasExport={study.cover.hasExport ?? false}
            accent={accent}
            ink={ink}
            paper={paper}
          />
        </div>

        {/* footer */}
        <div className="flex shrink-0 items-end justify-between font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: `color-mix(in srgb, ${ink} 62%, transparent)` }}>
          <span>{study.subtitle}</span>
          <span>{study.year}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Two phone mockups. Uses a real cover export when present; otherwise a
 * clearly-marked placeholder frame (swapped automatically once the PNG lands
 * in /public/images/<slug>/).
 */
function MockupPair({
  slug,
  hasExport,
  accent,
  ink,
  paper,
}: {
  slug: string;
  hasExport: boolean;
  accent: string;
  ink: string;
  paper: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = `/images/${slug}/cover.png`;

  // Once the real export exists (cover.hasExport → true), render it; otherwise
  // show the clearly-marked placeholder without hitting the network.
  if (hasExport && !failed) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 640px) 70vw, 320px"
          className="object-contain"
          onError={() => setFailed(true)}
          priority={false}
        />
      </div>
    );
  }

  // Placeholder: two phone frames, marked TODO.
  return (
    <div className="flex items-end justify-center gap-3">
      <Phone accent={accent} ink={ink} paper={paper} scale={0.86} />
      <Phone accent={accent} ink={ink} paper={paper} scale={1} lead />
    </div>
  );
}

function Phone({
  accent,
  ink,
  paper,
  scale,
  lead = false,
}: {
  accent: string;
  ink: string;
  paper: string;
  scale: number;
  lead?: boolean;
}) {
  return (
    <div
      className="relative rounded-[16px] p-[5px]"
      style={{
        width: 108 * scale,
        height: 214 * scale,
        background: `color-mix(in srgb, ${ink} 82%, #000)`,
        boxShadow: lead
          ? "0 18px 30px -18px rgba(0,0,0,0.5)"
          : "0 12px 22px -16px rgba(0,0,0,0.45)",
      }}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[12px]"
        style={{ background: `color-mix(in srgb, ${paper} 88%, ${accent} 12%)` }}
      >
        <span
          className="absolute left-1/2 top-[6px] h-[5px] w-[34px] -translate-x-1/2 rounded-full"
          style={{ background: `color-mix(in srgb, ${ink} 55%, transparent)` }}
        />
        <div className="mt-6 flex flex-col gap-2 px-3">
          <span className="h-2 w-10 rounded-full" style={{ background: accent }} />
          <span className="h-1.5 w-full rounded-full" style={{ background: `color-mix(in srgb, ${ink} 20%, transparent)` }} />
          <span className="h-1.5 w-5/6 rounded-full" style={{ background: `color-mix(in srgb, ${ink} 18%, transparent)` }} />
          <span className="mt-2 h-12 w-full rounded-md" style={{ background: `color-mix(in srgb, ${accent} 22%, transparent)` }} />
          <span className="h-1.5 w-3/4 rounded-full" style={{ background: `color-mix(in srgb, ${ink} 16%, transparent)` }} />
        </div>
        <span className="absolute inset-x-0 bottom-1.5 text-center font-mono text-[6px] uppercase tracking-widest" style={{ color: `color-mix(in srgb, ${ink} 45%, transparent)` }}>
          screens TODO
        </span>
      </div>
    </div>
  );
}
