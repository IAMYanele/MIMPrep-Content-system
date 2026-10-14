import { fontFamily, loadFont } from "@remotion/google-fonts/Inter";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700", "900"],
});

export const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scale entrance
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Logo opacity
  const logoOpacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Tagline entrance (delayed)
  const taglineProgress = spring({
    frame,
    fps,
    delay: Math.round(0.4 * fps),
    config: { damping: 200 },
  });

  const taglineY = interpolate(taglineProgress, [0, 1], [30, 0]);
  const taglineOpacity = taglineProgress;

  // Glowing orb animation
  const orbPulse = interpolate(
    frame,
    [0, 2 * fps, 4 * fps],
    [0.6, 1, 0.6],
    {
      extrapolateRight: "clamp",
    },
  );

  // Rotating gradient angle
  const gradientAngle = interpolate(frame, [0, 3 * fps], [0, 60], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientAngle}deg, #0a0a1a 0%, #1a0a2e 40%, #0f1629 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
          top: "10%",
          right: "10%",
          opacity: orbPulse,
          transform: `scale(${0.8 + orbPulse * 0.3})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)",
          bottom: "5%",
          left: "5%",
          opacity: orbPulse * 0.8,
          transform: `scale(${0.9 + orbPulse * 0.2})`,
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 60px rgba(139, 92, 246, 0.4)",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M22 6C13.163 6 6 13.163 6 22s7.163 16 16 16 16-7.163 16-16S30.837 6 22 6zm0 4a12 12 0 0 1 10.39 6H11.61A12 12 0 0 1 22 10zm-12 12a12 12 0 0 1 1.61-6v12A12 12 0 0 1 10 22zm12 12a12 12 0 0 1-8.39-3.42h16.78A12 12 0 0 1 22 34zm10.39-6H11.61"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="22" cy="22" r="4" fill="white" />
          </svg>
        </div>

        {/* Brand name */}
        <h1
          style={{
            fontFamily,
            fontSize: 72,
            fontWeight: 900,
            background: "linear-gradient(135deg, #FFFFFF 0%, #C4B5FD 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            letterSpacing: -2,
          }}
        >
          Clonify
        </h1>
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: "28%",
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 24,
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.6)",
            margin: 0,
            letterSpacing: 1,
          }}
        >
          Clone. Customize. Ship.
        </p>
      </div>
    </AbsoluteFill>
  );
};
