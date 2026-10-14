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
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 20,
          padding: "22px 40px",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily: overlayFont,
            color: "#1a1a1a",
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          How to Build an AI Agent 🤖
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Progress bar along top ─────────────────────────────────────────
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "rgba(255,255,255,0.15)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: "linear-gradient(90deg, #FACC15, #F59E0B)",
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 12px rgba(250, 204, 21, 0.4)",
        }}
      />
    </div>
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
  const scale = interpolate(entrance, [0, 1], [0.9, 1]);

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
          opacity: entrance,
          transform: `translateY(${slideUp}px) scale(${scale})`,
          background: "#FACC15",
          borderRadius: 30,
          padding: "14px 36px",
          boxShadow:
            "0 0 30px rgba(250, 204, 21, 0.35), 0 4px 16px rgba(0,0,0,0.3)",
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
          Follow for more 🔥
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
      {/* Progress bar — entire video */}
      <ProgressBar />

      {/* Hook title at start */}
      <Sequence
        from={0}
        durationInFrames={Math.round(4 * fps)}
        premountFor={fps}
      >
        <HookTitle />
      </Sequence>

      {/* CTA at closing — last 6 seconds */}
      <Sequence
        from={Math.round(59 * fps)}
        durationInFrames={Math.round(6.4 * fps)}
        premountFor={fps}
      >
        <CTAOverlay />
      </Sequence>
    </AbsoluteFill>
  );
};
