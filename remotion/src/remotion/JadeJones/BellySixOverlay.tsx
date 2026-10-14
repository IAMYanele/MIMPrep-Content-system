// ─────────────────────────────────────────────────────────────
// BellySixOverlay — graphics layer on TOP of Jade's already-
// composed "belly fat vs six pack" video (AI names each food +
// gives the verdict, in one tight cut). For each food we overlay:
//   • the food name (top pill),
//   • a POPUP PHOTO of the food, under her hips (centered), and
//   • the red-✕ / green-✓ verdict STAMPED over that photo when the
//     verdict is spoken.
// The composed .mp4 (with its own audio) is the untouched base.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
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

const anton = loadAnton().fontFamily;

const itemSchema = z.object({
  food: z.string(),
  img: z.string(),
  verdict: z.enum(["belly", "six"]),
  nameStart: z.number(), // seconds — food is named / photo pops
  verdictStart: z.number(), // seconds — verdict is spoken / stamp hits
  endT: z.number(), // seconds — this food's window ends
  pos: z.string().default("50% 50%"), // photo object-position
});

export const bellyOverlaySchema = z.object({
  videoSrc: z.string(),
  fps: z.number().default(30),
  durationInSeconds: z.number(),
  foodY: z.number().default(54),
  cardTop: z.number().default(1285),
  cardSize: z.number().default(452),
  items: z.array(itemSchema),
});
export type BellyOverlayProps = z.infer<typeof bellyOverlaySchema>;

export const calculateBellyOverlayMetadata: CalculateMetadataFunction<
  BellyOverlayProps
> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
  width: 1080,
  height: 1920,
});

const FoodPill: React.FC<{ text: string; pop: number }> = ({ text, pop }) => (
  <div
    style={{
      transform: `translateY(${interpolate(pop, [0, 1], [24, 0])}px) scale(${interpolate(pop, [0, 1], [0.9, 1])})`,
      opacity: pop,
      padding: "16px 46px 22px",
      borderRadius: 999,
      background: "rgba(8,8,10,0.64)",
      border: "2px solid rgba(255,255,255,0.16)",
      boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
    }}
  >
    <span
      style={{
        fontFamily: anton,
        fontSize: 78,
        letterSpacing: 1,
        color: "#fff",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        lineHeight: 1,
        textShadow: "0 3px 12px rgba(0,0,0,0.5)",
      }}
    >
      {text}
    </span>
  </div>
);

const FoodOverlay: React.FC<{
  item: z.infer<typeof itemSchema>;
  verdictFromF: number;
  foodY: number;
  cardTop: number;
  cardSize: number;
}> = ({ item, verdictFromF, foodY, cardTop, cardSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const belly = item.verdict === "belly";
  const color = belly ? "#ff4747" : "#22d07a";

  const pop = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 200, mass: 0.7 },
    durationInFrames: 14,
  });
  const vpop = spring({
    frame: Math.max(0, frame - verdictFromF),
    fps,
    config: { damping: 11, stiffness: 230, mass: 0.7 },
    durationInFrames: 14,
  });
  const showVerdict = frame >= verdictFromF;

  return (
    <AbsoluteFill>
      {/* Food name — top */}
      <div
        style={{
          position: "absolute",
          top: foodY,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <FoodPill text={item.food} pop={pop} />
      </div>

      {/* Popup food photo — under the hips, centered */}
      <div
        style={{
          position: "absolute",
          top: cardTop,
          left: "50%",
          width: cardSize,
          height: cardSize,
          transform: `translateX(-50%) scale(${interpolate(pop, [0, 1], [0.5, 1])}) rotate(${interpolate(pop, [0, 1], [-5, 0])}deg)`,
          opacity: interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" }),
          borderRadius: 28,
          overflow: "hidden",
          border: "7px solid #fff",
          boxShadow: "0 22px 60px rgba(0,0,0,0.55)",
        }}
      >
        <Img
          src={staticFile(item.img)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: item.pos,
          }}
        />
      </div>

      {/* Verdict — stamped OVER the lower part of the photo */}
      {showVerdict ? (
        <div
          style={{
            position: "absolute",
            top: cardTop + cardSize * 0.6,
            left: "50%",
            transform: `translateX(-50%) scale(${interpolate(vpop, [0, 1], [0.62, 1])}) rotate(${interpolate(vpop, [0, 1], [-4, 0])}deg)`,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "16px 40px 20px",
            borderRadius: 18,
            background: belly ? "rgba(184,22,22,0.92)" : "rgba(14,140,74,0.92)",
            border: `4px solid ${color}`,
            boxShadow: `0 14px 40px rgba(0,0,0,0.55), 0 0 40px ${belly ? "rgba(255,71,71,0.5)" : "rgba(34,208,122,0.5)"}`,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontFamily: anton, fontSize: 70, color: "#fff", lineHeight: 1 }}>
            {belly ? "✕" : "✓"}
          </span>
          <span
            style={{
              fontFamily: anton,
              fontSize: 84,
              color: "#fff",
              textTransform: "uppercase",
              lineHeight: 1,
              letterSpacing: 1,
              textShadow: "0 3px 12px rgba(0,0,0,0.6)",
            }}
          >
            {belly ? "BELLY FAT" : "SIX PACK"}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const BellySixOverlay: React.FC<BellyOverlayProps> = ({
  videoSrc,
  fps,
  foodY,
  cardTop,
  cardSize,
  items,
}) => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Video
        src={staticFile(videoSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {items.map((it, i) => {
        const from = Math.round(it.nameStart * fps);
        const dur = Math.round((it.endT - it.nameStart) * fps);
        const verdictFromF = Math.round((it.verdictStart - it.nameStart) * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={it.food}>
            <FoodOverlay
              item={it}
              verdictFromF={verdictFromF}
              foodY={foodY}
              cardTop={cardTop}
              cardSize={cardSize}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
