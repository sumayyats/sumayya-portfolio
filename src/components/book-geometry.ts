// Deterministic per-book geometry so the shelf reads like real, hand-shelved
// books: varied heights and widths, a subtle organic lean, and a little
// perspective. Pure function of the index → identical on server and client
// (no hydration mismatch) and stable across the pull-forward layout animation.

function frac(seed: number): number {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

// Round to 2 decimals. Math.sin is not bit-identical across JS engines, so the
// raw fractions differ between server and client in the far decimals; rounding
// the emitted values keeps SSR and hydration in agreement.
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type BookGeometry = {
  width: number; // px
  height: number; // px
  lean: number; // deg, rotateZ around the foot
  roty: number; // deg, rotateY perspective
};

export function bookGeometry(
  index: number,
  kind: "featured" | "external"
): BookGeometry {
  const r1 = frac(index * 12.9898 + 1.31);
  const r2 = frac(index * 78.233 + 2.71);
  const r3 = frac(index * 37.719 + 4.13);

  if (kind === "featured") {
    return {
      width: Math.round(50 + r1 * 12), // 50–62
      height: Math.round(318 + r2 * 38), // 318–356
      lean: round2((r3 - 0.5) * 4.4), // ~ -2.2 .. +2.2
      roty: round2(-(7 + r1 * 5)), // -7 .. -12
    };
  }
  return {
    width: Math.round(30 + r1 * 13), // 30–43
    height: Math.round(236 + r2 * 74), // 236–310
    lean: round2((r3 - 0.5) * 6.2), // ~ -3.1 .. +3.1
    roty: round2(-(6 + r1 * 6)), // -6 .. -12
  };
}
