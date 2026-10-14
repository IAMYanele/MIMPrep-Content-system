import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Base, BONE, DIM, DISPLAY, Field, Hero, RED, usePop } from "../canvas";
import { Label, Panel } from "./compounding";
import { UI_W, UI_X } from "./intro";

const CX = 960;
const CY = 540;
const R = 300;

const LOOP = ["CUE", "CRAVING", "RESPONSE", "REWARD"];
// top, right, bottom, left
const ANGLES = [-90, 0, 90, 180];

const pt = (deg: number, r = R) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};

/** [54]-[56] RED — the four-part loop draws on and closes on "locks it in". */
export const HabitLoop: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // each quarter of the ring draws between its two nodes
  const segs = [0, 1, 2, 3].map((i) =>
    interpolate(t, [1.0 + i * 1.15, 1.75 + i * 1.15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const arcLen = (Math.PI * 2 * R) / 4;

  return (
    <Field tint="#1D1A20">
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(244,240,232,0.10)" strokeWidth={14} />
        {segs.map((p, i) => {
          const a0 = ANGLES[i];
          const [x0, y0] = pt(a0);
          const [x1, y1] = pt(a0 + 90);
          return (
            <path
              key={i}
              d={`M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}`}
              fill="none"
              stroke={RED}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={arcLen}
              strokeDashoffset={arcLen * (1 - p)}
            />
          );
        })}
      </svg>

      {LOOP.map((name, i) => {
        const [x, y] = pt(ANGLES[i], R);
        const show = interpolate(t, [0.75 + i * 1.15, 1.1 + i * 1.15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%,-50%) scale(${interpolate(show, [0, 1], [0.8, 1])})`,
              opacity: show,
              background: BONE,
              color: "#0E0E10",
              fontFamily: DISPLAY,
              fontSize: 46,
              padding: "14px 30px",
              boxShadow: "0 14px 34px rgba(0,0,0,0.6)",
            }}
          >
            {name}
          </div>
        );
      })}

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            opacity: interpolate(t, [5.6, 6.2], [0, 1], { extrapolateRight: "clamp" }),
            textAlign: "center",
          }}
        >
          {/* two lines, so it sits inside the ring instead of running under the
              CRAVING and REWARD chips */}
          <Hero at={5.6} size={58} colour={DIM}>
            EVERY
            <br />
            HABIT
          </Hero>
        </div>
      </AbsoluteFill>
    </Field>
  );
};

type LeverSpec = { n: number; title: string; graphic: React.FC<{ t: number }> };

/** Lever 1 — the cue. Where the book physically sits decides whether you open it. */
const ObviousGraphic: React.FC<{ t: number }> = ({ t }) => {
  const swap = interpolate(t, [1.6, 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Row text="BURIED IN A DRAWER" lit={1 - swap} struck />
      <Row text="OPEN ON THE DESK" lit={swap} />
      <Row text="PHONE, ANOTHER ROOM" lit={interpolate(t, [3.0, 3.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </>
  );
};

/** Lever 2 — pair the hard thing with something you already want. */
const AttractiveGraphic: React.FC<{ t: number }> = ({ t }) => {
  const a = interpolate(t, [1.3, 1.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const b = interpolate(t, [2.3, 2.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
      <Chip text="QUANT DRILL" lit={a} />
      <span style={{ fontFamily: DISPLAY, fontSize: 48, color: RED, opacity: b }}>+</span>
      <Chip text="THE GOOD COFFEE" lit={b} />
    </div>
  );
};

/** Lever 3 — friction is the whole reason you keep not starting. */
const EasyGraphic: React.FC<{ t: number }> = ({ t }) => {
  const drop = interpolate(t, [1.2, 3.4], [1, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ marginTop: 14 }}>
      <Label>FRICTION</Label>
      <div style={{ height: 30, background: "rgba(244,240,232,0.10)", borderRadius: 3 }}>
        <div style={{ width: `${drop * 100}%`, height: "100%", background: RED, borderRadius: 3 }} />
      </div>
      <div style={{ marginTop: 20, fontFamily: DISPLAY, fontSize: 32, color: DIM, lineHeight: 1.3 }}>
        TIMER · ANSWER SHEET · QUIET ROOM
        <br />
        SET OUT THE NIGHT BEFORE
      </div>
    </div>
  );
};

/** Lever 4 — the reward has to arrive today, not in six months. */
const SatisfyingGraphic: React.FC<{ t: number }> = ({ t }) => {
  const ticks = Math.floor(
    interpolate(t, [1.0, 4.4], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  return (
    <div style={{ marginTop: 10 }}>
      <Label>SESSION LOG</Label>
      <div style={{ display: "flex", gap: 10 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 50,
              height: 50,
              border: `3px solid ${i < ticks ? RED : "rgba(244,240,232,0.20)"}`,
              background: i < ticks ? RED : "transparent",
              color: "#0E0E10",
              fontFamily: DISPLAY,
              fontSize: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {i < ticks ? "✓" : ""}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, fontFamily: DISPLAY, fontSize: 32, color: DIM, lineHeight: 1.3 }}>
        TODAY, NOT IN SIX MONTHS
      </div>
    </div>
  );
};

const Row: React.FC<{ text: string; lit: number; struck?: boolean }> = ({ text, lit, struck }) => (
  <div
    style={{
      fontFamily: DISPLAY,
      fontSize: 38,
      marginTop: 14,
      color: lit > 0.5 ? BONE : DIM,
      opacity: 0.35 + lit * 0.65,
      textDecoration: struck && lit < 0.5 ? "line-through" : undefined,
      textDecorationColor: RED,
    }}
  >
    {text}
  </div>
);

const Chip: React.FC<{ text: string; lit: number }> = ({ text, lit }) => (
  <div
    style={{
      border: `3px solid ${RED}`,
      padding: "12px 16px",
      fontFamily: DISPLAY,
      fontSize: 30,
      color: BONE,
      opacity: lit,
      transform: `scale(${interpolate(lit, [0, 1], [0.86, 1])})`,
    }}
  >
    {text}
  </div>
);

export const LEVERS: LeverSpec[] = [
  { n: 1, title: "MAKE IT OBVIOUS", graphic: ObviousGraphic },
  { n: 2, title: "MAKE IT ATTRACTIVE", graphic: AttractiveGraphic },
  { n: 3, title: "MAKE IT EASY", graphic: EasyGraphic },
  { n: 4, title: "MAKE IT SATISFYING", graphic: SatisfyingGraphic },
];

/** [57]/[63]/[68]/[72] YELLOW — one lever per card, face visible throughout. */
export const Lever: React.FC<{ index: number; from: number; dur: number }> = ({ index, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pop = usePop(0.1, 110);
  const spec = LEVERS[index];
  const Graphic = spec.graphic;

  return (
    <AbsoluteFill>
      <Base from={from} />
      <div
        style={{
          position: "absolute",
          left: UI_X,
          top: 220,
          width: UI_W,
          opacity: pop,
          transform: `translateX(${(1 - pop) * 48}px)`,
        }}
      >
        <Panel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 86, color: RED, lineHeight: 0.9 }}>
              {spec.n}
            </span>
            <span style={{ fontFamily: DISPLAY, fontSize: 52, color: BONE, lineHeight: 1.0 }}>
              {spec.title}
            </span>
          </div>
          <div style={{ height: 3, background: "rgba(244,240,232,0.16)", margin: "20px 0 4px" }} />
          <Graphic t={t} />
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
