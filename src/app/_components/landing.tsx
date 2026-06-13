"use client";

import { signIn } from "next-auth/react";

import "./landing.css";

// Fonts and the design tokens this component uses are loaded globally
// (layout.tsx + globals.css); landing.css just consumes the shared variables.

// The V-scale ladder — read bottom (V0) upward. Hue encodes difficulty.
const RUNGS = [
  { grade: "V0", color: "var(--rl-teal)", note: "start" },
  { grade: "V3", color: "var(--rl-teal)" },
  { grade: "V5", color: "var(--rl-gold)" },
  { grade: "V7", color: "var(--rl-ember)" },
  { grade: "V9", color: "var(--rl-violet)", note: "project" },
];

// Honest descriptions of the send types the app actually records.
const SEND_TYPES = [
  {
    tag: "Flash",
    color: "var(--rl-gold)",
    blurb: "Topped first try with beta in hand. The cleanest line in the book.",
  },
  {
    tag: "Send",
    color: "var(--rl-green)",
    blurb: "Climbed it clean — however many goes it took to get there.",
  },
  {
    tag: "Project",
    color: "var(--rl-ember)",
    blurb: "Still working it. Log the attempts as they stack up.",
  },
];

// Examples of a logged climb — shows the product, not borrowed social proof.
const SAMPLES = [
  {
    grade: "V4–V5",
    chip: "Flash",
    chipColor: "var(--rl-gold)",
    gym: "Movement · Englewood",
    note: "Blue slab in the back corner. Trusted the feet for once.",
  },
  {
    grade: "V6",
    chip: "Send",
    chipColor: "var(--rl-green)",
    gym: "The Spot · Boulder",
    note: "Fourth session on the red overhang. Finally stuck the deadpoint.",
  },
  {
    grade: "V7",
    chip: "Project",
    chipColor: "var(--rl-ember)",
    gym: "Earth Treks · Golden",
    note: "Crimp rail into the throw. Two moves from the top — next time.",
  },
];

export function Landing() {
  return (
    <div className="rl-root">
      <div className="rl-wrap">
        {/* ---------- Hero ---------- */}
        <section className="rl-hero">
          <div className="rl-ladder" aria-hidden="true">
            <span className="rl-marker" />
            {RUNGS.map((r) => (
              <div
                key={r.grade}
                className="rl-rung"
                style={{ ["--rung" as string]: r.color }}
              >
                <span className="rl-rung-grade">{r.grade}</span>
                {r.note ? <span className="rl-rung-note">{r.note}</span> : null}
              </div>
            ))}
          </div>

          <div className="rl-hero-body">
            <p className="rl-eyebrow">Indoor climbing log</p>
            <h1 className="rl-title">
              Log every <em>send.</em>
            </h1>
            <p className="rl-lede">
              Grade range, send type, photos, and notes — one record for every
              boulder and route you top out at the gym, so you can watch the
              grades climb over a season.
            </p>

            <div className="rl-cta-row">
              <button className="rl-btn" onClick={() => void signIn()}>
                Start logging
                <span className="rl-arrow" aria-hidden="true">
                  →
                </span>
              </button>
              <div className="rl-legend">
                <span style={{ ["--dot" as string]: "var(--rl-gold)" }}>Flash</span>
                <span style={{ ["--dot" as string]: "var(--rl-green)" }}>Send</span>
                <span style={{ ["--dot" as string]: "var(--rl-ember)" }}>Project</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Send-type ladder ---------- */}
        <section className="rl-section">
          <div className="rl-section-head">
            <div>
              <p className="rl-eyebrow">How a climb gets logged</p>
              <h2 className="rl-section-title">Three ways to send</h2>
            </div>
          </div>
          <div className="rl-steps">
            {SEND_TYPES.map((s) => (
              <div
                key={s.tag}
                className="rl-step"
                style={{ ["--step" as string]: s.color }}
              >
                <h3>
                  <span className="rl-step-dot" aria-hidden="true" />
                  {s.tag}
                </h3>
                <p>{s.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- What a log looks like ---------- */}
        <section className="rl-section">
          <div className="rl-section-head">
            <div>
              <p className="rl-eyebrow">Examples</p>
              <h2 className="rl-section-title">What a log looks like</h2>
            </div>
          </div>
          <div className="rl-cards">
            {SAMPLES.map((c) => (
              <article key={c.note} className="rl-card">
                <div className="rl-card-top">
                  <span className="rl-grade">{c.grade}</span>
                  <span
                    className="rl-chip"
                    style={{ ["--chip" as string]: c.chipColor }}
                  >
                    {c.chip}
                  </span>
                </div>
                <span className="rl-card-gym">{c.gym}</span>
                <p className="rl-card-note">{c.note}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Footer ---------- */}
        <footer className="rl-footer">
          <div>
            <p className="rl-foot-word">🧗 Rocklog</p>
            <p className="rl-foot-note">
              Your climbs, your call — mark each send public to share it, or keep
              it to yourself.
            </p>
          </div>
          <button className="rl-btn" onClick={() => void signIn()}>
            Start logging
            <span className="rl-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}
