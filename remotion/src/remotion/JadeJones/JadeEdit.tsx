// ─────────────────────────────────────────────────────────────
// JadeEdit — clean caption + B-roll pass for the Jade Jones clone videos.
// Plays a (loop-edited) source video full-frame with the Jade caption
// preset. NO zoom, NO motion graphics. B-roll clips cut in over the
// talking head at chosen windows (muted — the base VO keeps playing),
// and captions render ON TOP of everything.
//
// Parameterized for batch rendering:
//   videoSrc          e.g. "looped.mp4"        (in --public-dir)
//   captionsSrc       e.g. "looped-captions.json"
//   durationInSeconds
//   fps               (source fps, 25)
//   broll[]           { src, fromSeconds, durationInSeconds }
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { JadeCaptions } from "./JadeCaptions";

const anton = loadAnton().fontFamily;

const brollSchema = z.object({
  src: z.string(),
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
  // Optional gaussian blur in px — used to obscure a reveal (e.g. hiding the
  // ingredient while the VO teases "one teaspoon of THIS").
  blur: z.number().default(0),
  objectPosition: z.string().default("50% 50%"),
});

// A big number callout for the stat beats ("60% higher risk of death").
// Several of these scripts hang their whole point on a percentage, and a
// spoken number goes past the ear — on screen it lands. tone drives the
// accent colour so good/bad reads instantly: bad = red, good = green.
const statSchema = z.object({
  value: z.string(), // e.g. "60%"
  label: z.string(), // e.g. "HIGHER RISK OF DEATH"
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
  tone: z.enum(["bad", "good", "neutral"]).default("neutral"),
});

// Eyebrow chapter marker ("MISTAKE 2 OF 5"). On a numbered-list script these do
// real work: without them the video plays as one undifferentiated monologue, and
// the viewer loses track of where they are in the list. Sits at the TOP of frame
// over the background, clear of her face and clear of the captions.
const markerSchema = z.object({
  text: z.string(),
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
});

export const jadeEditSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  broll: z.array(brollSchema).default([]),
  stats: z.array(statSchema).default([]),
  markers: z.array(markerSchema).default([]),
  // Caption look + placement. "esteban" is the original track styling (soft
  // shadow, no hard outline); "jade" adds the outline for light backgrounds.
  captionVariant: z.enum(["jade", "esteban"]).default("jade"),
  captionCenterY: z.number().default(1100),
  // Per-window caption placement. Needed when the framing changes mid-video -
  // e.g. a screen-capture-on-top layout wants captions in the gap above the
  // presenter's head, but the full-face section wants them under his chin.
  captionOverrides: z
    .array(z.object({ from: z.number(), to: z.number(), centerY: z.number() }))
    .default([]),
});

const Marker: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 200, stiffness: 220 }, durationInFrames: 6 });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 168,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: pop,
          transform: `translateY(${interpolate(pop, [0, 1], [-14, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: anton,
            fontSize: 40,
            lineHeight: 1,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: 3,
            background: "rgba(8,8,10,0.72)",
            border: "2px solid rgba(255,255,255,0.28)",
            borderRadius: 999,
            padding: "13px 32px 15px",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TONE: Record<string, string> = {
  bad: "#FF4D4D",
  good: "#3DDC84",
  neutral: "#FFFFFF",
};

// Sits BELOW the caption line (captions live at y1100 under her chin), so the
// number never covers her face or the words.
const StatCard: React.FC<{ value: string; label: string; tone: string }> = ({
  value,
  label,
  tone,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 200, stiffness: 210 }, durationInFrames: 8 });
  const accent = TONE[tone] ?? TONE.neutral;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 1235,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${interpolate(pop, [0, 1], [0.86, 1])})`,
          opacity: pop,
        }}
      >
        <div
          style={{
            background: "rgba(8,8,10,0.78)",
            border: `3px solid ${accent}`,
            borderRadius: 26,
            padding: "22px 46px 26px",
            textAlign: "center",
            boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
            maxWidth: 900,
          }}
        >
          <div style={{ fontFamily: anton, fontSize: 132, lineHeight: 1, color: accent }}>
            {value}
          </div>
          <div
            style={{
              fontFamily: anton,
              fontSize: 40,
              lineHeight: 1.1,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginTop: 10,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export type JadeEditProps = z.infer<typeof jadeEditSchema>;

export const calculateJadeEditMetadata: CalculateMetadataFunction<JadeEditProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

export const JadeEdit: React.FC<JadeEditProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  broll = [],
  stats = [],
  markers = [],
  captionVariant = "jade",
  captionCenterY = 1100,
  captionOverrides = [],
}) => {
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Base: loop-edited talking head — carries the VO audio throughout */}
      <Video
        src={staticFile(videoSrc)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      {/* B-roll cutaways — cover the frame during their window (muted). */}
      {broll.map((b, i) => (
        <Sequence
          key={i}
          from={Math.round(b.fromSeconds * fps)}
          durationInFrames={Math.round(b.durationInSeconds * fps)}
          premountFor={fps}
          name={`broll-${i}`}
        >
          <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
            <Video
              src={staticFile(b.src)}
              muted
              objectFit="cover"
              style={{
                width: "100%",
                height: "100%",
                objectPosition: b.objectPosition,
                // scale up slightly when blurred so the blur can't feather in the edges
                ...(b.blur
                  ? { filter: `blur(${b.blur}px)`, transform: `scale(${1 + b.blur / 120})` }
                  : {}),
              }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Big number callouts for the stat beats — under the caption line. */}
      {stats.map((s, i) => (
        <Sequence
          key={`stat-${i}`}
          from={Math.round(s.fromSeconds * fps)}
          durationInFrames={Math.round(s.durationInSeconds * fps)}
          name={`stat-${i}`}
        >
          <StatCard value={s.value} label={s.label} tone={s.tone} />
        </Sequence>
      ))}

      {/* Numbered chapter markers — top of frame, clear of face and captions. */}
      {markers.map((m, i) => (
        <Sequence
          key={`mk-${i}`}
          from={Math.round(m.fromSeconds * fps)}
          durationInFrames={Math.round(m.durationInSeconds * fps)}
          name={`marker-${i}`}
        >
          <Marker text={m.text} />
        </Sequence>
      ))}

      {/* Captions on top of everything (visible over talking head AND B-roll) */}
      <JadeCaptions
        captionsSrc={captionsSrc}
        variant={captionVariant}
        centerY={captionCenterY}
        positionOverrides={captionOverrides}
      />
    </AbsoluteFill>
  );
};
