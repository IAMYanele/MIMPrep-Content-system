import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useDelayRender } from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import {
  fontFamily as captionFont,
  loadFont as loadCaptionFont,
} from "@remotion/google-fonts/SpaceGrotesk";

loadCaptionFont("normal", { subsets: ["latin"], weights: ["700"] });

const SWITCH_CAPTIONS_EVERY_MS = 700;
const MAX_CHARS_PER_PAGE = 20;
const ACTIVE_BG = "#FACC15";
const FONT_SIZE = 68;

const Word: React.FC<{
  text: string;
  isActive: boolean;
}> = ({ text, isActive }) => {
  return (
    <span
      style={{
        position: "relative",
        display: "inline",
        padding: isActive ? "2px 8px" : "2px 0",
        margin: isActive ? "0 2px" : 0,
        borderRadius: 8,
        background: isActive ? ACTIVE_BG : "transparent",
        color: isActive ? "#000" : "#fff",
        fontWeight: 700,
        textShadow: isActive
          ? "none"
          : "0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.5)",
      }}
    >
      {text}
    </span>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  const entrance = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 200,
      }}
    >
      <div
        style={{
          opacity: entrance,
          transform: `scale(${0.85 + entrance * 0.15})`,
          fontSize: FONT_SIZE,
          fontWeight: 700,
          fontFamily: captionFont,
          textAlign: "center",
          maxWidth: 950,
          lineHeight: 1.3,
          textTransform: "uppercase",
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

          return (
            <Word
              key={token.fromMs}
              text={token.text}
              isActive={isActive}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

function splitOversizedPages(pages: TikTokPage[]): TikTokPage[] {
  const result: TikTokPage[] = [];
  for (const page of pages) {
    const fullText = page.tokens.map((t) => t.text).join("");
    if (fullText.trim().length <= MAX_CHARS_PER_PAGE) {
      result.push(page);
      continue;
    }
    const mid = Math.ceil(page.tokens.length / 2);
    const firstTokens = page.tokens.slice(0, mid);
    const secondTokens = page.tokens.slice(mid);
    if (firstTokens.length > 0) {
      result.push({ ...page, tokens: firstTokens });
    }
    if (secondTokens.length > 0) {
      result.push({
        ...page,
        startMs: secondTokens[0].fromMs,
        tokens: secondTokens,
      });
    }
  }
  return result;
}

export const EnvironmentCaptions: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile("environment-captions.json"));
      const data = await response.json();
      setCaptions(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const pages = useMemo(() => {
    if (!captions) return [];
    const raw = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    }).pages;
    return splitOversizedPages(raw);
  }, [captions]);

  if (!captions) return null;

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          startFrame + (SWITCH_CAPTIONS_EVERY_MS / 1000) * fps,
        );
        const durationInFrames = Math.round(endFrame - startFrame);

        if (durationInFrames <= 0) return null;

        return (
          <Sequence
            key={index}
            from={Math.round(startFrame)}
            durationInFrames={durationInFrames}
            premountFor={fps}
          >
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
