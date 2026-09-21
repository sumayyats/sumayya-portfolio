"use client";

import { useEffect, useState } from "react";
import { useSound } from "@/lib/sound";

/** Speaker button: turns page-turn and button sounds on/off, site-wide. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const { on, toggle } = useSound();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const label = mounted
    ? on
      ? "Turn sound off"
      : "Turn sound on"
    : "Toggle sound";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mounted ? on : undefined}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-edge text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] ${className}`}
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {mounted && on ? <SpeakerOn /> : <SpeakerOff />}
      </span>
    </button>
  );
}

function SpeakerOn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="m16 9 5 6M21 9l-5 6" />
    </svg>
  );
}
