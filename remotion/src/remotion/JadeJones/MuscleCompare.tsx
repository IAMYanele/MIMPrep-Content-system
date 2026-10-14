// ─────────────────────────────────────────────────────────────
// MuscleCompare — for "Muscle loss doesn't start at seventy".
//
// The script walks four states: a 30-year-old who lifts, a 30-year-old who
// doesn't, then the same two at 70. Spoken, that's four abstractions in nine
// seconds. The client's reference shows it the way it actually lands: two leg
// cross-sections side by side, dense red muscle versus muscle shot through
// with fat.
//
// No honest free stock exists for this (checked Pexels, Pixabay, Openverse and
// Wikimedia — you get anatomy plates, a massage, and a steak), so the sections
// are DRAWN as a schematic diagram rather than passed off as real scan imagery.
// Marbling is seeded, so it's identical on every frame and every re-render.
//
// Cards use the established compositing: white border, rounded, drop shadow,
// Anton label pill beneath — and they sit BELOW the caption line so the text
// stays under her chin.
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
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { JadeCaptions } from "./JadeCaptions";

const anton = loadAnton().fontFamily;

// One state of one leg. `img` is a REAL axial thigh MRI (preferred — the client
// wants actual medical imagery, not a diagram); `fat` only drives the drawn
// fallback for when no licensed scan exists for that state.
const stateSchema = z.object({
  atSeconds: z.number(),
  fat: z.number(), // 0..1, drawn fallback only
  label: z.string(),
  img: z.string().default(""),
});

export const muscleCompareSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  left: z.array(stateSchema).default([]),
  right: z.array(stateSchema).default([]),
  clearAtSeconds: z.number(),
  rowTop: z.number().default(1215),
  cardW: z.number().default(452),
});
export type MuscleCompareProps = z.infer<typeof muscleCompareSchema>;

export const calculateMuscleCompareMetadata: CalculateMetadataFunction<
  MuscleCompareProps
> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const GAP = 36;

// Deterministic PRNG — same marbling every frame, no flicker between renders.
const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
};

// A thigh in cross-section: fascia ring, muscle body, femur, and fat marbling
// whose density is driven by `fat`.
const CrossSection: React.FC<{ fat: number; seed: number }> = ({ fat, seed }) => {
  const R = 150;
  const C = 160;
  const rand = seeded(seed);

  // more fat -> more, larger, paler inclusions and a duller muscle red
  const blobs = Math.round(interpolate(fat, [0, 1], [10, 62]));
  const muscle = `hsl(352, ${interpolate(fat, [0, 1], [62, 34])}%, ${interpolate(
    fat,
    [0, 1],
    [30, 42],
  )}%)`;

  const marbling = Array.from({ length: blobs }, (_, i) => {
    // rejection-free polar placement, biased outward where fat actually sits
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * (R - 26);
    const rx = interpolate(fat, [0, 1], [2.2, 5.4]) * (0.6 + rand());
    const ry = rx * (0.5 + rand() * 0.9);
    return (
      <ellipse
        key={i}
        cx={C + Math.cos(a) * rr}
        cy={C + Math.sin(a) * rr}
        rx={rx}
        ry={ry}
        fill="#F3E9DC"
        opacity={0.55 + rand() * 0.4}
        transform={`rotate(${rand() * 180} ${C + Math.cos(a) * rr} ${
          C + Math.sin(a) * rr
        })`}
      />
    );
  });

  // faint radial fibre striations so it reads as muscle, not a flat disc
  const fibres = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2;
    return (
      <line
        key={i}
        x1={C + Math.cos(a) * 34}
        y1={C + Math.sin(a) * 34}
        x2={C + Math.cos(a) * (R - 12)}
        y2={C + Math.sin(a) * (R - 12)}
        stroke="#000"
        strokeOpacity={0.12}
        strokeWidth={2}
      />
    );
  });

  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%", display: "block" }}>
      <circle cx={C} cy={C} r={R} fill="#E8C9A8" />
      <circle cx={C} cy={C} r={R - 12} fill={muscle} />
      {fibres}
      {marbling}
      {/* femur */}
      <circle cx={C} cy={C + 16} r={26} fill="#FBF6EE" />
      <circle cx={C} cy={C + 16} r={26} fill="none" stroke="#D9CDBB" strokeWidth={3} />
      <circle cx={C} cy={C} r={R} fill="none" stroke="#C9A882" strokeWidth={4} />
    </svg>
  );
};

const Card: React.FC<{
  fat: number;
  label: string;
  seed: number;
  cardW: number;
  pop: number;
  img?: string;
}> = ({ fat, label, seed, cardW, pop, img }) => (
  <div
    style={{
      width: cardW,
      transform: `scale(${interpolate(pop, [0, 1], [0.88, 1])})`,
      opacity: interpolate(pop, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
    }}
  >
    <div
      style={{
        width: cardW,
        height: cardW,
        borderRadius: 26,
        overflow: "hidden",
        background: "#1b1b1e",
        border: "7px solid #fff",
        boxShadow: "0 14px 38px rgba(0,0,0,0.55)",
      }}
    >
      {img ? (
        <Img src={staticFile(img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <CrossSection fat={fat} seed={seed} />
      )}
    </div>
    <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: anton,
          fontSize: 40,
          lineHeight: 1.05,
          color: "#fff",
          textTransform: "uppercase",
          background: "rgba(8,8,10,0.78)",
          padding: "12px 24px 14px",
          borderRadius: 14,
          border: "2px solid rgba(255,255,255,0.22)",
          textAlign: "center",
          letterSpacing: 1,
          maxWidth: cardW,
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

export const MuscleCompare: React.FC<MuscleCompareProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  left,
  right,
  clearAtSeconds,
  rowTop,
  cardW,
}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  // current state of each leg = the last entry whose cue has passed
  const pick = (states: typeof left) => {
    const passed = states.filter((s) => t >= s.atSeconds);
    return passed.length ? passed[passed.length - 1] : null;
  };
  const L = pick(left);
  const Rt = pick(right);

  const popFor = (s: { atSeconds: number } | null) =>
    s
      ? spring({
          frame: Math.round((t - s.atSeconds) * fps),
          fps,
          config: { damping: 200, stiffness: 200 },
          durationInFrames: 8,
        })
      : 0;

  const leave = interpolate(t, [clearAtSeconds, clearAtSeconds + 0.3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* objectFit MUST be a prop — @remotion/media ignores it in style. */}
      <Video
        src={staticFile(videoSrc)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      {leave > 0 && (L || Rt) ? (
        <AbsoluteFill style={{ opacity: leave }}>
          <div
            style={{
              position: "absolute",
              top: rowTop,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: GAP,
            }}
          >
            {L ? (
              <Card fat={L.fat} label={L.label} seed={11} cardW={cardW} pop={popFor(L)} img={L.img} />
            ) : (
              <div style={{ width: cardW }} />
            )}
            {Rt ? (
              <Card fat={Rt.fat} label={Rt.label} seed={97} cardW={cardW} pop={popFor(Rt)} img={Rt.img} />
            ) : (
              <div style={{ width: cardW }} />
            )}
          </div>
        </AbsoluteFill>
      ) : null}

      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
