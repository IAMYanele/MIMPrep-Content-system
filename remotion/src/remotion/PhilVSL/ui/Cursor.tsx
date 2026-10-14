import React from "react";
import { interpolate, Easing } from "remotion";

export type CursorWaypoint = {
  x: number; // px in composition space
  y: number;
  at: number; // local frame in the scene
  click?: boolean;
};

type Props = {
  frame: number;
  waypoints: CursorWaypoint[];
  hidden?: boolean;
};

// macOS-style cursor SVG
const CursorSvg: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <svg
    width={32 * scale}
    height={36 * scale}
    viewBox="0 0 32 36"
    style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
  >
    <path
      d="M3 2 L3 25 L9.5 19 L13.5 28 L17 26.5 L13 17.5 L22 17.5 Z"
      fill="#FFFFFF"
      stroke="#1E291E"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const EASE = Easing.bezier(0.4, 0, 0.2, 1);

export const Cursor: React.FC<Props> = ({ frame, waypoints, hidden }) => {
  if (waypoints.length === 0 || hidden) return null;

  // Find current segment
  let from = waypoints[0];
  let to = waypoints[0];
  for (let i = 0; i < waypoints.length - 1; i++) {
    if (frame >= waypoints[i].at && frame <= waypoints[i + 1].at) {
      from = waypoints[i];
      to = waypoints[i + 1];
      break;
    }
    if (frame > waypoints[i + 1].at) {
      from = waypoints[i + 1];
      to = waypoints[i + 1];
    }
  }

  const t = from.at === to.at ? 1 : interpolate(frame, [from.at, to.at], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const x = interpolate(t, [0, 1], [from.x, to.x]);
  const y = interpolate(t, [0, 1], [from.y, to.y]);

  // Click ripple — find nearest waypoint with click flag near current frame
  const clickPoint = waypoints.find((w) => w.click && Math.abs(frame - w.at) < 16);
  const clickProgress = clickPoint
    ? interpolate(frame, [clickPoint.at, clickPoint.at + 14], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : null;

  return (
    <>
      {/* Click ripple */}
      {clickPoint && clickProgress !== null && clickProgress > 0 && (
        <div
          style={{
            position: "absolute",
            left: clickPoint.x - 30,
            top: clickPoint.y - 30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "2px solid rgba(200, 255, 140, 0.85)",
            background: "rgba(200, 255, 140, 0.15)",
            transform: `scale(${interpolate(clickProgress, [0, 1], [0.3, 1.6])})`,
            opacity: interpolate(clickProgress, [0, 0.4, 1], [0.9, 0.6, 0]),
            pointerEvents: "none",
            transition: "none",
          }}
        />
      )}
      {/* Cursor — small press scale on click */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `scale(${clickPoint && clickProgress !== null && clickProgress < 0.3 ? 0.85 : 1})`,
          pointerEvents: "none",
          zIndex: 1000,
        }}
      >
        <CursorSvg />
      </div>
    </>
  );
};
