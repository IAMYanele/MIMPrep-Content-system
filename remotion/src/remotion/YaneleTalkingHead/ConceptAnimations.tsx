import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  fontFamily as conceptFont,
  loadFont as loadConceptFont,
} from "@remotion/google-fonts/SpaceGrotesk";

loadConceptFont("normal", { subsets: ["latin"], weights: ["600", "700"] });

// ── SVG Icons ──────────────────────────────────────────────────────

const BrainIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 0 1 4.9 4 5 5 0 0 1-.6 9.3A4.5 4.5 0 0 1 12 22a4.5 4.5 0 0 1-4.3-6.7A5 5 0 0 1 7.1 6 5 5 0 0 1 12 2z" />
    <path d="M12 2v20" />
    <path d="M7.1 6C8 7.4 9.8 8 12 8s4-0.6 4.9-2" />
    <path d="M7.7 15.3C8.7 13.6 10.2 13 12 13s3.3.6 4.3 2.3" />
  </svg>
);

const RocketIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const TargetIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const LightbulbIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const ChartIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
  </svg>
);

const StarIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ── Concept card with white background ─────────────────────────────
const ConceptCard: React.FC<{
  Icon: React.FC<{ color: string }>;
  title: string;
  accentColor: string;
  durationSec: number;
}> = ({ Icon, title, accentColor, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.round(durationSec * fps);

  // Card entrance
  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const slideUp = interpolate(entrance, [0, 1], [40, 0]);
  const scale = interpolate(entrance, [0, 1], [0.85, 1]);

  // Icon bounce-in (slightly delayed)
  const iconSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const iconScale = interpolate(iconSpring, [0, 1], [0, 1.15]);
  const iconFinalScale = frame > 14
    ? interpolate(
        spring({
          frame: frame - 14,
          fps,
          config: { damping: 200 },
          durationInFrames: 8,
        }),
        [0, 1],
        [1.15, 1],
      )
    : iconScale;

  // Label slide-in
  const labelSpring = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 200 },
    durationInFrames: 12,
  });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [totalFrames - 15, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Subtle floating animation on the icon
  const float = Math.sin((frame / fps) * 2.5) * 3;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity: entrance * fadeOut,
          transform: `translateY(${slideUp}px) scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* White card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 24,
            padding: "32px 40px",
            boxShadow: `0 4px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04), 0 0 40px ${accentColor}15`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            minWidth: 200,
          }}
        >
          {/* Icon with accent background circle */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `${accentColor}12`,
              border: `2px solid ${accentColor}25`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: `scale(${iconFinalScale}) translateY(${float}px)`,
            }}
          >
            <Icon color={accentColor} />
          </div>

          {/* Title */}
          <div
            style={{
              opacity: labelSpring,
              transform: `translateY(${interpolate(labelSpring, [0, 1], [10, 0])}px)`,
              fontSize: 20,
              fontWeight: 700,
              fontFamily: conceptFont,
              color: "#1a1a1a",
              textAlign: "center",
              letterSpacing: -0.3,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main export ────────────────────────────────────────────────────
export const ConceptAnimations: React.FC = () => {
  const { fps } = useVideoConfig();

  // Concept cards positioned in the upper-right area to avoid captions
  const positioning: React.CSSProperties = {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingRight: 40,
    paddingTop: 200,
  };

  // Timings matched to actual transcript about building AI agents
  const concepts = [
    { at: 2,   dur: 4,   Icon: BrainIcon,    title: "AI Agent\nStructure",        color: "#6366F1" },
    { at: 6,   dur: 10,  Icon: TargetIcon,    title: "Agent\nInstructions",       color: "#EC4899" },
    { at: 17,  dur: 10,  Icon: RocketIcon,    title: "Tools",                      color: "#F59E0B" },
    { at: 28,  dur: 7,   Icon: ChartIcon,     title: "Resources",                  color: "#3B82F6" },
    { at: 36,  dur: 16,  Icon: LightbulbIcon, title: "Building\nAnalogy",          color: "#10B981" },
    { at: 54,  dur: 8,   Icon: StarIcon,      title: "Agent\nInstructions",        color: "#8B5CF6" },
  ];

  return (
    <AbsoluteFill>
      {concepts.map(({ at, dur, Icon, title, color }, i) => (
        <Sequence
          key={i}
          from={Math.round(at * fps)}
          durationInFrames={Math.round(dur * fps)}
          premountFor={fps}
        >
          <AbsoluteFill style={positioning}>
            <ConceptCard
              Icon={Icon}
              title={title}
              accentColor={color}
              durationSec={dur}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
