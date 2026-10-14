// ─────────────────────────────────────────────────────────────
// Captions for TwoBrands — styled to match the Premiere
// "esteban captions real" track: Anton, size 100, white fill,
// centered, NO stroke. Chunked to <=18 chars AND <=2.5s per page,
// positioned just under Esteban's chin (over his dark shirt).
//
// Data: public/avatar-captions.json (whisper token array:
//   { text, startMs, endMs, timestampMs, confidence }).
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

// ── Style — mirrors the Premiere caption track ────────────────
const FONT_SIZE = 100; // Premiere "Font Size 100"
const FILL = "#FFFFFF"; // white fill
const CAPTION_CENTER_Y = 1040; // vertical center: just under his chin (~y900), on the black shirt
const MAX_CHARS = 18; // <= 18 characters per caption
const MAX_DUR_MS = 2500; // ~2.5s per caption

type Token = { text: string; startMs: number; endMs: number };
type Page = { text: string; startMs: number; endMs: number };

// ALL CAPS + strip sentence punctuation for a bold TikTok caption look
// (Anton is a condensed display face built for uppercase).
const clean = (s: string) =>
  s
    .toUpperCase()
    .replace(/[.,!?;:"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Chunk word tokens into pages of <= MAX_CHARS and <= MAX_DUR_MS.
function buildPages(tokens: Token[]): Page[] {
  const pages: Page[] = [];
  let words: Token[] = [];
  let text = "";

  const flush = () => {
    if (words.length) {
      pages.push({
        text: text.trim(),
        startMs: words[0].startMs,
        endMs: words[words.length - 1].endMs,
      });
    }
    words = [];
    text = "";
  };

  for (const t of tokens) {
    const w = clean(t.text);
    if (!w) continue;
    const tentative = text ? text + " " + w : w;
    const dur = words.length ? t.endMs - words[0].startMs : 0;
    if (words.length && (tentative.length > MAX_CHARS || dur > MAX_DUR_MS)) {
      flush();
      text = w;
      words = [t];
    } else {
      text = tentative;
      words.push(t);
    }
  }
  flush();
  return pages;
}

const CaptionPage: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Quick, subtle pop-in (matches a clean caption track, not karaoke).
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
          top: CAPTION_CENTER_Y,
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
            // No stroke (per the track setting); a soft shadow keeps it
            // legible if he moves off the dark shirt.
            textShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("avatar-captions"));
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    fetch(staticFile("avatar-captions.json"))
      .then((r) => r.json())
      .then((data: Token[]) => {
        setPages(buildPages(data));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle]);

  const ms2f = (ms: number) => Math.round((ms / 1000) * fps);

  return (
    <AbsoluteFill>
      {pages.map((p, i) => {
        const from = ms2f(p.startMs);
        const next = pages[i + 1];
        const until = next ? ms2f(next.startMs) : ms2f(p.endMs + 500);
        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={Math.max(1, until - from)}
            premountFor={fps}
          >
            <CaptionPage text={p.text} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
