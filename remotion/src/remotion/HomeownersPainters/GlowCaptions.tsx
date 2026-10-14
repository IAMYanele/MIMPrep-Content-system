// ─────────────────────────────────────────────────────────────
// GlowCaptions — Devin Jatho style caption layer.
//
// Two-tier text: a white→light-grey gradient base, with emphasis
// keywords promoted to the glowing blue gradient "special" treatment.
//
// Pages hold 2–4 words (the chunking the user picked), but each word
// pops in on its OWN spoken timestamp and then holds for the rest of
// the page — so the line reads ahead while still hitting every beat.
//
// Chunking rules (ported from the SRT builder so both stay in sync):
//   • never spans a sentence boundary
//   • never ends on a word that binds forward (articles, preps, aux)
//   • never ends right before a phrasal-verb particle ("show | up")
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["800", "900"],
  subsets: ["latin"],
});

// ── Layout ────────────────────────────────────────────────────
const FONT_SIZE = 92;
const CAPTION_CENTER_Y = 1480; // on the shirt, clear of the chin and of platform UI
const MAX_WORDS = 4;
const WORD_STAGGER = 2; // frames between words within a page

// ── Emphasis words promoted to the glowing treatment ──────────
// The proof points and fear words — what the viewer should retain.
const KEYWORDS = new Set([
  "585",
  "reviews",
  "afraid",
  "three",
  "lose",
  "jobs",
  "show",
  "up",
  "angriest",
  "rescheduled",
  "ran",
  "away",
  "strangers",
  "trust",
  "money",
  "deposit",
  "quiet",
  "free",
]);

// Words that bind forward — a page must never END on one.
const STICKY = new Set([
  "a", "an", "the", "of", "to", "in", "on", "at", "for", "with", "from",
  "and", "or", "but", "because", "that", "which", "who", "so", "if",
  "is", "are", "was", "were", "be", "been", "has", "have", "had",
  "will", "can", "should", "would", "could", "do", "does", "did",
  "my", "your", "his", "her", "its", "their", "our", "this", "these",
  "never", "not", "just", "all", "any", "even", "still", "least", "one",
]);

// Particles that bind BACKWARD to their verb ("show up", "ran away").
const PARTICLES = new Set(["up", "out", "off", "down", "away", "back", "over"]);

type Token = { text: string; startMs: number; endMs: number };
type Word = { text: string; startMs: number; endMs: number; special: boolean };
type Page = { words: Word[]; startMs: number; endMs: number };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const endsSentence = (s: string) => /[.!?]$/.test(s.trim());
const endsClause = (s: string) => /[,;:]$/.test(s.trim());

function buildPages(tokens: Token[]): Page[] {
  const w = tokens
    .map((t) => ({ ...t, text: t.text.trim() }))
    .filter((t) => t.text.length > 0);

  const pages: Page[] = [];
  let i = 0;

  while (i < w.length) {
    // hard rule 1: stop at a sentence end inside the next MAX_WORDS
    let size = 0;
    for (let k = i; k < Math.min(i + MAX_WORDS, w.length); k++) {
      if (endsSentence(w[k].text)) {
        size = k - i + 1;
        break;
      }
    }

    if (!size) {
      for (const trial of [4, 3, 2]) {
        const j = i + trial - 1;
        if (j >= w.length) continue;
        // hard rule 2: don't strand a particle at the head of the next page
        if (j + 1 < w.length && PARTICLES.has(norm(w[j + 1].text))) continue;
        const tail = norm(w[j].text);
        if (endsClause(w[j].text)) {
          size = trial;
          break;
        }
        if (!size && !STICKY.has(tail)) size = trial;
      }
    }
    if (!size) {
      // nothing clean — take whatever doesn't split a phrasal verb
      for (const trial of [4, 3, 2, 5]) {
        const j = i + trial - 1;
        if (j >= w.length) continue;
        if (j + 1 < w.length && PARTICLES.has(norm(w[j + 1].text))) continue;
        size = trial;
        break;
      }
    }
    if (!size) size = Math.min(MAX_WORDS, w.length - i);

    const slice = w.slice(i, i + size);
    pages.push({
      words: slice.map((t) => ({
        text: t.text,
        startMs: t.startMs,
        endMs: t.endMs,
        special: KEYWORDS.has(norm(t.text)),
      })),
      startMs: slice[0].startMs,
      endMs: slice[slice.length - 1].endMs,
    });
    i += size;
  }
  return pages;
}

