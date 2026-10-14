import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Roboto";

// MIM Prep — "The MiM application resource desk" (Mathilde, Script 4).
//
// Rapid question/answer: a frosted glass label carries the question top-left, a glass
// card with the resource sits top-right, and the answer lands as a caption. Matched to
// the V4 reference edit, with the glass pushed harder: real backdrop blur over the
// footage, inner glow, a diagonal light streak and a soft drop shadow on every panel.

const { fontFamily: ROBOTO } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin"] });
const HEAVY = `${ROBOTO}, Arial, Helvetica, sans-serif`;

type Pair = {
  label: string;
  answer: string;
  card: string;
  fit?: "cover" | "contain";
  labelAt: number;   // question spoken
  answerAt: number;  // answer spoken
  until: number;     // when this pair leaves
};

// Timings read off the transcript of the tightened clip.
const PAIRS: Pair[] = [
  { label: "GMAT", answer: "Official starter kit", card: "gmat.png", fit: "contain", labelAt: 0.0, answerAt: 1.6, until: 3.74 },
  { label: "GRE", answer: "POWERPREP", card: "gre.png", fit: "contain", labelAt: 3.74, answerAt: 4.87, until: 6.46 },
  { label: "School research", answer: "Employment reports", card: "research.png", fit: "contain", labelAt: 6.46, answerAt: 7.72, until: 9.46 },
  { label: "Essay stories", answer: "Your evidence bank", card: "evidence.jpg", labelAt: 9.46, answerAt: 10.72, until: 12.58 },
  { label: "Interview practice", answer: "Your camera", card: "camera.jpg", labelAt: 12.58, answerAt: 14.36, until: 15.72 },
  { label: "Deadlines", answer: "One spreadsheet", card: "deadlines.png", fit: "contain", labelAt: 15.72, answerAt: 16.8, until: 18.4 },
];

// One frosted panel recipe, used by every element so the look stays consistent.
const glass = (radius: number): React.CSSProperties => ({
  borderRadius: radius,
  // A touch of dark in the fill so the panel still reads as glass against a bright
  // wall, where a pure backdrop blur has nothing to refract.
  background:
    "linear-gradient(158deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 45%, rgba(10,12,20,0.22) 100%)",
  backdropFilter: "blur(60px) saturate(1.6) contrast(1.05) brightness(1.02)",
  WebkitBackdropFilter: "blur(60px) saturate(1.6) contrast(1.05) brightness(1.02)",
  border: "2px solid rgba(255,255,255,0.62)",
  boxShadow: [
    "inset 0 2px 0 rgba(255,255,255,0.85)",      // top highlight, the lit edge of the glass
    "inset 0 -2px 10px rgba(0,0,0,0.22)",        // bottom inner shadow, gives it thickness
    "inset 0 0 70px rgba(255,255,255,0.20)",     // inner glow
    "0 26px 60px rgba(0,0,0,0.34)",              // soft drop shadow, lifts it off the wall
    "0 2px 6px rgba(0,0,0,0.18)",
  ].join(", "),
  overflow: "hidden",
});

const Streak: React.FC<{ progress: number }> = ({ progress }) => (
  <>
    {/* cool tint — glass is never perfectly neutral */}
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(150deg, rgba(175,205,255,0.16), rgba(255,255,255,0.02) 60%)",
        pointerEvents: "none",
      }}
    />
    {/* specular sweep travelling across on entry */}
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: "-60%",
        bottom: "-60%",
        left: `${interpolate(progress, [0, 1], [-130, 130], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}%`,
        width: "70%",
        background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.75), transparent)",
        filter: "blur(10px)",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
    {/* static diagonal streak so the panel keeps a sheen after the sweep */}
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.5,
        background: "linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.45) 49%, transparent 66%)",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  </>
);

export const ResourceDesk: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill>
        <OffthreadVideo src={staticFile("mim4/base.mp4")} />
      </AbsoluteFill>

      {PAIRS.map((pair) => (
        <PairLayer key={pair.label} pair={pair} frame={frame} fps={fps} t={t} />
      ))}
    </AbsoluteFill>
  );
};

