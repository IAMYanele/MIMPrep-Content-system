import { fontFamily } from "@remotion/google-fonts/Inter";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const features = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Lightning Fast",
    description: "Deploy in seconds, not hours",
    gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Secure by Default",
    description: "Enterprise-grade security built in",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
  },
  {
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    title: "Smart Templates",
    description: "100+ pre-built components",
    gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
  },
];

const FeatureCard: React.FC<{
  feature: (typeof features)[number];
  index: number;
}> = ({ feature, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = Math.round(index * 0.2 * fps);

  const entrance = spring({
    frame,
    fps,
    delay,
    config: { damping: 15, stiffness: 120 },
  });

  const translateY = interpolate(entrance, [0, 1], [60, 0]);
  const opacity = entrance;

  // Subtle float animation after entrance
  const floatOffset = interpolate(
    frame,
    [delay + fps, delay + 3 * fps],
    [0, -4],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      style={{
        width: 340,
        padding: 32,
        borderRadius: 20,
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(10px)",
        opacity,
        transform: `translateY(${translateY + floatOffset}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: feature.gradient,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={feature.icon} />
        </svg>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily,
          fontSize: 22,
          fontWeight: 700,
          color: "white",
          margin: 0,
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily,
          fontSize: 15,
          fontWeight: 400,
          color: "rgba(255, 255, 255, 0.5)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {feature.description}
      </p>
    </div>
  );
};

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Section title entrance
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a1a 0%, #0f1629 100%)",
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      {/* Section header */}
      <div
        style={{
          position: "absolute",
          top: 80,
          opacity: titleProgress,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 14,
            fontWeight: 700,
            color: "#8B5CF6",
            margin: 0,
            marginBottom: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Features
        </p>
        <h2
          style={{
            fontFamily,
            fontSize: 44,
            fontWeight: 900,
            color: "white",
            margin: 0,
            textAlign: "center",
            letterSpacing: -1,
          }}
        >
          Everything you need
        </h2>
      </div>

      {/* Feature cards */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 40,
        }}
      >
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
