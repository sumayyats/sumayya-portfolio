import { Cursor } from "./Cursor";
import { EASE_CALM, type SceneDef } from "../timeline";

const EASE_PAN = "cubic-bezier(.45,.05,.55,.95)";

/**
 * Kyros · from insight to design — "calm tactile cards". Slow easing, no
 * flashes, no reds: the empty state, adding an activity, cards settling into
 * the grid, then edit mode removing one through a calm confirmation.
 * Coordinates are in cqw of a 16:9 canvas (100 × 56.25).
 */

// Activity names as they appear on the app's own screens.
const CARDS = [
  { name: "Games", bg: "#C9D3FB", edge: "#8E9FE6", icon: "dice" },
  { name: "Listen to music", bg: "#D9CCF5", edge: "#A893DE", icon: "music" },
  { name: "Market", bg: "#F4D3E4", edge: "#D79AB9", icon: "market" },
  { name: "Shower", bg: "#C8E3F8", edge: "#8CBBE3", icon: "shower" },
  { name: "School", bg: "#D6EDC4", edge: "#9FCB82", icon: "school" },
  { name: "Lunch", bg: "#F8EBB8", edge: "#E1C566", icon: "bowl" }, // the one being added
] as const;

const SWATCHES = ["#C9D3FB", "#D9CCF5", "#F8EBB8", "#F4D3E4", "#D6EDC4", "#C8E3F8"];
const ICONS = ["dice", "music", "bowl", "shower", "school"] as const;

