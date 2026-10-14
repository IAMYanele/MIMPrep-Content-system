// ─────────────────────────────────────────────────────────────
// JadeAdCta — the ad build: talking head + captions + optional B-roll + an
// optional vertical stack, plus a CTA moment at the end.
//
// These are ADS, not organic posts: the whole thing is paid for by whether the
// viewer types one word in the comments. So unlike the organic edits — where the
// rule is "don't decorate, don't retell" — the CTA genuinely earns a dedicated
// moment. It is not retelling: hearing "comment the word collagen" and SEEING
// the exact string you have to type are different jobs, and the second one is
// what converts.
//
// Everything before the CTA still follows the organic discipline: animate only
// where the audio can't carry it.
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { JadeCaptions } from "./JadeCaptions";

const anton = loadAnton().fontFamily;

const brollSchema = z.object({
  src: z.string(),
  fromSeconds: z.number(),
  durationInSeconds: z.number(),
  crossOut: z.boolean().default(false), // for the "it's NOT this" rule-outs
  // A COVER cutaway: renders above the graphics and the matte instead of below
  // them, so it hides a graphic layer switching on or off. Cutting away should
  // cut away from everything - otherwise the seam shows through the cover,
  // which is the exact tell we are trying to remove.
  over: z.boolean().default(false),
});

const rowSchema = z.object({
  img: z.string().default(""),
  label: z.string(),
  note: z.string().default(""),
  atSeconds: z.number(),
});

export const jadeAdCtaSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  durationInSeconds: z.number(),
  fps: z.number(),
  broll: z.array(brollSchema).default([]),
  rows: z.array(rowSchema).default([]),
  rowsFromSeconds: z.number().default(0),
  rowsClearAtSeconds: z.number().default(0),
  rowsTopY: z.number().default(1160),
  rowH: z.number().default(112),
  ctaFromSeconds: z.number(),
  ctaDurationInSeconds: z.number(),
  ctaWord: z.string().default("COLLAGEN"),
  ctaLine: z.string().default("COMMENT THE WORD"),
  ctaSub: z.string().default("AND CHECK YOUR MESSAGES"),
  ctaTopY: z.number().default(1560),
  // An alpha-matted copy of the SUBJECT ONLY (VP9/WebM, yuva420p), produced by
  // make-matte.py. Layer order is: base footage -> graphics -> this. That puts
  // the graphics BEHIND her head while she and the product stay in front, so a
  // graphic can occupy the middle of frame without hiding the pouch.
  // matteFromSeconds is where this clip sits on the main timeline; the clip
  // itself always starts at its own frame 0.
  matteSrc: z.string().default(""),
  matteFromSeconds: z.number().default(0),
  matteDurationInSeconds: z.number().default(0),
  // Seconds to skip INTO the matte clip. The matte is generated for a wider
  // window than it is used, so this offsets to the right frame. Needed because
  // the behind-subject effect should apply to the CTA only — a list of four
  // mistakes has to stay fully readable, so it renders in FRONT of her.
  matteTrimBeforeSeconds: z.number().default(0),
  // The compound name was cut from the VO because it is a mouthful that stalls
  // the read. On screen it still lands, and reads as credibility rather than a
  // stumble. Rendered in FRONT — it is the only place the term now appears.
  termText: z.string().default(""),
  termFromSeconds: z.number().default(0),
  termDurationInSeconds: z.number().default(0),
  termTopY: z.number().default(1230),
});
export type JadeAdCtaProps = z.infer<typeof jadeAdCtaSchema>;

export const calculateJadeAdCtaMetadata: CalculateMetadataFunction<JadeAdCtaProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * props.fps),
  fps: props.fps,
});

const GREEN = "#3DDC84";

