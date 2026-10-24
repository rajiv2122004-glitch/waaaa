"use client";
import { useEffect, useState } from "react";

const links = [["The Watch", "#watch"], ["Movement", "#movement"], ["Reserve", "#reserve"]];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-[900ms] ease-maison ${
        scrolled ? "border-bone/10 bg-ink/85" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6 md:px-12">
        <a href="#watch" className="font-display text-[13px] uppercase tracking-[0.38em] text-bone/90">Astronomia Luxe</a>
        <ul className="flex items-center gap-6 md:gap-10">
          {links.map(([t, h]) => (
            <li key={h}>
              <a href={h} className="label transition-colors duration-[900ms] ease-maison hover:text-rose">{t}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
