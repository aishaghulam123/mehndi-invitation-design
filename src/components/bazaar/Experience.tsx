import { useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

import streetImg from "@/assets/bazaar-street.jpg";
import fabricImg from "@/assets/fabric-house.jpg";
import flowerImg from "@/assets/flower-lane.jpg";
import courtyardImg from "@/assets/courtyard.jpg";
import { EVENT } from "@/data/event";
import { Split, Lantern, Petals, Motes, Ornament } from "./parts";
import { useAmbientSound } from "./useAmbientSound";

const BANGLES = [
  { s: 300, b: 10, c: "bangle-a" },
  { s: 262, b: 7, c: "bangle-b" },
  { s: 228, b: 12, c: "bangle-c" },
  { s: 196, b: 6, c: "bangle-d" },
  { s: 166, b: 9, c: "bangle-a" },
  { s: 136, b: 5, c: "bangle-b" },
  { s: 108, b: 8, c: "bangle-c" },
];

// points along a pointed arch for the petal gateway
const ARCH = Array.from({ length: 34 }, (_, i) => {
  const t = i / 33;
  const a = Math.PI * t;
  return { x: 50 - Math.cos(a) * 38, y: 92 - Math.sin(a) * 70 - Math.sin(a) ** 6 * 8 };
});

export function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const spreadRef = useRef<gsap.core.Timeline | null>(null);
  const [spread, setSpread] = useState(false);
  const sound = useAmbientSound();

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);
    if (reduce) {
      gsap.set(".op-velvet, .op-shutters", { autoAlpha: 0 });
      return;
    }

    const lenis = new Lenis({ lerp: 0.09 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      /* ---------------- OPENING: first 3 seconds ---------------- */
      lenis.stop();
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => lenis.start() });
      introRef.current = tl;
      tl.set(".op-lantern", { scale: 0, autoAlpha: 0 })
        .set(".op-street", { scale: 1.25, filter: "brightness(0.15) blur(6px)" })
        .set(".op-line .w", { yPercent: 115 })
        .set(".op-title", { autoAlpha: 0, letterSpacing: "0.6em", filter: "blur(12px)" })
        .set(".op-hint", { autoAlpha: 0 })
        .set(".op-petals .petal", { x: "-70vw", y: () => gsap.utils.random(-80, 80), autoAlpha: 0 })
        .set(".op-velvet", { autoAlpha: 1 })
        .set(".op-shutter", { yPercent: 0 })
        // 0 – 0.7s spinning bangles, quick camera push
        .fromTo(".op-bangle", { rotation: 0, rotationX: 62, scale: 1.8 }, { rotation: (i) => (i % 2 ? -900 : 900), scale: 1, duration: 0.75, ease: "expo.out", stagger: 0.02 }, 0)
        .fromTo(".op-bangles", { scale: 1.6 }, { scale: 1, duration: 0.7, ease: "power2.out" }, 0)
        // 0.7 – 1.5s bangles become lanterns, street lit
        .to(".op-bangle", { rotationX: 0, scale: 0.2, autoAlpha: 0, duration: 0.45, ease: "power3.in", stagger: 0.015 }, 0.7)
        .to(".op-lantern", { scale: 1, autoAlpha: 1, duration: 0.55, ease: "back.out(2)", stagger: 0.05 }, 0.9)
        .to(".op-velvet", { autoAlpha: 0, duration: 0.4 }, 1.0)
        .to(".op-street", { filter: "brightness(0.55) blur(0px)", scale: 1.1, duration: 0.7 }, 1.0)
        // 1.5 – 2.2s shutters fly up, petals sweep
        .to(".op-shutter", { yPercent: -102, duration: 0.45, ease: "power4.inOut", stagger: { each: 0.06, from: "center" } }, 1.5)
        .to(".op-street", { filter: "brightness(0.85) blur(0px)", duration: 0.5 }, 1.7)
        .to(".op-petals .petal", { x: "80vw", autoAlpha: 1, rotation: "+=360", duration: 1.4, ease: "power1.inOut", stagger: 0.02 }, 1.55)
        // 2.2 – 3.0s kinetic title
        .to(".op-line .w", { yPercent: 0, duration: 0.5, ease: "expo.out", stagger: 0.045 }, 2.15)
        .to(".op-title", { autoAlpha: 1, letterSpacing: "0.08em", filter: "blur(0px)", duration: 0.8, ease: "expo.out" }, 2.45)
        .fromTo(".op-sweep", { xPercent: -120 }, { xPercent: 120, duration: 0.9, ease: "power2.inOut" }, 2.5)
        .to(".op-hint", { autoAlpha: 1, duration: 0.6 }, 3.1);

      gsap.to(".op-lantern", { y: 8, rotation: 2, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.3, delay: 3 });

      /* ---------------- generic helpers ---------------- */
      gsap.utils.toArray<HTMLElement>(".scene-bg").forEach((img) => {
        gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>(".mote").forEach((m, i) => {
        gsap.to(m, { y: -60 - (i % 5) * 20, x: (i % 2 ? 1 : -1) * 20, opacity: 0, duration: 4 + (i % 4), repeat: -1, ease: "sine.inOut", delay: i * 0.2 });
      });

      /* ---------------- Scene A: enter the bazaar ---------------- */
      const a = gsap.timeline({ scrollTrigger: { trigger: "#enter", start: "top top", end: "+=180%", scrub: 1, pin: true } });
      a.fromTo("#enter .scene-bg", { scale: 1 }, { scale: 1.45, ease: "none", duration: 3 }, 0)
        .fromTo("#enter .fg-near", { yPercent: 0 }, { yPercent: -80, scale: 1.6, ease: "none", duration: 3 }, 0)
        .fromTo("#enter .fg-far", { yPercent: 0 }, { yPercent: -30, ease: "none", duration: 3 }, 0)
        .from("#enter .a1 .w", { yPercent: 115, stagger: 0.08, duration: 0.6 }, 0.3)
        .to("#enter .a1", { autoAlpha: 0, y: -40, duration: 0.5 }, 1.4)
        .from("#enter .a2 .w", { yPercent: 115, stagger: 0.08, duration: 0.6 }, 1.7)
        .from("#enter .trail", { scaleY: 0, transformOrigin: "bottom", duration: 2, ease: "none" }, 0.2);

      /* ---------------- Scene B: bangle shop ---------------- */
      gsap.utils.toArray<HTMLElement>(".shop-bangle").forEach((b, i) => {
        gsap.to(b, { rotation: i % 2 ? -360 : 360, duration: 6 + i * 1.3, repeat: -1, ease: "none" });
      });
      gsap.set(".spread-line", { autoAlpha: 0, y: 30 });
      gsap.from("#bangles .b-head .w", { yPercent: 115, stagger: 0.06, scrollTrigger: { trigger: "#bangles", start: "top 60%" } });
      const s = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      s.to(".shop-bangle", {
        x: (i) => Math.cos((i / BANGLES.length) * Math.PI * 2) * (60 + i * 14),
        y: (i) => Math.sin((i / BANGLES.length) * Math.PI * 2) * (40 + i * 10),
        z: (i) => i * 40,
        rotationX: (i) => 20 + i * 8,
        duration: 1.1,
        stagger: 0.04,
      })
        .to(".bangle-stage", { rotationX: 55, duration: 1.1 }, 0)
        .to(".spread-line", { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.35 }, 0.4);
      spreadRef.current = s;
      // circular motion resolves into a mirror as we leave the shop
      gsap.timeline({ scrollTrigger: { trigger: "#mirror", start: "top bottom", end: "center center", scrub: 1 } })
        .fromTo(".mirror", { scale: 0.2, rotation: -180, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, ease: "none" })
        .fromTo(".mirror-glint", { xPercent: -150 }, { xPercent: 150, ease: "none" }, 0.4);

      /* ---------------- Scene C: fabric house ---------------- */
      const c = gsap.timeline({ scrollTrigger: { trigger: "#fabric", start: "top top", end: "+=260%", scrub: 1, pin: true } });
      c.fromTo("#fabric .scene-bg", { scale: 1.05 }, { scale: 1.25, ease: "none", duration: 6 }, 0);
      gsap.utils.toArray<HTMLElement>(".fabric-sweep").forEach((p, i) => {
        c.fromTo(p, { clipPath: "inset(0% 100% 0% 0%)", skewX: -6 }, { clipPath: "inset(0% 0% 0% 0%)", skewX: 0, duration: 1.2, ease: "power2.inOut" }, i * 1.7)
          .from(p.querySelectorAll(".w"), { yPercent: 115, stagger: 0.06, duration: 0.5 }, i * 1.7 + 0.6)
          .to(p.querySelector(".fabric-wave"), { backgroundPositionX: "+=200px", duration: 1.7, ease: "none" }, i * 1.7);
      });
      c.to(".fabric-sweep", { clipPath: "inset(0% 0% 0% 100%)", duration: 1, ease: "power2.inOut", stagger: 0.1 }, 5.4);

      /* ---------------- Scene D: flower lane ---------------- */
      const d = gsap.timeline({ scrollTrigger: { trigger: "#flowers", start: "top top", end: "+=220%", scrub: 1, pin: true } });
      d.from(".arch-petal", { y: 400, x: () => gsap.utils.random(-120, 120), rotation: 360, autoAlpha: 0, stagger: 0.04, duration: 1, ease: "power2.out" }, 0)
        .from("#flowers .d1 .w", { yPercent: 115, stagger: 0.07, duration: 0.6 }, 1)
        .to(".garland", { rotation: (i) => (i % 2 ? 3 : -3), duration: 1, ease: "sine.inOut" }, 0)
        .to("#flowers .d1", { autoAlpha: 0, duration: 0.4 }, 2.2)
        .to(".arch-gate", { scale: 4.5, autoAlpha: 0, duration: 1.6, ease: "power2.in" }, 2.3)
        .to("#flowers .scene-bg", { scale: 1.6, duration: 1.6, ease: "power2.in" }, 2.3)
        .from("#flowers .d2 .w", { yPercent: 115, stagger: 0.08, duration: 0.6 }, 3.3);

      /* ---------------- Couple reveal ---------------- */
      const cp = gsap.timeline({ scrollTrigger: { trigger: "#couple", start: "top 65%", end: "center center", scrub: 1 } });
      cp.from(".name", { filter: "blur(18px)", autoAlpha: 0, letterSpacing: "0.4em", stagger: 0.25 })
        .from(".amp", { scale: 0, rotation: -90, autoAlpha: 0 }, 0.2)
        .from("#couple .sub .w", { yPercent: 115, stagger: 0.05 }, 0.5);
      gsap.fromTo("#couple .scene-bg", { filter: "blur(10px) brightness(0.4)" }, { filter: "blur(2px) brightness(0.6)", scrollTrigger: { trigger: "#couple", start: "top bottom", end: "center center", scrub: true } });

      /* ---------------- Date plaque ---------------- */
      const dt = gsap.timeline({ scrollTrigger: { trigger: "#date", start: "top 70%", end: "center center", scrub: 1 } });
      dt.from(".date-plaque", { rotationY: -100, rotationX: 20, z: -300, autoAlpha: 0, ease: "power2.out" })
        .from(".tassel", { rotation: 25, transformOrigin: "top center", ease: "elastic.out(1,0.4)" }, 0.3)
        .fromTo(".date-underline", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none" }, 0.5);

      /* ---------------- Time clock ---------------- */
      gsap.fromTo(".clock-ring", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: "#time", start: "top 80%", end: "top 30%", scrub: 1 } });
      const hourDeg = (EVENT.clockHour % 12) * 30 + EVENT.clockMinute * 0.5;
      const minDeg = EVENT.clockMinute * 6;
      gsap.timeline({ scrollTrigger: { trigger: "#time", start: "top 40%" } })
        .fromTo(".hand-h", { rotation: 0 }, { rotation: 720 + hourDeg, duration: 2.2, ease: "power4.out", svgOrigin: "100 100" })
        .fromTo(".hand-m", { rotation: 0 }, { rotation: 2160 + minDeg, duration: 2.2, ease: "power4.out", svgOrigin: "100 100" }, 0)
        .from(".time-txt .w", { yPercent: 115, stagger: 0.05, duration: 0.6 }, 1.5);

      /* ---------------- Venue ---------------- */
      const v = gsap.timeline({ scrollTrigger: { trigger: "#venue", start: "top top", end: "+=160%", scrub: 1, pin: true } });
      v.fromTo(".venue-arch", { clipPath: "ellipse(14% 22% at 50% 100%)" }, { clipPath: "ellipse(90% 120% at 50% 100%)", ease: "power2.inOut", duration: 1.4 })
        .fromTo(".venue-arch img", { scale: 1.6 }, { scale: 1, duration: 1.4, ease: "power2.inOut" }, 0)
        .from(".venue-lantern", { y: -200, stagger: 0.1, duration: 0.8 }, 0.3)
        .from(".venue-plaque", { y: 80, autoAlpha: 0, duration: 0.6 }, 1.2)
        .fromTo(".route", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, ease: "none" }, 1.6)
        .from(".pin", { scale: 0, transformOrigin: "center bottom", duration: 0.3, ease: "back.out(3)" }, 2.5);

      /* ---------------- Emotion ---------------- */
      const e = gsap.timeline({ scrollTrigger: { trigger: "#emotion", start: "top top", end: "+=260%", scrub: 1, pin: true } });
      gsap.utils.toArray<HTMLElement>(".emo").forEach((line, i) => {
        e.from(line, { autoAlpha: 0, y: 30, filter: "blur(8px)", duration: 1 }, i * 1.1);
        if (i < 4) e.to(line, { autoAlpha: 0.25, duration: 0.6 }, i * 1.1 + 1.2);
      });
      e.from(".saved", { autoAlpha: 0, scale: 0.9, filter: "blur(10px)", duration: 1.2 }, 5.8);

      /* ---------------- Finale ---------------- */
      const f = gsap.timeline({ scrollTrigger: { trigger: "#finale", start: "top 60%", end: "top top", scrub: 1 } });
      f.fromTo("#finale .scene-bg", { scale: 1.4, filter: "brightness(0.2)" }, { scale: 1, filter: "brightness(0.55)", ease: "none", duration: 2 }, 0);
      gsap.utils.toArray<SVGElement>(".finale-lantern").forEach((l, i) => {
        f.fromTo(l, { opacity: 0.25, filter: "none" }, { opacity: 1, filter: "drop-shadow(0 0 16px oklch(0.77 0.14 72 / 0.9))", duration: 0.3 }, 0.2 + i * 0.15);
      });
      gsap.from(".finale-line", { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".finale-card", start: "top 75%" } });
      gsap.fromTo("#finale .petal", { y: "60vh", x: 0, autoAlpha: 0 }, { y: 0, x: (i) => ((i % 5) - 2) * 60, autoAlpha: 1, rotation: 540, stagger: 0.03, duration: 2, ease: "power2.out", scrollTrigger: { trigger: ".finale-card", start: "top 80%" } });
    }, root);

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  const toggleSpread = useCallback(() => {
    const s = spreadRef.current;
    if (!s) {
      setSpread((v) => !v);
      return;
    }
    if (spread) s.reverse();
    else s.play();
    setSpread(!spread);
  }, [spread]);

  const restart = useCallback(() => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    introRef.current?.restart();
  }, []);

  return (
    <div ref={root} className="grain relative">
      <button onClick={sound.toggle} className="ghost-btn fixed right-4 top-4 z-50" aria-pressed={sound.on} aria-label={sound.on ? "Turn ambient sound off" : "Turn ambient sound on"}>
        {sound.on ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span className="hidden sm:inline">{sound.on ? "Sound on" : "Sound off"}</span>
      </button>

      {/* ============ OPENING ============ */}
      <section id="opening" className="scene flex items-center justify-center">
        <img src={streetImg} alt="A lantern-lit Pakistani bazaar street at night" width={1088} height={1920} className="op-street absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="veil" />
        <div className="op-shutters absolute inset-0 z-10 flex" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="op-shutter shutter h-full flex-1" />
          ))}
        </div>
        <div className="op-velvet velvet absolute inset-0 z-20 flex items-center justify-center" style={{ perspective: 900 }} aria-hidden="true">
          <div className="op-bangles relative h-[320px] w-[320px]" style={{ transformStyle: "preserve-3d" }}>
            {BANGLES.map((b, i) => (
              <span key={i} className={`op-bangle bangle ${b.c}`} style={{ width: b.s, height: b.s, borderWidth: b.b, left: (320 - b.s) / 2, top: (320 - b.s) / 2 }} />
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-around px-4" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Lantern key={i} className="op-lantern" size={i % 2 ? 38 : 52} />
          ))}
        </div>
        <Petals count={22} className="op-petals z-30" />
        <div className="relative z-40 mx-auto max-w-3xl px-6 text-center">
          <p className="op-line caps text-sm text-ivory/90 sm:text-lg">
            <Split text="Tonight, the bazaar belongs to love." />
          </p>
          <h1 className="op-title display relative mt-6 overflow-hidden text-6xl sm:text-8xl md:text-9xl">
            Bazaar
            <span className="script block text-5xl normal-case tracking-normal sm:text-7xl">after</span>
            Dark
            <span className="op-sweep pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber/40 to-transparent mix-blend-screen" />
          </h1>
          <p className="op-hint eyebrow mt-10">Scroll to follow the lights</p>
        </div>
      </section>

      {/* ============ SCENE A ============ */}
      <section id="enter" className="scene flex items-center justify-center">
        <img src={streetImg} alt="" width={1088} height={1920} loading="lazy" className="scene-bg" />
        <div className="veil" />
        <div className="haze" />
        <Motes count={30} />
        <div className="trail absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-gradient-to-t from-amber to-transparent" aria-hidden="true" />
        <div className="fg-far pointer-events-none absolute inset-x-0 top-[8%] flex justify-between px-[12%]" aria-hidden="true">
          <Lantern size={30} />
          <Lantern size={26} />
          <Lantern size={30} />
        </div>
        <div className="fg-near pointer-events-none absolute inset-x-0 top-[38%] flex justify-between px-2" aria-hidden="true">
          <Lantern size={70} />
          <Lantern size={84} />
        </div>
        <div className="relative z-10 grid place-items-center px-6 text-center">
          <h2 className="a1 display col-start-1 row-start-1 text-5xl sm:text-7xl">
            <Split text="Follow the lights." />
          </h2>
          <h2 className="a2 display col-start-1 row-start-1 text-4xl sm:text-6xl">
            <Split text="The celebration starts here." />
          </h2>
        </div>
      </section>

      {/* ============ SCENE B ============ */}
      <section id="bangles" className="scene velvet flex flex-col items-center justify-center gap-10 py-24">
        <Motes count={16} />
        <div className="b-head text-center">
          <p className="eyebrow">The Bangle Shop</p>
          <h2 className="display mt-3 text-4xl sm:text-6xl">
            <Split text="Touch the colours" />
          </h2>
        </div>
        <button
          onClick={toggleSpread}
          className="relative h-[320px] w-[320px] cursor-pointer rounded-full focus-visible:outline focus-visible:outline-1 focus-visible:outline-amber"
          style={{ perspective: 1000 }}
          aria-pressed={spread}
          aria-label={spread ? "Gather the bangles" : "Spread the bangles"}
        >
          <div className="bangle-stage relative h-full w-full" style={{ transformStyle: "preserve-3d", transform: "rotateX(28deg)" }}>
            {BANGLES.map((b, i) => (
              <span key={i} className={`shop-bangle bangle ${b.c}`} style={{ width: b.s, height: b.s, borderWidth: b.b, left: (320 - b.s) / 2, top: (320 - b.s) / 2 }} />
            ))}
          </div>
        </button>
        <p className="eyebrow -mt-4">{spread ? "Tap to gather" : "Tap the bangles"}</p>
        <div className="space-y-2 text-center">
          <p className="spread-line caps text-xl text-amber sm:text-2xl">A little colour.</p>
          <p className="spread-line caps text-xl text-ivory sm:text-2xl">A little music.</p>
          <p className="spread-line script text-4xl sm:text-5xl">A whole lot of love.</p>
        </div>
      </section>

      <section id="mirror" className="scene velvet flex items-center justify-center">
        <div className="mirror relative grid h-[min(80vw,420px)] w-[min(80vw,420px)] place-items-center overflow-hidden rounded-full border-[10px] border-brass" style={{ boxShadow: "var(--glow-amber)" }}>
          <img src={fabricImg} alt="" width={1088} height={1920} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <span className="mirror-glint absolute inset-0 bg-gradient-to-r from-transparent via-ivory/40 to-transparent" />
          <p className="script relative text-4xl">step inside…</p>
        </div>
      </section>

      {/* ============ SCENE C ============ */}
      <section id="fabric" className="scene">
        <img src={fabricImg} alt="Embroidered dupattas hanging in a lantern-lit textile shop" width={1088} height={1920} loading="lazy" className="scene-bg" />
        <div className="veil" />
        {["Dressed in colour.", "Wrapped in tradition.", "Made for a night to remember."].map((t, i) => (
          <div key={i} className="fabric-sweep absolute inset-0 grid place-items-center">
            <div className={`fabric-panel fabric-wave ${i === 1 ? "green" : ""}`} />
            <span className="zari-edge left-0" />
            <span className="zari-edge right-0" />
            <h2 className="display relative px-6 text-center text-5xl sm:text-7xl">
              {i === 2 ? <span className="script block text-4xl sm:text-5xl">made for</span> : null}
              <Split text={i === 2 ? "A night to remember." : t} />
            </h2>
          </div>
        ))}
      </section>

      {/* ============ SCENE D ============ */}
      <section id="flowers" className="scene flex items-center justify-center">
        <img src={flowerImg} alt="A lane hung with marigold and jasmine strings" width={1088} height={1920} loading="lazy" className="scene-bg" />
        <div className="veil" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <svg key={i} viewBox="0 0 20 200" className="garland h-[30vh] w-5" style={{ transformOrigin: "top center" }}>
              {Array.from({ length: 12 }).map((_, k) => (
                <circle key={k} cx="10" cy={8 + k * 16} r="7" className={k % 3 ? "fill-amber" : "fill-ivory"} />
              ))}
            </svg>
          ))}
        </div>
        <div className="arch-gate absolute inset-0" aria-hidden="true">
          {ARCH.map((p, i) => (
            <span key={i} className={`arch-petal petal ${i % 3 === 0 ? "m" : i % 3 === 1 ? "r" : ""}`} style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${i * 23}deg) scale(1.4)` }} />
          ))}
        </div>
        <div className="relative z-10 grid place-items-center px-6 text-center">
          <h2 className="d1 display col-start-1 row-start-1 text-4xl sm:text-6xl">
            <Split text="And at the heart of it all…" />
          </h2>
          <h2 className="d2 col-start-1 row-start-1">
            <span className="script block text-5xl sm:text-6xl"><Split text="our" /></span>
            <span className="display block text-6xl sm:text-8xl"><Split text="Mehndi Night." /></span>
          </h2>
        </div>
      </section>

      {/* ============ COUPLE ============ */}
      <section id="couple" className="scene flex items-center justify-center">
        <img src={courtyardImg} alt="A grand courtyard glowing with lanterns" width={1088} height={1920} loading="lazy" className="scene-bg" />
        <div className="veil" />
        <Petals count={8} />
        <div className="relative z-10 px-6 text-center">
          <Ornament className="mx-auto mb-8 w-48" />
          <h2 className="name display text-6xl uppercase sm:text-8xl">{EVENT.bride}</h2>
          <p className="amp script my-2 text-6xl sm:text-7xl">&amp;</p>
          <h2 className="name display text-6xl uppercase sm:text-8xl">{EVENT.groom}</h2>
          <p className="sub caps mt-10 text-sm text-ivory/90 sm:text-base">
            <Split text="Invite you to celebrate" />
          </p>
          <p className="sub caps mt-2 text-lg text-amber sm:text-2xl">
            <Split text={`their ${EVENT.event}`} />
          </p>
        </div>
      </section>

      {/* ============ DATE ============ */}
      <section id="date" className="scene flex items-center justify-center bg-emerald/40 py-24" style={{ perspective: 1200 }}>
        <Motes count={14} />
        <div className="date-plaque plaque arch-plaque relative w-[min(86vw,380px)] px-8 pb-12 pt-20 text-center">
          <Lantern size={34} className="absolute left-1/2 top-3 -translate-x-1/2" />
          <p className="eyebrow">Save the evening</p>
          <p className="caps mt-6 text-2xl text-amber">{EVENT.weekday}</p>
          <p className="display mt-3 text-6xl">{EVENT.dateLong.split(" ")[0]}</p>
          <p className="caps mt-2 text-xl">{EVENT.dateLong.split(" ").slice(1).join(" ")}</p>
          <svg viewBox="0 0 300 30" className="mx-auto mt-6 w-full" aria-hidden="true">
            <path className="date-underline stroke-amber" pathLength={1} strokeDasharray="1" fill="none" strokeWidth="1.6" strokeLinecap="round" d="M10 18 C 60 4, 100 28, 150 15 S 240 4, 290 16" />
          </svg>
          <span className="tassel absolute -bottom-16 left-1/2 h-16 w-px bg-brass" aria-hidden="true">
            <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-magenta" />
          </span>
        </div>
      </section>

      {/* ============ TIME ============ */}
      <section id="time" className="scene flex flex-col items-center justify-center gap-10 bg-midnight py-24">
        <svg viewBox="0 0 200 200" className="w-[min(70vw,300px)]" aria-label={`Clock showing ${EVENT.time}`}>
          <circle cx="100" cy="100" r="92" className="clock-ring stroke-brass" pathLength={1} strokeDasharray="1" fill="none" strokeWidth="2" />
          <circle cx="100" cy="100" r="84" className="stroke-brass" fill="none" strokeWidth="0.5" opacity="0.6" />
          {Array.from({ length: 12 }).map((_, i) => {
            const ang = (i * 30 * Math.PI) / 180;
            return <circle key={i} cx={100 + Math.sin(ang) * 74} cy={100 - Math.cos(ang) * 74} r={i % 3 ? 1.6 : 3.2} className="fill-amber" />;
          })}
          <line className="hand-h stroke-amber" x1="100" y1="100" x2="100" y2="56" strokeWidth="4" strokeLinecap="round" />
          <line className="hand-m stroke-brass" x1="100" y1="100" x2="100" y2="34" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" className="fill-amber" />
        </svg>
        <div className="time-txt px-6 text-center">
          <p className="display text-6xl sm:text-7xl"><Split text={EVENT.time} /></p>
          <p className="caps mt-4 text-sm text-ivory/85 sm:text-base"><Split text="When the lights glow and the music begins." /></p>
        </div>
      </section>

      {/* ============ VENUE ============ */}
      <section id="venue" className="scene bg-midnight">
        <div className="venue-arch absolute inset-0">
          <img src={courtyardImg} alt="" width={1088} height={1920} loading="lazy" className="h-full w-full object-cover" />
          <div className="veil" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Lantern key={i} size={i % 2 ? 40 : 54} className="venue-lantern" />
          ))}
        </div>
        <div className="relative z-10 flex min-h-[100svh] items-end justify-center px-5 pb-12">
          <div className="venue-plaque plaque w-full max-w-md rounded-sm p-7 text-center">
            <p className="eyebrow">The venue</p>
            <h2 className="display mt-3 text-4xl uppercase sm:text-5xl">{EVENT.venue}</h2>
            <p className="caps mt-2 text-xs text-amber sm:text-sm">{EVENT.address}</p>
            <svg viewBox="0 0 300 120" className="mt-5 w-full" aria-hidden="true">
              <g className="stroke-brass" strokeWidth="0.6" opacity="0.5" fill="none">
                <path d="M0 30h300M0 70h300M0 100h300M40 0v120M110 0v120M190 0v120M260 0v120M0 120L120 0M180 120L300 10" />
              </g>
              <path className="route stroke-amber" pathLength={1} strokeDasharray="1" fill="none" strokeWidth="2.2" strokeLinecap="round" d="M14 108 L40 100 L40 70 L110 70 L110 30 L190 30 L222 56" />
              <g className="pin">
                <path d="M222 56c-8-10-12-16-12-22a12 12 0 0 1 24 0c0 6-4 12-12 22z" className="fill-amber" />
                <circle cx="222" cy="34" r="4" className="fill-midnight" />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ============ EMOTION ============ */}
      <section id="emotion" className="scene flex items-center justify-center">
        <img src={courtyardImg} alt="" width={1088} height={1920} loading="lazy" className="scene-bg opacity-40" />
        <div className="veil" />
        <Motes count={18} />
        <div className="relative z-10 max-w-xl space-y-5 px-6 text-center">
          <p className="emo display text-3xl italic sm:text-4xl">Behind every celebration…</p>
          <p className="emo display text-3xl italic sm:text-4xl">are the people who make it special.</p>
          <p className="emo caps text-lg text-amber">The laughter.</p>
          <p className="emo caps text-lg text-amber">The memories.</p>
          <p className="emo display text-2xl italic sm:text-3xl">The moments we wish could last a little longer.</p>
          <p className="saved script pt-6 text-5xl sm:text-6xl">We saved a place for you.</p>
        </div>
      </section>

      {/* ============ FINALE ============ */}
      <section id="finale" className="scene flex flex-col items-center justify-center py-20">
        <img src={streetImg} alt="" width={1088} height={1920} loading="lazy" className="scene-bg" />
        <div className="veil" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-center gap-[3vw]" aria-hidden="true">
          {[14, 18, 22, 28, 36, 46, 36, 28, 22, 18, 14].map((s, i) => (
            <Lantern key={i} size={s} className="finale-lantern" />
          ))}
        </div>
        <Petals count={20} />
        <div className="finale-card relative z-10 mx-5 mt-24 w-full max-w-lg border border-brass/60 bg-midnight/70 px-6 py-12 text-center backdrop-blur-md sm:px-10" style={{ boxShadow: "var(--glow-amber)" }}>
          <Ornament className="finale-line mx-auto w-40" />
          <h2 className="finale-line display mt-6 text-4xl uppercase sm:text-5xl">
            {EVENT.bride}
            <span className="script block py-1 text-4xl normal-case">&amp;</span>
            {EVENT.groom}
          </h2>
          <p className="finale-line caps mt-6 text-xl text-amber">{EVENT.event}</p>
          <div className="finale-line mx-auto my-6 h-px w-24 bg-brass" />
          <p className="finale-line caps text-sm sm:text-base">{EVENT.weekday}, {EVENT.dateLong}</p>
          <p className="finale-line display mt-2 text-3xl">{EVENT.time}</p>
          <p className="finale-line caps mt-5 text-sm sm:text-base">{EVENT.venue}</p>
          <p className="finale-line caps mt-1 text-xs text-ivory/80">{EVENT.address}</p>
          <p className="finale-line eyebrow mt-7">Hosted by {EVENT.host}</p>
          <p className="finale-line script mt-8 text-3xl leading-snug sm:text-4xl">Come for the colours. Stay for the memories.</p>
        </div>
        <button onClick={restart} className="ghost-btn relative z-10 mt-10">
          <RotateCcw size={13} /> Replay the night
        </button>
      </section>
    </div>
  );
}
