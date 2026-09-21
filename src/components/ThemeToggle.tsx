"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import { useSound } from "@/lib/sound";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle: toggleTheme } = useTheme();
  const { click } = useSound();
  const toggle = () => {
    click();
    toggleTheme();
  };
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";
  const label = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Toggle theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-edge text-ink transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] ${className}`}
    >
      {/* Icon reflects current theme; suppressed until mounted to avoid mismatch. */}
      <span aria-hidden="true" suppressHydrationWarning>
        {mounted && isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.4 5.4 4 4M20 20l-1.4-1.4M18.6 5.4 20 4M4 20l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 14.4A8.2 8.2 0 0 1 9.6 4 8.2 8.2 0 1 0 20 14.4Z" />
    </svg>
  );
}
