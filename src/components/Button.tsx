"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-[14px] font-display leading-none tracking-tight transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[1.15rem]",
  lg: "px-8 py-4 text-[1.4rem]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-button text-button-ink shadow-[0_10px_22px_-12px_rgba(107,45,26,0.7)] hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:brightness-95",
  secondary:
    "border-2 border-[color-mix(in_srgb,var(--ink)_22%,transparent)] text-ink hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] active:translate-y-0",
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
