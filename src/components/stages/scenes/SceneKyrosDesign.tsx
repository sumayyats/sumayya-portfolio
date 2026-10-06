import { Phone, Screen } from "./Frames";
import { EASE_CALM, type SceneDef } from "../timeline";

/**
 * Kyros · from insight to design. The real activities flow on a phone, one
 * calm crossfade at a time, each screen paired with the insight it answers
 * (wording from the "From insight to design" table). Slow easing, no flashes.
 * Coordinates are in cqw of a 16:9 canvas (100 × 56.25).
 */

const STEPS = [
  {
    src: "/images/binapani/screens/first-activity.png",
    insight: "First-time users face an empty screen",
    design: "A friendly empty state that invites carers to create their first activity, with a “do it later” option",
  },
  {
    src: "/images/binapani/screens/activity-add.png",
    insight: "Each child needs a personal schedule",
    design: "An add-activity flow where carers pick an icon or upload their own image, choose a card colour, and add a name and description",
  },
  {
    src: "/images/binapani/screens/icon-picker.png",
    insight: "Symbols over text",
    design: "Activity cards led by a large icon, with a short label underneath",
  },
  {
    src: "/images/binapani/screens/colour-picker.png",
    insight: "Colour-coded timeline boards are already familiar",
    design: "Colour-coded cards with a soft pastel palette, plus a custom colour picker",
  },
  {
    src: "/images/binapani/screens/activities-edit.png",
    insight: "Routines change",
    design: "An edit mode to remove or replace activities (with a confirmation step so nothing is deleted by accident), plus suggested activities for adding quickly",
  },
];

const SLOT = 2000; // each step's share of the loop
const T0 = 400;
const at = (i: number) => T0 + i * SLOT;

type Track = SceneDef["tracks"][number];
type Key = [number, Keyframe];

export function SceneKyrosDesign() {
  return (
    <div className="sc-kyros">
      <div className="sc-kyros__stage" data-k="drift">
        <Phone src={STEPS[0].src} style={{ left: "15cqw", top: "3.6cqw", width: "22.6cqw" }}>
          {STEPS.slice(1).map((s, i) => (
            <Screen key={s.src} src={s.src} k={`s${i + 1}`} />
          ))}
        </Phone>
      </div>

      <div className="sc-kyros__notes">
        {STEPS.map((s, i) => (
          <div key={s.src} className="sc-kyros__note" data-k={`n${i}`}>
            <span className="sc-kyros__idx">
              {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </span>
            <span className="sc-kyros__k">Insight</span>
            <p className="sc-kyros__insight">{s.insight}</p>
            <span className="sc-kyros__k">What I designed</span>
            <p className="sc-kyros__design">{s.design}</p>
          </div>
        ))}
      </div>

      <div className="sc-kyros__dots">
        {STEPS.map((s, i) => (
          <i key={s.src} data-k={`d${i}`} />
        ))}
      </div>
    </div>
  );
}

// screens settle in over the one before, like the app's own transitions
const screenTrack = (i: number): Track => ({
  k: `s${i}`,
  ease: EASE_CALM,
  at: [
    [0, { opacity: 0, transform: "translateY(1.2cqw)" }],
    [at(i), { opacity: 0, transform: "translateY(1.2cqw)" }],
    [at(i) + 800, { opacity: 1, transform: "translateY(0)" }],
  ],
});

// each note holds while its screen is up; the first is the still frame's
const noteTrack = (i: number): Track => {
  const hidden = { opacity: 0, transform: "translateY(0.8cqw)" };
  const shown = { opacity: 1, transform: "translateY(0)" };
  const keys: Key[] =
    i === 0
      ? [[0, shown]]
      : [
          [0, hidden],
          [at(i), hidden],
          [at(i) + 700, shown],
        ];
  if (i < STEPS.length - 1)
    keys.push([at(i + 1), shown], [at(i + 1) + 500, { opacity: 0, transform: "translateY(-0.6cqw)" }]);
  return { k: `n${i}`, ease: EASE_CALM, at: keys };
};

const dotTrack = (i: number): Track => {
  const keys: Key[] =
    i === 0
      ? [[0, { opacity: 1 }]]
      : [
          [0, { opacity: 0.3 }],
          [at(i), { opacity: 0.3 }],
          [at(i) + 500, { opacity: 1 }],
        ];
  if (i < STEPS.length - 1) keys.push([at(i + 1), { opacity: 1 }], [at(i + 1) + 500, { opacity: 0.3 }]);
  return { k: `d${i}`, ease: EASE_CALM, at: keys };
};

export const kyrosDesign: SceneDef = {
  duration: 11000,
  finalAt: at(STEPS.length - 1) + 1000,
  tracks: [
    ...STEPS.slice(1).map((_, j) => screenTrack(j + 1)),
    ...STEPS.map((_, i) => noteTrack(i)),
    ...STEPS.map((_, i) => dotTrack(i)),
    // a slow, almost imperceptible drift so the frame never sits dead still
    {
      k: "drift",
      ease: "cubic-bezier(.45,.05,.55,.95)",
      at: [
        [0, { transform: "translateY(0)" }],
        [10200, { transform: "translateY(-1.2cqw)" }],
      ],
    },
  ],
};
