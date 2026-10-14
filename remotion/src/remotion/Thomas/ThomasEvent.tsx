import React from "react";
import { AbsoluteFill } from "remotion";
import { BONE, DISPLAY, Field } from "./canvas";
import { EVENTS } from "./events";
import { FourCards, SameGoal, TheBook } from "./scenes/intro";
import { ChapterTurn } from "./scenes/chapter";
import { CramVsDaily, ThirtySeven, Valley } from "./scenes/compounding";
import { HoldingPattern, Problems, SevenHundred, SystemOverOutcome } from "./scenes/systems";
import { ArrowFlip, OrdinaryTuesday } from "./scenes/identity";
import { HabitLoop, Lever } from "./scenes/loop";
import { EnvelopeOpen, Promo, Recap } from "./scenes/outro";

// One composition for every animation event. `id` selects the scene; the duration
// comes from the cue sheet in events.ts, and `from` — where this event sits in the
// assembled cut — comes from timings.json, which the assembly script writes.
//
// Rendering per event rather than one 9-minute timeline keeps each render small,
// and lets the talking head between events stay stream-copied instead of re-encoded.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const TIMINGS: Record<string, { from: number }> = require("./timings.json");

export type ThomasEventProps = { id: string };

const Missing: React.FC<{ id: string }> = ({ id }) => (
  <Field>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 70, color: BONE, opacity: 0.4 }}>{id}</div>
    </AbsoluteFill>
  </Field>
);

export const ThomasEvent: React.FC<ThomasEventProps> = ({ id }) => {
  const ev = EVENTS.find((e) => e.id === id);
  if (!ev) return <Missing id={`unknown event: ${id}`} />;
  const from = TIMINGS[id]?.from ?? 0;
  const d = ev.dur;

  const scene = (() => {
    switch (id) {
      // intro
      case "same-goal":
        return <SameGoal dur={d} />;
      case "the-book":
        return <TheBook from={from} dur={d} />;
      case "four-cards":
        return <FourCards dur={d} />;
      // chapter device
      case "chapter-1":
        return <ChapterTurn index={0} dur={d} />;
      case "chapter-2":
        return <ChapterTurn index={1} dur={d} />;
      case "chapter-3":
        return <ChapterTurn index={2} dur={d} />;
      case "chapter-4":
        return <ChapterTurn index={3} dur={d} />;
      // 1 compounding
      case "thirty-seven":
        return <ThirtySeven dur={d} />;
      case "cram-vs-daily":
        return <CramVsDaily from={from} dur={d} />;
      case "valley":
        return <Valley dur={d} />;
      // 2 systems
      case "problem-1":
        return <Problems upto={1} from={from} dur={d} />;
      case "problem-2":
        return <Problems upto={2} from={from} dur={d} />;
      case "problem-3":
        return <Problems upto={3} from={from} dur={d} />;
      case "seven-hundred":
        return <SevenHundred dur={d} />;
      case "holding-pattern":
        return <HoldingPattern dur={d} />;
      case "system-over-outcome":
        return <SystemOverOutcome from={from} dur={d} />;
      // 3 identity
      case "arrow-flip":
        return <ArrowFlip dur={d} />;
      case "ordinary-tuesday":
        return <OrdinaryTuesday dur={d} />;
      // 4 the loop
      case "habit-loop":
        return <HabitLoop dur={d} />;
      case "lever-1":
        return <Lever index={0} from={from} dur={d} />;
      case "lever-2":
        return <Lever index={1} from={from} dur={d} />;
      case "lever-3":
        return <Lever index={2} from={from} dur={d} />;
      case "lever-4":
        return <Lever index={3} from={from} dur={d} />;
      // recap + CTA
      case "recap":
        return <Recap dur={d} />;
      case "envelope-open":
        return <EnvelopeOpen dur={d} />;
      case "promo":
        return <Promo dur={d} />;
      default:
        return <Missing id={id} />;
    }
  })();

  // hard in and out: the style cuts straight back to the face, and a fade here
  // encoded as a black frame at both ends of every event
  return scene;
};

export const thomasEventMetadata = ({ props }: { props: ThomasEventProps }) => {
  const ev = EVENTS.find((e) => e.id === props.id);
  return {
    // the raw is 25 fps, so events are too — no resampling at the joins
    durationInFrames: Math.round((ev?.dur ?? 5) * 25),
    fps: 25,
    width: 1920,
    height: 1080,
  };
};