export function SceneKyrosDesign() {
  return (
    <div className="sc-kyros">
      <div className="sc-kyros__head">
        <span className="sc-kyros__logo" />
        <span className="sc-kyros__title">Your Activities</span>
        <span className="sc-kyros__edit" data-k="editbtn">
          <svg viewBox="0 0 16 16"><path d="M3 11.5V13h1.5l7-7L10 4.5l-7 7ZM11 3.5l1.5 1.5 1-1L12 2.5z" /></svg>
        </span>
      </div>
      <div className="sc-kyros__search"><span /> Search</div>

      {/* slow camera pan across the grid */}
      <div className="sc-kyros__pan" data-k="pan">
        {CARDS.map((c, i) => (
          <div
            key={c.name}
            className="sc-kyros__slot"
            style={{ left: `${(i % 3) * 25.5}cqw`, top: `${Math.floor(i / 3) * 17.5}cqw` }}
            data-k={i === 5 ? "newcard" : "card"}
          >
            <div
              className="sc-kyros__card"
              style={{ background: c.bg, borderColor: c.edge }}
              data-k={c.name === "Market" ? "market" : undefined}
            >
              <Icon name={c.icon} />
              <span>{c.name}</span>
              <i className="sc-kyros__rm" data-k="rm">
                <svg viewBox="0 0 12 12"><path d="M3 6h6" /></svg>
              </i>
            </div>
          </div>
        ))}
      </div>

      {/* the still frame: nothing yet */}
      <div className="sc-kyros__empty" data-k="empty">
        <span className="sc-kyros__blob"><i /><i /></span>
        <p>No activities yet</p>
        <span className="sc-kyros__btn" data-k="addbtn">+ Add activity</span>
      </div>

      {/* the add-activity panel floats bottom-left */}
      <div className="sc-kyros__panel" data-k="panel">
        <p className="sc-kyros__ph">Add activity</p>
        <span className="sc-kyros__lab" style={{ top: "5.8cqw" }}>Name</span>
        <span className="sc-kyros__field">
          <span data-k="typed" />
          <i className="sc-kyros__caret" />
        </span>
        <span className="sc-kyros__lab" style={{ top: "13cqw" }}>Icon</span>
        <span className="sc-kyros__row" style={{ top: "15cqw" }}>
          {ICONS.map((n) => (
            <span key={n} className="sc-kyros__tile"><Icon name={n} /></span>
          ))}
          <i className="sc-kyros__ring" data-k="iconring" />
        </span>
        <span className="sc-kyros__lab" style={{ top: "20.4cqw" }}>Colour</span>
        <span className="sc-kyros__row is-sw" style={{ top: "22.4cqw" }}>
          {SWATCHES.map((s) => (
            <span key={s} className="sc-kyros__sw" style={{ background: s }} />
          ))}
          <i className="sc-kyros__ring is-sw" data-k="swring" />
        </span>
        <span className="sc-kyros__save" data-k="save">Save</span>
      </div>

      {/* category list, dark popover top-right */}
      <div className="sc-kyros__pop" data-k="pop">
        <span className="sc-kyros__poph">Category</span>
        <i className="sc-kyros__pophl" data-k="pophl" />
        {[62, 48, 70, 54].map((w, i) => (
          <span key={i} className="sc-kyros__popi"><b /><em style={{ width: `${w}%` }} /></span>
        ))}
      </div>

      {/* edit mode: a calm confirmation, never an alarm */}
      <div className="sc-kyros__confirm" data-k="confirm">
        <p>Remove this activity?</p>
        <span className="sc-kyros__keep">Keep</span>
        <span className="sc-kyros__ok" data-k="okbtn">Remove</span>
      </div>

      <Cursor k="cur" />
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const p = {
    dice: <><rect x="4" y="7" width="11" height="11" rx="2" /><rect x="10" y="3" width="10" height="10" rx="2" /><circle cx="7.5" cy="12.5" r=".9" /><circle cx="11.5" cy="15" r=".9" /><circle cx="15" cy="8" r=".9" /></>,
    music: <><path d="M5 15v-3a7 7 0 0 1 14 0v3" /><rect x="3.5" y="14" width="4" height="6" rx="1.5" /><rect x="16.5" y="14" width="4" height="6" rx="1.5" /></>,
    bowl: <><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0Z" /><path d="M9 4c-1 1.5 1 2.5 0 4M13 4c-1 1.5 1 2.5 0 4" /></>,
    market: <><path d="M4 9h16l-1.5-4h-13Z" /><path d="M5 9v10h14V9M9 19v-5h6v5" /></>,
    shower: <><path d="M6 10a6 6 0 0 1 12 0Z" /><path d="M9 14v1.5M12 14v3M15 14v1.5M10.5 18.5v1M13.5 18.5v1" /></>,
    school: <><path d="M3 10 12 5l9 5" /><path d="M5 10v9h14v-9M10 19v-4h4v4" /></>,
  }[name];
  return (
    <svg className="sc-kyros__icon" viewBox="0 0 24 24" aria-hidden="true">{p}</svg>
  );
}

// The ring steps along the picker rows: tile pitch in cqw.
const TILE = 4.6;

export const kyrosDesign: SceneDef = {
  duration: 11000,
  finalAt: 6900,
  tracks: [
    {
      k: "cur",
      ease: EASE_CALM,
      at: [
        [0, { opacity: 0, transform: "translate(62cqw, 46cqw) scale(1)" }],
        [300, { opacity: 1, transform: "translate(62cqw, 46cqw) scale(1)" }],
        [1100, { opacity: 1, transform: "translate(50.5cqw, 34.2cqw) scale(1)" }],
        [1250, { opacity: 1, transform: "translate(50.5cqw, 34.2cqw) scale(0.86)" }],
        [1450, { opacity: 1, transform: "translate(50.5cqw, 34.2cqw) scale(1)" }],
        // icon, then colour, then save
        [3500, { opacity: 1, transform: "translate(18.4cqw, 34.2cqw) scale(1)" }],
        [3650, { opacity: 1, transform: "translate(18.4cqw, 34.2cqw) scale(0.86)" }],
        [3800, { opacity: 1, transform: "translate(18.4cqw, 34.2cqw) scale(1)" }],
        [4300, { opacity: 1, transform: "translate(15.4cqw, 41.1cqw) scale(1)" }],
        [4450, { opacity: 1, transform: "translate(15.4cqw, 41.1cqw) scale(0.86)" }],
        [4600, { opacity: 1, transform: "translate(15.4cqw, 41.1cqw) scale(1)" }],
        [5100, { opacity: 1, transform: "translate(21cqw, 48.2cqw) scale(1)" }],
        [5250, { opacity: 1, transform: "translate(21cqw, 48.2cqw) scale(0.86)" }],
        [5400, { opacity: 1, transform: "translate(21cqw, 48.2cqw) scale(1)" }],
        // to the edit button, then the Market card's remove, then confirm
        [7000, { opacity: 1, transform: "translate(91.6cqw, 4.6cqw) scale(1)" }],
        [7150, { opacity: 1, transform: "translate(91.6cqw, 4.6cqw) scale(0.86)" }],
        [7300, { opacity: 1, transform: "translate(91.6cqw, 4.6cqw) scale(1)" }],
        [7900, { opacity: 1, transform: "translate(76.4cqw, 16.4cqw) scale(1)" }],
        [8050, { opacity: 1, transform: "translate(76.4cqw, 16.4cqw) scale(0.86)" }],
        [8200, { opacity: 1, transform: "translate(76.4cqw, 16.4cqw) scale(1)" }],
        [8800, { opacity: 1, transform: "translate(57cqw, 48cqw) scale(1)" }],
        [8950, { opacity: 1, transform: "translate(57cqw, 48cqw) scale(0.86)" }],
        [9100, { opacity: 1, transform: "translate(57cqw, 48cqw) scale(1)" }],
        [9700, { opacity: 0, transform: "translate(66cqw, 48cqw) scale(1)" }],
      ],
    },
    { k: "addbtn", ease: EASE_CALM, at: [[0, { transform: "scale(1)" }], [1250, { transform: "scale(1)" }], [1450, { transform: "scale(0.96)" }], [1700, { transform: "scale(1)" }]] },
    {
      k: "empty",
      ease: EASE_CALM,
      at: [
        [0, { opacity: 1, transform: "translateY(0)" }],
        [1500, { opacity: 1, transform: "translateY(0)" }],
        [2200, { opacity: 0, transform: "translateY(-1cqw)" }],
        [10000, { opacity: 0, transform: "translateY(-1cqw)" }],
        [10900, { opacity: 1, transform: "translateY(0)" }],
      ],
    },
    {
      k: "panel",
      ease: EASE_CALM,
      at: [
        [0, { opacity: 0, transform: "translateY(2.4cqw)" }],
        [1700, { opacity: 0, transform: "translateY(2.4cqw)" }],
        [2500, { opacity: 1, transform: "translateY(0)" }],
        [5500, { opacity: 1, transform: "translateY(0)" }],
        [6200, { opacity: 0, transform: "translateY(1.6cqw)" }],
      ],
    },
    {
      k: "iconring",
      ease: EASE_CALM,
      at: [
        [0, { opacity: 0, transform: "translateX(0)" }],
        [3100, { opacity: 0, transform: "translateX(0)" }],
        [3300, { opacity: 1, transform: "translateX(0)" }],
        [3700, { opacity: 1, transform: `translateX(${2 * TILE}cqw)` }],
      ],
    },
    {
      k: "swring",
      ease: EASE_CALM,
      at: [
        [0, { opacity: 0, transform: "translateX(0)" }],
        [3900, { opacity: 0, transform: "translateX(0)" }],
        [4100, { opacity: 1, transform: "translateX(0)" }],
        [4500, { opacity: 1, transform: `translateX(${2 * 3.4}cqw)` }],
      ],
    },
    { k: "save", ease: EASE_CALM, at: [[0, { transform: "scale(1)" }], [5250, { transform: "scale(1)" }], [5400, { transform: "scale(0.95)" }], [5650, { transform: "scale(1)" }]] },
    { k: "pop", ease: EASE_CALM, at: [[0, { opacity: 0, transform: "translateY(-1cqw)" }], [2400, { opacity: 0, transform: "translateY(-1cqw)" }], [3100, { opacity: 1, transform: "translateY(0)" }], [5300, { opacity: 1, transform: "translateY(0)" }], [6000, { opacity: 0, transform: "translateY(-0.6cqw)" }]] },
    {
      k: "pophl",
      ease: EASE_CALM,
      at: [
        [0, { transform: "translateY(0)" }],
        [3300, { transform: "translateY(0)" }],
        [3900, { transform: "translateY(3.2cqw)" }],
        [4600, { transform: "translateY(6.4cqw)" }],
        [5200, { transform: "translateY(6.4cqw)" }],
      ],
    },
    // the library settles in, gently, after Save
    {
      k: "card",
      ease: EASE_CALM,
      at: (i) => {
        const t = 5700 + i * 170;
        return [
          [0, { opacity: 0, transform: "scale(0.96) translateY(0.8cqw)" }],
          [t, { opacity: 0, transform: "scale(0.96) translateY(0.8cqw)" }],
          [t + 700, { opacity: 1, transform: "scale(1) translateY(0)" }],
          [10000, { opacity: 1, transform: "scale(1) translateY(0)" }],
          [10700, { opacity: 0, transform: "scale(1) translateY(0)" }],
        ];
      },
    },
    {
      k: "newcard",
      ease: EASE_CALM,
      at: [
        [0, { opacity: 0, transform: "scale(0.94)" }],
        [6500, { opacity: 0, transform: "scale(0.94)" }],
        [7300, { opacity: 1, transform: "scale(1)" }],
        [10000, { opacity: 1, transform: "scale(1)" }],
        [10700, { opacity: 0, transform: "scale(1)" }],
      ],
    },
    {
      k: "pan",
      ease: EASE_PAN,
      at: [
        [0, { transform: "translateX(0)" }],
        [5600, { transform: "translateX(0)" }],
        [9800, { transform: "translateX(-3cqw)" }],
      ],
    },
    { k: "editbtn", ease: EASE_CALM, at: [[0, { opacity: 0.55 }], [7150, { opacity: 0.55 }], [7400, { opacity: 1 }], [9600, { opacity: 1 }]] },
    { k: "rm", ease: EASE_CALM, at: [[0, { opacity: 0, transform: "scale(0.6)" }], [7300, { opacity: 0, transform: "scale(0.6)" }], [7800, { opacity: 1, transform: "scale(1)" }], [9500, { opacity: 1, transform: "scale(1)" }], [9900, { opacity: 0, transform: "scale(0.6)" }]] },
    {
      k: "confirm",
      ease: EASE_CALM,
      at: [
        [0, { opacity: 0, transform: "translateY(2cqw)" }],
        [8100, { opacity: 0, transform: "translateY(2cqw)" }],
        [8700, { opacity: 1, transform: "translateY(0)" }],
        [9150, { opacity: 1, transform: "translateY(0)" }],
        [9600, { opacity: 0, transform: "translateY(1.2cqw)" }],
      ],
    },
    { k: "okbtn", ease: EASE_CALM, at: [[0, { transform: "scale(1)" }], [8950, { transform: "scale(1)" }], [9100, { transform: "scale(0.95)" }], [9300, { transform: "scale(1)" }]] },
    // the removed card eases away
    { k: "market", ease: EASE_CALM, at: [[0, { opacity: 1, transform: "scale(1)" }], [9300, { opacity: 1, transform: "scale(1)" }], [10000, { opacity: 0, transform: "scale(0.92)" }], [10900, { opacity: 0, transform: "scale(0.92)" }]] },
  ],
  typers: [{ k: "typed", text: "Lunch", start: 2700, end: 3200 }],
};
