import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

type Props = {
  file: string;
  durationInFrames: number;
  fadeInFrames: number;
  fadeOutFrames: number;
};

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

export const MotionGraphicOverlay: React.FC<Props> = ({
  file,
  durationInFrames,
  fadeInFrames,
  fadeOutFrames,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [
      0,
      fadeInFrames,
      durationInFrames - fadeOutFrames,
      durationInFrames,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const enterScale = interpolate(frame, [0, fadeInFrames], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  const exitScale = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 1.02],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_IN,
    },
  );

  const scale = frame > durationInFrames - fadeOutFrames ? exitScale : enterScale;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        pointerEvents: "none",
      }}
    >
      <Img
        src={staticFile(file)}
        style={{
          width,
          height,
          objectFit: "cover",
        }}
      />
    </AbsoluteFill>
  );
};
