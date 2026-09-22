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

/**
 * `scale` lets the shelf grow/shrink the books to fit the viewport height
 * (measured in <Shelf/>). Defaults to 1 so SSR and the first client render
 * agree; the effect then applies the real scale.
 */
export function bookGeometry(
  index: number,
  kind: "featured" | "external",
  scale = 1
): BookGeometry {
  const r1 = frac(index * 12.9898 + 1.31);
  const r2 = frac(index * 78.233 + 2.71);
  const r3 = frac(index * 37.719 + 4.13);
  const r4 = frac(index * 24.113 + 5.17);

  if (kind === "featured") {
    const height = Math.round((436 + r2 * 92) * scale); // 436–528
    return {
      spineW: Math.round((46 + r1 * 34) * scale), // 46–80 (slim to chunky)
      // A real book is about three-quarters as wide as it is tall, and the
      // front cover is printed on this face — so it has to be cover-shaped.
      depth: Math.round(height * (0.72 + r4 * 0.05)),
      height, // fills the screen
      lean: round2((r3 - 0.5) * 3.2), // ~ -1.6 .. +1.6
      // Barely turned: a real shelf packs books spine-out, with just a hint
      // of cover catching the light. Every extra degree is a gap.
      angleY: round2(6 + r1 * 4), // 6–10
      angleX: round2(5 + r4 * 2.5), // 5–7.5
    };
  }
  const height = Math.round((338 + r2 * 112) * scale); // 338–450
  return {
    spineW: Math.round((32 + r1 * 28) * scale), // 32–60
    depth: Math.round(height * (0.7 + r4 * 0.05)),
    height,
    lean: round2((r3 - 0.5) * 4.4), // ~ -2.2 .. +2.2
    angleY: round2(5 + r1 * 4), // 5–9
    angleX: round2(4 + r4 * 2.5), // 4–6.5
  };
}

/** Must match the `perspective` the shelf puts on each book. */
export const PERSPECTIVE = 1200;

/**
 * The book's on-shelf footprint once turned — used to pack books tightly.
 * The spine's leading edge is the pivot, so the spine paints at full size and
 * the cover swings back behind it, shrinking as it recedes.
 */
export function projectedWidth(g: BookGeometry): number {
  const a = g.angleY * DEG;
  const back = g.spineW * Math.sin(a) + g.depth * Math.cos(a); // how far it recedes
  const shrink = PERSPECTIVE / (PERSPECTIVE + back / 2); // averaged over the face
  return Math.round(g.spineW * Math.cos(a) + g.depth * Math.sin(a) * shrink);
}
