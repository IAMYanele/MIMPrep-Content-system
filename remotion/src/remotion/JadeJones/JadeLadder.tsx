// ─────────────────────────────────────────────────────────────
// JadeLadder — talking head + an on-screen "supplement stack" that BUILDS UP
// as each item is named. Beat 1 shows one card; when she names the second the
// "+" and 2nd card pop in and the whole group eases outward to stay centred;
// same for the third. Cards clear before the twist line so the punchline lands
// on her face alone.
//
// Each card = a royalty-free photo with a white outline + drop shadow (for
// contrast over any footage) and a small caps label underneath. An item can be
// marked crossOut to render a red ✕ over it — used for "…and AVOID coffee",
// where a plain "+ coffee" would read as the opposite of the advice.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { JadeCaptions } from "./JadeCaptions";

const anton = loadAnton().fontFamily;

const itemSchema = z.object({
  img: z.string(),
  label: z.string(),
  atSeconds: z.number(), // when this card pops in (on the spoken word)
  crossOut: z.boolean().default(false),
});

export const jadeLadderSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  items: z.array(itemSchema).default([]),
  clearAtSeconds: z.number(), // cards leave (start of the twist line)
  rowTop: z.number().default(1215), // just under the caption line
  cardW: z.number().default(238),
  imgH: z.number().default(224),
});
export type JadeLadderProps = z.infer<typeof jadeLadderSchema>;

export const calculateJadeLadderMetadata: CalculateMetadataFunction<
  JadeLadderProps
> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const GAP = 16;
const PLUS_W = 52;

const Card: React.FC<{
  item: z.infer<typeof itemSchema>;
  cardW: number;
  imgH: number;
  pop: number;
}> = ({ item, cardW, imgH, pop }) => (
  <div
    style={{
      width: cardW,
      transform: `scale(${interpolate(pop, [0, 1], [0.55, 1])})`,
      opacity: interpolate(pop, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
    }}
  >
    <div
      style={{
        position: "relative",
        width: cardW,
        height: imgH,
        borderRadius: 14,
        overflow: "hidden",
        border: "5px solid #fff",
        boxShadow: "0 16px 38px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.45)",
        background: "#111",
      }}
    >
      <Img
        src={staticFile(item.img)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: item.crossOut ? "saturate(0.55) brightness(0.72)" : undefined,
        }}
      />
      {item.crossOut ? (
        <>
          {[45, -45].map((deg) => (
            <div
              key={deg}
              style={{
                position: "absolute",
                left: "-8%",
                top: "50%",
                width: "116%",
                height: 13,
                background: "#ff3b30",
                borderRadius: 8,
                transform: `translateY(-50%) rotate(${deg}deg)`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            />
          ))}
        </>
      ) : null}
    </div>
    <div
      style={{
        marginTop: 10,
        textAlign: "center",
        fontFamily: anton,
        fontSize: 31,
        letterSpacing: 0.5,
        color: "#fff",
        textTransform: "uppercase",
        lineHeight: 1.05,
        textShadow:
          "-2px -2px 0 rgba(0,0,0,0.75), 2px -2px 0 rgba(0,0,0,0.75), -2px 2px 0 rgba(0,0,0,0.75), 2px 2px 0 rgba(0,0,0,0.75), 0 4px 12px rgba(0,0,0,0.6)",
      }}
    >
      {item.label}
    </div>
  </div>
);

const Plus: React.FC<{ pop: number }> = ({ pop }) => (
  <div
    style={{
      width: PLUS_W,
      textAlign: "center",
      fontFamily: anton,
      fontSize: 54,
      color: "#fff",
      transform: `scale(${interpolate(pop, [0, 1], [0.4, 1])})`,
      opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
      textShadow:
        "-2px -2px 0 rgba(0,0,0,0.75), 2px -2px 0 rgba(0,0,0,0.75), -2px 2px 0 rgba(0,0,0,0.75), 2px 2px 0 rgba(0,0,0,0.75), 0 4px 12px rgba(0,0,0,0.6)",
    }}
  >
    +
  </div>
);

export const JadeLadder: React.FC<JadeLadderProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  items,
  clearAtSeconds,
  rowTop,
  cardW,
  imgH,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const appear = items.map((it) => Math.round(it.atSeconds * fps));
  const clearF = Math.round(clearAtSeconds * fps);

  // how many cards are showing, and how far into the newest card's entrance we are
  const visible = appear.filter((a) => frame >= a).length;
  const stepW = cardW + GAP * 2 + PLUS_W;
  // centre x of card i when n cards are on screen
  const cardX = (n: number, i: number) =>
    width / 2 - ((n * cardW + (n - 1) * (GAP * 2 + PLUS_W)) / 2) + cardW / 2 + i * stepW;

  const enter =
    visible > 0
      ? spring({
          frame: frame - appear[visible - 1],
          fps,
          config: { damping: 200, stiffness: 190 },
          durationInFrames: 10,
        })
      : 0;
  // group fades out at the twist
  const leave = interpolate(frame, [clearF, clearF + 7], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nFrom = Math.max(1, visible - 1);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Video
        src={staticFile(videoSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {visible > 0 && leave > 0 ? (
        <AbsoluteFill style={{ opacity: leave }}>
          {items.slice(0, visible).map((it, i) => {
            const isNew = i === visible - 1;
            // existing cards ease from the old layout to the new one; the new card
            // just lands in its final slot and scales in
            const x = isNew
              ? cardX(visible, i)
              : interpolate(enter, [0, 1], [cardX(nFrom, i), cardX(visible, i)]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: rowTop,
                  left: x - cardW / 2,
                }}
              >
                <Card item={it} cardW={cardW} imgH={imgH} pop={isNew ? enter : 1} />
              </div>
            );
          })}

          {items.slice(0, Math.max(0, visible - 1)).map((_, j) => {
            const isNew = j === visible - 2;
            const mid = (a: number, b: number) => (a + b) / 2;
            const x = isNew
              ? mid(cardX(visible, j), cardX(visible, j + 1))
              : interpolate(
                  enter,
                  [0, 1],
                  [mid(cardX(nFrom, j), cardX(nFrom, j + 1)), mid(cardX(visible, j), cardX(visible, j + 1))],
                );
            return (
              <div
                key={`p${j}`}
                style={{
                  position: "absolute",
                  top: rowTop + imgH / 2 - 40,
                  left: x - PLUS_W / 2,
                }}
              >
                <Plus pop={isNew ? enter : 1} />
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
