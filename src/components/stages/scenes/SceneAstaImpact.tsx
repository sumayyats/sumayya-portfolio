import { Cursor } from "./Cursor";
import { EASE_CAMERA, type SceneDef } from "../timeline";

/**
 * ASTA · impact — "UI story" (reference 1): the parent dashboard's 8-step
 * checklist fills, then the frame pulls back to the two reported figures.
 * Coordinates are in cqw of a 16:9 canvas (100 × 56.25).
 */
const STEPS = 8;
const STEP_T0 = 1300; // first tick
const STEP_GAP = 380;

export function SceneAstaImpact() {
  return (
    <div className="sc-asta">
      <div className="sc-asta__win" data-k="win">
        <div className="sc-asta__chrome">
          <i /><i /><i />
          <span className="sc-asta__url">ppdb.asy-syukriyyah.sch.id</span>
        </div>
        <div className="sc-asta__body">
          <nav className="sc-asta__side">
            <span className="sc-asta__logo" />
            {["Overview", "Profile", "Payment information", "Document downloads"].map((l, i) => (
              <span key={l} className={i === 0 ? "is-on" : ""}>{l}</span>
            ))}
          </nav>
          <div className="sc-asta__main">
            <p className="sc-asta__h">Overview</p>
            <span className="sc-asta__cta" data-k="cta">Complete your personal data now</span>
            <div className="sc-asta__bar"><span data-k="fill" /></div>
            <ol className="sc-asta__steps">
              {Array.from({ length: STEPS }, (_, i) => (
                <li key={i}>
                  <span className="sc-asta__dot">
                    <span data-k="tick">
                      <svg viewBox="0 0 12 12"><path d="M2.5 6.4 5 8.8l4.6-5.4" /></svg>
                    </span>
                  </span>
                  <span className="sc-asta__step">Step {i + 1}</span>
                  <span className="sc-asta__pill" style={{ width: `${[38, 30, 44, 26, 36, 40, 28, 34][i]}%` }} data-k="pill" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* the two figures grow out of small bars, load, then resolve */}
      {[
        { k: "n1", label: "families registered through the new site in the last intake" },
        { k: "n2", label: "of them completed registration without help from school staff" },
      ].map((c, i) => (
        <div key={c.k} className="sc-asta__card" style={{ top: `${9 + i * 18}cqw` }} data-k={`card${i}`}>
          <div className="sc-asta__sk" data-k={`sk${i}`}>
            <i style={{ width: "34%" }} /><i style={{ width: "82%" }} /><i style={{ width: "60%" }} />
          </div>
          <div className="sc-asta__fig" data-k={`fig${i}`}>
            <span className="sc-asta__num" data-k={c.k}>~0</span>
            <span className="sc-asta__lab">{c.label}</span>
          </div>
        </div>
      ))}

      <p className="sc-asta__src">Figures reported by the school&apos;s IT team.</p>
      <Cursor k="cur" />
    </div>
  );
}

const card = (i: number): SceneDef["tracks"] => {
  const t = 5000 + i * 350;
  return [
    {
      k: `card${i}`,
      at: [
        [0, { opacity: 0, transform: "scale(0.18, 0.08)" }],
        [t, { opacity: 0, transform: "scale(0.18, 0.08)" }],
        [t + 200, { opacity: 1, transform: "scale(0.18, 0.08)" }],
        [t + 550, { opacity: 1, transform: "scale(1, 0.08)" }],
        [t + 950, { opacity: 1, transform: "scale(1, 1)" }],
        [7350, { opacity: 1, transform: "scale(1, 1)" }],
        [7750, { opacity: 0, transform: "scale(1, 1)" }],
      ],
    },
    {
      k: `sk${i}`,
      at: [
        [0, { opacity: 0 }],
        [t + 950, { opacity: 0 }],
        [t + 1150, { opacity: 1 }],
        [t + 1450, { opacity: 1 }],
        [t + 1650, { opacity: 0 }],
      ],
    },
    {
      k: `fig${i}`,
      at: [
        [0, { opacity: 0, transform: "translateY(0.6cqw)" }],
        [t + 1500, { opacity: 0, transform: "translateY(0.6cqw)" }],
        [t + 1900, { opacity: 1, transform: "translateY(0)" }],
      ],
    },
  ];
};

export const astaImpact: SceneDef = {
  duration: 8000,
  finalAt: 7300,
  tracks: [
    // cursor: drift to the call to action, press, then rest out of the way
    {
      k: "cur",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 0, transform: "translate(72cqw, 44cqw) scale(1)" }],
        [200, { opacity: 1, transform: "translate(72cqw, 44cqw) scale(1)" }],
        [850, { opacity: 1, transform: "translate(37cqw, 15.6cqw) scale(1)" }],
        [980, { opacity: 1, transform: "translate(37cqw, 15.6cqw) scale(0.82)" }],
        [1120, { opacity: 1, transform: "translate(37cqw, 15.6cqw) scale(1)" }],
        [1900, { opacity: 1, transform: "translate(70cqw, 30cqw) scale(1)" }],
        [4200, { opacity: 1, transform: "translate(70cqw, 30cqw) scale(1)" }],
        [4500, { opacity: 0, transform: "translate(70cqw, 30cqw) scale(1)" }],
      ],
    },
    {
      k: "cta",
      at: [
        [0, { transform: "scale(1)" }],
        [980, { transform: "scale(1)" }],
        [1080, { transform: "scale(0.96)" }],
        [1250, { transform: "scale(1)" }],
      ],
    },
    // one tick per step, one step every STEP_GAP
    {
      k: "tick",
      at: (i) => {
        const t = STEP_T0 + i * STEP_GAP;
        return [
          [0, { transform: "scale(0)" }],
          [t, { transform: "scale(0)" }],
          [t + 320, { transform: "scale(1)" }],
        ];
      },
    },
    {
      k: "pill",
      at: (i) => {
        const t = STEP_T0 + i * STEP_GAP;
        return [
          [0, { opacity: 0.35 }],
          [t, { opacity: 0.35 }],
          [t + 320, { opacity: 1 }],
        ];
      },
    },
    // the progress bar runs in step with the checklist
    {
      k: "fill",
      ease: "linear",
      at: [
        [0, { transform: "scaleX(0)" }],
        [STEP_T0, { transform: "scaleX(0)" }],
        [STEP_T0 + STEPS * STEP_GAP, { transform: "scaleX(1)" }],
      ],
    },
    // camera: pull back so the window recedes beside the figures
    {
      k: "win",
      ease: EASE_CAMERA,
      at: [
        [0, { opacity: 1, transform: "translate(0, 0) scale(1)" }],
        [4500, { opacity: 1, transform: "translate(0, 0) scale(1)" }],
        [5400, { opacity: 0.7, transform: "translate(-23cqw, -1cqw) scale(0.5)" }],
        [7300, { opacity: 0.7, transform: "translate(-23cqw, -1cqw) scale(0.5)" }],
      ],
    },
    ...card(0),
    ...card(1),
  ],
  counters: [
    { k: "n1", from: 0, to: 700, start: 6550, end: 7250, format: (n) => `~${n}` },
    { k: "n2", from: 0, to: 97, start: 6900, end: 7300, format: (n) => `~${n}%` },
  ],
};
