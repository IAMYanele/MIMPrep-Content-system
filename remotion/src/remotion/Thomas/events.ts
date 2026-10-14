// The cue sheet, as data. One entry per planned animation event.
//
// `sents` is the script sentence range the event covers; the build script resolves
// that to a real timecode in the assembled cut and writes timings.json, so nothing
// here has to be re-typed when the assembly changes.
//
// Channels follow the Iman editor brain: red = full-screen major, yellow = on-screen
// UI over the face, blue = AI image, green = real material, purple = promo.

export type Channel = "red" | "yellow" | "blue" | "green" | "purple";

export type Event = {
  id: string;
  channel: Channel;
  /** inclusive script sentence range this event sits on */
  sents: [number, number];
  /** seconds after that sentence starts, when two events share an anchor */
  offset?: number;
  /** seconds; the brain's window is 4-12 */
  dur: number;
  /** the single hero word/number/object — if it can't be named, it isn't a major */
  hero: string;
  why: string;
};

export const EVENTS: Event[] = [
  // --- intro: 6 events, chained rather than cut (modern style) ---
  { id: "same-goal", channel: "red", sents: [1, 2], dur: 9,
    hero: "THE SAME GOAL",
    why: "The claim is 'everyone has your goal' — the grid of identical forms IS the sentence, and the stamp corrects it in the same world." },
  { id: "the-book", channel: "yellow", sents: [5, 5], dur: 6,
    hero: "ATOMIC HABITS",
    why: "Concrete noun becomes the hero object; also the authority beat, so the face stays visible." },
  { id: "four-cards", channel: "red", sents: [8, 8], dur: 8,
    hero: "FOUR CARDS, THEN THE SEALED LETTER",
    why: "Framework preview = open loop, where the chapter device is designed - and "
       + "the camera tilts off the rail onto the sealed envelope in the same shot, "
       + "planting the bookend that opens on [84]. Two beats, one world: the line is "
       + "too short to hold them as separate events." },

  // --- idea 1: compounding ---
  { id: "chapter-1", channel: "red", sents: [9, 9], dur: 4,
    hero: "1 · COMPOUNDING",
    why: "Structural transition — the chapter device marks numbered progress." },
  { id: "thirty-seven", channel: "red", sents: [10, 11], dur: 10,
    hero: "37×",
    why: "Numbers are always visualised; this is the biggest number in the script." },
  { id: "cram-vs-daily", channel: "yellow", sents: [17, 18], dur: 7,
    hero: "ONE WEEKEND vs 90 DAYS",
    why: "Comparison claim — two stacked rows make the asymmetry legible at a glance." },
  { id: "valley", channel: "red", sents: [22, 23], dur: 11,
    hero: "THE VALLEY OF DISAPPOINTMENT",
    why: "Named concept → literal-minded metaphor, with the quit-point marked just before the curve turns." },

  // --- idea 2: systems over goals ---
  { id: "chapter-2", channel: "red", sents: [26, 26], dur: 4,
    hero: "2 · SYSTEMS",
    why: "Chapter device." },
  // the list rebuilds on each of "first / second / third" rather than sitting on
  // screen for the whole 50-second section, which would break the 4-12s window
  { id: "problem-1", channel: "yellow", sents: [28, 29], dur: 5,
    hero: "1 · EVERYONE HAS IT",
    why: "List item 1 of 3; numbered items persist so the viewer sees progress." },
  { id: "problem-2", channel: "yellow", sents: [30, 30], dur: 5,
    hero: "2 · IT'S TEMPORARY",
    why: "List item 2 of 3, with item 1 still visible but dim." },
  { id: "problem-3", channel: "yellow", sents: [34, 35], dur: 5,
    hero: "3 · HAPPINESS ON HOLD",
    why: "List item 3 of 3 — the list is complete and the section can pay off." },
  { id: "seven-hundred", channel: "red", sents: [31, 32], dur: 8,
    hero: "700",
    why: "A number, and the claim that the goal expires the moment it is hit." },
  { id: "holding-pattern", channel: "red", sents: [36, 37], dur: 7,
    hero: "WAITING",
    why: "Concept — every identical day between now and the letter, stamped." },
  { id: "system-over-outcome", channel: "yellow", sents: [38, 39], dur: 6,
    hero: "SYSTEM > OUTCOME",
    why: "The section's payoff, compressed to three characters." },

  // --- idea 3: identity ---
  { id: "chapter-3", channel: "red", sents: [40, 40], dur: 4,
    hero: "3 · IDENTITY",
    why: "Chapter device, plus a handwritten aside carrying 'the one that matters'." },
  { id: "arrow-flip", channel: "red", sents: [42, 45], dur: 10,
    hero: "THE ARROW REVERSES",
    why: "The whole idea is a direction, so the visual performs the reversal." },
  { id: "ordinary-tuesday", channel: "blue", sents: [50, 51], dur: 7,
    hero: "AN ORDINARY TUESDAY",
    why: "Emotional beat → image channel; warm and unremarkable, no effort on display." },

  // --- idea 4: the habit loop ---
  { id: "chapter-4", channel: "red", sents: [52, 52], dur: 4,
    hero: "4 · THE LOOP",
    why: "Chapter device." },
  { id: "habit-loop", channel: "red", sents: [54, 56], dur: 9,
    hero: "CUE → CRAVING → RESPONSE → REWARD",
    why: "Definition — the ring draws on and closes on 'locks it in', then names the four levers." },
  { id: "lever-1", channel: "yellow", sents: [57, 62], dur: 8,
    hero: "MAKE IT OBVIOUS",
    why: "List item 1 of 4; the drawer-vs-desk split is the concrete version of the cue." },
  { id: "lever-2", channel: "yellow", sents: [63, 66], dur: 6,
    hero: "MAKE IT ATTRACTIVE",
    why: "List item 2 of 4 — pairing is the mechanic, so the card shows a pair." },
  { id: "lever-3", channel: "yellow", sents: [68, 71], dur: 6,
    hero: "MAKE IT EASY",
    why: "List item 3 of 4; friction is a meter, and it drops." },
  { id: "lever-4", channel: "yellow", sents: [72, 77], dur: 8,
    hero: "MAKE IT SATISFYING",
    why: "List item 4 of 4 — immediate reward grows as the six-month one shrinks." },

  // --- recap + CTA ---
  { id: "recap", channel: "red", sents: [78, 82], dur: 11,
    hero: "ALL FOUR, COMPLETE",
    why: "The chapter device paid off: four cards face-up, each lighting as its line is spoken." },
  { id: "envelope-open", channel: "red", sents: [84, 84], dur: 8,
    hero: "THE LETTER OPENS",
    why: "Bookend closed, and it is literally the last image of the script." },
  { id: "promo", channel: "purple", sents: [85, 86], dur: 7,
    hero: "MIM PREP",
    why: "Product block in its own branded canvas; the sign-off after it stays un-animated." },
];

/** Face beats are placements too — these are the deliberate dry spells. */
export const FACE_BEATS: { sents: [number, number]; why: string }[] = [
  { sents: [0, 0], why: "One beat of eye contact before anything moves." },
  { sents: [3, 4], why: "The question lands on the face, never on a graphic." },
  { sents: [6, 7], why: "Setup, not value." },
  { sents: [12, 16], why: "'Big single efforts' is delivery — let it breathe." },
  { sents: [19, 21], why: "The 'hard to feel' build-up stays naked so the valley hits harder." },
  { sents: [24, 25], why: "Reassurance is delivery, not spectacle." },
  { sents: [27, 27], why: "Framing line." },
  { sents: [33, 33], why: "Nuance." },
  { sents: [41, 41], why: "The thesis of the section, spoken straight." },
  { sents: [46, 49], why: "The 'I am someone who' reframe is pure eye contact." },
  { sents: [53, 53], why: "Question, not claim." },
  { sents: [67, 67], why: "Nuance after lever 2." },
  { sents: [83, 83], why: "'None of this is really about the GMAT' — the thesis lands bare." },
  { sents: [87, 87], why: "Post-pitch de-escalation is deliberately un-animated." },
];
