"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { useTheme } from "@/lib/theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReaderScroll } from "./ReaderScroll";
import { ReaderFlip } from "./ReaderFlip";

type View = "scroll" | "flip";
type TextSize = "S" | "M" | "L";

const SCALE: Record<TextSize, number> = { S: 0.92, M: 1, L: 1.14 };

export function Reader({ study }: { study: CaseStudy }) {
  const { theme } = useTheme();
  const [view, setView] = useState<View>("scroll");
  const [size, setSize] = useState<TextSize>("M");
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    try {
      // ?view= takes precedence (and is persisted), else fall back to storage.
      const urlView = new URLSearchParams(window.location.search).get("view");
      if (urlView === "flip" || urlView === "scroll") {
        setView(urlView);
        localStorage.setItem("sp-view", urlView);
      } else {
        const v = localStorage.getItem("sp-view");
        if (v === "flip" || v === "scroll") setView(v);
      }
      const s = localStorage.getItem("sp-textsize");
      if (s === "S" || s === "M" || s === "L") setSize(s);
      setSoundOn(localStorage.getItem("sp-sound") === "on");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on;
      try {
        localStorage.setItem("sp-sound", next ? "on" : "off");
      } catch {}
      return next;
    });
  };

  const chooseView = (v: View) => {
    setView(v);
    try {
      localStorage.setItem("sp-view", v);
    } catch {}
  };
  const chooseSize = (s: TextSize) => {
    setSize(s);
    try {
      localStorage.setItem("sp-textsize", s);
    } catch {}
  };

  const p = study.palette;
  const dark = theme === "dark";
  const ink = dark ? p.darkInk : p.ink;
  const vars = {
    "--paper": dark ? p.darkPaper : p.paper,
    "--ink": ink,
    "--accent": dark ? p.darkAccent : p.accent,
    "--ink-soft": `color-mix(in srgb, ${ink} 56%, transparent)`,
    "--edge": `color-mix(in srgb, ${ink} 16%, transparent)`,
    "--reading-scale": String(SCALE[size]),
  } as React.CSSProperties;

  return (
    <div style={vars} className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-edge bg-[color-mix(in_srgb,var(--paper)_86%,transparent)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-[max(1rem,4vw)]">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-widest text-ink-soft transition-colors hover:text-ink"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Shelf</span>
          </Link>

          <Segmented
            label="Reading view"
            options={[
              { value: "scroll", label: "Scroll" },
              { value: "flip", label: "Flip" },
            ]}
            value={view}
            onChange={(v) => chooseView(v as View)}
          />

          <div className="flex items-center gap-2">
            <Segmented
              label="Text size"
              options={[
                { value: "S", label: "S" },
                { value: "M", label: "M" },
                { value: "L", label: "L" },
              ]}
              value={size}
              onChange={(s) => chooseSize(s as TextSize)}
              compact
            />
            {view === "flip" && (
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={soundOn}
                aria-label={soundOn ? "Mute page-turn sound" : "Enable page-turn sound"}
                title={soundOn ? "Sound on" : "Sound off"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-edge text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]"
              >
                {soundOn ? <SpeakerOn /> : <SpeakerOff />}
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="pt-8">
        {view === "scroll" ? (
          <ReaderScroll study={study} />
        ) : (
          <ReaderFlip study={study} scale={SCALE[size]} soundOn={soundOn} />
        )}
      </main>
    </div>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-full border border-edge p-0.5"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-full font-mono uppercase tracking-wider transition-colors ${
              compact ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-[11px]"
            } ${
              active
                ? "bg-ink text-paper"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SpeakerOn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="m16 9 5 6M21 9l-5 6" />
    </svg>
  );
}
