import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Aside, Base, BONE, DIM, DISPLAY, Field, Hero, RED, usePop } from "../canvas";
import { Panel, Label } from "./compounding";
import { UI_W, UI_X } from "./intro";

const PROBLEMS = ["EVERYONE HAS IT", "IT'S TEMPORARY", "HAPPINESS ON HOLD"];

/**
 * [28] / [30] / [34] YELLOW — the three problems with goal-first thinking. The list
 * rebuilds each time with one more item, so the viewer sees progress through it;
 * earlier items stay visible but dim.
 */
export const Problems: React.FC<{ upto: number; from: number; dur: number }> = ({
  upto,
  from,
}) => {
  const pop = usePop(0.1, 110);
  // only the newest item animates; the hook must not live inside the map
  const land = usePop(0.4, 120);
  return (
    <AbsoluteFill>
      <Base from={from} />
      <div
        style={{
          position: "absolute",
          left: UI_X,
          top: 232,
          width: UI_W,
          opacity: pop,
          transform: `translateX(${(1 - pop) * 48}px)`,
        }}
      >
        <Panel>
          <Label>THE PROBLEM WITH GOALS</Label>
          {PROBLEMS.slice(0, upto).map((p, i) => {
            const isNew = i === upto - 1;
            return (
              <div
                key={p}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  marginTop: i === 0 ? 10 : 18,
                  opacity: (isNew ? land : 1) * (isNew ? 1 : 0.42),
                  transform: `translateY(${(1 - (isNew ? land : 1)) * 16}px)`,
                }}
              >
                <span style={{ fontFamily: DISPLAY, fontSize: 46, color: RED }}>{i + 1}</span>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 42,
                    lineHeight: 1.04,
                    color: BONE,
                  }}
                >
                  {p}
                </span>
              </div>
            );
          })}
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

/** [31]-[32] RED — the score lands, and the goal expires the same day. */
export const SevenHundred: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const sweep = interpolate(t, [0.5, 3.4], [200, 700], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 200-800 maps onto a 240-degree dial
  const angle = interpolate(sweep, [200, 800], [-120, 120]);
  const score = Math.round(sweep);
  const dark = interpolate(t, [5.0, 6.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const R = 300;
  const arc = (a0: number, a1: number) => {
    const pt = (a: number) => {
      const r = ((a - 90) * Math.PI) / 180;
      return [960 + R * Math.cos(r), 620 + R * Math.sin(r)];
    };
    const [x0, y0] = pt(a0);
    const [x1, y1] = pt(a1);
    return `M${x0},${y0} A${R},${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
  };

  return (
    <Field tint="#1D1E1A">
      <AbsoluteFill style={{ filter: `saturate(${1 - dark * 0.9}) brightness(${1 - dark * 0.55})` }}>
        <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <path d={arc(-120, 120)} fill="none" stroke="rgba(244,240,232,0.13)" strokeWidth={26} />
          <path
            d={arc(-120, angle)}
            fill="none"
            stroke={RED}
            strokeWidth={26}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 470,
            width: "100%",
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 230,
            color: BONE,
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div
          style={{
            position: "absolute",
            top: 716,
            width: "100%",
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 42,
            letterSpacing: 5,
            color: DIM,
          }}
        >
          GMAT
        </div>
      </AbsoluteFill>

      {/* the goal is done the day it is hit */}
      {t > 6.0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end" }}>
          <div style={{ marginBottom: 150 }}>
            <Aside at={6.1} size={92} rotate={-2}>
              …now what?
            </Aside>
          </div>
        </AbsoluteFill>
      ) : null}
    </Field>
  );
};

/** [36]-[37] RED — every identical day between now and the letter, stamped. */
export const HoldingPattern: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const DAYS = 126;
  const shown = Math.floor(
    interpolate(t, [0.5, 4.2], [0, DAYS], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );

  return (
    <Field tint="#1A1B20">
      <div
        style={{
          position: "absolute",
          top: 118,
          left: 180,
          fontFamily: DISPLAY,
          fontSize: 44,
          color: DIM,
          letterSpacing: 2,
        }}
      >
        TODAY
      </div>
      <div
        style={{
          position: "absolute",
          top: 118,
          right: 180,
          fontFamily: DISPLAY,
          fontSize: 44,
          color: RED,
          letterSpacing: 2,
        }}
      >
        THE ADMIT LETTER
      </div>

      <div
        style={{
          position: "absolute",
          top: 210,
          left: 180,
          right: 180,
          display: "grid",
          gridTemplateColumns: "repeat(21, 1fr)",
          gap: 12,
        }}
      >
        {Array.from({ length: DAYS }, (_, i) => (
          <div
            key={i}
            style={{
              height: 68,
              background: i < shown ? "rgba(244,240,232,0.12)" : "transparent",
              border: `2px solid rgba(244,240,232,${i < shown ? 0.16 : 0.05})`,
              borderRadius: 3,
            }}
          />
        ))}
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ marginTop: 180 }}>
          <Hero at={4.6} size={210} colour={BONE}>
            WAITING
          </Hero>
        </div>
      </AbsoluteFill>
    </Field>
  );
};

/** [38]-[39] YELLOW — the section's payoff, three characters wide. */
export const SystemOverOutcome: React.FC<{ from: number; dur: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pop = usePop(0.1, 110);
  const fade = interpolate(t, [2.2, 3.2], [1, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spin = interpolate(t, [1.4, 6], [0, 360], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <Base from={from} />
      <div
        style={{
          position: "absolute",
          left: UI_X,
          top: 300,
          width: UI_W,
          opacity: pop,
          transform: `translateX(${(1 - pop) * 48}px)`,
        }}
      >
        <Panel>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 62,
              color: DIM,
              opacity: fade,
              textDecoration: "line-through",
              textDecorationColor: RED,
            }}
          >
            THE OUTCOME
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 18,
            }}
          >
            <svg width="54" height="54" viewBox="0 0 54 54" style={{ transform: `rotate(${spin}deg)` }}>
              <path
                d="M27,6 A21,21 0 1 1 10,16"
                fill="none"
                stroke={RED}
                strokeWidth={6}
                strokeLinecap="round"
              />
              <path d="M27,0 L27,13 L16,6 Z" fill={RED} />
            </svg>
            <span style={{ fontFamily: DISPLAY, fontSize: 74, color: BONE }}>THE SYSTEM</span>
          </div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