const PairLayer: React.FC<{ pair: Pair; frame: number; fps: number; t: number }> = ({ pair, frame, fps, t }) => {
  if (t < pair.labelAt - 0.25 || t > pair.until + 0.3) return null;

  // Overshoot spring in, quick fade out when the next pair takes over.
  const inSpring = spring({
    frame: frame - Math.round(pair.labelAt * fps),
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 110 },
  });
  const out = interpolate(t, [pair.until - 0.12, pair.until + 0.18], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardSpring = spring({
    frame: frame - Math.round((pair.labelAt + 0.12) * fps),
    fps,
    config: { damping: 13, mass: 0.9, stiffness: 100 },
  });

  const answerSpring = spring({
    frame: frame - Math.round(pair.answerAt * fps),
    fps,
    config: { damping: 11, mass: 0.7, stiffness: 120 },
  });
  const answerShown = t >= pair.answerAt - 0.05;
  // sweep runs over ~0.75s once the panel has popped in
  const sweep = interpolate(t, [pair.labelAt + 0.05, pair.labelAt + 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepCard = interpolate(t, [pair.labelAt + 0.2, pair.labelAt + 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* a soft bloom behind each panel: glass needs light to refract, and the
          ceiling behind her is flat white */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -60,
          top: 150,
          width: 760,
          height: 420,
          opacity: 0.7 * inSpring * out,
          background: "radial-gradient(45% 50% at 42% 52%, rgba(120,170,255,0.55), rgba(120,170,255,0) 70%)",
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -40,
          top: 70,
          width: 620,
          height: 520,
          opacity: 0.6 * cardSpring * out,
          background: "radial-gradient(45% 45% at 58% 50%, rgba(255,186,120,0.45), rgba(255,186,120,0) 70%)",
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />

      {/* question — frosted label, top left */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 250,
          maxWidth: 470,
          opacity: inSpring * out,
          transform: `translateX(${interpolate(inSpring, [0, 1], [-70, 0])}px) scale(${interpolate(
            inSpring,
            [0, 1],
            [0.86, 1],
          )}) rotate(${interpolate(inSpring, [0, 1], [-5, 0])}deg)`,
          transformOrigin: "left center",
        }}
      >
        <div style={{ ...glass(30), padding: "20px 34px", position: "relative" }}>
          <Streak progress={sweep} />
          <span
            style={{
              position: "relative",
              fontFamily: HEAVY,
              fontWeight: 900,
              fontSize: 56,
              lineHeight: 1.08,
              color: "#FFFFFF",
              textShadow: "0 3px 12px rgba(0,0,0,0.45)",
              display: "block",
            }}
          >
            {pair.label}
          </span>
        </div>
      </div>

      {/* resource — glass-framed card, top right */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 168,
          width: 380,
          opacity: cardSpring * out,
          transform: `translateX(${interpolate(cardSpring, [0, 1], [90, 0])}px) scale(${interpolate(
            cardSpring,
            [0, 1],
            [0.82, 1],
          )}) rotate(${interpolate(cardSpring, [0, 1], [7, 0])}deg)`,
          transformOrigin: "right center",
        }}
      >
        <div style={{ ...glass(28), padding: 12, position: "relative" }}>
          <Streak progress={sweepCard} />
          <Img
            src={staticFile(`mim4/cards/${pair.card}`)}
            style={{
              position: "relative",
              display: "block",
              width: "100%",
              height: 290,
              objectFit: pair.fit ?? "cover",
              // screenshots and product shots sit on white so nothing is cropped off
              background: (pair.fit ?? "cover") === "contain" ? "#FFFFFF" : undefined,
              borderRadius: 18,
              boxShadow: "0 8px 22px rgba(0,0,0,0.35)",
            }}
          />
        </div>
      </div>

      {/* answer — in glass too. It lands over her chest, where there is real
          detail behind it, so the frosting actually shows. */}
      {answerShown ? (
        <div
          style={{
            position: "absolute",
            top: 1185,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            opacity: out,
            transform: `scale(${interpolate(answerSpring, [0, 1], [0.86, 1])}) translateY(${interpolate(
              answerSpring,
              [0, 1],
              [26, 0],
            )}px)`,
          }}
        >
          <div style={{ ...glass(26), padding: "18px 38px", position: "relative", maxWidth: 940 }}>
            <Streak progress={interpolate(t, [pair.answerAt + 0.02, pair.answerAt + 0.7], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })} />
            <span
              style={{
                position: "relative",
                fontFamily: HEAVY,
                fontWeight: 900,
                fontSize: pair.answer.length > 18 ? 62 : 72,
                lineHeight: 1.06,
                color: "#FFFFFF",
                textShadow: "0 4px 16px rgba(0,0,0,0.55)",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {pair.answer}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
};
