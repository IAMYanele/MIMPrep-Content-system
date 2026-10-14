import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Aside, BONE, DIM, DISPLAY, Field, Hero, INK, RED } from "../canvas";

const NODES = ["IDENTITY", "HABIT", "OUTCOME"];

const Node: React.FC<{ label: string; lit: number }> = ({ label, lit }) => (
  <div
    style={{
      width: 400,
      padding: "34px 0",
      textAlign: "center",
      border: `4px solid ${lit > 0.5 ? BONE : "rgba(244,240,232,0.26)"}`,
      background: lit > 0.5 ? "rgba(244,240,232,0.06)" : "transparent",
      fontFamily: DISPLAY,
      fontSize: 62,
      color: lit > 0.5 ? BONE : DIM,
    }}
  >
    {label}
  </div>
);

/** An arrow that can run either way, and strains when it runs the wrong way. */
const Arrow: React.FC<{ flip: number; strain: number; frame: number }> = ({
  flip,
  strain,
  frame,
}) => {
  // the backwards arrow judders; the forwards one is still
  const shake = strain * Math.sin(frame * 0.9) * 7;
  const colour = flip > 0.5 ? BONE : RED;
  return (
    <div
      style={{
        width: 170,
        display: "flex",
        justifyContent: "center",
        transform: `translateX(${shake}px) perspective(900px) rotateY(${(1 - flip) * 180}deg)`,
      }}
    >
      <svg width="140" height="54" viewBox="0 0 140 54">
        <line x1="4" y1="27" x2="112" y2="27" stroke={colour} strokeWidth={9} strokeLinecap="round" />
        <path d="M108,8 L138,27 L108,46 Z" fill={colour} />
      </svg>
    </div>
  );
};

/**
 * [42]-[45] RED — the whole idea is a direction, so the visual performs the
 * reversal: the chain strains while it runs outcome-first, then flips and settles.
 */
export const ArrowFlip: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const flip = interpolate(t, [4.9, 5.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strain = interpolate(t, [1.0, 1.6, 4.6, 5.0], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // whichever end is driving is the lit one
  const litLeft = flip;
  const litRight = 1 - flip;

  return (
    <Field tint="#1C1D22">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Node label={NODES[0]} lit={litLeft} />
          <Arrow flip={flip} strain={strain} frame={frame} />
          <Node label={NODES[1]} lit={0.6} />
          <Arrow flip={flip} strain={strain} frame={frame} />
          <Node label={NODES[2]} lit={litRight} />
        </div>
      </AbsoluteFill>

      {/* the verdict on each direction */}
      <div
        style={{
          position: "absolute",
          bottom: 210,
          width: "100%",
          textAlign: "center",
          opacity: 1 - flip,
        }}
      >
        <span style={{ fontFamily: DISPLAY, fontSize: 92, color: RED }}>BACKWARDS</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 210,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: flip,
        }}
      >
        <Hero at={5.9} size={92} colour={BONE}>
          IDENTITY FIRST
        </Hero>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 118,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(t, [6.6, 7.1], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <Aside at={6.6} size={58} rotate={-2}>
          no willpower required
        </Aside>
      </div>
    </Field>
  );
};

/**
 * [50]-[51] BLUE — the emotional beat. Warm, unremarkable, no effort on display:
 * just the kind of person you decided to be, doing the thing on an ordinary day.
 */
export const OrdinaryTuesday: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const push = interpolate(t, [0, dur], [1.04, 1.16], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Img
          src={staticFile("thomas/tuesday.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // the source is neutral-cool; the beat is supposed to feel like
            // morning light, so warm it at the source rather than only in the wash
            filter: "sepia(0.26) saturate(1.3) contrast(1.04) brightness(1.06)",
          }}
        />
      </AbsoluteFill>
      {/* warm grade + falloff so it sits inside the canvas rather than on top of it */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(255,186,96,0.20) 0%, rgba(14,14,16,0.06) 40%, rgba(14,14,16,0.82) 100%)",
        }}
      />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 110px rgba(0,0,0,0.6)" }} />
      <div
        style={{
          position: "absolute",
          bottom: 132,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Hero at={1.4} size={104} colour={BONE}>
          AN ORDINARY TUESDAY
        </Hero>
      </div>
    </AbsoluteFill>
  );
};
