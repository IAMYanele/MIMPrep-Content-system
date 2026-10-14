import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, W, H } from "./tokens";
import { useCardOffset, fadeEnvelope } from "../animation/springs";
import { BrowserChrome } from "./BrowserChrome";

type Props = {
  url: string;
  tabTitle: string;
  durationInFrames: number;
  children: (innerFrame: number, dims: { w: number; h: number }) => React.ReactNode;
};

// Wraps a scene with: page bg + browser chrome that slings up from below
// and slides back down at the end. Provides a local frame to children.
export const SceneShell: React.FC<Props> = ({ url, tabTitle, durationInFrames, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const y = useCardOffset({ frame, fps, durationInFrames });
  const opacity = fadeEnvelope({ frame, durationInFrames, fadeInFrames: 4, fadeOutFrames: 10 });

  // Slight overshoot tilt during settle
  const tilt = 0; // disabled — translateY is enough motion

  // Browser content area dimensions (after chrome subtracts top bars)
  const chromeTop = 44 + 40; // title + url bar
  const innerW = W - 160; // 80px margin each side
  const innerH = H - 120 - chromeTop; // 60px margin top/bottom, minus chrome
  const innerY = 60 + chromeTop;
  const innerX = 80;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Soft backdrop dim so chrome stands out from the speaker video */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(30,41,30,0.55) 0%, rgba(30,41,30,0.78) 70%)",
          opacity: opacity * 0.92,
        }}
      />
      {/* Browser chrome — slings up with spring */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 60,
          width: W - 160,
          height: H - 120,
          opacity,
          transform: `translateY(${y}px) rotate(${tilt}deg)`,
          transformOrigin: "50% 100%",
        }}
      >
        <BrowserChrome url={url} tabTitle={tabTitle} style={{ width: "100%", height: "100%" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", background: C.page }}>
            {children(frame, { w: innerW, h: innerH })}
          </div>
        </BrowserChrome>
      </div>
      {/* Expose inner coords as data for cursor positioning hints */}
      <div data-inner-x={innerX} data-inner-y={innerY} style={{ display: "none" }} />
    </AbsoluteFill>
  );
};

// Returns coords for a point relative to the chrome inner area, which is
// where scene children are rendered (the relatively-positioned body div
// inside <BrowserChrome>). Cursor waypoints are passed directly as left/top
// inside that container, so no offset math is needed — this is effectively
// a pass-through, kept named for documentation intent in scene files.
// Valid range: x ∈ [0, 1760], y ∈ [0, 876].
export const innerToAbs = (x: number, y: number) => ({ x, y });
