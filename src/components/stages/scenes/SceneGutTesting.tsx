import { EASE_CAMERA, type SceneDef } from "../timeline";

/**
 * Gut-Skin · three rounds of testing — "data and camera" (reference 2).
 * Lines draw in and converge across the rounds like a funnel; each round's
 * figures land at the foot of its column with what testing revealed; a short
 * dot-matrix interlude bridges into the history screens merging into one.
 * Coordinates are in cqw of a 16:9 canvas (100 × 56.25).
 */

// Figures and findings verbatim from the case study's tables.
const ROUNDS = [
  {
    label: "Round 1 · Low-fi",
    success: "69.0%",
    confusion: "46",
    revealed: "Participants didn't understand how content was grouped and labelled",
  },
  {
    label: "Round 2 · Mid-fi",
    success: "68.6%",
    confusion: "42",
    revealed: "3 of 6 participants started a new scan when asked to find an old one, and nobody found scan history unaided.",
  },
  {
    label: "Round 3 · Hi-fi",
    success: "100%",
    confusion: "26",
    revealed: "100% task success, and no one confused the two histories.",
  },
];

const ROUND_T = [1700, 3500, 5300]; // each column's figures land
const LINES = 22;

// Deterministic spread so the server and client draw the same funnel.
const lineY = (i: number) => {
  const u = i / (LINES - 1);
  const y0 = 10.5 + u * 22; // wide at Round 1
  const y1 = 15.5 + u * 12; // narrower at Round 2
  const y2 = 20.2 + u * 2.6; // converged at Round 3
  return `M3 ${y0} C 22 ${y0}, 26 ${y1}, 41 ${y1} S 64 ${y2}, 97 ${y2}`;
};

// 5×5 dot grids for the interlude: two patterns each, crossfading.
const GRIDS = 24;
const pattern = (g: number, layer: number) =>
  Array.from({ length: 25 }, (_, d) => ((d * 7 + g * 13 + layer * 5) % 11) < 5);

