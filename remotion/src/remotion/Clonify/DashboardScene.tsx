import { fontFamily } from "@remotion/google-fonts/Inter";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const StatCard: React.FC<{
  label: string;
  value: string;
  change: string;
  positive: boolean;
  delay: number;
}> = ({ label, value, change, positive, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    delay,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        flex: 1,
        padding: "16px 20px",
        borderRadius: 12,
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        opacity: entrance,
        transform: `scale(${interpolate(entrance, [0, 1], [0.95, 1])})`,
      }}
    >
      <p
        style={{
          fontFamily,
          fontSize: 11,
          color: "rgba(255, 255, 255, 0.4)",
          margin: 0,
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontFamily,
            fontSize: 24,
            fontWeight: 700,
            color: "white",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontFamily,
            fontSize: 12,
            fontWeight: 600,
            color: positive ? "#10B981" : "#EF4444",
          }}
        >
          {change}
        </span>
      </div>
    </div>
  );
};

const BarChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bars = [35, 55, 42, 68, 52, 78, 60, 85, 72, 92, 65, 88];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height: 120,
        padding: "0 8px",
      }}
    >
      {bars.map((height, i) => {
        const barEntrance = spring({
          frame,
          fps,
          delay: Math.round(0.6 * fps + i * 2),
          config: { damping: 15, stiffness: 100 },
        });

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${height * barEntrance}%`,
              borderRadius: 4,
              background:
                i >= 8
                  ? "linear-gradient(180deg, #8B5CF6, #6366F1)"
                  : "rgba(139, 92, 246, 0.25)",
            }}
          />
        );
      })}
    </div>
  );
};

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dashboard panel slides up
  const panelEntrance = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const panelY = interpolate(panelEntrance, [0, 1], [200, 0]);
  const panelOpacity = panelEntrance;

  // Title entrance
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a1a 0%, #0d0d24 100%)",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "50px 80px",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          top: "20%",
          left: "30%",
        }}
      />

      {/* Title */}
      <div
        style={{
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [15, 0])}px)`,
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 14,
            fontWeight: 700,
            color: "#8B5CF6",
            margin: 0,
            marginBottom: 8,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Dashboard
        </p>
        <h2
          style={{
            fontFamily,
            fontSize: 40,
            fontWeight: 900,
            color: "white",
            margin: 0,
            letterSpacing: -1,
          }}
        >
          Analytics that matter
        </h2>
      </div>

      {/* Dashboard panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          padding: 28,
          opacity: panelOpacity,
          transform: `translateY(${panelY}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 16,
              fontWeight: 700,
              color: "white",
            }}
          >
            Overview
          </span>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 12,
                fontWeight: 600,
                color: "#A78BFA",
              }}
            >
              Last 30 days
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16 }}>
          <StatCard
            label="Total Users"
            value="24,521"
            change="+12.5%"
            positive
            delay={Math.round(0.3 * fps)}
          />
          <StatCard
            label="Revenue"
            value="$84.2K"
            change="+8.3%"
            positive
            delay={Math.round(0.4 * fps)}
          />
          <StatCard
            label="Conversion"
            value="3.24%"
            change="+2.1%"
            positive
            delay={Math.round(0.5 * fps)}
          />
          <StatCard
            label="Churn Rate"
            value="1.8%"
            change="-0.4%"
            positive
            delay={Math.round(0.6 * fps)}
          />
        </div>

        {/* Chart area */}
        <div
          style={{
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            padding: 20,
          }}
        >
          <p
            style={{
              fontFamily,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.5)",
              margin: 0,
              marginBottom: 16,
            }}
          >
            Monthly Active Users
          </p>
          <BarChart />
        </div>
      </div>
    </AbsoluteFill>
  );
};
