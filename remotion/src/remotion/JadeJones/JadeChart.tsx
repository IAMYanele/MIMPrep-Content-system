// ─────────────────────────────────────────────────────────────
// JadeChart — a drawn line chart for the beats that are really a NUMBER.
//
// Built for "You don't need to walk after every meal", where the payoff line is
// "your muscles will pull excess glucose from your blood". Stock footage of red
// blood cells doesn't show that — it shows generic biology. A post-meal glucose
// curve with and without the walk shows the actual claim: same meal, lower peak.
// (Free stock for "glucose" returns literally zero results — verified.)
//
// Curves draw left-to-right as she speaks, so the drop is revealed rather than
// just presented. Chart sits BELOW the caption line.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
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

export const jadeChartSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  broll: z.array(brollSchema).default([]),
  chartFromSeconds: z.number(),
  chartDurationInSeconds: z.number(),
  topY: z.number().default(1195),
  // peak height of each curve, 0..1 of the plot area
  highPeak: z.number().default(0.92),
  lowPeak: z.number().default(0.42),
  highLabel: z.string().default("NO WALK"),
  lowLabel: z.string().default("10-MIN WALK"),
  title: z.string().default("BLOOD SUGAR AFTER A MEAL"),
});
export type JadeChartProps = z.infer<typeof jadeChartSchema>;

export const calculateJadeChartMetadata: CalculateMetadataFunction<JadeChartProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const W = 900;
const H = 430;
const PAD_L = 60;
const PAD_R = 40;
const PAD_T = 40;
const PAD_B = 60;
const RED = "#FF4D4D";
const GREEN = "#3DDC84";

// A post-meal glucose response: flat, sharp rise, rounded peak, slower fall.
const curvePoints = (peak: number) => {
  const x0 = PAD_L;
  const x1 = W - PAD_R;
  const yBase = H - PAD_B;
  const yTop = PAD_T;
  const pts: string[] = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const x = x0 + f * (x1 - x0);
    // gaussian bump centred at ~35% along, with a longer tail
    const mu = 0.34;
    const sigma = f < mu ? 0.13 : 0.24;
    const bump = Math.exp(-((f - mu) ** 2) / (2 * sigma ** 2));
    const y = yBase - bump * peak * (yBase - yTop);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

export const JadeChart: React.FC<JadeChartProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  broll,
  chartFromSeconds,
  chartDurationInSeconds,
  topY,
  highPeak,
  lowPeak,
  highLabel,
  lowLabel,
  title,
}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  const on = t >= chartFromSeconds && t < chartFromSeconds + chartDurationInSeconds;
  // red draws first, green follows — you see the spike, then the fix
  const p = interpolate(
    t,
    [chartFromSeconds, chartFromSeconds + chartDurationInSeconds * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const p2 = interpolate(
    t,
    [chartFromSeconds + chartDurationInSeconds * 0.32, chartFromSeconds + chartDurationInSeconds * 0.8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const LEN = 1400; // longer than any path, so dashoffset fully hides it

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* objectFit MUST be a prop — @remotion/media ignores it in style. */}
      <Video
        src={staticFile(videoSrc)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

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
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {on ? (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              top: topY,
              left: (1080 - W) / 2,
              width: W,
              height: H + 90,
            }}
          >
            <div
              style={{
                fontFamily: anton,
                fontSize: 38,
                color: "#fff",
                textAlign: "center",
                letterSpacing: 1,
                marginBottom: 8,
                textShadow: "0 4px 14px rgba(0,0,0,0.8)",
              }}
            >
              {title}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
              <rect
                x={PAD_L - 22}
                y={PAD_T - 22}
                width={W - PAD_L - PAD_R + 44}
                height={H - PAD_T - PAD_B + 44}
                rx={20}
                fill="rgba(8,8,10,0.62)"
              />
              {/* baseline */}
              <line
                x1={PAD_L}
                y1={H - PAD_B}
                x2={W - PAD_R}
                y2={H - PAD_B}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={3}
              />
              <polyline
                points={curvePoints(highPeak)}
                fill="none"
                stroke={RED}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={LEN}
                strokeDashoffset={LEN * (1 - p)}
                style={{ filter: "drop-shadow(0 0 10px rgba(255,77,77,0.5))" }}
              />
              <polyline
                points={curvePoints(lowPeak)}
                fill="none"
                stroke={GREEN}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={LEN}
                strokeDashoffset={LEN * (1 - p2)}
                style={{ filter: "drop-shadow(0 0 10px rgba(61,220,132,0.5))" }}
              />
            </svg>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 28,
                marginTop: 2,
              }}
            >
              {[
                { c: RED, s: highLabel, o: p > 0.15 ? 1 : 0 },
                { c: GREEN, s: lowLabel, o: p2 > 0.15 ? 1 : 0 },
              ].map((l) => (
                <div
                  key={l.s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    opacity: l.o,
                    background: "rgba(8,8,10,0.78)",
                    border: `2px solid ${l.c}`,
                    borderRadius: 12,
                    padding: "8px 18px 10px",
                  }}
                >
                  <div style={{ width: 22, height: 6, borderRadius: 3, background: l.c }} />
                  <div
                    style={{
                      fontFamily: anton,
                      fontSize: 32,
                      color: "#fff",
                      letterSpacing: 1,
                    }}
                  >
                    {l.s}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
