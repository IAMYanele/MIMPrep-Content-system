// ─────────────────────────────────────────────────────────────
// SkipBreakfast — Jade "skipping breakfast works differently for
// women" clone (@jessie.schramm source). Talking-head + concept
// B-roll (afternoon crash → 9pm chocolate raid → protein breakfast)
// and a myth-flip text card: "STARVATION MODE ✕" struck through,
// then "UNDER-FED BY 8PM ✓". Per the notes: NO hormone-diagram
// graphics — the script explicitly rejects that framing. Jade
// captions render on top throughout.
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
});

export const skipBreakfastSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  broll: z.array(brollSchema).default([]),
  mythFrom: z.number(),
  mythSwitch: z.number(),
  mythUntil: z.number(),
  wrongText: z.string().default("Starvation mode"),
  rightText: z.string().default("Under-fed by 8pm"),
});
export type SkipBreakfastProps = z.infer<typeof skipBreakfastSchema>;

export const calculateSkipBreakfastMetadata: CalculateMetadataFunction<
  SkipBreakfastProps
> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const Chip: React.FC<{ text: string; kind: "wrong" | "right" }> = ({ text, kind }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 220 }, durationInFrames: 6 });
  const wrong = kind === "wrong";
  return (
    <div
      style={{
        transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
        opacity: enter,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "22px 44px 26px",
        borderRadius: 26,
        background: "rgba(10,10,13,0.72)",
        border: `2px solid ${wrong ? "rgba(255,90,90,0.5)" : "rgba(90,220,140,0.55)"}`,
        boxShadow: "0 16px 44px rgba(0,0,0,0.45)",
      }}
    >
      <span
        style={{
          fontFamily: anton,
          fontSize: 58,
          color: wrong ? "#ff5a5a" : "#5fe08c",
          lineHeight: 1,
        }}
      >
        {wrong ? "✕" : "✓"}
      </span>
      <span
        style={{
          fontFamily: anton,
          fontSize: 66,
          color: "#fff",
          textTransform: "uppercase",
          lineHeight: 1.02,
          textDecoration: wrong ? "line-through" : "none",
          textDecorationColor: "#ff5a5a",
          textDecorationThickness: "5px",
          textShadow: "0 3px 10px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const MythFlip: React.FC<{
  switchAtFrames: number;
  wrongText: string;
  rightText: string;
}> = ({ switchAtFrames, wrongText, rightText }) => {
  const frame = useCurrentFrame();
  const showRight = frame >= switchAtFrames;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div style={{ marginTop: 360 }}>
        {showRight ? (
          <Chip key="r" text={rightText} kind="right" />
        ) : (
          <Chip key="w" text={wrongText} kind="wrong" />
        )}
      </div>
    </AbsoluteFill>
  );
};

export const SkipBreakfast: React.FC<SkipBreakfastProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  broll,
  mythFrom,
  mythSwitch,
  mythUntil,
  wrongText,
  rightText,
}) => {
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* Base talking head — carries the VO throughout. */}
      <Video
        src={staticFile(videoSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Concept B-roll cutaways (muted). */}
      {broll.map((b, i) => (
        <Sequence
          key={i}
          from={Math.round(b.fromSeconds * fps)}
          durationInFrames={Math.round(b.durationInSeconds * fps)}
          premountFor={fps}
          name={`broll-${i}`}
        >
          <AbsoluteFill style={{ background: "#000" }}>
            <Video
              src={staticFile(b.src)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Myth-flip text card — only when a real window is set (off by default; we edit with B-roll). */}
      {mythUntil > mythFrom ? (
        <Sequence
          from={Math.round(mythFrom * fps)}
          durationInFrames={Math.round((mythUntil - mythFrom) * fps)}
          name="myth-flip"
        >
          <MythFlip
            switchAtFrames={Math.round((mythSwitch - mythFrom) * fps)}
            wrongText={wrongText}
            rightText={rightText}
          />
        </Sequence>
      ) : null}

      {/* Captions on top of everything. */}
      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
