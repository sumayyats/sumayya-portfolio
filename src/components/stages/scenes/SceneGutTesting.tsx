import { Phone, Screen } from "./Frames";
import { EASE_CAMERA, type SceneDef } from "../timeline";

/**
 * Gut-Skin · three rounds of testing. Each round arrives as its real screens
 * (low-fi, the split mid-fi histories, the merged hi-fi history) with that
 * round's figures and what testing revealed; then the camera moves in on the
 * hi-fi history for the before → after of the refinements.
 * Coordinates are in cqw of a 16:9 canvas (100 × 56.25).
 */

// Figures verbatim from the case study's tables.
const ROUNDS = [
  {
    label: "Round 1 · Low-fi",
    success: "69.0%",
    confusion: "46",
  },
  {
    label: "Round 2 · Mid-fi",
    success: "68.6%",
    confusion: "42",
  },
  {
    label: "Round 3 · Hi-fi",
    success: "100%",
    confusion: "26",
  },
];

const ROUND_T = [400, 2200, 4000]; // each round arrives
const COL_X = [4, 36, 68];
const BA_T = 7000; // before → after begins

type Track = SceneDef["tracks"][number];

export function SceneGutTesting() {
  return (
    <div className="sc-gut">
      <div className="sc-gut__rounds" data-k="rounds">
        {ROUNDS.map((r, i) => (
          <div key={r.label} className="sc-gut__col" style={{ left: `${COL_X[i]}cqw` }} data-k={`c${i}`}>
            <span className="sc-gut__label">{r.label}</span>
            <div className="sc-gut__devices">
              {i === 0 && <Phone src="/images/gut-skin/stage/round1-home.png" style={{ left: "7.25cqw", width: "13.5cqw" }} />}
              {i === 1 && (
                <>
                  {/* two histories in two places: the round's problem */}
                  <Phone src="/images/gut-skin/stage/round2-log-history.png" style={{ left: "13.5cqw", width: "12cqw", top: "1.4cqw" }} />
                  <Phone src="/images/gut-skin/stage/round2-scan-history.png" style={{ left: "2.5cqw", width: "12cqw" }} />
                </>
              )}
              {i === 2 && <Phone src="/images/gut-skin/screens/history-after.png" style={{ left: "7.25cqw", width: "13.5cqw" }} />}
            </div>
            <div className={`sc-gut__fig ${i === 2 ? "is-accent" : ""}`} data-k={`f${i}`}>
              <div className="sc-gut__stats">
                <span><b>{r.success}</b><em>task success</em></span>
                <span><b>{r.confusion}</b><em>confusion moments</em></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* before → after: the history screen, wiped across */}
      <div className="sc-gut__ba" data-k="ba">
        <span className="sc-gut__bacap">Before and after the refinements</span>
        <Phone src="/images/gut-skin/screens/history-before.png" className="sc-gut__baphone">
          <div className="sc-gut__wipe" data-k="wipe">
            <div className="sc-gut__wipein" data-k="wipein">
              <Screen src="/images/gut-skin/screens/history-after.png" />
            </div>
          </div>
        </Phone>
        <i className="sc-gut__line" data-k="line" />
        <span className="sc-gut__tag is-before">Before</span>
        <span className="sc-gut__tag is-after" data-k="aftertag">After</span>
      </div>
    </div>
  );
}

const col = (i: number): Track => ({
  k: `c${i}`,
  at: [
    [0, { opacity: 0.18, transform: "translateY(1.6cqw)" }],
    [ROUND_T[i], { opacity: 0.18, transform: "translateY(1.6cqw)" }],
    [ROUND_T[i] + 700, { opacity: 1, transform: "translateY(0)" }],
  ],
});

const fig = (i: number): Track => ({
  k: `f${i}`,
  at: [
    [0, { opacity: 0 }],
    [ROUND_T[i] + 500, { opacity: 0 }],
    [ROUND_T[i] + 900, { opacity: 1 }],
  ],
});

// the wipe moves with transforms only: the window slides one way, its
// content the other, so the "after" screen stays put while it's revealed
const WIPE: [number, number][] = [
  [0, 100],
  [BA_T + 900, 100],
  [BA_T + 2300, 0],
  [BA_T + 3200, 0],
  [BA_T + 3900, 50],
];

export const gutTesting: SceneDef = {
  duration: 12000,
  finalAt: BA_T + 3000,
  tracks: [
    col(0),
    col(1),
    col(2),
    fig(0),
    fig(1),
    fig(2),
    {
      k: "rounds",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 1, transform: "scale(1)" }],
        [BA_T - 400, { opacity: 1, transform: "scale(1)" }],
        [BA_T + 500, { opacity: 0, transform: "scale(1.06)" }],
        [11300, { opacity: 0, transform: "scale(1)" }],
      ],
    },
    {
      k: "ba",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 0, transform: "scale(0.96)" }],
        [BA_T - 100, { opacity: 0, transform: "scale(0.96)" }],
        [BA_T + 600, { opacity: 1, transform: "scale(1)" }],
        [11300, { opacity: 1, transform: "scale(1)" }],
      ],
    },
    { k: "wipe", ease: EASE_CAMERA, at: WIPE.map(([t, p]) => [t, { transform: `translateX(${p}%)` }]) },
    { k: "wipein", ease: EASE_CAMERA, at: WIPE.map(([t, p]) => [t, { transform: `translateX(${-p}%)` }]) },
    {
      k: "line",
      ease: EASE_CAMERA,
      // the divider rides the wipe edge across the phone (phone is 18cqw wide)
      at: WIPE.map(([t, p]) => [t, { transform: `translateX(${(p / 100) * 18}cqw)`, opacity: p === 100 || p === 0 ? 0 : 1 }]),
    },
    { k: "aftertag", ease: EASE_CAMERA, at: [[0, { opacity: 0 }], [BA_T + 1600, { opacity: 0 }], [BA_T + 2200, { opacity: 1 }]] },
  ],
};
