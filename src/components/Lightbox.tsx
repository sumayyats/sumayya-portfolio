"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useSound } from "@/lib/sound";

export type LightboxItem = {
  src: string;
  alt: string;
  caption?: string;
  label?: string;
};

type LightboxApi = {
  open: (items: LightboxItem[], index?: number) => void;
};

const Ctx = createContext<LightboxApi>({ open: () => {} });

/** `useLightbox().open(items, index)` pops a figure out over the page. */
export function useLightbox() {
  return useContext(Ctx);
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LightboxItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const { click } = useSound();
  const restoreFocus = useRef<HTMLElement | null>(null);

  const open = useCallback(
    (list: LightboxItem[], at = 0) => {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      setItems(list);
      setIndex(Math.max(0, Math.min(at, list.length - 1)));
    },
    []
  );
  const close = useCallback(() => {
    click();
    setItems(null);
    restoreFocus.current?.focus?.();
  }, [click]);
  const step = useCallback(
    (d: 1 | -1) => {
      if (!items) return;
      click();
      setIndex((i) => (i + d + items.length) % items.length);
    },
    [items, click]
  );

  const api = useMemo(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {items && (
        <LightboxDialog
          items={items}
          index={index}
          onClose={close}
          onStep={step}
        />
      )}
    </Ctx.Provider>
  );
}

function LightboxDialog({
  items,
  index,
  onClose,
  onStep,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onStep: (d: 1 | -1) => void;
}) {
  const item = items[index];
  const many = items.length > 1;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && many) onStep(1);
      else if (e.key === "ArrowLeft" && many) onStep(-1);
      else if (e.key === "Tab") e.preventDefault(); // keep focus in the dialog
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onStep, many]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 sm:p-8"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_82%,black)] backdrop-blur-sm"
      />

      <figure className="relative z-10 flex max-h-full max-w-full flex-col items-center">
        <div className="relative max-h-[78vh] max-w-full overflow-hidden rounded-xl shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt}
            width={1600}
            height={1600}
            sizes="100vw"
            priority
            className="block h-auto max-h-[78vh] w-auto max-w-[min(92vw,1200px)] object-contain"
          />
        </div>
        <figcaption className="mt-4 max-w-[60ch] text-center font-mono text-[11px] leading-relaxed text-[color-mix(in_srgb,var(--paper)_80%,transparent)]">
          {item.label && (
            <span className="mr-2 uppercase tracking-[0.16em] text-paper">
              {item.label}
            </span>
          )}
          {item.caption}
          {many && (
            <span className="ml-2 tabular-nums opacity-60">
              {index + 1} / {items.length}
            </span>
          )}
        </figcaption>
      </figure>

      <button
        ref={closeRef}
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-transform hover:scale-105"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {many && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => onStep(-1)}
            className="absolute left-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-transform hover:scale-105 sm:left-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => onStep(1)}
            className="absolute right-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-transform hover:scale-105 sm:right-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
