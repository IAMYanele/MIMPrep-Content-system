import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { OffthreadVideo } from "@remotion/media";
import { EnvironmentCaptions } from "./Captions";

// Each clip: file path, start time (seconds), duration (seconds)
const CLIPS = [
  { src: "env-clips/clip1.mp4", startSec: 0, durSec: 6 },
  { src: "env-clips/clip2.mp4", startSec: 6, durSec: 6 },
  { src: "env-clips/clip3.mp4", startSec: 12, durSec: 3.2 },
  { src: "env-clips/clip4.mp4", startSec: 15.2, durSec: 4.8 },
  { src: "env-clips/clip5.mp4", startSec: 20, durSec: 5.2 },
  { src: "env-clips/clip6.mp4", startSec: 25.2, durSec: 4.2 },
  { src: "env-clips/clip7.mp4", startSec: 29.4, durSec: 8 },
];

const FADE_FRAMES = 6; // ~0.2s crossfade

const ClipWithFade: React.FC<{ durFrames: number }> = ({ durFrames }) => {
  const frame = useCurrentFrame();

  // Fade in at start, fade out at end
  const opacity = interpolate(
    frame,
    [0, FADE_FRAMES, durFrames - FADE_FRAMES, durFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Dark overlay for cinematic look */}
      <AbsoluteFill
        style={{ backgroundColor: "rgba(0,0,0,0.15)", zIndex: 1 }}
      />
    </AbsoluteFill>
  );
};

export const EnvironmentVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Video clips layer */}
      {CLIPS.map((clip, i) => {
        const fromFrame = Math.round(clip.startSec * fps);
        const durFrames = Math.round(clip.durSec * fps);

        return (
          <Sequence
            key={i}
            from={fromFrame}
            durationInFrames={durFrames}
          >
            <AbsoluteFill>
              <OffthreadVideo
                src={staticFile(clip.src)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <ClipWithFade durFrames={durFrames} />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Audio narration */}
      <Audio src={staticFile("environment-audio.mp3")} />

      {/* TikTok-style captions */}
      <EnvironmentCaptions />
    </AbsoluteFill>
  );
};
