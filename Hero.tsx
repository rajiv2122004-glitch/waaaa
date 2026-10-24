"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";
import Reveal from "./Reveal";

const N = 240, FW = 1280, FH = 720, INK = "#060606";
const src = (i: number) => `/frames/${String(i + 1).padStart(4, "0")}.webp`;
const sm = (x: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// First, last, then progressively denser passes so scrubbing works almost immediately.
function loadOrder() {
  const seen = new Set<number>(), out: number[] = [];
  const add = (i: number) => { if (!seen.has(i)) { seen.add(i); out.push(i); } };
  add(0); add(N - 1);
  for (const step of [24, 12, 6, 3, 1]) for (let i = 0; i < N; i += step) add(i);
  return out;
}

type Seg = { s: number; e: number; side: "center" | "left" | "right"; label: string; title: React.ReactNode; body?: string; cta?: boolean };
const SEGS: Seg[] = [
  { s: 0, e: 0.2, side: "center", label: "Haute Horlogerie — Skeleton Perpetual", title: <>Astronomia Luxe</>, body: "Time, laid bare." },
  { s: 0.2, e: 0.45, side: "left", label: "I — The Dial", title: <>A perpetual calendar with nothing to hide.</>, body: "The skeletonized dial is cut back to its structure, leaving the moonphase to drift across open space. Hand-applied rose gold indices mark the hour." },
  { s: 0.45, e: 0.75, side: "right", label: "II — The Movement", title: <>407 components. Zero shortcuts.</>, body: "Twin balance wheels beat in concert. Forty-one ruby jewels sit in hand-finished bridges, each bevel drawn by file and by eye." },
  { s: 0.75, e: 1, side: "left", label: "III — The Maker", title: <>Assembled by one watchmaker, start to finish.</>, cta: true },
];

function Copy({ seg }: { seg: Seg }) {
  const c = seg.side === "center";
  return (
    <div className={c ? "mx-auto max-w-3xl text-center" : "max-w-md md:max-w-lg"}>
      <p className="label mb-5">{seg.label}</p>
      <h2 className="display text-[clamp(1.9rem,4.4vw,3.6rem)]" style={c ? { fontSize: "clamp(2.8rem,8vw,6.5rem)" } : undefined}>{seg.title}</h2>
      {seg.body && <p className={`body-copy mt-5 ${c ? "text-lg md:text-xl" : "max-w-sm"}`}>{seg.body}</p>}
      {seg.cta && <a href="#reserve" className="cta mt-8">Reserve yours <span aria-hidden>→</span></a>}
    </div>
  );
}

function Overlay({ seg, progress, first, last }: { seg: Seg; progress: MotionValue<number>; first: boolean; last: boolean }) {
  const f = 0.04, { s, e } = seg;
  const input = first ? [0, 0.0001, e - f, e] : last ? [s, s + f, 0.9999, 1] : [s, s + f, e - f, e];
  const opacity = useTransform(progress, input, first ? [1, 1, 1, 0] : last ? [0, 1, 1, 1] : [0, 1, 1, 0]);
  const y = useTransform(progress, input, first ? [0, 0, 0, -16] : last ? [16, 0, 0, 0] : [16, 0, 0, -16]);
  const pe = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  const side = seg.side === "right" ? "md:text-right md:flex md:justify-end" : "";
  return (
    <motion.div style={{ opacity, y, pointerEvents: pe }}
      className={`absolute inset-x-0 bottom-[8svh] px-7 md:bottom-[9svh] md:px-[7vw] ${side}`}>
      <Copy seg={seg} />
    </motion.div>
  );
}

function Scrub() {
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const dirty = useRef(true);
  const bitmaps = useRef<(ImageBitmap | undefined)[]>([]);

  // Progressive preload; createImageBitmap decodes off the main thread.
  useEffect(() => {
    let dead = false, count = 0;
    const queue = loadOrder();
    const worker = async () => {
      while (!dead && queue.length) {
        const i = queue.shift()!;
        try {
          const blob = await (await fetch(src(i))).blob();
          const bmp = await createImageBitmap(blob);
          if (dead) return bmp.close();
          bitmaps.current[i] = bmp; dirty.current = true;
          if (++count % 6 === 0 || count === N) setLoaded(count);
        } catch { /* skip frame; nearest neighbour fills in */ }
      }
    };
    Array.from({ length: 6 }, worker);
    return () => { dead = true; };
  }, []);

  useEffect(() => {
    const el = cvs.current!, ctx = el.getContext("2d", { alpha: false })!;
    let w = 0, h = 0, dpr = 1, raf = 0, cur = scrollYProgress.get(), shown = -1, last = performance.now();
    const resize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; el.width = w * dpr; el.height = h * dpr; dirty.current = true; };
    const near = (i: number) => { for (let d = 0; d < N; d++) { const a = bitmaps.current[i - d] ?? bitmaps.current[i + d]; if (a) return a; } };
    const draw = (p: number) => {
      const fi = p * (N - 1), i0 = Math.floor(fi), i1 = Math.min(i0 + 1, N - 1), a = fi - i0;
      const b0 = near(i0), b1 = near(i1);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = INK; ctx.fillRect(0, 0, el.width, el.height);
      if (!b0) return;
      let s: number, rot = 0, cy: number;
      if (w < 768) { // mobile: dolly in while the exploded axis turns vertical
        const t = sm(p, 0.12, 0.5), s0 = (w * 1.5) / FW, s1 = Math.min((h * 0.95) / FW, (w * 1.15) / FH);
        s = s0 + (s1 - s0) * t; rot = t * Math.PI / 2; cy = h * 0.4;
      } else {
        const t = sm(p, 0, 0.5), s0 = h / 987, s1 = Math.min((w / FW) * 1.05, (h * 1.25) / FH);
        s = s0 + (s1 - s0) * t; cy = h * 0.42;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.translate(w / 2, cy); ctx.rotate(rot); ctx.scale(s, s);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(b0, -FW / 2, -FH / 2);
      if (b1 && b1 !== b0 && a > 0.001) { ctx.globalAlpha = a; ctx.drawImage(b1, -FW / 2, -FH / 2); ctx.globalAlpha = 1; }
    };
    const tick = (t: number) => {
      const dt = Math.min(t - last, 64); last = t;
      const target = scrollYProgress.get();
      cur += (target - cur) * (1 - Math.exp(-dt / 90)); // eased, never snapping
      if (Math.abs(target - cur) < 0.00005) cur = target;
      if (cur !== shown || dirty.current) { draw(Math.min(1, Math.max(0, cur))); shown = cur; dirty.current = false; }
      raf = requestAnimationFrame(tick);
    };
    resize(); addEventListener("resize", resize); raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, [scrollYProgress]);

  return (
    <div ref={wrap} className="relative h-[450vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-ink">
        <canvas ref={cvs} aria-label="Astronomia Luxe disassembling along its central axis" role="img"
          className="absolute inset-0 h-full w-full"
          style={{ WebkitMaskImage: "radial-gradient(ellipse 78% 82% at 50% 46%, #000 62%, transparent 100%)", maskImage: "radial-gradient(ellipse 78% 82% at 50% 46%, #000 62%, transparent 100%)" }} />
        {SEGS.map((s, i) => <Overlay key={i} seg={s} progress={scrollYProgress} first={i === 0} last={i === SEGS.length - 1} />)}
        <div className="absolute inset-x-0 bottom-0 h-px transition-opacity duration-[1200ms] ease-maison" style={{ opacity: loaded >= N ? 0 : 1 }}>
          <div className="h-full bg-rose/70" style={{ width: `${(loaded / N) * 100}%`, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
        </div>
      </div>
    </div>
  );
}

function Static() {
  return (
    <div className="pt-14">
      <img src="/exploded.webp" alt="Astronomia Luxe, fully exploded" className="mx-auto w-full max-w-[1600px]"
        style={{ WebkitMaskImage: "radial-gradient(ellipse 78% 82% at 50% 50%, #000 62%, transparent 100%)", maskImage: "radial-gradient(ellipse 78% 82% at 50% 50%, #000 62%, transparent 100%)" }} />
      <div className="mx-auto max-w-4xl space-y-28 px-7 pb-32 pt-12">
        {SEGS.map((s, i) => <Reveal key={i}><Copy seg={{ ...s, side: "center" }} /></Reveal>)}
      </div>
    </div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  return <section id="watch" className="bg-ink">{reduced ? <Static /> : <Scrub />}</section>;
}
