import { Browser, Screen } from "./Frames";
import { EASE_CAMERA, type SceneDef } from "../timeline";

/**
 * ASTA · impact. The parent's journey through the real dashboard screens
 * (login → overview → profile → payment → downloads), a push-in on the
 * registration checklist, then the window steps back for the two figures the
 * school reported. Coordinates are in cqw of a 16:9 canvas (100 × 56.25).
 */

const SCREENS = [
  { k: "s0", src: "/images/asta/login.png", label: "Login" },
  { k: "s1", src: "/images/asta/dashboard.png", label: "Overview" },
  { k: "s2", src: "/images/asta/profile.png", label: "Profile" },
  { k: "s3", src: "/images/asta/payment.png", label: "Payment information" },
  { k: "s4", src: "/images/asta/downloads.png", label: "Document downloads" },
];
const IN = [0, 800, 4000, 4700, 5300]; // when each screen arrives

export function SceneAstaImpact() {
  return (
    <div className="sc-asta">
      <Browser url="ppdb.asy-syukriyyah.sch.id" k="win" style={{ left: "17cqw", top: "3.4cqw", width: "66cqw" }}>
        {/* the overview gets its own wrapper so the camera can push in on it */}
        {SCREENS.map((s, i) =>
          i === 1 ? (
            <div key={s.k} className="sf-layer" data-k={s.k}>
              <div className="sf-layer sc-asta__zoom" data-k="zoom">
                <Screen src={s.src} sizes="(min-width: 1024px) 900px, 70vw" />
              </div>
            </div>
          ) : (
            <Screen key={s.k} k={s.k} src={s.src} sizes="(min-width: 1024px) 900px, 70vw" />
          )
        )}
      </Browser>

      <div className="sc-asta__labels">
        {SCREENS.map((s) => (
          <span key={s.k} data-k={`l${s.k}`}>{s.label}</span>
        ))}
      </div>

      <div className="sc-asta__figs">
        <div data-k="f0">
          <span className="sc-asta__num" data-k="n1">~0</span>
          <span className="sc-asta__lab">families registered through the new site in the last intake</span>
        </div>
        <div data-k="f1">
          <span className="sc-asta__num" data-k="n2">~0%</span>
          <span className="sc-asta__lab">of them completed registration without help from school staff</span>
        </div>
      </div>

      <p className="sc-asta__src">Figures reported by the school&apos;s IT team.</p>
    </div>
  );
}

const screenTrack = (k: string, t: number): SceneDef["tracks"][number] =>
  t === 0
    ? { k, at: [[0, { opacity: 1 }]] }
    : {
        k,
        at: [
          [0, { opacity: 0, transform: "translateX(1.5cqw)" }],
          [t, { opacity: 0, transform: "translateX(1.5cqw)" }],
          [t + 450, { opacity: 1, transform: "translateX(0)" }],
        ],
      };

const labelTrack = (i: number): SceneDef["tracks"][number] => {
  const t = IN[i];
  const next = IN[i + 1] ?? 5900;
  return {
    k: `ls${i}`,
    at: [
      [0, { opacity: i === 0 ? 1 : 0 }],
      [t, { opacity: i === 0 ? 1 : 0 }],
      [t + 300, { opacity: 1 }],
      [next, { opacity: 1 }],
      [next + 250, { opacity: 0 }],
    ],
  };
};

const fig = (i: number): SceneDef["tracks"][number] => {
  const t = 6200 + i * 300;
  return {
    k: `f${i}`,
    at: [
      [0, { opacity: 0, transform: "translateY(1.2cqw)" }],
      [t, { opacity: 0, transform: "translateY(1.2cqw)" }],
      [t + 600, { opacity: 1, transform: "translateY(0)" }],
    ],
  };
};

export const astaImpact: SceneDef = {
  duration: 8000,
  finalAt: 7350,
  tracks: [
    ...SCREENS.map((s, i) => screenTrack(s.k, IN[i])),
    ...SCREENS.map((_, i) => labelTrack(i)),
    // push in on "Progres pendaftaran", the 8-step checklist, and back out
    {
      k: "zoom",
      ease: EASE_CAMERA,
      at: [
        [0, { transform: "scale(1)" }],
        [1500, { transform: "scale(1)" }],
        [2600, { transform: "scale(1.75)" }],
        [3300, { transform: "scale(1.75)" }],
        [4000, { transform: "scale(1)" }],
      ],
    },
    // the window steps back for the figures
    {
      k: "win",
      ease: EASE_CAMERA,
      at: [
        [0, { transform: "translate(0, 0) scale(1)" }],
        [5800, { transform: "translate(0, 0) scale(1)" }],
        [6700, { transform: "translate(-16cqw, 0) scale(0.6)" }],
      ],
    },
    fig(0),
    fig(1),
  ],
  counters: [
    { k: "n1", from: 0, to: 700, start: 6400, end: 7200, format: (n) => `~${n}` },
    { k: "n2", from: 0, to: 97, start: 6700, end: 7350, format: (n) => `~${n}%` },
  ],
};
