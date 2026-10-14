import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Aside,
  Base,
  BONE,
  DISPLAY,
  Field,
  Hero,
  INK,
  RED,
  Stamp,
  Tape,
  usePop,
  WriteOn,
} from "../canvas";
import { IndexCard } from "./chapter";

// Measured off the raw: the subject sits x 720-1440 of 1920, so on-screen UI lives
// in the clean shelf area to the right of x 1430.
export const UI_X = 1448;
export const UI_W = 404;

/** One LBS application form. The hero object of the opening scene. */
const FormCard: React.FC<{ w?: number; faded?: boolean }> = ({ w = 300, faded }) => (
  <div
    style={{
      width: w,
      height: w * 1.33,
      background: BONE,
      borderRadius: 4,
      boxShadow: "0 14px 30px rgba(0,0,0,0.55)",
      padding: w * 0.09,
      opacity: faded ? 0.78 : 1,
      display: "flex",
      flexDirection: "column",
      gap: w * 0.045,
    }}
  >
    <div style={{ height: w * 0.055, width: "62%", background: "rgba(14,16,32,0.72)" }} />
    <div style={{ height: w * 0.028, width: "88%", background: "rgba(14,16,32,0.17)" }} />
    <div style={{ height: w * 0.028, width: "73%", background: "rgba(14,16,32,0.17)" }} />
    {/* the goal line — the only thing that matters, and it is identical on every form */}
    <div
      style={{
        marginTop: w * 0.03,
        padding: `${w * 0.022}px ${w * 0.03}px`,
        background: "rgba(227,55,43,0.17)",
        borderLeft: `${Math.max(2, w * 0.016)}px solid ${RED}`,
        fontFamily: DISPLAY,
        fontSize: w * 0.082,
        color: INK,
        letterSpacing: 0.3,
      }}
    >
      GOAL: GET INTO LBS
    </div>
    <div style={{ height: w * 0.028, width: "80%", background: "rgba(14,16,32,0.17)" }} />
    <div style={{ height: w * 0.028, width: "55%", background: "rgba(14,16,32,0.17)" }} />
    <div style={{ height: w * 0.028, width: "68%", background: "rgba(14,16,32,0.17)" }} />
  </div>
);

/**
 * [01]-[02] chained into one world: one form multiplies into a wall of identical
 * forms as the camera pulls back, then the stamp corrects the claim in place.
 */
