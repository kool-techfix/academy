"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

// Learn → Apply → Innovate. Each value gets its own brand tint (see
// `.landing-hero-copy[data-value=…]` in globals.css).
const HERO_STATES = [
  {
    value: "learn",
    label: "Learn",
    heading: ["Learn the work", "behind the work."],
    body: "Build practical IT knowledge with focused courses, experienced instructors, and clear progress that moves you closer to real-world confidence.",
  },
  {
    value: "apply",
    label: "Apply",
    heading: ["Apply your skills", "to real work."],
    body: "Put your knowledge into practice, strengthen your technical skills, and develop the confidence to solve real IT challenges.",
  },
  {
    value: "innovate",
    label: "Innovate",
    heading: ["Innovate with skills", "that move you."],
    body: "Go beyond the basics, explore new possibilities, and apply your skills to create smarter solutions for a world that never stops evolving.",
  },
] as const;

const ROTATE_MS = 4500;

/**
 * The landing hero copy. Heading, paragraph and panel tint rotate together;
 * `children` (the CTA links) render untouched below the rotating text.
 *
 * All three headings/paragraphs are stacked in one grid cell so the panel is
 * always as tall as the longest copy — no layout shift between states.
 */
export function LandingHeroRotator({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const rotating = !paused && !hovering && !reducedMotion;

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % HERO_STATES.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [rotating]);

  return (
    <div
      className="landing-hero-copy"
      data-value={HERO_STATES[active].value}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Decorative photo per value; crossfades with the copy (globals.css). */}
      <div className="landing-hero-media" aria-hidden="true">
        {HERO_STATES.map((state, i) => (
          <span
            key={state.value}
            data-value={state.value}
            data-active={i === active}
          />
        ))}
      </div>
      <span className="eyebrow">
        Practical IT learning, built for the real world
      </span>
      <h1 className="landing-hero-rotate">
        {HERO_STATES.map((state, i) => (
          <span
            key={state.value}
            className="landing-hero-slide"
            data-active={i === active}
            aria-hidden={i !== active}
          >
            <span className="landing-hero-line">{state.heading[0]}</span>{" "}
            <span className="landing-hero-line">{state.heading[1]}</span>
          </span>
        ))}
      </h1>
      <p className="landing-hero-rotate">
        {HERO_STATES.map((state, i) => (
          <span
            key={state.value}
            className="landing-hero-slide text-[14px]"
            data-active={i === active}
            aria-hidden={i !== active}
          >
            {state.body}
          </span>
        ))}
      </p>
      {children}
      <div className="landing-hero-values">
        {HERO_STATES.map((state, i) => (
          <button
            key={state.value}
            type="button"
            aria-pressed={i === active}
            onClick={() => {
              setActive(i);
              setPaused(true);
            }}
          >
            {state.label}
          </button>
        ))}
        {!reducedMotion && (
          <button
            type="button"
            className="landing-hero-pause"
            aria-label={paused ? "Resume rotation" : "Pause rotation"}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}
