// ─────────────────────────────────────────────────────────────
// BellySixPack — Jade "belly fat vs six pack" food quiz.
// An AI voiceover (ElevenLabs "Lily") NAMES each of 14 foods while
// Jade stands still; then we hard-cut to Jade's OWN footage where
// she points and says the verdict ("belly fat" / "six pack"), with
// a red / green stamp. Belly-fat foods use her soft-belly shots,
// six-pack foods use her abs shots — matched state per food so the
// cuts read as intentional, not jarring.
//
// Per item: [food beat] neutral stand + AI food-name audio + food
// label, then [verdict beat] her pointing clip + colored stamp.
// The AI verdict word was cut out of every snippet; the verdict is
// always Jade's real voice + footage.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  Audio,
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

const anton = loadAnton().fontFamily;

const itemSchema = z.object({
  food: z.string(),
  verdict: z.enum(["belly", "six"]),
  aiSrc: z.string(),
  aiDur: z.number(),
  neutralSrc: z.string(),
  verdictSrc: z.string(),
  verdictDur: z.number(),
});
export type BellyItem = z.infer<typeof itemSchema>;

export const bellySixSchema = z.object({
  fps: z.number().default(25),
  foodPad: z.number().default(0.3),
  aiLead: z.number().default(0.06),
  foodY: z.number().default(1140),
  stampY: z.number().default(1380),
  items: z.array(itemSchema),
});
export type BellySixProps = z.infer<typeof bellySixSchema>;

const beatFrames = (p: BellySixProps) =>
  p.items.map((it) => ({
    food: Math.round((it.aiDur + p.foodPad) * p.fps),
    verdict: Math.round(it.verdictDur * p.fps),
  }));

export const calculateBellySixMetadata: CalculateMetadataFunction<
  BellySixProps
> = ({ props }) => ({
  durationInFrames: beatFrames(props).reduce(
    (a, b) => a + b.food + b.verdict,
    0,
  ),
  fps: props.fps,
  width: 1080,
  height: 1920,
});

const FoodLabel: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 260 },
    durationInFrames: 8,
  });
  return (
    <div
      style={{
        transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        opacity: s,
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
          fontSize: 80,
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
};

const Stamp: React.FC<{ verdict: "belly" | "six" }> = ({ verdict }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.7 },
    durationInFrames: 14,
  });
  const belly = verdict === "belly";
  const color = belly ? "#ff4747" : "#22d07a";
  const label = belly ? "BELLY FAT" : "SIX PACK";
  const mark = belly ? "✕" : "✓";
  return (
    <div
      style={{
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])}) rotate(${interpolate(s, [0, 1], [-4, 0])}deg)`,
        opacity: interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" }),
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "20px 54px 26px",
        borderRadius: 22,
        background: belly ? "rgba(150,20,20,0.32)" : "rgba(12,110,60,0.32)",
        border: `4px solid ${color}`,
        boxShadow: `0 16px 46px rgba(0,0,0,0.5), 0 0 44px ${belly ? "rgba(255,71,71,0.4)" : "rgba(34,208,122,0.4)"}`,
      }}
    >
      <span style={{ fontFamily: anton, fontSize: 92, color, lineHeight: 1 }}>
        {mark}
      </span>
      <span
        style={{
          fontFamily: anton,
          fontSize: 118,
          color: "#fff",
          textTransform: "uppercase",
          lineHeight: 1,
          letterSpacing: 1,
          textShadow: "0 3px 14px rgba(0,0,0,0.55)",
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const BellySixPack: React.FC<BellySixProps> = (props) => {
  const { items, fps, aiLead, foodY, stampY } = props;
  const frames = beatFrames(props);
  const leadF = Math.round(aiLead * fps);
  let cursor = 0;
  const blocks: React.ReactNode[] = [];

  items.forEach((it, i) => {
    const f = frames[i];
    const start = cursor;
    blocks.push(
      <Sequence
        key={`item-${i}`}
        from={start}
        durationInFrames={f.food + f.verdict}
        name={it.food}
      >
        {/* Food beat: neutral stand + AI names the food */}
        <Sequence from={0} durationInFrames={f.food} name="food">
          <AbsoluteFill style={{ background: "#000" }}>
            <Video
              src={staticFile(it.neutralSrc)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
          <Sequence from={leadF} name="ai">
            <Audio src={staticFile(it.aiSrc)} />
          </Sequence>
        </Sequence>

        {/* Verdict beat: Jade's clip + stamp */}
        <Sequence from={f.food} durationInFrames={f.verdict} name="verdict">
          <AbsoluteFill style={{ background: "#000" }}>
            <Video
              src={staticFile(it.verdictSrc)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
            <div style={{ marginTop: stampY }}>
              <Stamp verdict={it.verdict} />
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* Food label persists across the whole item */}
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
          <div style={{ marginTop: foodY }}>
            <FoodLabel text={it.food} />
          </div>
        </AbsoluteFill>
      </Sequence>,
    );
    cursor += f.food + f.verdict;
  });

  return <AbsoluteFill style={{ background: "#000" }}>{blocks}</AbsoluteFill>;
};
