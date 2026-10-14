import React from "react";

type Props = {
  text: string;
  frame: number;
  startFrame: number;
  charsPerFrame?: number; // typing speed
  showCaret?: boolean;
  style?: React.CSSProperties;
};

// Renders progressively-typed text. Caret blinks while typing pauses.
export const Typewriter: React.FC<Props> = ({
  text,
  frame,
  startFrame,
  charsPerFrame = 0.6,
  showCaret = true,
  style,
}) => {
  const local = Math.max(0, frame - startFrame);
  const charsRevealed = Math.min(text.length, Math.floor(local * charsPerFrame));
  const shown = text.slice(0, charsRevealed);
  const typingDone = charsRevealed >= text.length;

  // Caret blink — 24-frame cycle (on for 12f, off for 12f) when typing is done; solid while typing
  const caretOpacity = typingDone ? (local % 24 < 12 ? 1 : 0) : 1;

  return (
    <span style={style}>
      {shown}
      {showCaret && local >= 0 && (
        <span
          style={{
            display: "inline-block",
            width: 1.5,
            height: "1em",
            background: "currentColor",
            marginLeft: 1,
            verticalAlign: "-0.15em",
            opacity: caretOpacity,
          }}
        />
      )}
    </span>
  );
};
