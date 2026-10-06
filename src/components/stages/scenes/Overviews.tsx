import { Phone, Screen } from "./Frames";
import { EASE_CALM, EASE_CAMERA, type SceneDef } from "../timeline";

/**
 * The overview stages: each product as it is, in motion, with no words.
 * Coordinates are in cqw of a 16:9 canvas (100 × 56.25).
 */

type Track = SceneDef["tracks"][number];

// ── ASTA: the live homepage, as recorded ────────────────────────────────
// The recording carries its own device frame and backdrop, so it fills the card.
export function SceneAstaOverview() {
  return (
    <div className="sc-ov">
      <video
        className="sc-ov__film"
        src="/images/asta/homepage-walkthrough.mp4"
        poster="/images/asta/homepage-walkthrough-poster.png"
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
}

// The footage runs on its own clock; the stage only plays, pauses and seeks it.
export const astaOverview: SceneDef = { duration: 33500, finalAt: 16000, tracks: [] };

// ── Kyros: three screens, floating gently ─────────────────────────────────
const KYROS = [
  { src: "/images/binapani/screens/home.png", x: 21 },
  { src: "/images/binapani/screens/activities.png", x: 40.5 },
  { src: "/images/binapani/screens/activity-detail.png", x: 60 },
];

export function SceneKyrosOverview() {
  return (
    <div className="sc-ov">
      {KYROS.map((p, i) => (
        <Phone key={p.src} src={p.src} k={`p${i}`} style={{ left: `${p.x}cqw`, top: "6cqw", width: "19cqw" }} />
      ))}
    </div>
  );
}

const float = (i: number): Track => {
  const d = i * 900;
  return {
    k: `p${i}`,
    ease: EASE_CALM,
    at: [
      [0, { transform: "translateY(0)" }],
      [1000 + d, { transform: "translateY(0)" }],
      [3600 + d, { transform: "translateY(-1.6cqw)" }],
      [6200 + d, { transform: "translateY(0.6cqw)" }],
    ],
  };
};

export const kyrosOverview: SceneDef = {
  duration: 10000,
  finalAt: 3600,
  tracks: [float(0), float(1), float(2)],
};

// ── Gut-Skin: the main features, light and dark side by side ───────────────
const GUT = ["home", "insights", "scan", "community", "profile"];
const GUT_SLOT = 2000;

export function SceneGutOverview() {
  return (
    <div className="sc-ov">
      <Phone src="/images/gut-skin/screens/home.png" style={{ left: "29.5cqw", top: "4.5cqw", width: "19.5cqw" }} k="light">
        {GUT.slice(1).map((s, i) => (
          <Screen key={s} src={`/images/gut-skin/screens/${s}.png`} k={`l${i + 1}`} />
        ))}
      </Phone>
      <Phone src="/images/gut-skin/screens/dark-home-3.png" style={{ left: "51cqw", top: "4.5cqw", width: "19.5cqw" }} k="dark">
        {GUT.slice(1).map((s, i) => (
          <Screen key={s} src={`/images/gut-skin/screens/dark-${s}-3.png`} k={`d${i + 1}`} />
        ))}
      </Phone>
    </div>
  );
}

const swap = (k: string, i: number, lag: number): Track => {
  const t = 600 + i * GUT_SLOT + lag;
  return {
    k,
    ease: EASE_CAMERA,
    at: [
      [0, { opacity: 0 }],
      [t, { opacity: 0 }],
      [t + 600, { opacity: 1 }],
    ],
  };
};

export const gutOverview: SceneDef = {
  duration: 10600,
  finalAt: 600 + 4 * GUT_SLOT + 800,
  tracks: [
    ...GUT.slice(1).map((_, j) => swap(`l${j + 1}`, j + 1, 0)),
    ...GUT.slice(1).map((_, j) => swap(`d${j + 1}`, j + 1, 160)),
    {
      k: "light",
      ease: EASE_CALM,
      at: [
        [0, { transform: "translateY(0)" }],
        [5000, { transform: "translateY(-1cqw)" }],
      ],
    },
    {
      k: "dark",
      ease: EASE_CALM,
      at: [
        [0, { transform: "translateY(0)" }],
        [5000, { transform: "translateY(1cqw)" }],
      ],
    },
  ],
};
