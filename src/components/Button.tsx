"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

// Duolingo-style: a solid offset ledge (blur 0) that the button presses into.
const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-[14px] font-display leading-none tracking-tight transition-[transform,box-shadow,filter] duration-100 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[1.15rem]",
  lg: "px-8 py-4 text-[1.4rem]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-button text-button-ink shadow-[0_5px_0_0_color-mix(in_srgb,var(--button)_62%,#000)] hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--button)_62%,#000)]",
  secondary:
    "bg-paper border-2 border-[color-mix(in_srgb,var(--ink)_18%,var(--paper))] text-ink shadow-[0_5px_0_0_color-mix(in_srgb,var(--ink)_18%,var(--paper))] hover:bg-[color-mix(in_srgb,var(--ink)_5%,var(--paper))] active:translate-y-[4px] active:shadow-[0_1px_0_0_color-mix(in_srgb,var(--ink)_18%,var(--paper))]",
};

function classes(variant: Variant, size: Size, className?: string) {
  return `${base} ${sizes[size]} ${variants[variant]} ${className ?? ""}`.trim();
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

/** Link-styled button (internal or external). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

/** Native button. */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
