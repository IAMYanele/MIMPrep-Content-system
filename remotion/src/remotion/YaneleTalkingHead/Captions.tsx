import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const ACTIVE_COLOR = "#FACC15";
const BOX_BG = "rgba(0, 0, 0, 0.78)";
const FONT_SIZE = 58;

// ── Animated highlight box that jumps between words ────────────────
const HighlightBox: React.FC<{
  left: number;
  top: number;
  width: number;
  height: number;
  progress: number;
}> = ({ left, top, width, height, progress }) => {
  const PAD_X = 6;
  const PAD_Y = 4;
  return (
    <div
      style={{
        position: "absolute",
        left: left - PAD_X,
        top: top - PAD_Y,
        width: width + PAD_X * 2,
        height: height + PAD_Y * 2,
        borderRadius: 10,
        background: ACTIVE_COLOR,
        opacity: progress,
        transform: `scaleX(${progress})`,
        transformOrigin: "left center",
        pointerEvents: "none",
      }}
    />
  );
};

// ── Caption page with animated highlight ───────────────────────────
const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordRects, setWordRects] = useState<
    Map<number, { left: number; top: number; width: number; height: number }>
  >(new Map());

  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  // Find active token
  const activeToken = page.tokens.find(
    (t) => t.fromMs <= absoluteTimeMs && t.toMs > absoluteTimeMs,
  );

  // Measure word positions after first render
  useEffect(() => {
    if (!containerRef.current) return;
    const spans =
      containerRef.current.querySelectorAll<HTMLSpanElement>("[data-from]");
    const containerRect = containerRef.current.getBoundingClientRect();
    const rects = new Map<
      number,
      { left: number; top: number; width: number; height: number }
    >();
    spans.forEach((span) => {
      const fromMs = Number(span.getAttribute("data-from"));
      const rect = span.getBoundingClientRect();
      rects.set(fromMs, {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      });
    });
    setWordRects(rects);
  }, [page.tokens]);

  // Spring for highlight box entrance
  const boxProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 8,
  });

  const activeRect = activeToken ? wordRects.get(activeToken.fromMs) : null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 1320,
      }}
    >
      {/* Background pill */}
      <div
        style={{
          position: "relative",
          background: BOX_BG,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 16,
          padding: "12px 24px",
          maxWidth: 920,
        }}
      >
        {/* Animated highlight behind active word */}
        {activeRect && (
          <HighlightBox
            left={activeRect.left}
            top={activeRect.top}
            width={activeRect.width}
            height={activeRect.height}
            progress={boxProgress}
          />
        )}

        {/* Text */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            fontSize: FONT_SIZE,
            fontWeight: 700,
            fontFamily: captionFont,
            whiteSpace: "pre",
            textAlign: "center",
            lineHeight: 1.3,
            zIndex: 1,
          }}
        >
          {page.tokens.map((token) => {
            const isActive =
              token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

            return (
              <span
                key={token.fromMs}
                data-from={token.fromMs}
                style={{
                  position: "relative",
                  color: isActive ? "#000" : "white",
                  textShadow: isActive
                    ? "none"
                    : "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {token.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Page splitting for character limit ─────────────────────────────
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

// ── Main captions component ────────────────────────────────────────
export const Captions: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile("yanele-captions.json"));
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
