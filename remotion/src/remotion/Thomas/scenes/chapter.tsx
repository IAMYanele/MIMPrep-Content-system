import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BONE, DISPLAY, Field, INK, RED, SCRIPT, Stamp, usePop } from "../canvas";

// The chapter device: a rail of four index cards on a desk, shot top-down.
// Previewed face-down in the intro, one flips face-up and gets stamped at each
// transition, all four stand complete in the recap. This is the viewer's progress bar.

export const CHAPTERS = ["COMPOUNDING", "SYSTEMS", "IDENTITY", "THE LOOP"] as const;

const CARD_W = 330;
const CARD_H = 430;
// a fixed lean per card so the rail looks dealt by hand, not laid out by a computer
const LEAN = [-3.2, 1.8, -1.4, 2.6];

/** One index card. `flip` 0 = face-down (number only), 1 = face-up (the idea). */
export const IndexCard: React.FC<{
  index: number;
  flip: number;
  dim?: boolean;
  stamped?: boolean;
  stampAt?: number;
  highlight?: number;
}> = ({ index, flip, dim, stamped, stampAt = 0, highlight = 0 }) => {
  // a half-turn: the card is edge-on at flip 0.5, so swap faces there
  const turn = interpolate(flip, [0, 1], [0, 180]);
  const faceUp = flip > 0.5;
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        transform: `rotate(${LEAN[index]}deg) perspective(1400px) rotateY(${turn}deg)`,
        transformStyle: "preserve-3d",
        position: "relative",
        filter:
          dim
            ? "brightness(0.52) saturate(0.7)"
            : highlight > 0
              ? undefined
              : "brightness(0.72) saturate(0.85)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: faceUp ? "rotateY(180deg)" : undefined,
          background: BONE,
          borderRadius: 8,
          boxShadow: `0 ${18 + highlight * 14}px ${34 + highlight * 26}px rgba(0,0,0,${0.5 + highlight * 0.2})`,
          // ruled index-card lines
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0 46px, rgba(14,16,32,0.10) 46px 47px)",
          backgroundPosition: "0 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: faceUp ? "center" : "center",
          padding: 22,
          overflow: "hidden",
        }}
      >
        {/* the red margin rule every index card has */}
        <div
          style={{
            position: "absolute",
            top: 84,
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(227,55,43,0.55)",
          }}
        />
        {faceUp ? (
          <>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 54,
                color: RED,
                position: "absolute",
                top: 20,
                left: 24,
              }}
            >
              {index + 1}
            </span>
            <span
              style={{
                fontFamily: DISPLAY,
                // fit the word to the card instead of letting it run off the edges
                fontSize: Math.min(74, Math.round((CARD_W - 52) / CHAPTERS[index].length * 1.72)),
                lineHeight: 0.98,
                color: INK,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              {CHAPTERS[index]}
            </span>
            {stamped ? (
              <div style={{ position: "absolute", bottom: 54, transform: "scale(0.52)" }}>
                <Stamp at={stampAt} text="DONE" rotate={-11} size={78} />
              </div>
            ) : null}
          </>
        ) : (
          <span style={{ fontFamily: DISPLAY, fontSize: 168, color: "rgba(14,16,32,0.16)" }}>
            {index + 1}
          </span>
        )}
      </div>
    </div>
  );
};

/** The rail of four, centred on the desk. */
export const CardRail: React.FC<{
  flips: number[];
  stamped?: boolean[];
  highlight?: number[];
  scale?: number;
  dimOthers?: number | null;
}> = ({ flips, stamped = [], highlight = [], scale = 1, dimOthers = null }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div style={{ display: "flex", gap: 46, transform: `scale(${scale})` }}>
      {[0, 1, 2, 3].map((i) => (
        <IndexCard
          key={i}
          index={i}
          flip={flips[i] ?? 0}
          stamped={stamped[i]}
          highlight={highlight[i] ?? 0}
          dim={dimOthers !== null && dimOthers !== i}
        />
      ))}
    </div>
  </AbsoluteFill>
);

/**
 * The transition itself: the rail slides in, card N flips face-up and is stamped,
 * and the camera pushes in on it so the next idea starts on a close-up.
 */
export const ChapterTurn: React.FC<{ index: number; dur: number }> = ({ index, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const flipP = usePop(0.45, 80);

  const flips = [0, 1, 2, 3].map((i) => (i < index ? 1 : i === index ? flipP : 0));
  const stamped = [0, 1, 2, 3].map((i) => i < index);

  // push in on the active card: scale up and slide it toward centre
  const push = interpolate(t, [0.3, dur], [1, 1.13], { extrapolateRight: "clamp" });
  const shift = interpolate(t, [0.3, dur], [0, (1.5 - index) * 148], {
    extrapolateRight: "clamp",
  });

  return (
    <Field tint="#201C1B">
      <AbsoluteFill style={{ transform: `translateX(${shift}px)` }}>
        <CardRail
          flips={flips}
          stamped={stamped}
          highlight={[0, 1, 2, 3].map((i) => (i === index ? flipP : 0))}
          dimOthers={index}
          scale={push}
        />
      </AbsoluteFill>
      {index === 2 ? (
        <div
          style={{
            position: "absolute",
            bottom: 150,
            width: "100%",
            textAlign: "center",
            fontFamily: SCRIPT,
            fontSize: 72,
            color: RED,
            opacity: interpolate(t, [1.4, 1.9], [0, 1], { extrapolateRight: "clamp" }),
            transform: "rotate(-2.5deg)",
          }}
        >
          this is the one that matters
        </div>
      ) : null}
    </Field>
  );
};
