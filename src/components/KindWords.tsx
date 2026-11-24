"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSound } from "@/lib/sound";

const RECOMMENDATIONS = "https://www.linkedin.com/in/sumayyatsabitah/details/recommendations/";

/**
 * Kind words from people I've worked with, as I designed them: retro windows
 * titled "Sumayya's work feedback". The words are the images, so each also
 * carries its full text for screen readers. `button` and `close` are where the
 * window's own "See on LinkedIn" and × sit in the artwork (percent of its
 * size), so they can be real controls.
 */
type Box = { left: number; top: number; width: number; height: number };
const WORDS: {
  src: string;
  w: number;
  h: number;
  name: string;
  role: string;
  quote: string;
  button: Box;
  close: Box;
}[] = [
  {
    src: "/images/kind-words/iqbal.webp",
    w: 1746,
    h: 2000,
    name: "M. Iqbal",
    role: "Ex-Qlue Lead Engineer, Engineer Manager at Hukumonline.com",
    quote:
      "Sumayya is a talented and dedicated designer who quickly grasped the requirements of our projects and was able to translate them into designs that met our needs. Sumayya's ability to understand the requirements and translate them into designs was particularly impressive. Their keen eye for detail and their ability to incorporate feedback effectively resulted in designs that were both visually appealing and functional. The willingness to collaborate and receive feedback was also appreciated by the team, and their contributions were integral to the success of our product design efforts.",
    button: { left: 35.3, top: 87.2, width: 29.1, height: 8.1 },
    close: { left: 94.2, top: 1, width: 4.6, height: 3.6 },
  },
  {
    src: "/images/kind-words/risdy.png",
    w: 1920,
    h: 1551,
    name: "Risdy",
    role: "Ex-Qlue Product Manager, Head Department at Transjakarta",
    quote:
      "Ayya was my partner when developing products at Qlue, Ayya was very friendly. The design contributions that Ayya has made to several products and projects have been outstanding. Ayya has good communication in almost every design-related discussion, every problem can be solved.",
    button: { left: 35.3, top: 80.4, width: 29.1, height: 11.7 },
    close: { left: 94.2, top: 1.5, width: 4.4, height: 4.7 },
  },
];

const at = (b: Box) => ({
  left: `${b.left}%`,
  top: `${b.top}%`,
  width: `${b.width}%`,
  height: `${b.height}%`,
});

/** The stack that stands at the end of the shelf, and the windows it opens. */
export function KindWords({ scale }: { scale: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { click } = useSound();
  const h = Math.round(300 * scale);

  const close = useCallback(() => {
    click();
    setOpen(null);
    requestAnimationFrame(() => trigger.current?.focus());
  }, [click]);
  const step = useCallback(
    (d: 1 | -1) => {
      click();
      setOpen((i) => (i === null ? i : (i + d + WORDS.length) % WORDS.length));
    },
    [click]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const word = open === null ? null : WORDS[open];

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          click();
          setOpen(0);
        }}
        aria-label={`Kind words: ${WORDS.length} notes from people I've worked with`}
        className="kind-stack group relative mx-3 shrink-0 self-end"
        style={{ height: h, width: Math.round(h * 0.82) }}
      >
        {WORDS.map((w, i) => (
          <span key={w.src} className="kind-stack__card" style={{ "--i": i } as React.CSSProperties}>
            <Image src={w.src} alt="" width={w.w} height={w.h} sizes="240px" />
          </span>
        ))}
        <span className="kind-stack__label">kind words</span>
      </button>

      {word &&
        createPortal(
          <div className="kind-view" role="dialog" aria-modal="true" aria-label="Kind words">
            <button type="button" className="kind-view__backdrop" aria-label="Close kind words" onClick={close} />
            <figure className="kind-view__window" style={{ "--ratio": word.w / word.h } as React.CSSProperties}>
              <Image
                src={word.src}
                alt=""
                width={word.w}
                height={word.h}
                sizes="(min-width: 768px) 560px, 92vw"
                priority
              />
              <blockquote className="sr-only">
                <p>{word.quote}</p>
                <footer>
                  {word.name}, {word.role}
                </footer>
              </blockquote>
              {/* the window's own × and button, made real */}
              <button type="button" className="kind-view__hit" style={at(word.close)} aria-label="Close" onClick={close} />
              <a
                className="kind-view__hit"
                style={at(word.button)}
                href={RECOMMENDATIONS}
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only">See on LinkedIn (opens in a new tab)</span>
              </a>
            </figure>
            <div className="kind-view__nav">
              <button type="button" onClick={() => step(-1)} aria-label="Previous note">
                ←
              </button>
              <span aria-live="polite">
                {(open ?? 0) + 1} / {WORDS.length}
              </span>
              <button type="button" onClick={() => step(1)} aria-label="Next note">
                →
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
