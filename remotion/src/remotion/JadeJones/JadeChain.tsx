// ─────────────────────────────────────────────────────────────
// JadeChain — for the "flywheel" scripts, where every sentence hands
// off to the next ("the more you lift, the stronger you get; the
// stronger you get, the more muscle you build; …") and the last link
// closes back onto the first.
//
// Spoken, that chain is impossible to hold in your head — by link six
// the viewer has lost links one through four. So each link drops in as
// a pill on the word that names it and STAYS, with the older ones
// riding up and dimming. You can always see where the chain has been,
// which is the whole point of the video.
//
// Pills sit BELOW the caption line (captions live at y1100 under her
// chin) so they never cover her face or the words.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
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

const linkSchema = z.object({
  text: z.string(),
  atSeconds: z.number(), // the word that introduces this link
});

export const jadeChainSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  links: z.array(linkSchema).default([]),
  // How many links stay on screen at once. The stack rides up as new ones land.
  maxVisible: z.number().default(4),
  topY: z.number().default(1215), // under the caption line
});
export type JadeChainProps = z.infer<typeof jadeChainSchema>;

export const calculateJadeChainMetadata: CalculateMetadataFunction<JadeChainProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const ROW_H = 104; // pill + the arrow gap beneath it

const Pill: React.FC<{ text: string; age: number; depth: number }> = ({
  text,
  age,
  depth,
}) => {
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: Math.max(0, age),
    fps,
    config: { damping: 200, stiffness: 200 },
    durationInFrames: 7,
  });
  // Older links recede: dimmer and slightly smaller, so the newest reads first.
  const fade = interpolate(depth, [0, 1, 3], [1, 0.72, 0.42], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(depth, [0, 3], [1, 0.9], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        opacity: pop * fade,
        transform: `scale(${scale * interpolate(pop, [0, 1], [0.9, 1])})`,
      }}
    >
      <div
        style={{
          fontFamily: anton,
          fontSize: 52,
          lineHeight: 1,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: 1,
          background: "rgba(8,8,10,0.8)",
          border: `3px solid ${depth === 0 ? "#3DDC84" : "rgba(255,255,255,0.28)"}`,
          borderRadius: 18,
          padding: "16px 34px 19px",
          textAlign: "center",
          maxWidth: 900,
          boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const JadeChain: React.FC<JadeChainProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  links,
  maxVisible,
  topY,
}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;

  // Everything named so far, newest last; keep only the tail we display.
  const landed = links.filter((l) => t >= l.atSeconds);
  const shown = landed.slice(-maxVisible);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* NOTE: objectFit must be a PROP — @remotion/media ignores it in style. */}
      <Video
        src={staticFile(videoSrc)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: topY,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 10,
            padding: "0 60px",
          }}
        >
          {shown.map((l, i) => {
            const depth = shown.length - 1 - i; // 0 = newest
            const age = Math.round((t - l.atSeconds) * fps);
            return (
              <div key={l.text + l.atSeconds} style={{ height: ROW_H }}>
                <Pill text={l.text} age={age} depth={depth} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
