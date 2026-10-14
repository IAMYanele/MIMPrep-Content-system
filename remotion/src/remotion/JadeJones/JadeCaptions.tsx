// ─────────────────────────────────────────────────────────────
// JadeCaptions — Anton 100 white centered ALL-CAPS captions
// with a soft dark drop-shadow (dark enough to see, soft enough
// not to be too dark). Loads its captions JSON from a path passed
// via the parent comp's input props.
//
// Chunking: <=18 chars and <=2.5s per page.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Anton";

const { fontFamily } = loadFont();

// ── Style (matches the Premiere "esteban captions real" track) ─
const FONT_SIZE = 100;
const FILL = "#FFFFFF";
const CAPTION_CENTER_Y = 1100; // just under the talking head's chin, over dark clothing
const MAX_CHARS = 18;
const MAX_DUR_MS = 2500;

// Crisp black outline (4 diagonal offsets) so white text stays legible on ANY
// background — including light ones like a white shirt or bright room — then a
// soft dark drop shadow for depth. On dark backgrounds the outline is invisible,
// so this is a universal readability win that leaves the dark-clip look unchanged.
const TEXT_SHADOW =
  "-2px -2px 0 rgba(0,0,0,0.72), 2px -2px 0 rgba(0,0,0,0.72), -2px 2px 0 rgba(0,0,0,0.72), 2px 2px 0 rgba(0,0,0,0.72), 0 4px 10px rgba(0,0,0,0.5), 0 12px 30px rgba(0,0,0,0.4)";

type Token = { text: string; startMs: number; endMs: number };
type Word = { text: string; startMs: number; endMs: number };
type Page = { text: string; startMs: number; endMs: number };

// Punctuation to drop from display (keep apostrophes ' ’ for contractions).
const isDashOnly = (s: string) => /^[-–—]+$/.test(s);
const isPunctOnly = (s: string) => /^[.,!?;:"“”…]+$/.test(s);
const stripPunct = (s: string) => s.replace(/[.,!?;:"“”…]/g, "");
// Quotes are NOT droppable: on a "comment the word X" CTA the quoted term is the
// thing the viewer is being asked to type, so it has to stay visible AND stay a
// separate word. Whisper emits the quote as its own token and the following word
// with no leading space, so without this the two run together (WORDCOLLAGEN).
const isQuoteOnly = (s: string) => /^["“”]+$/.test(s);

// Reconstruct whole words from whisper's sub-word tokens.
//  • continuation tokens (no leading space) merge into the current word,
//    so "end"+"orph"+"ins" → "ENDORPHINS" and "tum"+"my" → "TUMMY".
//  • dash tokens are dropped AND force the next token to start a new word,
//    so "feel"+"-"+"good" → "FEEL","GOOD" and "because"+"--" → "BECAUSE".
//  • standalone punctuation just extends the current word's end time.
function reconstructWords(tokens: Token[]): Word[] {
  const words: Word[] = [];
  let forceNew = true;
  let pendingQuote = ""; // an open quote waiting to be glued onto the next word
  let inQuote = false;
  for (const t of tokens) {
    const raw = t.text;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (isDashOnly(trimmed)) {
      forceNew = true;
      continue;
    }
    if (isQuoteOnly(trimmed)) {
      if (inQuote && words.length) {
        // closing quote — attach to the word we just finished
        words[words.length - 1].text += '"';
        words[words.length - 1].endMs = t.endMs;
        inQuote = false;
      } else {
        // opening quote — start a fresh word and prefix it
        inQuote = true;
        pendingQuote = '"';
        forceNew = true;
      }
      continue;
    }
    if (isPunctOnly(trimmed)) {
      if (words.length) words[words.length - 1].endMs = t.endMs;
      continue;
    }
    const piece = stripPunct(trimmed).toUpperCase();
    if (!piece) {
      if (words.length) words[words.length - 1].endMs = t.endMs;
      continue;
    }
    const startsNew = raw[0] === " " || forceNew || words.length === 0;
    if (startsNew) {
      words.push({ text: pendingQuote + piece, startMs: t.startMs, endMs: t.endMs });
      pendingQuote = "";
    } else {
      const w = words[words.length - 1];
      w.text += piece;
      w.endMs = t.endMs;
    }
    forceNew = false;
  }
  return words;
}

// Chunk whole words into pages of <= MAX_CHARS and <= MAX_DUR_MS.
// A single word is never split, so multi-token words always stay intact.
function buildPages(tokens: Token[]): Page[] {
  const words = reconstructWords(tokens);
  const pages: Page[] = [];
  let cur: Word[] = [];

  const flush = () => {
    if (cur.length) {
      pages.push({
        text: cur.map((w) => w.text).join(" "),
        startMs: cur[0].startMs,
        endMs: cur[cur.length - 1].endMs,
      });
      cur = [];
    }
  };

  for (const w of words) {
    const tentative = cur.length
      ? cur.map((x) => x.text).join(" ") + " " + w.text
      : w.text;
    const dur = cur.length ? w.endMs - cur[0].startMs : 0;
    if (cur.length && (tentative.length > MAX_CHARS || dur > MAX_DUR_MS)) {
      flush();
      cur = [w];
    } else {
      cur.push(w);
    }
  }
  flush();
  return pages;
}

// The Esteban track is the parent of this preset: Anton 100, white, centred,
// NO stroke - just a soft shadow. The Jade variant added the hard outline for
// light backgrounds. Both share the same chunking.
const SOFT_SHADOW = "0 4px 16px rgba(0,0,0,0.5)";

const CaptionPage: React.FC<{ text: string; centerY: number; variant: string }> = ({
  text,
  centerY,
  variant,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 220 },
    durationInFrames: 5,
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: centerY,
          transform: `translateY(-50%) scale(${interpolate(enter, [0, 1], [0.97, 1])})`,
          opacity: enter,
          display: "flex",
          justifyContent: "center",
          padding: "0 70px",
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: FONT_SIZE,
            color: FILL,
            textAlign: "center",
            lineHeight: 1.05,
            maxWidth: 940,
            textShadow: variant === "esteban" ? SOFT_SHADOW : TEXT_SHADOW,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Optional per-time-window override of the caption vertical position — e.g. during
// a split-screen section, pull captions up onto the seam line. Each window is in
// seconds; a page whose start falls inside a window uses that window's centerY.
type PosOverride = { from: number; to: number; centerY: number };

export const JadeCaptions: React.FC<{
  captionsSrc: string;
  centerY?: number;
  positionOverrides?: PosOverride[];
  variant?: "jade" | "esteban";
}> = ({
  captionsSrc,
  centerY = CAPTION_CENTER_Y,
  positionOverrides = [],
  variant = "jade",
}) => {
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("jade-captions"));
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
        const until = next ? ms2f(next.startMs) : ms2f(p.endMs + 500);
        const sec = p.startMs / 1000;
        const ov = positionOverrides.find((o) => sec >= o.from && sec < o.to);
        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={Math.max(1, until - from)}
            premountFor={fps}
          >
            <CaptionPage text={p.text} centerY={ov ? ov.centerY : centerY} variant={variant} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