export function SceneGutTesting() {
  return (
    <div className="sc-gut">
      {ROUNDS.map((r, i) => (
        <div key={r.label} className="sc-gut__col" style={{ left: `${3 + i * 32}cqw` }}>
          <span className="sc-gut__label">{r.label}</span>
        </div>
      ))}

      <svg className="sc-gut__lines" viewBox="0 0 100 56.25" preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: LINES }, (_, i) => (
          <path key={i} d={lineY(i)} pathLength={1} data-k="line" className={i % 5 === 2 ? "is-lit" : ""} />
        ))}
      </svg>

      {ROUNDS.map((r, i) => (
        <div
          key={r.label}
          className={`sc-gut__fig ${i === 2 ? "is-accent" : ""}`}
          style={{ left: `${4.5 + i * 32}cqw` }}
          data-k={`fig${i}`}
        >
          <div className="sc-gut__stats">
            <span><b>{r.success}</b><em>task success</em></span>
            <span><b>{r.confusion}</b><em>confusion moments</em></span>
          </div>
          <p className="sc-gut__rev">
            <span className="sc-gut__ghost">{r.revealed}</span>
            <span className="sc-gut__type" data-k={`rev${i}`} />
          </p>
        </div>
      ))}

      {/* interlude: flickering dot matrices on black */}
      <div className="sc-gut__dots" data-k="dots">
        {Array.from({ length: GRIDS }, (_, g) => (
          <div key={g} className="sc-gut__grid">
            {[0, 1].map((layer) => (
              <div key={layer} className="sc-gut__layer" data-k={layer ? "dotB" : "dotA"}>
                {pattern(g, layer).map((on, d) => (
                  <i key={d} className={on ? "on" : ""} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* before → after: two histories become one screen with filters */}
      <div className="sc-gut__ba" data-k="ba">
        <span className="sc-gut__bacap">Round 2 → Round 3</span>
        {[
          { k: "hA", title: "Scan history", x: 22 },
          { k: "hB", title: "Log history", x: 58 },
        ].map((h) => (
          <div key={h.k} className="sc-gut__phone" style={{ left: `${h.x}cqw` }} data-k={h.k}>
            <p>{h.title}</p>
            {[0, 1, 2, 3].map((r) => (
              <span key={r} className="sc-gut__rowi"><i /><em /></span>
            ))}
          </div>
        ))}
        <div className="sc-gut__phone is-merged" style={{ left: "40cqw" }} data-k="hM">
          <p>History</p>
          <span className="sc-gut__chips">
            {["Today", "This week", "This month", "This year"].map((c, i) => (
              <i key={c} className={i === 1 ? "on" : ""}>{c}</i>
            ))}
          </span>
          {[0, 1, 2, 3].map((r) => (
            <span key={r} className="sc-gut__rowi"><i /><em /></span>
          ))}
        </div>
      </div>
    </div>
  );
}

const fig = (i: number): SceneDef["tracks"][number] => ({
  k: `fig${i}`,
  at: [
    [0, { opacity: 0, transform: "translateY(1cqw)" }],
    [ROUND_T[i], { opacity: 0, transform: "translateY(1cqw)" }],
    [ROUND_T[i] + 500, { opacity: 1, transform: "translateY(0)" }],
    [7400, { opacity: 1, transform: "translateY(0)" }],
    [7700, { opacity: 0, transform: "translateY(0)" }],
  ],
});

// Flicker no faster than twice a second per grid (well under 3 flashes/s).
const flicker = (g: number): [number, Keyframe][] => {
  const base = 7600 + (g % 5) * 90; // last grid ends its cycle by 9180
  return [
    [0, { opacity: 0 }],
    [base, { opacity: 0 }],
    [base + 120, { opacity: 0.9 }],
    [base + 560, { opacity: 0.9 }],
    [base + 680, { opacity: 0.15 }],
    [base + 1100, { opacity: 0.15 }],
    [base + 1220, { opacity: 0.9 }],
    [9300, { opacity: 0.9 }],
    [9450, { opacity: 0 }],
  ];
};

export const gutTesting: SceneDef = {
  duration: 12000,
  finalAt: 10900,
  tracks: [
    {
      k: "line",
      ease: "cubic-bezier(.3,.1,.2,1)",
      at: (i) => {
        const t = 500 + i * 70;
        return [
          [0, { strokeDashoffset: "1" }],
          [t, { strokeDashoffset: "1" }],
          [t + 2600, { strokeDashoffset: "0" }],
          [9000, { strokeDashoffset: "0" }],
          [9200, { strokeDashoffset: "1" }],
        ];
      },
    },
    fig(0),
    fig(1),
    fig(2),
    {
      k: "dots",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 0 }],
        [7400, { opacity: 0 }],
        [7650, { opacity: 1 }],
        [11400, { opacity: 1 }],
        [11900, { opacity: 0 }],
      ],
    },
    { k: "dotA", at: (g) => flicker(g + 3) },
    { k: "dotB", at: (g) => flicker(g + 1).map(([t, s]) => [t, { opacity: 0.9 - (s.opacity as number) * 0.8 }]) },
    {
      k: "ba",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 0, transform: "scale(1.04)" }],
        [8900, { opacity: 0, transform: "scale(1.04)" }],
        [9300, { opacity: 1, transform: "scale(1)" }],
        [11400, { opacity: 1, transform: "scale(1)" }],
        [11900, { opacity: 0, transform: "scale(1)" }],
      ],
    },
    {
      k: "hA",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 1, transform: "translateX(0)" }],
        [9700, { opacity: 1, transform: "translateX(0)" }],
        [10400, { opacity: 0, transform: "translateX(18cqw)" }],
        [11500, { opacity: 0, transform: "translateX(18cqw)" }],
      ],
    },
    {
      k: "hB",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 1, transform: "translateX(0)" }],
        [9700, { opacity: 1, transform: "translateX(0)" }],
        [10400, { opacity: 0, transform: "translateX(-18cqw)" }],
        [11500, { opacity: 0, transform: "translateX(-18cqw)" }],
      ],
    },
    {
      k: "hM",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 0, transform: "scale(0.94)" }],
        [10100, { opacity: 0, transform: "scale(0.94)" }],
        [10700, { opacity: 1, transform: "scale(1)" }],
        [11500, { opacity: 1, transform: "scale(1)" }],
      ],
    },
  ],
  typers: ROUNDS.map((r, i) => ({
    k: `rev${i}`,
    text: r.revealed,
    start: ROUND_T[i] + 500,
    end: ROUND_T[i] + 500 + r.revealed.length * 18,
  })),
};
