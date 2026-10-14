import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  fontFamily as overlayFont,
  loadFont as loadOverlayFont,
} from "@remotion/google-fonts/SpaceGrotesk";

loadOverlayFont("normal", { subsets: ["latin"], weights: ["700"] });

// ── Hook title — cinematic intro ───────────────────────────────────
const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const slideIn = interpolate(entrance, [0, 1], [50, 0]);
  const scaleIn = interpolate(entrance, [0, 1], [0.9, 1]);

  const fadeOut = interpolate(frame, [3 * fps, 3.5 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 120,
      }}
    >
      <div
        style={{
          opacity: entrance * fadeOut,
          transform: `translateY(${slideIn}px) scale(${scaleIn})`,
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 18,
          padding: "18px 36px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily: overlayFont,
            color: "white",
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          How to Build an
        </div>
        <div
          style={{
            fontSize: 46,
            fontWeight: 700,
            fontFamily: overlayFont,
            color: "#39E508",
            textAlign: "center",
            lineHeight: 1.35,
            textShadow: "0 0 20px rgba(57, 229, 8, 0.3)",
          }}
        >
          AI Agent
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Section label — brief flash (2.5s), then fades out ─────────────
const SectionLabel: React.FC<{
  label: string;
  number: string;
  color: string;
}> = ({ label, number, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const slideX = interpolate(entrance, [0, 1], [-30, 0]);

  // Fade out after ~1.8s (stays visible briefly, then leaves)
  const fadeOut = interpolate(
    frame,
    [1.8 * fps, 2.5 * fps],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingTop: 100,
        paddingLeft: 40,
      }}
    >
      <div
        style={{
          opacity: entrance * fadeOut,
          transform: `translateX(${slideX}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: 14,
          padding: "10px 18px 10px 10px",
          border: `1px solid ${color}33`,
          boxShadow: `0 0 24px ${color}15`,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: color,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 20,
            fontWeight: 700,
            fontFamily: overlayFont,
            color: "white",
            boxShadow: `0 0 16px ${color}40`,
          }}
        >
          {number}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: overlayFont,
            color: "white",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── CTA overlay ────────────────────────────────────────────────────
const CTAOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const slideUp = interpolate(entrance, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          opacity: entrance,
          transform: `translateY(${slideUp}px)`,
          background: "#39E508",
          borderRadius: 30,
          padding: "14px 36px",
          boxShadow:
            "0 0 30px rgba(57, 229, 8, 0.35), 0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: overlayFont,
            color: "#000",
          }}
        >
          Follow for more AI tips
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main export ────────────────────────────────────────────────────
export const Overlays: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Hook title: 0–4s */}
      <Sequence
        from={0}
        durationInFrames={Math.round(4 * fps)}
        premountFor={fps}
      >
        <HookTitle />
      </Sequence>

      {/* Section 1 label: flashes at 5s for 2.5s */}
      <Sequence
        from={Math.round(5 * fps)}
        durationInFrames={Math.round(2.5 * fps)}
        premountFor={fps}
      >
        <SectionLabel
          label="Agent Instructions"
          number="1"
          color="#6366F1"
        />
      </Sequence>

      {/* Section 2 label: flashes at 15.9s for 2.5s */}
      <Sequence
        from={Math.round(15.9 * fps)}
        durationInFrames={Math.round(2.5 * fps)}
        premountFor={fps}
      >
        <SectionLabel label="Tools" number="2" color="#F59E0B" />
      </Sequence>

      {/* Section 3 label: flashes at 28.1s for 2.5s */}
      <Sequence
        from={Math.round(28.1 * fps)}
        durationInFrames={Math.round(2.5 * fps)}
        premountFor={fps}
      >
        <SectionLabel label="Resources" number="3" color="#EF4444" />
      </Sequence>

      {/* CTA at closing: 38–44.3s */}
      <Sequence
        from={Math.round(38 * fps)}
        durationInFrames={Math.round(6.3 * fps)}
        premountFor={fps}
      >
        <CTAOverlay />
      </Sequence>
    </AbsoluteFill>
  );
};
