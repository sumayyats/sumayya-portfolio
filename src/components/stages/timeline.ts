/**
 * The motion-stage timeline: a scene declares keyframes at absolute times
 * (ms) and this turns them into Web Animations that share one loop, so a
 * stage can play, pause where it is, jump back to its still frame or show
 * its final frame — the same control `animation-play-state` gives CSS
 * keyframes, plus scrubbing.
 *
 * Only transform, opacity and SVG stroke-dashoffset are animated, so nothing
 * triggers layout. Text that changes (count-ups, typing) is the one thing
 * CSS can't do; those run off the same clock in `sync()`.
 */

export const EASE_IN = "cubic-bezier(.2,.7,.2,1)"; // entrances
export const EASE_CAMERA = "cubic-bezier(.65,0,.35,1)"; // slow ease-in-out
export const EASE_CALM = "cubic-bezier(.45,0,.25,1)"; // Kyros: slower still

type Frame = [ms: number, styles: Keyframe];

/** How long the end of every loop takes to ease back to the still frame. */
const RETURN_MS = 600;

export type Track = {
  /** Matches `[data-k="…"]`; several elements get the track each, indexed. */
  k: string;
  /** Frames for element `i` of `n`. The first frame is the still state. */
  at: Frame[] | ((i: number, n: number) => Frame[]);
  /** Easing into each next frame unless a frame sets its own. */
  ease?: string;
};

/** A number that counts up between two times. */
export type Counter = {
  k: string;
  from: number;
  to: number;
  start: number;
  end: number;
  decimals?: number;
  format?: (n: string) => string;
};

/** Text that types in, a character at a time. */
export type Typer = { k: string; text: string; start: number; end: number };

export type SceneDef = {
  duration: number;
  /** The finished state (shown by "Show final frame" under reduced motion). */
  finalAt: number;
  tracks: Track[];
  counters?: Counter[];
  typers?: Typer[];
};

export type Timeline = {
  play(): void;
  pause(): void;
  seek(ms: number): void;
  /** Current position in the loop, 0…duration. */
  time(): number;
  /** Re-render the text-driven bits for the current time. */
  sync(): void;
  destroy(): void;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function buildTimeline(root: HTMLElement, def: SceneDef): Timeline {
  const { duration } = def;
  const anims: Animation[] = [];

  for (const track of def.tracks) {
    const els = Array.from(root.querySelectorAll<HTMLElement>(`[data-k="${track.k}"]`));
    els.forEach((el, i) => {
      const frames = typeof track.at === "function" ? track.at(i, els.length) : track.at;
      if (!frames.length) return;
      const ease = track.ease ?? EASE_IN;
      let prev = 0;
      const kfs: Keyframe[] = frames.map(([ms, s]) => {
        // keys must never run backwards; a scene bug shouldn't take the page down
        if (ms < prev && process.env.NODE_ENV !== "production")
          console.warn(`Motion stage track "${track.k}"[${i}]: key at ${ms}ms is before ${prev}ms`);
        prev = Math.max(prev, ms);
        return { easing: ease, ...s, offset: clamp01(prev / duration) };
      });
      // Still frame at 0, and the loop hands back to it at the end: each
      // element holds its last state, then eases home over the final
      // RETURN_MS so the loop restarts on the still frame without a jump.
      const still = { ...kfs[0] };
      delete still.offset;
      if ((kfs[0].offset as number) > 0) kfs.unshift({ ...still, offset: 0 });
      const last = kfs[kfs.length - 1];
      const home = 1 - RETURN_MS / duration;
      if ((last.offset as number) < home) kfs.push({ ...last, easing: EASE_CAMERA, offset: home });
      if ((last.offset as number) < 1) {
        kfs[kfs.length - 1].easing = EASE_CAMERA;
        kfs.push({ ...still, offset: 1 });
      }
      const a = el.animate(kfs, { duration, iterations: Infinity, fill: "both" });
      a.pause();
      a.currentTime = 0;
      anims.push(a);
    });
  }

  const counters = (def.counters ?? []).map((c) => ({
    c,
    el: root.querySelector<HTMLElement>(`[data-k="${c.k}"]`),
  }));
  const typers = (def.typers ?? []).map((t) => ({
    t,
    el: root.querySelector<HTMLElement>(`[data-k="${t.k}"]`),
  }));

  let clock = 0; // fallback when a scene has no tracks
  const time = () => {
    const ct = anims[0]?.currentTime;
    const v = typeof ct === "number" ? ct : clock;
    return ((v % duration) + duration) % duration;
  };

  const sync = () => {
    const t = time();
    for (const { c, el } of counters) {
      if (!el) continue;
      const p = clamp01((t - c.start) / (c.end - c.start));
      const eased = 1 - Math.pow(1 - p, 3);
      const v = (c.from + (c.to - c.from) * eased).toFixed(c.decimals ?? 0);
      const s = c.format ? c.format(v) : v;
      if (el.textContent !== s) el.textContent = s;
    }
    for (const { t: ty, el } of typers) {
      if (!el) continue;
      const p = clamp01((t - ty.start) / (ty.end - ty.start));
      const s = ty.text.slice(0, Math.round(ty.text.length * p));
      if (el.textContent !== s) el.textContent = s;
    }
  };
  sync();

  return {
    play: () => anims.forEach((a) => a.play()),
    pause: () => anims.forEach((a) => a.pause()),
    seek: (ms) => {
      clock = ms;
      anims.forEach((a) => (a.currentTime = ms));
      sync();
    },
    time,
    sync,
    destroy: () => anims.forEach((a) => a.cancel()),
  };
}

/** Frames for a step that appears at `t` and holds until `out` (if given). */
export const show = (t: number, out?: number, dur = 500): Frame[] => [
  [0, { opacity: 0 }],
  [t, { opacity: 0 }],
  [t + dur, { opacity: 1 }],
  ...(out !== undefined
    ? ([
        [out, { opacity: 1 }],
        [out + dur, { opacity: 0 }],
      ] as Frame[])
    : []),
];
