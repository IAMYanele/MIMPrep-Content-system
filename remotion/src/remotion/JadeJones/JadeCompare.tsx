// ─────────────────────────────────────────────────────────────
// JadeCompare — proportional bars for the "X vs Y" beats.
//
// The point the skill makes that I got wrong first time round: a card that
// prints "80%" while she SAYS "eighty percent" is redundant — it retells. What
// the audio genuinely cannot deliver is the PROPORTION. Two bars where one is
// five times the other lands the disproportion in a single glance, and that's
// the claim she's actually making.
//
// Portrait rule: bars stack vertically, never side by side.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { JadeCaptions } from "./JadeCaptions";

const anton = loadAnton().fontFamily;

const barSchema = z.object({
  label: z.string(),
  value: z.number(), // relative magnitude; bar widths are normalised to the max
  display: z.string().default(""), // optional text on the bar, e.g. "80%"
  tone: z.enum(["good", "bad", "neutral"]).default("neutral"),
});

const groupSchema = z.object({
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
  title: z.string().default(""),
  bars: z.array(barSchema).default([]),
});

const brollSchema = z.object({
  src: z.string(),
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
});

export const jadeCompareSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  groups: z.array(groupSchema).default([]),
  broll: z.array(brollSchema).default([]),
  topY: z.number().default(1210),
});
export type JadeCompareProps = z.infer<typeof jadeCompareSchema>;

export const calculateJadeCompareMetadata: CalculateMetadataFunction<
  JadeCompareProps
> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const TONE: Record<string, string> = {
  good: "#3DDC84",
  bad: "#FF4D4D",
  neutral: "#FFFFFF",
};
const W = 880;

const BarGroup: React.FC<{ title: string; bars: z.infer<typeof barSchema>[]; topY: number }> = ({
  title,
  bars,
  topY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: topY,
          left: (1080 - W) / 2,
          width: W,
        }}
      >
        {title ? (
          <div
            style={{
              fontFamily: anton,
              fontSize: 36,
              color: "#fff",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 14,
              textShadow: "0 4px 14px rgba(0,0,0,0.85)",
            }}
          >
            {title}
          </div>
        ) : null}
        {bars.map((b, i) => {
          // stagger the grow so the eye reads one bar, then the other
          const grow = interpolate(frame, [i * 7, i * 7 + 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const pct = (b.value / max) * grow;
          const c = TONE[b.tone] ?? TONE.neutral;
          return (
            <div key={i} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontFamily: anton,
                  fontSize: 34,
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                  textShadow: "0 3px 12px rgba(0,0,0,0.85)",
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  height: 74,
                  borderRadius: 16,
                  background: "rgba(10,10,12,0.55)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct * 100}%`,
                    height: "100%",
                    borderRadius: 16,
                    background: c,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 20,
                    boxShadow: `0 0 22px ${c}66`,
                  }}
                >
                  {b.display && pct > 0.28 ? (
                    <span
                      style={{
                        fontFamily: anton,
                        fontSize: 46,
                        color: "#0b0b0d",
                        letterSpacing: 1,
                      }}
                    >
                      {b.display}
                    </span>
                  ) : null}
                </div>
                {/* A short bar can't hold its own label — park it just outside so
                    the small number is still readable (this is the whole point of
                    the beat: 15 next to 80). */}
                {b.display && pct <= 0.28 && pct > 0.02 ? (
                  <div
                    style={{
                      position: "relative",
                      top: -58,
                      left: `calc(${pct * 100}% + 18px)`,
                      fontFamily: anton,
                      fontSize: 46,
                      color: c,
                      letterSpacing: 1,
                      textShadow: "0 3px 12px rgba(0,0,0,0.9)",
                    }}
                  >
                    {b.display}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const JadeCompare: React.FC<JadeCompareProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  groups,
  broll,
  topY,
}) => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    {/* objectFit MUST be a prop — @remotion/media ignores it in style. */}
    <Video src={staticFile(videoSrc)} objectFit="cover" style={{ width: "100%", height: "100%" }} />

    {broll.map((b, i) => (
      <Sequence
        key={`b-${i}`}
        from={Math.round(b.fromSeconds * fps)}
        durationInFrames={Math.round(b.durationInSeconds * fps)}
        premountFor={fps}
        name={`broll-${i}`}
      >
        <AbsoluteFill style={{ background: "#000" }}>
          <Video
            src={staticFile(b.src)}
            muted
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </AbsoluteFill>
      </Sequence>
    ))}

    {groups.map((g, i) => (
      <Sequence
        key={`g-${i}`}
        from={Math.round(g.fromSeconds * fps)}
        durationInFrames={Math.round(g.durationInSeconds * fps)}
        name={`compare-${i}`}
      >
        <BarGroup title={g.title} bars={g.bars} topY={topY} />
      </Sequence>
    ))}

    <JadeCaptions captionsSrc={captionsSrc} />
  </AbsoluteFill>
);
