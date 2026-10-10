import { useCallback, useEffect, useRef, useState } from "react";

/** Soft synthesized tanpura-like drone with occasional bell chimes (Web Audio). Off by default. */
export function useAmbientSound() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(() => {
    let ctx = ctxRef.current;
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      ctxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      filter.connect(master).connect(ctx.destination);
      masterRef.current = master;
      [130.81, 196, 261.63, 130.4].forEach((f, i) => {
        const o = ctx!.createOscillator();
        o.type = i === 3 ? "triangle" : "sawtooth";
        o.frequency.value = f;
        const g = ctx!.createGain();
        g.gain.value = 0.04;
        const lfo = ctx!.createOscillator();
        lfo.frequency.value = 0.08 + i * 0.05;
        const lg = ctx!.createGain();
        lg.gain.value = 0.03;
        lfo.connect(lg).connect(g.gain);
        o.connect(g).connect(filter);
        o.start();
        lfo.start();
      });
    }
    ctx.resume();
    masterRef.current!.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5);
    const chime = () => {
      const c = ctxRef.current!;
      const notes = [523.25, 587.33, 659.25, 783.99, 880];
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = notes[Math.floor(Math.random() * notes.length)] ?? 523.25;
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.5);
      o.connect(g).connect(c.destination);
      o.start();
      o.stop(c.currentTime + 2.6);
      timerRef.current = window.setTimeout(chime, 2500 + Math.random() * 4000);
    };
    timerRef.current = window.setTimeout(chime, 1200);
  }, []);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (ctx && masterRef.current) masterRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  }, []);

  const toggle = useCallback(() => {
    setOn((v) => {
      if (v) stop();
      else start();
      return !v;
    });
  }, [start, stop]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    ctxRef.current?.close();
  }, []);

  return { on, toggle };
}
