// ─────────────────────────────────────────────────────────────
// JadeFlywheel — for "Lifting doesn't just make you stronger".
//
// The methodology question that matters here: what does the audio alone fail
// to communicate? Not the twelve links — she says those clearly. What she
// CANNOT say is that it's a CIRCLE. Spoken, link 12 handing back to link 1 is
// just another sentence; you only feel the loop if you can see the ring close.
//
// So the graphic is the flywheel itself: twelve nodes around a ring, an arc
// that draws as she speaks, and the current link named in the centre where
// it's actually readable. When the last link lands, the arc completes the
// circle — the point of the video happens on screen instead of being asserted.
//
// Ring sits BELOW the caption line so the text stays under her chin.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
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

const linkSchema = z.object({
  text: z.string(),
  atSeconds: z.number(),
});

export const jadeFlywheelSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  links: z.array(linkSchema).default([]),
  centerY: z.number().default(1545), // ring centre, below the caption line
  radius: z.number().default(268),
  // "good" = a virtuous cycle (lifting), "bad" = a trap the viewer is stuck in
  // (under-eating). Same mechanic, opposite meaning — the colour carries it.
  tone: z.enum(["good", "bad"]).default("good"),
  broll: z
    .array(
      z.object({
        src: z.string(),
        fromSeconds: z.number(),
        durationInSeconds: z.number(),
      }),
    )
    .default([]),
});
export type JadeFlywheelProps = z.infer<typeof jadeFlywheelSchema>;

export const calculateJadeFlywheelMetadata: CalculateMetadataFunction<
  JadeFlywheelProps
> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const GREEN = "#3DDC84";
const RED = "#FF4D4D";

export const JadeFlywheel: React.FC<JadeFlywheelProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  links,
  centerY,
  radius,
  tone,
}) => {
  const ACCENT = tone === "bad" ? RED : GREEN;
  const GLOW = tone === "bad" ? "rgba(255,77,77,0.55)" : "rgba(61,220,132,0.55)";
  const frame = useCurrentFrame();
  const t = frame / fps;
  const n = links.length;

  const landed = links.filter((l) => t >= l.atSeconds).length;
  const activeIdx = Math.max(0, landed - 1);
  const active = links[activeIdx];

  // Angle per node, starting at 12 o'clock and moving clockwise.
  const angleOf = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;

  // The arc grows to the current node, then eases the final segment closed so
  // the ring visibly completes on the last link.
  const nextAt = links[activeIdx + 1]?.atSeconds ?? null;
  const segProgress =
    active && nextAt !== null
      ? interpolate(t, [active.atSeconds, nextAt], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : active
        ? interpolate(t, [active.atSeconds, active.atSeconds + 2.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : 0;
  const drawn = n > 0 ? (activeIdx + segProgress) / n : 0;

  const SVG = 720;
  const c = SVG / 2;
  const circumference = 2 * Math.PI * radius;

  const pop = active
    ? spring({
        frame: Math.round((t - active.atSeconds) * fps),
        fps,
        config: { damping: 200, stiffness: 210 },
        durationInFrames: 8,
      })
    : 0;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* objectFit MUST be a prop — @remotion/media ignores it in style. */}
      <Video
        src={staticFile(videoSrc)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: centerY - SVG / 2,
            left: (1080 - SVG) / 2,
            width: SVG,
            height: SVG,
          }}
        >
          <svg viewBox={`0 0 ${SVG} ${SVG}`} style={{ width: "100%", height: "100%" }}>
            {/* unlit track */}
            <circle
              cx={c}
              cy={c}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={7}
            />
            {/* the arc that has been "earned" so far */}
            <circle
              cx={c}
              cy={c}
              r={radius}
              fill="none"
              stroke={ACCENT}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - drawn)}
              transform={`rotate(-90 ${c} ${c})`}
              style={{ filter: `drop-shadow(0 0 12px ${GLOW})` }}
            />
            {links.map((l, i) => {
              const a = angleOf(i);
              const x = c + Math.cos(a) * radius;
              const y = c + Math.sin(a) * radius;
              const passed = i <= activeIdx;
              const isActive = i === activeIdx;
              return (
                <g key={l.text + i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 20 : 12}
                    fill={passed ? ACCENT : "rgba(20,20,24,0.9)"}
                    stroke={passed ? "#fff" : "rgba(255,255,255,0.4)"}
                    strokeWidth={isActive ? 6 : 4}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* current link, named in the middle of the ring where it reads */}
        {active ? (
          <div
            style={{
              position: "absolute",
              top: centerY - 90,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              padding: "0 300px",
              transform: `scale(${interpolate(pop, [0, 1], [0.9, 1])})`,
              opacity: pop,
            }}
          >
            <div
              style={{
                fontFamily: anton,
                fontSize: 56,
                lineHeight: 1.04,
                color: "#fff",
                textTransform: "uppercase",
                textAlign: "center",
                letterSpacing: 1,
                textShadow:
                  "-2px -2px 0 rgba(0,0,0,0.8), 2px -2px 0 rgba(0,0,0,0.8), -2px 2px 0 rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,0.8), 0 8px 22px rgba(0,0,0,0.7)",
              }}
            >
              {active.text}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
