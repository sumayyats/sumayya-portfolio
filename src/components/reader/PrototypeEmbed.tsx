"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { useSound } from "@/lib/sound";

/** figma.com/proto/… → embed.figma.com/proto/…&embed-host=share */
export function figmaEmbedUrl(url: string): string {
  const u = new URL(url);
  u.hostname = "embed.figma.com";
  u.searchParams.set("embed-host", "share");
  u.searchParams.set("hide-ui", "1");
  return u.toString();
}

/**
 * The interactive Figma prototype, loaded only once it scrolls into view.
 * Shows a skeleton while loading and falls back to a plain link if the frame
 * never loads (blocked embeds, offline) — it must never break the layout.
 */
export function PrototypeEmbed({ study }: { study: CaseStudy }) {
  const proto = study.prototype;
  const { click } = useSound();
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [state, setState] = useState<"idle" | "loaded" | "failed">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          obs.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // give the frame a generous window before offering the fallback
  useEffect(() => {
    if (!near || state !== "idle") return;
    const t = setTimeout(() => setState((s) => (s === "idle" ? "failed" : s)), 15000);
    return () => clearTimeout(t);
  }, [near, state]);

  if (!proto || proto.type !== "figma" || !proto.url) return null;

  return (
    <section
      ref={ref}
      id="prototype"
      className="mt-16 border-t border-[color-mix(in_srgb,var(--ink)_10%,transparent)] pt-10"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        Try the prototype
      </p>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
        Tap through the clickable Figma prototype here, or open it in Figma.
      </p>

      <div
        className="relative mt-6 aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--ink)_4%,var(--paper))] bg-cover bg-center sm:aspect-[16/10]"
        style={
          proto.background
            ? { backgroundImage: `url(${proto.background})` }
            : undefined
        }
      >
        {near && state !== "failed" && (
          // The frame is phone-shaped and centred so the backdrop shows
          // around it; Figma's own canvas colour fills whatever is left.
          <iframe
            title={`${study.title} — Figma prototype`}
            src={figmaEmbedUrl(proto.url)}
            allowFullScreen
            loading="lazy"
            onLoad={() => setState("loaded")}
            onError={() => setState("failed")}
            className={`absolute left-1/2 top-0 h-full max-w-full -translate-x-1/2 border-0 transition-opacity duration-500 ${
              state === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            // `lighten` lets the backdrop show through Figma's black canvas
            style={{ aspectRatio: "1 / 2", mixBlendMode: proto.background ? "lighten" : undefined }}
          />
        )}

        {state !== "loaded" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[color-mix(in_srgb,var(--paper)_70%,transparent)] p-6 text-center backdrop-blur-sm">
            {state === "failed" ? (
              <>
                <p className="max-w-[36ch] text-sm text-ink-soft">
                  The embedded prototype couldn&apos;t load here.
                </p>
              </>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="h-24 w-12 animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]"
                />
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  {near ? "Loading prototype…" : "Prototype"}
                </p>
              </>
            )}
            <a
              href={proto.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={click}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-edge px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
            >
              View the prototype on Figma
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
