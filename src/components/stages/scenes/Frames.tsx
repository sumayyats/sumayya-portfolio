import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * Device frames for the real screens exported from Figma. The frame is the
 * only thing drawn here; everything inside it is the author's own design.
 */

type Shot = { src: string; k?: string; alt?: string; style?: CSSProperties; className?: string };

/** A phone: rounded bezel, the screen anchored to its top. */
export function Phone({ src, k, style, className = "", children }: Shot & { children?: React.ReactNode }) {
  return (
    <div className={`sf-phone ${className}`} style={style} data-k={k}>
      <div className="sf-phone__screen">
        <Image src={src} alt="" fill sizes="(min-width: 1024px) 260px, 30vw" className="sf-img-top" />
        {children}
      </div>
    </div>
  );
}

/** One screen layer inside a phone or browser, for crossfades between states. */
export function Screen({ src, k, style, sizes = "(min-width: 1024px) 260px, 30vw" }: Shot & { sizes?: string }) {
  return (
    <div className="sf-layer" style={style} data-k={k}>
      <Image src={src} alt="" fill sizes={sizes} className="sf-img-top" />
    </div>
  );
}

/** A desktop browser window: a quiet title bar, then the page. */
export function Browser({ url, style, k, children }: { url: string; style?: CSSProperties; k?: string; children: React.ReactNode }) {
  return (
    <div className="sf-browser" style={style} data-k={k}>
      <div className="sf-browser__bar">
        <i /><i /><i />
        <span>{url}</span>
      </div>
      <div className="sf-browser__page">{children}</div>
    </div>
  );
}