// ── A single word, popping in on its own spoken timestamp ─────
const CaptionWord: React.FC<{ word: Word; delay: number }> = ({ word, delay }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;

  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // the workhorse entrance: rise + fade + blur-off, ease-out
  const y = interpolate(local, [0, 7], [26, 0], {
    easing: (t) => 1 - Math.pow(1 - t, 3),
    ...clamp,
  });
  const opacity = interpolate(local, [0, 5], [0, 1], clamp);
  const blur = interpolate(local, [0, 6], [9, 0], clamp);
  const scale = interpolate(local, [0, 8], [0.94, 1], {
    easing: (t) => 1 - Math.pow(1 - t, 3),
    ...clamp,
  });

  const base: React.CSSProperties = {
    display: "inline-block",
    fontFamily,
    fontSize: FONT_SIZE,
    lineHeight: 1.06,
    textTransform: "uppercase",
    transform: `translateY(${y}px) scale(${scale})`,
    opacity,
    filter: `blur(${blur}px)`,
    margin: "0 0.16em",
  };

  if (word.special) {
    // "special" glowing keyword: heavier weight, blue gradient fill, deep glow
    return (
      <span
        style={{
          ...base,
          fontWeight: 900,
          letterSpacing: "0.02em",
          // brighter top stop so the word still reads against a white shirt
          background: "linear-gradient(180deg, #BFE4FF 0%, #3D8BFF 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          // dark shadow FIRST for definition, then the glow bloom on top —
          // without the shadow the blue dissolves into bright backgrounds
          filter:
            `blur(${blur}px) drop-shadow(0 3px 7px rgba(0,0,0,0.75))` +
            ` drop-shadow(0 0 16px #5ab0ff) drop-shadow(0 0 44px #2b6fff)`,
        }}
      >
        {word.text}
      </span>
    );
  }

  return (
    <span
      style={{
        ...base,
        fontWeight: 800,
        letterSpacing: "0.01em",
        background: "linear-gradient(180deg, #FFFFFF 0%, #C9CFD6 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        // soft cast shadow so white text holds against a bright background
        filter: `blur(${blur}px) drop-shadow(0 4px 10px rgba(0,0,0,0.6)) drop-shadow(0 12px 30px rgba(0,0,0,0.45))`,
      }}
    >
      {word.text}
    </span>
  );
};

const CaptionPage: React.FC<{ page: Page }> = ({ page }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: CAPTION_CENTER_Y,
        transform: "translateY(-50%)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 60px",
        textAlign: "center",
      }}
    >
      {page.words.map((w, i) => (
        // The page lands as a UNIT (the 2-4 word chunking that was asked for),
        // with a short stagger so it still has motion. Syncing each word to its
        // own spoken onset instead would read as one-word captions.
        <CaptionWord key={i} word={w} delay={i * WORD_STAGGER} />
      ))}
    </div>
  </AbsoluteFill>
);

export const GlowCaptions: React.FC<{ captionsSrc: string }> = ({ captionsSrc }) => {
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("glow-captions"));
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    fetch(staticFile(captionsSrc))
      .then((r) => r.json())
      .then((data: Token[]) => {
        setPages(buildPages(data));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle, captionsSrc]);

  const ms2f = (ms: number) => Math.round((ms / 1000) * fps);

  return (
    <AbsoluteFill>
      {pages.map((p, i) => {
        const from = ms2f(p.startMs);
        const next = pages[i + 1];
        const until = next ? ms2f(next.startMs) : ms2f(p.endMs + 400);
        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={Math.max(1, until - from)}
            premountFor={fps}
          >
            <CaptionPage page={p} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
