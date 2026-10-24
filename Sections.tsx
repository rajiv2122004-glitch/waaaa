"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Reveal, { EASE } from "./Reveal";

const SPECS: { group: string; rows: [string, string][] }[] = [
  { group: "Movement", rows: [["Calibre", "AL-407, manual winding"], ["Components", "407"], ["Jewels", "41"], ["Regulator", "Twin balance wheels, 21,600 vph"], ["Power reserve", "72 hours"], ["Finishing", "Hand-bevelled bridges, Côtes de Genève"]] },
  { group: "Complications", rows: [["Calendar", "Perpetual — date, day, month, leap year"], ["Moonphase", "Accurate to one day in 122 years"], ["Display", "Skeletonized dial, open to the movement"]] },
  { group: "Case", rows: [["Material", "18k 5N rose gold"], ["Diameter", "41.0 mm"], ["Height", "11.4 mm"], ["Crystal & caseback", "Sapphire, anti-reflective"], ["Strap", "Hand-stitched brown alligator, rose gold pin buckle"]] },
  { group: "Water resistance", rows: [["Rating", "30 metres / 3 bar"]] },
];
const NUM = ["I", "II", "III", "IV"];

export function Specs() {
  return (
    <section id="movement" className="bg-ink px-6 py-32 md:py-48">
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <p className="label mb-6">Technical Specification</p>
          <h2 className="display text-[clamp(2.2rem,5vw,4rem)]">Calibre AL-407</h2>
          <div className="rule mt-10 w-16" />
        </Reveal>
        <div className="mt-20 space-y-16">
          {SPECS.map((g, i) => (
            <Reveal key={g.group}>
              <div className="grid gap-6 md:grid-cols-[240px_1fr] md:gap-12">
                <h3 className="label flex gap-4"><span className="text-rose">{NUM[i]}.</span>{g.group}</h3>
                <dl className="border-t hair">
                  {g.rows.map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-1 border-b py-4 hair sm:flex-row sm:justify-between sm:gap-8">
                      <dt className="text-[13px] text-bone/55">{k}</dt>
                      <dd className="text-[15px] tabular-nums text-bone/90 sm:text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="label mt-16 normal-case tracking-[0.12em]">Specifications are refined at the bench and may vary by piece.</p>
      </div>
    </section>
  );
}

export function MacroBand() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  return (
    <section ref={ref} className="relative h-[85svh] overflow-hidden bg-ink">
      <motion.img src="/macro.webp" alt="Macro of the twin balance wheels and gear train"
        style={{ y: reduced ? 0 : y, WebkitMaskImage: "linear-gradient(#0000, #000 18%, #000 82%, #0000)", maskImage: "linear-gradient(#0000, #000 18%, #000 82%, #0000)" }}
        className="absolute -top-[12%] left-0 h-[124%] w-full object-cover" />
      <div className="absolute bottom-10 left-6 md:bottom-14 md:left-12">
        <div className="rule mb-4 w-10" />
        <p className="label">Plate IV — Twin balance wheels</p>
      </div>
    </section>
  );
}

export function Craft() {
  const P = [
    "Every Astronomia Luxe begins as a drawing and ends as a single pair of hands. One watchmaker cuts, finishes, assembles and regulates the calibre — and signs the bridge when it is done.",
    "Bevels are drawn by file, then polished with pith wood. Screw heads are blued over a flame. Nothing is hidden because nothing needs to be.",
    "The skeletonized dial removes almost everything that is not structure. What remains is cut, chamfered and polished until the light moves across it slowly.",
    "Nine hundred hours pass between the first plate and the final adjustment. We have never found a way to make it faster, and we have stopped looking.",
  ];
  return (
    <section className="bg-ink px-6 py-32 md:py-48">
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <p className="label mb-6"><span className="text-rose">V.</span>&ensp;Craftsmanship</p>
          <h2 className="display max-w-3xl text-[clamp(2.2rem,5vw,4rem)]">Nine hundred hours, one bench.</h2>
        </Reveal>
        <div className="mt-16 gap-16 md:columns-2 md:mt-24">
          {P.map((t, i) => (
            <Reveal key={i} delay={i * 0.08} className="mb-8 break-inside-avoid"><p className="body-copy">{t}</p></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reserve() {
  const [sent, setSent] = useState(false);
  return (
    <section id="reserve" className="bg-ink px-6 pb-32 pt-32 md:pb-48">
      <div className="mx-auto grid max-w-[1100px] gap-16 md:grid-cols-2 md:gap-24">
        <Reveal>
          <p className="label mb-6">Private Appointment</p>
          <h2 className="display text-[clamp(2.2rem,5vw,4rem)]">Reserve yours.</h2>
          <p className="body-copy mt-6 max-w-sm">Each piece is made to order. Leave your details and a member of the maison will write to arrange a private viewing.</p>
        </Reveal>
        <Reveal delay={0.1}>
          {sent ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, ease: EASE }} className="display text-2xl">
              Thank you. We will write to you within two working days.
            </motion.p>
          ) : (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); /* TODO: POST to your CRM / route handler */ setSent(true); }}>
              <input required name="name" className="field" placeholder="Full name" autoComplete="name" />
              <input required type="email" name="email" className="field" placeholder="Email" autoComplete="email" />
              <select name="maison" defaultValue="Geneva" className="field appearance-none">
                {["Geneva", "Paris", "London", "Singapore"].map((c) => <option key={c} value={c} className="bg-ink">{c}</option>)}
              </select>
              <textarea name="note" rows={3} className="field resize-none" placeholder="A note (optional)" />
              <button type="submit" className="cta mt-6">Request an appointment <span aria-hidden>→</span></button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t px-6 py-10 hair md:px-12">
      <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-4 sm:flex-row">
        <p className="label">© 2026 Astronomia Luxe · Geneva</p>
        <p className="label">Privacy · Legal</p>
      </div>
    </footer>
  );
}
