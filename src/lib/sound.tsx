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
 * Site-wide sound: a page-turn "swish" for the flip reader and a soft tick
 * for buttons. Both are synthesised with the Web Audio API so no audio files
 * are shipped, and nothing plays until the reader switches sound on.
 */

type SoundContextValue = {
  on: boolean;
  toggle: () => void;
  flip: () => void;
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

  /** Paper swish: band-passed noise sweeping up, then a soft settle. */
  const flip = useCallback(() => {
    if (!on) return;
    const ctx = audio();
    if (!ctx) return;
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
  }, [on, audio, noise]);

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
        // audible confirmation that sound is now on
        const ctx = audio();
        if (ctx) tick(ctx);
      }
      return next;
    });
  }, [audio]);

  const value = useMemo(
    () => ({ on, toggle, flip, click }),
    [on, toggle, flip, click]
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
