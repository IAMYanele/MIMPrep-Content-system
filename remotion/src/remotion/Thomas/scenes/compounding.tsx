import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Aside, Base, BONE, DIM, DISPLAY, Field, Hero, INK, RED, usePop } from "../canvas";
import { UI_W, UI_X } from "./intro";

/** Draws an SVG path on, left to right. */
const Draw: React.FC<{
  d: string;
  len: number;
  at: number;
  dur: number;
  stroke: string;
  width?: number;
  dashed?: boolean;
}> = ({ d, len, at, dur, stroke, width = 7, dashed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame / fps, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (dashed) {
    // a dashed line can't use dashoffset to draw on, so clip it instead
    return (
      <g clipPath="url(#revealClip)">
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeDasharray="20 18"
          strokeLinecap="round"
          style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}
        />
      </g>
    );
  }
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={len}
      strokeDashoffset={len * (1 - p)}
    />
  );
};

/**
 * [10]-[11] RED — the number scene. 365 days tick by, the "365%" guess is struck
 * out, and 37x lands. Numbers are always visualised; this is the biggest one here.
 */
export const ThirtySeven: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // 7 rows x 52 columns is the year-of-days grid everyone already reads; 365 cells
  // in 73 columns rendered as one solid red bar and said nothing.
  const WEEKS = 52;
  const filledDays = Math.floor(
    interpolate(t, [1.1, 4.4], [0, 364], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const strike = interpolate(t, [5.55, 5.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const curve = "M160,330 C620,322 1020,300 1320,232 C1520,186 1640,96 1720,20";

  return (
    <Field tint="#1E1A1A">
      <div style={{ position: "absolute", top: 74, width: "100%", textAlign: "center" }}>
        <Hero at={0.3} size={100}>
          1% BETTER, EVERY DAY
        </Hero>
      </div>

      {/* a year of days, one cell each */}
      <div
        style={{
          position: "absolute",
          top: 232,
          left: 160,
          width: 1600,
          display: "grid",
          gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(7, 1fr)",
          gap: 5,
        }}
      >
        {Array.from({ length: 364 }, (_, i) => (
          <div
            key={i}
            style={{
              height: 25,
              background: i < filledDays ? RED : "rgba(244,240,232,0.09)",
              borderRadius: 2,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 160,
          fontFamily: DISPLAY,
          fontSize: 30,
          letterSpacing: 3,
          color: DIM,
        }}
      >
        365 DAYS
      </div>

      {/* and what they add up to */}
      <svg
        viewBox="0 0 1920 420"
        style={{ position: "absolute", top: 480, left: 0, width: 1920, height: 420 }}
      >
        <line x1="160" y1="330" x2="1760" y2="330" stroke={DIM} strokeWidth={3} />
        <Draw d={curve} len={1900} at={1.1} dur={3.3} stroke={RED} width={9} />
      </svg>

      {/* the guess, then the correction */}
      {t > 4.6 ? (
        <div
          style={{
            position: "absolute",
            bottom: 74,
            left: 160,
            display: "flex",
            alignItems: "baseline",
            gap: 26,
          }}
        >
          <div style={{ position: "relative" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 104, color: DIM }}>365%</span>
            <div
              style={{
                position: "absolute",
                top: "52%",
                left: -10,
                height: 8,
                width: `${strike * 112}%`,
                background: RED,
                transform: "rotate(-4deg)",
              }}
            />
          </div>
          <Aside at={4.8} size={54} rotate={-2}>
            nope
          </Aside>
        </div>
      ) : null}

      {t > 6.0 ? (
        <div style={{ position: "absolute", bottom: 56, right: 170 }}>
          <Hero at={6.05} size={190} colour={BONE}>
            37X
          </Hero>
        </div>
      ) : null}
    </Field>
  );
};

/** [17]-[18] YELLOW — one big push against ninety small ones. The face stays up. */
export const CramVsDaily: React.FC<{ from: number; dur: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pop = usePop(0.1, 110);

  const onePush = interpolate(t, [0.5, 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const daily = Math.floor(
    interpolate(t, [1.5, 5.0], [0, 90], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );

  return (
    <AbsoluteFill>
      <Base from={from} />
      <div
        style={{
          position: "absolute",
          left: UI_X,
          top: 212,
          width: UI_W,
          opacity: pop,
          transform: `translateX(${(1 - pop) * 48}px)`,
        }}
      >
        <Panel>
          <Label>ONE WEEKEND</Label>
          <div
            style={{
              height: 46 * onePush,
              background: DIM,
              borderRadius: 3,
              marginBottom: 30,
            }}
          />
          <Label>90 DAYS, 30 MINUTES</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 4 }}>
            {Array.from({ length: 90 }, (_, i) => (
              <div
                key={i}
                style={{
                  height: 17,
                  background: i < daily ? RED : "rgba(244,240,232,0.10)",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

/** The on-screen-UI shell every YELLOW event shares. */
export const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: "rgba(14,14,16,0.90)",
      border: `2px solid rgba(244,240,232,0.14)`,
      borderLeft: `6px solid ${RED}`,
      padding: "26px 28px 30px",
      boxShadow: "0 26px 60px rgba(0,0,0,0.65)",
      backdropFilter: "blur(3px)",
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: DISPLAY,
      fontSize: 34,
      letterSpacing: 1.2,
      color: BONE,
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

/**
 * [22]-[23] RED — the hero scene of the section. The expected line climbs straight,
 * the real one sinks into the valley, and the quit point is marked just before the
 * compounding turns up.
 */
export const Valley: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const expected = "M220,760 L1700,230";
  const real =
    "M220,760 C460,776 700,800 940,796 C1160,792 1330,700 1450,520 C1540,386 1620,286 1700,196";
  // closes along the expected line itself (220,760 -> 1700,230), so the shaded
  // region is genuinely the gap between the two curves rather than a chord
  const valleyFill =
    "M220,760 C460,776 700,800 940,796 C1160,792 1330,700 1450,520 " +
    "C1500,430 1560,350 1620,286 L1620,259 Z";

  const shade = interpolate(t, [4.6, 5.4], [0, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const figure = usePop(5.0, 100);
  const quit = usePop(7.1, 130);

  return (
    <Field tint="#241819">
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        {/* axes */}
        <line x1="220" y1="760" x2="1760" y2="760" stroke={DIM} strokeWidth={3} />
        <line x1="220" y1="140" x2="220" y2="760" stroke={DIM} strokeWidth={3} />

        {/* the gap between what you expect and what you get */}
        <path d={valleyFill} fill={RED} opacity={shade} />

        <Draw d={expected} len={1580} at={1.0} dur={1.4} stroke={DIM} width={6} />
        <Draw d={real} len={1900} at={2.6} dur={3.4} stroke={RED} width={10} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 1300,
          top: 142,
          fontFamily: DISPLAY,
          fontSize: 40,
          color: DIM,
          opacity: interpolate(t, [2.1, 2.5], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        WHAT YOU EXPECT
      </div>
      <div
        style={{
          position: "absolute",
          left: 268,
          top: 638,
          // the label crosses into the shaded valley, so it carries its own plate
          background: "rgba(14,14,16,0.86)",
          padding: "6px 14px",
          fontFamily: DISPLAY,
          fontSize: 40,
          color: RED,
          opacity: interpolate(t, [3.6, 4.0], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        WHAT ACTUALLY HAPPENS
      </div>

      {/* someone standing at the bottom of it */}
      <div
        style={{
          position: "absolute",
          left: 916,
          top: 700,
          opacity: figure,
          transform: `translateY(${(1 - figure) * -20}px)`,
        }}
      >
        <Figure />
      </div>

      <div
        style={{
          position: "absolute",
          left: 300,
          top: 886,
          opacity: interpolate(t, [5.0, 5.6], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontSize: 78, color: BONE, lineHeight: 0.95 }}>
          THE VALLEY OF DISAPPOINTMENT
        </div>
      </div>

      {/* the quit point, just before the curve turns */}
      <div
        style={{
          position: "absolute",
          left: 1136,
          top: 470,
          opacity: quit,
          transform: `scale(${interpolate(quit, [0, 1], [0.8, 1])}) rotate(-3deg)`,
        }}
      >
        <div
          style={{
            background: RED,
            color: INK,
            fontFamily: DISPLAY,
            fontSize: 44,
            padding: "10px 20px",
          }}
        >
          MOST PEOPLE QUIT HERE
        </div>
        <div style={{ width: 3, height: 290, background: RED, marginLeft: 34 }} />
      </div>
    </Field>
  );
};

/** A plain silhouette — small enough that the chart stays the subject. */
const Figure: React.FC = () => (
  <svg width="58" height="104" viewBox="0 0 58 104">
    <circle cx="29" cy="16" r="15" fill={BONE} />
    <path d="M29,34 C13,34 8,48 8,66 L8,104 L50,104 L50,66 C50,48 45,34 29,34 Z" fill={BONE} />
  </svg>
);
