import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  fontFamily as saasFont,
  loadFont as loadSaasFont,
} from "@remotion/google-fonts/SpaceGrotesk";

loadSaasFont("normal", { subsets: ["latin"], weights: ["500", "700"] });

// All SaaS graphics live in the lower-middle zone (below speaker's chin, above captions)
// On 1080x1920: speaker face ~top 55%, graphics ~55-78%, captions ~bottom 15%
// Lower zone — on chest area, well below chin, above captions at y:~1700
const GRAPHICS_ZONE = {
  top: 1280,
};

// ── Section 1: Agent Instructions — wide code editor card ──────────
const AgentInstructionsGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const TOTAL = Math.round(8 * fps);

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const slideY = interpolate(entrance, [0, 1], [60, 0]);

  const fadeOut = interpolate(frame, [TOTAL - 15, TOTAL], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const codeLines = [
    { color: "#818CF8", width: "85%" },
    { color: "rgba(255,255,255,0.3)", width: "60%" },
    { color: "#A78BFA", width: "72%" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: GRAPHICS_ZONE.top,
        left: 40,
        right: 40,
        opacity: entrance * fadeOut,
        transform: `translateY(${slideY}px)`,
      }}
    >
      <div
        style={{
          width: "100%",
          background: "rgba(15, 15, 25, 0.9)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          borderRadius: 20,
          padding: "20px 24px",
          boxShadow:
            "0 0 60px rgba(99, 102, 241, 0.15), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 6,
              background: "#EF4444",
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 6,
              background: "#F59E0B",
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 6,
              background: "#22C55E",
            }}
          />
          <div
            style={{
              marginLeft: "auto",
              fontSize: 15,
              fontFamily: saasFont,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
            }}
          >
            CLAUDE.md
          </div>
        </div>
        {/* Code lines — horizontal, full width */}
        {codeLines.map((line, i) => {
          const lineDelay = 6 + i * 3;
          const lineSpring = spring({
            frame: Math.max(0, frame - lineDelay),
            fps,
            config: { damping: 200 },
            durationInFrames: 12,
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.2)",
                  width: 22,
                  textAlign: "right" as const,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  height: 18,
                  width: line.width,
                  borderRadius: 6,
                  background: line.color,
                  opacity: lineSpring,
                  transform: `scaleX(${lineSpring})`,
                  transformOrigin: "left center",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Section 2: Tools — horizontal row of icon cards ─────────────────
const ToolsGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const TOTAL = Math.round(10 * fps);

  const fadeOut = interpolate(frame, [TOTAL - 15, TOTAL], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tools = [
    {
      label: "Remotion",
      color: "#F59E0B",
      delay: 0,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="13" height="14" rx="2" fill="white" />
          <path
            d="M17 8.5L22 5.5V18.5L17 15.5V8.5Z"
            fill="white"
            opacity="0.8"
          />
        </svg>
      ),
    },
    {
      label: "Google Drive",
      color: "#34D399",
      delay: 8,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 4C9.2 4 7 6 6.7 8.5C4.6 9 3 10.8 3 13c0 2.5 2 4.5 4.5 4.5H17c2.8 0 5-2.2 5-5 0-2.5-1.8-4.5-4.2-4.9C17.3 5.5 14.9 4 12 4z" />
        </svg>
      ),
    },
    {
      label: "Automation",
      color: "#A78BFA",
      delay: 16,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: GRAPHICS_ZONE.top,
        left: 30,
        right: 30,
        opacity: fadeOut,
        display: "flex",
        gap: 14,
        justifyContent: "center",
      }}
    >
      {tools.map(({ icon, label, color, delay }, i) => {
        const s = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: { damping: 14, stiffness: 100 },
        });

        return (
          <div
            key={i}
            style={{
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
              background: "rgba(15, 15, 25, 0.85)",
              backdropFilter: "blur(16px)",
              borderRadius: 18,
              padding: "18px 14px",
              border: `1px solid ${color}30`,
              boxShadow: `0 0 30px ${color}10, 0 8px 24px rgba(0,0,0,0.3)`,
              flex: 1,
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `${color}20`,
                border: `1px solid ${color}35`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                fontFamily: saasFont,
                color: "rgba(255,255,255,0.9)",
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                textAlign: "center" as const,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Section 3: Resources — horizontal brick wall with roof ──────────
const ResourcesGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const TOTAL = Math.round(5.5 * fps);

  const fadeOut = interpolate(frame, [TOTAL - 15, TOTAL], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 2 rows of bricks, compact
  const rows = [
    [
      { w: "48%", alpha: 0.75 },
      { w: "48%", alpha: 0.65 },
    ],
    [
      { w: "46%", alpha: 0.6 },
      { w: "50%", alpha: 0.7 },
    ],
  ];

  const roofSpring = spring({
    frame: Math.max(0, frame - rows.length * 5 - 4),
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: GRAPHICS_ZONE.top,
        left: 40,
        right: 40,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          background: "rgba(15, 15, 25, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: 20,
          padding: "20px 30px",
          boxShadow:
            "0 0 40px rgba(239, 68, 68, 0.1), 0 16px 48px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
      {/* Roof */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "90px solid transparent",
          borderRight: "90px solid transparent",
          borderBottom: "36px solid rgba(239, 68, 68, 0.6)",
          opacity: roofSpring,
          transform: `scaleY(${roofSpring})`,
          transformOrigin: "bottom center",
          filter: "drop-shadow(0 0 20px rgba(239,68,68,0.3))",
          marginBottom: 6,
        }}
      />
      {/* Brick rows — bottom-up stacking */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column-reverse",
          gap: 6,
        }}
      >
        {rows.map((row, rowIdx) => {
          const rowSpring = spring({
            frame: Math.max(0, frame - rowIdx * 5),
            fps,
            config: { damping: 16, stiffness: 100 },
          });
          return (
            <div
              key={rowIdx}
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
                opacity: rowSpring,
                transform: `translateY(${interpolate(rowSpring, [0, 1], [20, 0])}px)`,
              }}
            >
              {row.map((brick, brickIdx) => (
                <div
                  key={brickIdx}
                  style={{
                    width: brick.w,
                    height: 32,
                    borderRadius: 10,
                    background: `rgba(239, 68, 68, ${brick.alpha})`,
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    boxShadow: "0 4px 12px rgba(239,68,68,0.15)",
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
      {/* Label */}
      <div
        style={{
          marginTop: 14,
          fontSize: 16,
          fontWeight: 700,
          fontFamily: saasFont,
          color: "#F87171",
          textAlign: "center",
          textShadow: "0 2px 10px rgba(239,68,68,0.3)",
          letterSpacing: 1,
          textTransform: "uppercase" as const,
          opacity: spring({
            frame: Math.max(0, frame - rows.length * 5 - 8),
            fps,
            config: { damping: 200 },
            durationInFrames: 10,
          }),
        }}
      >
        Resources
      </div>
      </div>
    </div>
  );
};

// ── Main export ────────────────────────────────────────────────────
export const SaaSAnimations: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Agent Instructions: 6.5s–14.5s */}
      <Sequence
        from={Math.round(6.5 * fps)}
        durationInFrames={Math.round(8 * fps)}
        premountFor={fps}
      >
        <AgentInstructionsGraphic />
      </Sequence>

      {/* Tools: 17s–27s */}
      <Sequence
        from={Math.round(17 * fps)}
        durationInFrames={Math.round(10 * fps)}
        premountFor={fps}
      >
        <ToolsGraphic />
      </Sequence>

      {/* Resources: 29s–34.5s */}
      <Sequence
        from={Math.round(29 * fps)}
        durationInFrames={Math.round(5.5 * fps)}
        premountFor={fps}
      >
        <ResourcesGraphic />
      </Sequence>
    </AbsoluteFill>
  );
};
