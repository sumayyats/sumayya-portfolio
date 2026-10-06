"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Site-wide sound: for the flip reader, a page being picked up and a page
 * turning, and a soft tick for buttons. The page sounds are real recordings
 * (RECORDINGS), loaded the first time sound is used; until the turn has
 * loaded, or if it's missing, a synthesised swish stands in. Nothing plays
 * until the reader switches sound on.
 */

/** Real recordings, cut from the author's own voice memos. */
const RECORDINGS = {
  turn: "/audio/page-turn.m4a",
  pickup: "/audio/page-pickup.m4a",
} as const;
type Recording = keyof typeof RECORDINGS;

type SoundContextValue = {
  on: boolean;
  toggle: () => void;
  flip: () => void;
  /** A page lifted at the corner, before it turns. */
  pickup: () => void;
  click: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);
const STORAGE_KEY = "sp-sound";

function tick(ctx: AudioContext) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1800, t);
  osc.frequency.exponentialRampToValueAtTime(700, t + 0.04);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.1, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const recRef = useRef<Partial<Record<Recording, AudioBuffer | "loading" | "missing">>>({});

  useEffect(() => {
    try {
      setOn(localStorage.getItem(STORAGE_KEY) === "on");
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Lazily create the context on the first user-triggered sound.
  const audio = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return null;
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  }, []);

  const noise = useCallback((ctx: AudioContext): AudioBuffer => {
    if (!noiseRef.current) {
      const len = Math.floor(ctx.sampleRate * 0.6);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      noiseRef.current = buf;
    }
    return noiseRef.current;
  }, []);

  // Fetch and decode the recordings once, in the background.
  const loadRecordings = useCallback((ctx: AudioContext) => {
    for (const key of Object.keys(RECORDINGS) as Recording[]) {
      if (recRef.current[key]) continue;
      recRef.current[key] = "loading";
      fetch(RECORDINGS[key])
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(res.status)))
        .then((data) => ctx.decodeAudioData(data))
        .then((buf) => (recRef.current[key] = buf))
        .catch(() => (recRef.current[key] = "missing"));
    }
  }, []);

  // With sound already on (from a previous visit), load the recordings on
  // the first sign of a reader — a pointer move or key comes well before a
  // page can be grabbed, so the first pickup isn't lost to loading.
  useEffect(() => {
    if (!on) return;
    const warm = () => {
      const ctx = audio();
      if (ctx) loadRecordings(ctx);
    };
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointermove", warm, opts);
    window.addEventListener("pointerdown", warm, opts);
    window.addEventListener("keydown", warm, opts);
    return () => {
      window.removeEventListener("pointermove", warm);
      window.removeEventListener("pointerdown", warm);
      window.removeEventListener("keydown", warm);
    };
  }, [on, audio, loadRecordings]);

  /** Plays a recording if it has loaded; false if it hasn't (yet). */
  const play = useCallback((ctx: AudioContext, key: Recording, level: number) => {
    const rec = recRef.current[key];
    if (!(rec instanceof AudioBuffer)) return false;
    const src = ctx.createBufferSource();
    src.buffer = rec;
    // a touch of variation, so page after page never sounds looped
    src.playbackRate.value = 0.94 + Math.random() * 0.12;
    const gain = ctx.createGain();
    gain.gain.value = level;
    src.connect(gain).connect(ctx.destination);
    src.start();
    return true;
  }, []);

  /** Fallback paper swish: band-passed noise sweeping up, then a soft settle. */
  const swish = useCallback((ctx: AudioContext) => {
    const t = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = noise(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(900, t);
    band.frequency.exponentialRampToValueAtTime(3200, t + 0.32);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.45);

    // the page settling: a brief low thud
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t + 0.34);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.46);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t + 0.34);
    g2.gain.exponentialRampToValueAtTime(0.08, t + 0.36);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g2).connect(ctx.destination);
    osc.start(t + 0.34);
    osc.stop(t + 0.52);
  }, [noise]);

  /** A page turning: the recording, or the synthesised swish meanwhile. */
  const flip = useCallback(() => {
    if (!on) return;
    const ctx = audio();
    if (!ctx) return;
    loadRecordings(ctx);
    if (play(ctx, "turn", 0.8)) return;
    swish(ctx);
  }, [on, audio, loadRecordings, play, swish]);

  /** A page picked up at the corner: quieter than the turn that follows. */
  const pickup = useCallback(() => {
    if (!on) return;
    const ctx = audio();
    if (!ctx) return;
    loadRecordings(ctx);
    play(ctx, "pickup", 0.55);
  }, [on, audio, loadRecordings, play]);


  /** Button tick: a short, damped click. */
  const click = useCallback(() => {
    if (!on) return;
    const ctx = audio();
    if (ctx) tick(ctx);
  }, [on, audio]);

  const toggle = useCallback(() => {
    setOn((cur) => {
      const next = !cur;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {}
      if (next) {
        // audible confirmation that sound is now on; start fetching the turn
        const ctx = audio();
        if (ctx) {
          tick(ctx);
          loadRecordings(ctx);
        }
      }
      return next;
    });
  }, [audio, loadRecordings]);

  const value = useMemo(
    () => ({ on, toggle, flip, pickup, click }),
    [on, toggle, flip, pickup, click]
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
