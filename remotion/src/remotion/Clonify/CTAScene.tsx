import { fontFamily } from "@remotion/google-fonts/Inter";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main text entrance
  const textEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const textScale = interpolate(textEntrance, [0, 1], [0.85, 1]);
  const textOpacity = textEntrance;

  // Button entrance (delayed)
  const buttonEntrance = spring({
    frame,
    fps,
    delay: Math.round(0.3 * fps),
    config: { damping: 12, stiffness: 120 },
  });

  const buttonY = interpolate(buttonEntrance, [0, 1], [30, 0]);

  // Subtle shimmer on button
  const shimmerX = interpolate(
    frame,
    [Math.round(0.8 * fps), Math.round(2 * fps)],
    [-100, 200],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Background gradient rotation
  const gradAngle = interpolate(frame, [0, 3 * fps], [0, 30], {
    extrapolateRight: "clamp",
  });

  // Floating particles
  const particles = Array.from({ length: 6 }, (_, i) => ({
    x: 15 + i * 17,
    baseY: 20 + (i % 3) * 25,
    size: 3 + (i % 3) * 2,
    speed: 0.3 + (i % 4) * 0.15,
    opacity: 0.08 + (i % 3) * 0.05,
  }));

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${140 + gradAngle}deg, #0a0a1a 0%, #1a0a2e 50%, #0f1629 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Floating particles */}
      {particles.map((p, i) => {
        const floatY = interpolate(
          frame,
          [0, Math.round(3 * fps)],
          [0, -40 * p.speed],
          { extrapolateRight: "clamp" },
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.baseY}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "#8B5CF6",
              opacity: p.opacity * textEntrance,
              transform: `translateY(${floatY}px)`,
            }}
          />
        );
      })}

      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          opacity: textOpacity,
          transform: `scale(${textScale})`,
        }}
      >
        <h2
          style={{
            fontFamily,
            fontSize: 56,
            fontWeight: 900,
            color: "white",
            margin: 0,
            textAlign: "center",
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          Ready to build
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            something amazing?
          </span>
        </h2>

        <p
          style={{
            fontFamily,
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.5)",
            margin: 0,
            textAlign: "center",
          }}
        >
          Join 10,000+ teams shipping faster with Clonify
        </p>

        {/* CTA Button */}
        <div
          style={{
            opacity: buttonEntrance,
            transform: `translateY(${buttonY}px)`,
          }}
        >
          <div
            style={{
              padding: "16px 48px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
              boxShadow:
                "0 0 40px rgba(139, 92, 246, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shimmer */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: shimmerX,
                width: 60,
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
            <span
              style={{
                fontFamily,
                fontSize: 18,
                fontWeight: 700,
                color: "white",
                position: "relative",
              }}
            >
              Get Started Free
            </span>
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          opacity: interpolate(
            frame,
            [Math.round(0.5 * fps), Math.round(1 * fps)],
            [0, 0.3],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 13,
            color: "rgba(255, 255, 255, 0.4)",
            margin: 0,
          }}
        >
          clonify.io
        </p>
      </div>
    </AbsoluteFill>
  );
};
