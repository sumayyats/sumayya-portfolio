// Deterministic per-book geometry so the shelf reads like real, hand-shelved
// books: varied heights and widths, real thickness (a front-cover face + a top
// page-block), a subtle organic lean and a little perspective. Pure function of
// the index → identical on server and client (no hydration mismatch) and stable
// across the pull-forward layout animation.

const DEG = Math.PI / 180;

function frac(seed: number): number {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

// Math.sin is not bit-identical across JS engines, so raw fractions differ
// between server and client in the far decimals; rounding the emitted values
// keeps SSR and hydration in agreement.
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type BookGeometry = {
  spineW: number; // px — the thickness we read as the spine
  depth: number; // px — how deep the book is (its front cover)
  height: number; // px
  lean: number; // deg, rotateZ around the foot
  angleY: number; // deg, how far the book is turned (reveals the cover)
  angleX: number; // deg, slight downward tilt (reveals the page-block on top)
};

export function bookGeometry(
  index: number,
  kind: "featured" | "external"
): BookGeometry {
  const r1 = frac(index * 12.9898 + 1.31);
  const r2 = frac(index * 78.233 + 2.71);
  const r3 = frac(index * 37.719 + 4.13);
  const r4 = frac(index * 24.113 + 5.17);

  if (kind === "featured") {
    return {
      spineW: Math.round(44 + r1 * 12), // 44–56
      depth: Math.round(52 + r4 * 14), // 52–66
      height: Math.round(320 + r2 * 36), // 320–356
      lean: round2((r3 - 0.5) * 3.6), // ~ -1.8 .. +1.8
      angleY: round2(15 + r1 * 5), // 15–20 (spine-forward, slim cover sliver)
      angleX: round2(5 + r4 * 2.5), // 5–7.5
    };
  }
  return {
    spineW: Math.round(28 + r1 * 12), // 28–40
    depth: Math.round(38 + r4 * 12), // 38–50
    height: Math.round(240 + r2 * 66), // 240–306
    lean: round2((r3 - 0.5) * 5), // ~ -2.5 .. +2.5
    angleY: round2(13 + r1 * 5), // 13–18
    angleX: round2(4 + r4 * 2.5), // 4–6.5
  };
}

/** The book's on-shelf footprint once turned — used to pack books tightly. */
export function projectedWidth(g: BookGeometry): number {
  const a = g.angleY * DEG;
  return Math.round(g.spineW * Math.cos(a) + g.depth * Math.sin(a));
}
