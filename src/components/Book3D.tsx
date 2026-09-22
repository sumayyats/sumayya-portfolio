"use client";

import type { CSSProperties, ReactNode } from "react";
import type { BookGeometry } from "./book-geometry";

/**
 * A real 3D book built from CSS faces (preserve-3d): the spine faces the
 * viewer, the book is turned so a sliver of the front cover shows, and tilted
 * so the page-block on top is visible. Lean + hover-lift live on an outer
 * wrapper (origin at the foot); the 3D turn lives on the inner box (origin
 * centre) so the two never fight — and neither touches the Framer layout box.
 */
export function Book3D({
  geo,
  spineColor, // base cloth colour
  coverColor, // front-cover cloth colour (usually a touch darker)
  pageColor, // the paper block on top / fore-edge
  spine,
  cover,
}: {
  geo: BookGeometry;
  spineColor: string;
  coverColor: string;
  pageColor: string;
  spine: ReactNode;
  cover?: ReactNode;
}) {
  const { spineW: w, depth: d, height: h, lean, angleY, angleX } = geo;

  const face: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    // Subtle woven-cloth texture, applied per face over the base colour.
    backgroundBlendMode: "overlay",
  };
  const cloth =
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 2px), repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 2px)";

  return (
    <div
      className="transition-transform duration-200 ease-out will-change-transform"
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "bottom center",
        transform: `translateY(var(--lift,0px)) rotateZ(${lean}deg)`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: w,
          height: h,
          transformStyle: "preserve-3d",
          // Turn about the spine's leading edge, not the block's centre: that
          // edge then stays put on the projection plane and the cover swings
          // back behind it, so the book's painted footprint is exactly
          // `projectedWidth` and the shelf packs with no stray gaps.
          transformOrigin: "left center",
          transform: `rotateX(${-angleX}deg) rotateY(${-angleY}deg)`,
        }}
      >
        {/* FRONT — the spine */}
        <div
          style={{
            ...face,
            width: w,
            height: h,
            transform: `translate(-50%,-50%) translateZ(${d / 2}px)`,
            background: `${cloth}, linear-gradient(100deg, color-mix(in srgb, ${spineColor} 78%, #fff) 0%, ${spineColor} 34%, color-mix(in srgb, ${spineColor} 74%, #000) 100%)`,
            borderRadius: "3px 2px 2px 3px",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}
        >
          {spine}
          {/* head/tail cap shadow for a rounded hardback feel */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.28), transparent 8%, transparent 92%, rgba(0,0,0,0.3))",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* RIGHT — the front cover */}
        <div
          style={{
            ...face,
            width: d,
            height: h,
            transform: `translate(-50%,-50%) rotateY(90deg) translateZ(${w / 2}px)`,
            background: `${cloth}, linear-gradient(180deg, color-mix(in srgb, ${coverColor} 84%, #fff) 0%, ${coverColor} 55%, color-mix(in srgb, ${coverColor} 80%, #000) 100%)`,
            borderRadius: "2px 4px 4px 2px",
            overflow: "hidden",
          }}
        >
          {cover}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.22), transparent 22%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* TOP — the page block (head) */}
        <div
          style={{
            ...face,
            width: w,
            height: d,
            transform: `translate(-50%,-50%) rotateX(90deg) translateZ(${h / 2}px)`,
            background: `repeating-linear-gradient(90deg, ${pageColor} 0 1.5px, color-mix(in srgb, ${pageColor} 90%, #000) 1.5px 2.5px)`,
            borderRadius: "2px",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)",
          }}
        />

        {/* LEFT — the hinge / back-cover edge (mostly hidden, adds solidity) */}
        <div
          style={{
            ...face,
            width: d,
            height: h,
            transform: `translate(-50%,-50%) rotateY(-90deg) translateZ(${w / 2}px)`,
            background: `color-mix(in srgb, ${spineColor} 62%, #000)`,
          }}
        />

        {/* BOTTOM — tail, catches shelf shadow */}
        <div
          style={{
            ...face,
            width: w,
            height: d,
            transform: `translate(-50%,-50%) rotateX(-90deg) translateZ(${h / 2}px)`,
            background: `color-mix(in srgb, ${pageColor} 70%, #000)`,
          }}
        />
      </div>
    </div>
  );
}