export const SameGoal: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const COLS = 9;
  const ROWS = 5;
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => i);
  const centre = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2);

  // the pull-back: one card fills the frame, then the wall assembles behind it
  const pull = interpolate(t, [0.55, 3.1], [2.4, 0.66], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // everything desaturates when the stamp is about to land
  const freeze = interpolate(t, [4.5, 5.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Field tint="#1C1A24">
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          filter: `saturate(${1 - freeze * 0.75}) brightness(${1 - freeze * 0.3})`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 300px)`,
            gap: 44,
            transform: `scale(${pull})`,
          }}
        >
          {cells.map((i) => {
            if (i === centre) return <FormCard key={i} />;
            // stagger outward from the middle so the wall grows, not appears
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const d = Math.hypot(col - (COLS - 1) / 2, row - (ROWS - 1) / 2);
            const a = interpolate(t, [0.7 + d * 0.18, 1.05 + d * 0.18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div key={i} style={{ opacity: a, transform: `scale(${0.9 + a * 0.1})` }}>
                <FormCard faded />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* the compressed claim, written across the wall */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(t, [4.85, 5.05], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <WriteOn at={3.25} dur={0.5}>
          <div
            style={{
              background: INK,
              padding: "18px 56px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          >
            <Hero at={3.2} size={168} colour={BONE}>
              THE SAME GOAL
            </Hero>
          </div>
        </WriteOn>
      </AbsoluteFill>

      {/* [02] the correction, in the same world */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Stamp at={5.15} text="not the differentiator" rotate={-6} size={118} />
      </AbsoluteFill>
    </Field>
  );
};

/** [05] YELLOW — the book, pinned to the shelf beside him. The face stays visible. */
export const TheBook: React.FC<{ from: number; dur: number }> = ({ from }) => {
  const pop = usePop(0.15, 100);
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
          transform: `translateY(${(1 - pop) * 34}px) rotate(${interpolate(
            pop,
            [0, 1],
            [-4, -1.6],
          )}deg)`,
        }}
      >
        <Tape style={{ top: -22, left: UI_W / 2 - 75 }} rotate={-5} />
        {/* a typographic cover rather than the publisher's artwork */}
        <div
          style={{
            background: BONE,
            padding: "40px 30px 34px",
            boxShadow: "0 26px 56px rgba(0,0,0,0.6)",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: DISPLAY, fontSize: 78, lineHeight: 0.92, color: INK }}>
            ATOMIC
            <br />
            HABITS
          </div>
          <div style={{ height: 3, background: RED, margin: "20px auto", width: "58%" }} />
          <div style={{ fontFamily: DISPLAY, fontSize: 31, color: "#4A4740", letterSpacing: 1.6 }}>
            JAMES CLEAR
          </div>
        </div>
        <Aside at={1.5} size={54} rotate={-2.5} style={{ marginTop: 20, textAlign: "center" }}>
          not about applications
        </Aside>
      </div>
    </AbsoluteFill>
  );
};

/**
 * [08] RED - the chapter device is designed here, face-down: the open loop. Then
 * the camera tilts off the rail onto the sealed letter, planting the bookend that
 * opens in the final scene. Two beats in one world rather than two cut events,
 * because the line underneath is only a few seconds long.
 */
export const FourCards: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const deal = [0, 1, 2, 3].map((i) =>
    interpolate(t, [0.35 + i * 0.26, 0.95 + i * 0.26], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const settle = interpolate(t, [1.9, 3.0], [1.26, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // the tilt: the rail rises out of frame as the envelope comes up to meet it
  const tiltAt = Math.max(2.8, dur - 3.4);
  const tilt = interpolate(t, [tiltAt, tiltAt + 1.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Field tint="#201C1B">
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${-tilt * 760}px)`,
        }}
      >
        <div style={{ display: "flex", gap: 46, transform: `scale(${settle})` }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                opacity: deal[i],
                transform: `translate(${(1 - deal[i]) * 420}px, ${
                  (1 - deal[i]) * -90
                }px) rotate(${(1 - deal[i]) * 26}deg)`,
              }}
            >
              <IndexCard index={i} flip={0} />
            </div>
          ))}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 128,
          width: "100%",
          textAlign: "center",
          opacity: 1 - tilt,
          transform: `translateY(${-tilt * 760}px)`,
        }}
      >
        <Hero at={2.4} size={86}>
          FOUR IDEAS
        </Hero>
      </div>

      {/* the sealed letter, waiting below frame until the camera finds it */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${(1 - tilt) * 980}px) scale(${0.9 + tilt * 0.12})`,
          opacity: tilt,
        }}
      >
        <div style={{ transform: "rotate(-2deg)" }}>
          <Envelope sealed />
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(t, [tiltAt + 1.0, tiltAt + 1.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Aside at={tiltAt + 1.0} size={58} rotate={-2}>
          we&apos;ll come back to this
        </Aside>
      </div>
    </Field>
  );
};

/**
 * The bookend object. Drawn, not photographed, so it belongs to the canvas.
 * Built as back panel / letter / front pocket / flap, so the letter can rise out
 * of it rather than appearing on top of it.
 */
export const Envelope: React.FC<{ sealed: boolean; open?: number; letter?: number }> = ({
  sealed,
  open = 0,
  letter = 0,
}) => (
  <div style={{ width: 760, height: 500, position: "relative" }}>
    {/* back panel */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#E8E2D6",
        borderRadius: 4,
        boxShadow: "0 34px 80px rgba(0,0,0,0.7)",
      }}
    />
    {/* the letter, sliding up out of the pocket */}
    {letter > 0 ? (
      <div
        style={{
          position: "absolute",
          left: 60,
          width: 640,
          height: 440,
          bottom: 40,
          zIndex: 2,
          transform: `translateY(${-letter * 300}px)`,
          background: "#FBF8F1",
          boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
          padding: "34px 44px",
        }}
      >
        <div style={{ height: 9, width: 190, background: RED }} />
        <div style={{ height: 15, width: "72%", background: "rgba(14,16,32,0.20)", marginTop: 26 }} />
        <div style={{ height: 9, width: "88%", background: "rgba(14,16,32,0.11)", marginTop: 22 }} />
        <div style={{ height: 9, width: "80%", background: "rgba(14,16,32,0.11)", marginTop: 14 }} />
        <div style={{ height: 9, width: "84%", background: "rgba(14,16,32,0.11)", marginTop: 14 }} />
      </div>
    ) : null}
    {/* the pocket front, which the letter comes out from behind */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 310,
        zIndex: 3,
        background: BONE,
        borderRadius: "0 0 4px 4px",
        borderTop: "1px solid rgba(14,16,32,0.10)",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 42,
          left: 56,
          fontFamily: DISPLAY,
          fontSize: 34,
          letterSpacing: 2,
          color: "rgba(14,16,32,0.34)",
        }}
      >
        LONDON BUSINESS SCHOOL
      </div>
    </div>
    {/* the flap, hinged at the top */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 300,
        transformOrigin: "top center",
        // once it has flipped over backwards the flap belongs behind the letter
        zIndex: open > 0.5 ? 1 : 4,
        transform: `perspective(1200px) rotateX(${open * 168}deg)`,
        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        background: open > 0.5 ? "#E6E0D4" : "#EDE7DB",
        borderBottom: "1px solid rgba(14,16,32,0.12)",
      }}
    />
    {/* the wax seal */}
    {sealed ? (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 268,
          transform: "translate(-50%,-50%)",
          width: 118,
          height: 118,
          zIndex: 5,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 34%, #F0604F, ${RED} 58%, #9B1F16)`,
          boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: DISPLAY,
          fontSize: 44,
          color: "rgba(255,255,255,0.86)",
        }}
      >
        LBS
      </div>
    ) : null}
  </div>
);