const Cta: React.FC<{ word: string; line: string; sub: string; topY: number }> = ({ word, line, sub, topY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 200, stiffness: 190 }, durationInFrames: 10 });
  // a slow pulse so the pill keeps drawing the eye without flashing
  const pulse = 1 + 0.02 * Math.sin((frame / fps) * 4.4);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: topY,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: pop,
          transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: anton,
            fontSize: 58,
            color: "#fff",
            letterSpacing: 3,
            textTransform: "uppercase",
            textShadow: "0 4px 16px rgba(0,0,0,0.9)",
            marginBottom: 14,
          }}
        >
          {line}
        </div>
        <div
          style={{
            transform: `scale(${pulse})`,
            background: GREEN,
            borderRadius: 999,
            padding: "18px 60px 22px",
            width: 980,
            display: "flex",
            justifyContent: "center",
            boxShadow: `0 0 44px ${GREEN}77, 0 16px 40px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Letters are spread edge-to-edge rather than centred: her head sits
              mid-frame and would otherwise cover the whole word. Distributed,
              the occlusion only ever hides two or three characters and the eye
              completes the rest. */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {word.split("").map((ch, i) => (
              <span
                key={i}
                style={{
                  fontFamily: anton,
                  fontSize: 130,
                  lineHeight: 1,
                  color: "#08140d",
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: anton,
              fontSize: 38,
              color: "#fff",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginTop: 12,
              textShadow: "0 4px 16px rgba(0,0,0,0.9)",
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};


const Term: React.FC<{ text: string; topY: number }> = ({ text, topY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 200, stiffness: 200 }, durationInFrames: 8 });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: topY,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          padding: "0 50px",
          opacity: pop,
          transform: `scale(${interpolate(pop, [0, 1], [0.92, 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: anton,
            fontSize: 62,
            lineHeight: 1.05,
            color: "#fff",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 2,
            background: "rgba(8,8,10,0.82)",
            border: `3px solid ${GREEN}`,
            borderRadius: 22,
            padding: "18px 40px 22px",
            boxShadow: "0 14px 36px rgba(0,0,0,0.55)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Rows: React.FC<{
  rows: z.infer<typeof rowSchema>[];
  topY: number;
  rowH: number;
  t: number;
  fps: number;
  fromSeconds: number;
  clearAtSeconds: number;
}> = ({ rows, topY, rowH, t, fps, fromSeconds, clearAtSeconds }) => {
  const activeIdx = rows.reduce((acc, r, i) => (t >= r.atSeconds ? i : acc), -1);
  const W = 880;
  // Hard on/off reads as a glitch. Ease both ends so that even where B-roll
  // does not mask the change, nothing snaps.
  const fadeIn = interpolate(t, [fromSeconds, fromSeconds + 0.32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(t, [clearAtSeconds - 0.32, clearAtSeconds], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const groupOpacity = Math.min(fadeIn, fadeOut);
  return (
    <div
      style={{
        position: "absolute",
        top: topY,
        left: (1080 - W) / 2,
        width: W,
        opacity: groupOpacity,
        transform: `translateY(${interpolate(fadeIn, [0, 1], [22, 0])}px)`,
      }}
    >
      {rows.map((r, i) => {
        const isActive = i === activeIdx;
        return (
          <div
            key={i}
            style={{
              height: rowH,
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 12,
              padding: "0 20px 0 14px",
              borderRadius: 20,
              background: isActive ? "rgba(10,10,12,0.84)" : "rgba(10,10,12,0.5)",
              border: `3px solid ${isActive ? GREEN : "rgba(255,255,255,0.16)"}`,
              opacity: isActive ? 1 : 0.6,
            }}
          >
            {r.img ? (
              <div
                style={{
                  width: rowH - 26,
                  height: rowH - 26,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "3px solid #fff",
                  flexShrink: 0,
                }}
              >
                <Img
                  src={staticFile(r.img)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ) : null}
            <div
              style={{
                fontFamily: anton,
                fontSize: 42,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: 1,
                flex: 1,
              }}
            >
              {r.label}
            </div>
            {r.note ? (
              <div
                style={{
                  fontFamily: anton,
                  fontSize: 40,
                  color: isActive ? GREEN : "rgba(255,255,255,0.65)",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {r.note}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export const JadeAdCta: React.FC<JadeAdCtaProps> = ({
  videoSrc,
  captionsSrc,
  fps,
  broll,
  rows,
  rowsFromSeconds,
  rowsClearAtSeconds,
  rowsTopY,
  rowH,
  ctaFromSeconds,
  ctaDurationInSeconds,
  ctaWord,
  ctaLine,
  ctaSub,
  ctaTopY,
  matteSrc,
  matteFromSeconds,
  matteDurationInSeconds,
  matteTrimBeforeSeconds,
  termText,
  termFromSeconds,
  termDurationInSeconds,
  termTopY,
}) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const rowsOn = rows.length > 0 && t >= rowsFromSeconds && t < rowsClearAtSeconds + 0.05;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* objectFit MUST be a prop — @remotion/media ignores it in style. */}
      <Video
        src={staticFile(videoSrc)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      {broll.filter((b) => !b.over).map((b, i) => (
        <Sequence
          key={`b-${i}`}
          from={Math.round(b.fromSeconds * fps)}
          durationInFrames={Math.round(b.durationInSeconds * fps)}
          premountFor={fps}
          name={`broll-${i}`}
        >
          <AbsoluteFill style={{ background: "#000" }}>
            <Video
              src={staticFile(b.src)}
              muted
              objectFit="cover"
              style={{
                width: "100%",
                height: "100%",
                ...(b.crossOut ? { filter: "saturate(0.35) brightness(0.72)" } : {}),
              }}
            />
            {/* rule-out beats ("it's NOT retinol") get a red cross so the
                dismissal is visible, not just audible */}
            {b.crossOut ? (
              <AbsoluteFill>
                <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%" }}>
                  <line x1={250} y1={640} x2={830} y2={1220} stroke="#FF4D4D" strokeWidth={26} strokeLinecap="round" />
                  <line x1={830} y1={640} x2={250} y2={1220} stroke="#FF4D4D" strokeWidth={26} strokeLinecap="round" />
                </svg>
              </AbsoluteFill>
            ) : null}
          </AbsoluteFill>
        </Sequence>
      ))}

      {rowsOn ? (
        <AbsoluteFill>
          <Rows rows={rows} topY={rowsTopY} rowH={rowH} t={t} fps={fps} fromSeconds={rowsFromSeconds} clearAtSeconds={rowsClearAtSeconds} />
        </AbsoluteFill>
      ) : null}

      <Sequence
        from={Math.round(ctaFromSeconds * fps)}
        durationInFrames={Math.round(ctaDurationInSeconds * fps)}
        name="cta"
      >
        <Cta word={ctaWord} line={ctaLine} sub={ctaSub} topY={ctaTopY} />
      </Sequence>

      {/* Subject-only layer, drawn LAST so it covers the graphics above: she and
          the product sit in front, the graphic reads behind her head. This has to
          come after the rows AND the CTA — if it renders before either of them,
          they draw on top and the whole effect inverts. */}
      {matteSrc && matteDurationInSeconds > 0 ? (
        <Sequence
          from={Math.round(matteFromSeconds * fps)}
          durationInFrames={Math.round(matteDurationInSeconds * fps)}
          premountFor={fps}
          name="matte"
        >
          <AbsoluteFill>
            <Video
              src={staticFile(matteSrc)}
              muted
              trimBefore={Math.round(matteTrimBeforeSeconds * fps)}
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </AbsoluteFill>
        </Sequence>
      ) : null}

      {termText && termDurationInSeconds > 0 ? (
        <Sequence
          from={Math.round(termFromSeconds * fps)}
          durationInFrames={Math.round(termDurationInSeconds * fps)}
          name="term"
        >
          <Term text={termText} topY={termTopY} />
        </Sequence>
      ) : null}

      {/* Cover cutaways: above the graphics AND the matte. */}
      {broll.filter((b) => b.over).map((b, i) => (
        <Sequence
          key={`cov-${i}`}
          from={Math.round(b.fromSeconds * fps)}
          durationInFrames={Math.round(b.durationInSeconds * fps)}
          premountFor={fps}
          name={`cover-${i}`}
        >
          <AbsoluteFill style={{ background: "#000" }}>
            <Video
              src={staticFile(b.src)}
              muted
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Captions stay on top of everything — they must never be occluded. */}
      <JadeCaptions captionsSrc={captionsSrc} />
    </AbsoluteFill>
  );
};
