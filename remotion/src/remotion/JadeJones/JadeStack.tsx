// ─────────────────────────────────────────────────────────────
// JadeStack — a VERTICAL list for portrait, replacing the horizontal card row.
//
// Two rules from the animation skill drive this component:
//   1. "Portrait = vertical stacking — in 1080x1920, never put 3 items side by
//      side." The horizontal rows overflowed 1080 because they were fighting
//      the format, not because the cards were too big.
//   2. "Rapid-fire animations with no breathing room" is an anti-pattern. So a
//      list is ONE animation that updates, not N separate pop-ins: every row is
//      present from the start (dimmed), and the spoken one lights up. The viewer
//      sees the whole system immediately and tracks position within it.
//
// mode="reveal" keeps rows hidden until their cue (for a genuine accumulation,
// e.g. "add carbs, then protein, then fats"). mode="highlight" shows all rows
// from the first cue and only moves the emphasis.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { JadeCaptions } from "./JadeCaptions";

const anton = loadAnton().fontFamily;

const rowSchema = z.object({
  img: z.string().default(""),
  label: z.string(),
  note: z.string().default(""), // optional right-hand value, e.g. "8 EGGS"
  atSeconds: z.number(),
});

export const jadeStackSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  rows: z.array(rowSchema).default([]),
  mode: z.enum(["reveal", "highlight"]).default("reveal"),
  clearAtSeconds: z.number(),
  topY: z.number().default(1180),
  rowH: z.number().default(126),
  accent: z.string().default("#3DDC84"),
});
export type JadeStackProps = z.infer<typeof jadeStackSchema>;

export const calculateJadeStackMetadata: CalculateMetadataFunction<JadeStackProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const W = 860;

export const JadeStack: React.FC<JadeStackProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  rows,
  mode,
  clearAtSeconds,
  topY,
  rowH,
  accent,
}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  const firstCue = rows.length ? rows[0].atSeconds : 0;
  const activeIdx = rows.reduce((acc, r, i) => (t >= r.atSeconds ? i : acc), -1);

  const groupIn = spring({
    frame: Math.round((t - firstCue) * fps),
    fps,
    config: { damping: 200, stiffness: 200 },
    durationInFrames: 8,
  });
  const leave = interpolate(t, [clearAtSeconds, clearAtSeconds + 0.3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (t < firstCue || leave <= 0) return base();

  function base() {
    return (
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        {/* objectFit MUST be a prop — @remotion/media ignores it in style. */}
        <Video
          src={staticFile(videoSrc)}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <JadeCaptions captionsSrc={captionsSrc} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Video
        src={staticFile(videoSrc)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      <AbsoluteFill style={{ opacity: leave }}>
        <div
          style={{
            position: "absolute",
            top: topY,
            left: (1080 - W) / 2,
            width: W,
            opacity: groupIn,
          }}
        >
          {rows.map((r, i) => {
            const shown = mode === "highlight" ? true : t >= r.atSeconds;
            if (!shown) return <div key={i} style={{ height: rowH }} />;
            const isActive = i === activeIdx;
            const pop = spring({
              frame: Math.round((t - r.atSeconds) * fps),
              fps,
              config: { damping: 200, stiffness: 220 },
              durationInFrames: 7,
            });
            return (
              <div
                key={i}
                style={{
                  height: rowH,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 12,
                  padding: "0 20px 0 14px",
                  borderRadius: 20,
                  background: isActive ? "rgba(10,10,12,0.82)" : "rgba(10,10,12,0.5)",
                  border: `3px solid ${isActive ? accent : "rgba(255,255,255,0.16)"}`,
                  opacity: isActive ? 1 : 0.62,
                  transform: `scale(${isActive ? interpolate(pop, [0, 1], [0.97, 1]) : 0.97})`,
                  boxShadow: isActive ? "0 12px 30px rgba(0,0,0,0.5)" : "none",
                }}
              >
                {r.img ? (
                  <div
                    style={{
                      width: rowH - 26,
                      height: rowH - 26,
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "3px solid #fff",
                      flexShrink: 0,
                    }}
                  >
                    <Img
                      src={staticFile(r.img)}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ) : null}
                <div
                  style={{
                    fontFamily: anton,
                    fontSize: 46,
                    color: "#fff",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    flex: 1,
                  }}
                >
                  {r.label}
                </div>
                {r.note ? (
                  <div
                    style={{
                      fontFamily: anton,
                      fontSize: 44,
                      color: isActive ? accent : "rgba(255,255,255,0.65)",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.note}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
