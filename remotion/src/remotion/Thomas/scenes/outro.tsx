import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Aside, BONE, DIM, DISPLAY, Field, Hero, INK, RED } from "../canvas";
import { CardRail } from "./chapter";
import { Envelope } from "./intro";

/**
 * [78]-[82] RED — the chapter device pays off: all four cards face-up and stamped,
 * lighting in turn as the recap runs. This is what the viewer has been tracking.
 */
export const Recap: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // each card takes the light for a beat, in order
  const step = (dur - 1.6) / 4;
  const highlight = [0, 1, 2, 3].map((i) =>
    interpolate(
      t,
      [1.0 + i * step, 1.3 + i * step, 1.0 + (i + 1) * step, 1.3 + (i + 1) * step],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    ),
  );
  const pull = interpolate(t, [0, dur], [1.0, 0.88], { extrapolateRight: "clamp" });

  return (
    <Field tint="#201C1B">
      <CardRail
        flips={[1, 1, 1, 1]}
        stamped={[true, true, true, true]}
        highlight={highlight}
        scale={pull * 1.04}
      />
      <div
        style={{
          position: "absolute",
          bottom: 96,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(t, [dur - 2.6, dur - 2.1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Hero at={dur - 2.6} size={76} colour={DIM}>
          THE WHOLE SYSTEM
        </Hero>
      </div>
    </Field>
  );
};

/**
 * [84] RED — the bookend closes. The letter planted at 0:06 finally opens, and
 * behind it sit the two hundred that haven't.
 */
export const EnvelopeOpen: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const open = interpolate(t, [1.5, 3.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // pull back to reveal everyone still waiting
  const back = interpolate(t, [4.4, 7.0], [1, 0.52], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // the letter rises once the flap is clear
  const letter = interpolate(t, [3.0, 4.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crowd = interpolate(t, [4.6, 6.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Field tint="#241E1C">
      {/* the two hundred that are still sealed, held out of focus */}
      <AbsoluteFill
        style={{
          opacity: crowd * 0.5,
          filter: "blur(5px)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(16, 1fr)",
            gap: 18,
            width: 2300,
          }}
        >
          {Array.from({ length: 169 }, (_, i) => (
            <div
              key={i}
              style={{
                height: 112,
                background: "#D8D0C0",
                borderRadius: 2,
                opacity: 0.5 + ((i * 37) % 10) / 22,
                position: "relative",
                overflow: "hidden",
                // the flap is what makes the shape read as an envelope
                transform: `rotate(${(((i * 53) % 7) - 3) * 0.6}deg)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: "polygon(0 0, 100% 0, 50% 62%)",
                  background: "#A99F8C",
                }}
              />
            </div>
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${back}) rotate(-2deg)` }}>
          <Envelope sealed={open < 0.12} open={open} letter={letter} />
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 118,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: crowd,
        }}
      >
        <Aside at={5.2} size={64} rotate={-2}>
          the other 200 are still waiting
        </Aside>
      </div>
    </Field>
  );
};

/**
 * [85]-[86] PURPLE — the product block gets its own canvas: inverted, so it reads
 * as a different surface from the video. The sign-off after it stays un-animated.
 */
export const Promo: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const rise = interpolate(t, [0.2, 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BONE }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: rise,
          transform: `translateY(${(1 - rise) * 30}px)`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 190,
              color: INK,
              lineHeight: 0.92,
              letterSpacing: -2,
            }}
          >
            MIM PREP
          </div>
          <div style={{ height: 5, background: RED, width: 300, margin: "34px auto" }} />
          <div style={{ fontFamily: DISPLAY, fontSize: 52, color: "#4A4740", lineHeight: 1.25 }}>
            NOT JUST WHAT TO STUDY —
            <br />
            HOW TO ACTUALLY KEEP DOING IT
          </div>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 104,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(t, [dur - 4.4, dur - 3.9], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            background: INK,
            color: BONE,
            fontFamily: DISPLAY,
            fontSize: 46,
            padding: "16px 40px",
            letterSpacing: 2,
          }}
        >
          LINK BELOW
        </div>
      </div>
    </AbsoluteFill>
  );
};
