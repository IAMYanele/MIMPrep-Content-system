import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CTAScene } from "./CTAScene";
import { DashboardScene } from "./DashboardScene";
import { FeaturesScene } from "./FeaturesScene";
import { HeroScene } from "./HeroScene";

export const ClonifyMain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene durations in seconds
  const heroSeconds = 3.5;
  const featuresSeconds = 3.5;
  const dashboardSeconds = 4;
  const ctaSeconds = 3;

  // Convert to frames
  const heroDuration = Math.round(heroSeconds * fps);
  const featuresDuration = Math.round(featuresSeconds * fps);
  const dashboardDuration = Math.round(dashboardSeconds * fps);
  const ctaDuration = Math.round(ctaSeconds * fps);

  // Crossfade overlap in frames
  const crossfade = Math.round(0.5 * fps);

  // Scene start times (with overlap)
  const featuresStart = heroDuration - crossfade;
  const dashboardStart = featuresStart + featuresDuration - crossfade;
  const ctaStart = dashboardStart + dashboardDuration - crossfade;

  // Fade helpers - each scene fades out near its end
  const heroOpacity = interpolate(
    frame,
    [featuresStart - crossfade, featuresStart + crossfade],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const featuresOpacity = (() => {
    const fadeIn = interpolate(
      frame,
      [featuresStart, featuresStart + crossfade],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const fadeOut = interpolate(
      frame,
      [dashboardStart - crossfade, dashboardStart + crossfade],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return fadeIn * fadeOut;
  })();

  const dashboardOpacity = (() => {
    const fadeIn = interpolate(
      frame,
      [dashboardStart, dashboardStart + crossfade],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const fadeOut = interpolate(
      frame,
      [ctaStart - crossfade, ctaStart + crossfade],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return fadeIn * fadeOut;
  })();

  const ctaOpacity = interpolate(
    frame,
    [ctaStart, ctaStart + crossfade],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: "#0a0a1a" }}>
      {/* Scene 1: Hero */}
      <Sequence
        durationInFrames={heroDuration + crossfade}
        premountFor={Math.round(0.5 * fps)}
      >
        <AbsoluteFill style={{ opacity: heroOpacity }}>
          <HeroScene />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Features */}
      <Sequence
        from={featuresStart}
        durationInFrames={featuresDuration + crossfade}
        premountFor={Math.round(0.5 * fps)}
      >
        <AbsoluteFill style={{ opacity: featuresOpacity }}>
          <FeaturesScene />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Dashboard */}
      <Sequence
        from={dashboardStart}
        durationInFrames={dashboardDuration + crossfade}
        premountFor={Math.round(0.5 * fps)}
      >
        <AbsoluteFill style={{ opacity: dashboardOpacity }}>
          <DashboardScene />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: CTA */}
      <Sequence
        from={ctaStart}
        durationInFrames={ctaDuration}
        premountFor={Math.round(0.5 * fps)}
      >
        <AbsoluteFill style={{ opacity: ctaOpacity }}>
          <CTAScene />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
