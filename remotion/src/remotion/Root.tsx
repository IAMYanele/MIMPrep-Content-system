import { Composition, Folder } from "remotion";
import {
  COMP_NAME,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { AIAgentExplainer } from "./AIAgentExplainer/AIAgentExplainer";
import { Brandon30K } from "./Brandon30K/Brandon30K";
import { ClonifyMain } from "./Clonify/ClonifyMain";
import { ContentVsTransformation } from "./DigitalProductsDead/ContentVsTransformation";
import { DeathList } from "./DigitalProductsDead/DeathList";
import { DistributionStack } from "./DigitalProductsDead/DistributionStack";
import { InformationFree } from "./DigitalProductsDead/InformationFree";
import { NicheDown } from "./DigitalProductsDead/NicheDown";
import { TheFunnel } from "./DigitalProductsDead/TheFunnel";
import { TheProofLoop } from "./DigitalProductsDead/TheProofLoop";
import { Main } from "./MyComp/Main";
import { NextLogo } from "./MyComp/NextLogo";
import { YaneleTalkingHead } from "./YaneleTalkingHead/YaneleTalkingHead";
import { EnvironmentVideo } from "./EnvironmentVideo/EnvironmentVideo";
import { PhilVSL, PhilVSL2 } from "./PhilVSL/PhilVSL";
import { RatingReel as MimPrepRatingReel } from "./MimPrep/RatingReel";
import { ResourceDesk as MimPrepResourceDesk } from "./MimPrep/ResourceDesk";
import { TRIM as MIM_TRIM } from "./MimPrep/data";
import { TwoBrands } from "./TwoBrands/TwoBrands";
import {
  JadeShort,
  jadeShortSchema,
  calculateJadeMetadata,
} from "./JadeJones/JadeShort";
import {
  JadeEdit,
  jadeEditSchema,
  calculateJadeEditMetadata,
} from "./JadeJones/JadeEdit";
import {
  BodyFatSplit,
  bodyFatSplitSchema,
  calculateBodyFatMetadata,
} from "./JadeJones/BodyFatSplit";
import {
  MagnesiumEdit,
  magnesiumSchema,
  calculateMagnesiumMetadata,
} from "./JadeJones/MagnesiumEdit";
import {
  BrainExerciseEdit,
  brainExerciseSchema,
  calculateBrainMetadata,
} from "./JadeJones/BrainExerciseEdit";
import {
  NutrientTargets,
  nutrientSchema,
  calculateNutrientMetadata,
} from "./JadeJones/NutrientTargets";
import {
  SkipBreakfast,
  skipBreakfastSchema,
  calculateSkipBreakfastMetadata,
} from "./JadeJones/SkipBreakfast";
import {
  BellySixPack,
  bellySixSchema,
  calculateBellySixMetadata,
} from "./JadeJones/BellySixPack";
import {
  BellySixOverlay,
  bellyOverlaySchema,
  calculateBellyOverlayMetadata,
} from "./JadeJones/BellySixOverlay";
import {
  JadeLadder,
  jadeLadderSchema,
  calculateJadeLadderMetadata,
} from "./JadeJones/JadeLadder";
import {
  CravingDuality,
  cravingDualitySchema,
  calculateCravingMetadata,
} from "./JadeJones/CravingDuality";
import {
  JadeChain,
  jadeChainSchema,
  calculateJadeChainMetadata,
} from "./JadeJones/JadeChain";
import {
  JadeFlywheel,
  jadeFlywheelSchema,
  calculateJadeFlywheelMetadata,
} from "./JadeJones/JadeFlywheel";
import {
  JadeChart,
  jadeChartSchema,
  calculateJadeChartMetadata,
} from "./JadeJones/JadeChart";
import {
  JadeStack,
  jadeStackSchema,
  calculateJadeStackMetadata,
} from "./JadeJones/JadeStack";
import {
  JadeCompare,
  jadeCompareSchema,
  calculateJadeCompareMetadata,
} from "./JadeJones/JadeCompare";
import {
  JadeAdCta,
  jadeAdCtaSchema,
  calculateJadeAdCtaMetadata,
} from "./JadeJones/JadeAdCta";
import {
  MuscleCompare,
  muscleCompareSchema,
  calculateMuscleCompareMetadata,
} from "./JadeJones/MuscleCompare";
import {
  HealthRoutines,
  GHR_FPS,
  GHR_DURATION,
} from "./HealthRoutines/HealthRoutines";
import {
  HomeownersPainters,
  HPG_FPS,
  HPG_DURATION,
} from "./HomeownersPainters/HomeownersPainters";
import { ThomasEvent, thomasEventMetadata } from "./Thomas/ThomasEvent";
import { ThomasBackground } from "./ThomasBg/ThomasBackground";
import { DURATION as TBG_DUR, FPS as TBG_FPS } from "./ThomasBg/data";

const CLONIFY_FPS = 30;
const CLONIFY_DURATION = Math.round(12.5 * CLONIFY_FPS);

// AI Agent Explainer — 9:16 short form
const AI_AGENT_FPS = 30;
const AI_AGENT_DURATION = Math.round(44.3 * AI_AGENT_FPS);

// Yanele Talking Head — 9:16 short form
const YANELE_FPS = 30;
const YANELE_DURATION = Math.round(65.4 * YANELE_FPS);

// "Your Environment Dictates Your Success" — 9:16 short form
const ENV_FPS = 30;
const ENV_DURATION = Math.round(37.4 * ENV_FPS);

// "It Takes Two Brands" — @estenick × @getsellers.io — 9:16 short form
const TWO_BRANDS_FPS = 30;
const TWO_BRANDS_DURATION = Math.round(32.75 * TWO_BRANDS_FPS); // 983

// Phil VSL — Vita Bella onboarding (1920×1080 at 25fps)
const PHIL_VSL_FPS = 25;
const PHIL_VSL_DURATION = Math.ceil(218.32 * PHIL_VSL_FPS); // v1: 3:38
const PHIL_VSL_V2_DURATION = Math.ceil(207.24 * PHIL_VSL_FPS); // v2: 3:27 (faster take)

// "Digital Products Are Dead" — shared specs
const DPD_FPS = 30;
const DPD_W = 1920;
const DPD_H = 1080;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
      <Composition
        id="Clonify"
        component={ClonifyMain}
        durationInFrames={CLONIFY_DURATION}
        fps={CLONIFY_FPS}
        width={1280}
        height={720}
      />

      <Composition
        id="AIAgentExplainer"
        component={AIAgentExplainer}
        durationInFrames={AI_AGENT_DURATION}
        fps={AI_AGENT_FPS}
        width={1080}
        height={1920}
      />

      <Composition
        id="YaneleTalkingHead"
        component={YaneleTalkingHead}
        durationInFrames={YANELE_DURATION}
        fps={YANELE_FPS}
        width={1080}
        height={1920}
      />

      <Composition
        id="EnvironmentVideo"
        component={EnvironmentVideo}
        durationInFrames={ENV_DURATION}
        fps={ENV_FPS}
        width={1080}
        height={1920}
      />

      <Composition
        id="TwoBrands"
        component={TwoBrands}
        durationInFrames={TWO_BRANDS_DURATION}
        fps={TWO_BRANDS_FPS}
        width={1080}
        height={1920}
      />

      {/* Jade Jones clone edit — loop-cut video + Jade captions (no motion graphics) */}
      <Composition
        id="JadeEdit"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "looped.mp4",
          captionsSrc: "looped-captions.json",
          durationInSeconds: 34.94,
          fps: 25,
          broll: [
            { src: "broll/c-blood.mp4", fromSeconds: 3.2, durationInSeconds: 3.8 },
            { src: "broll/c-brain.mp4", fromSeconds: 7.5, durationInSeconds: 6.0 },
            { src: "broll/c-fat.mp4", fromSeconds: 14.0, durationInSeconds: 7.7 },
            { src: "broll/c-joints.mp4", fromSeconds: 26.7, durationInSeconds: 1.8 },
            { src: "broll/c-gut.mp4", fromSeconds: 28.5, durationInSeconds: 1.6 },
            { src: "broll/c-bloodsugar.mp4", fromSeconds: 30.1, durationInSeconds: 2.0 },
          ],
        }}
        durationInFrames={873}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* ── LADDER treatment (JadeLadder): on-screen supplement cards that build up as
             each item is named, instead of full-frame B-roll. Cards persist and the group
             re-centres when a new one pops in; all clear on the twist line so the punchline
             lands on her face. Card times = the exact frame she says the word. ── */}

      <Composition
        id="UnderEatingCards"
        component={JadeLadder}
        schema={jadeLadderSchema}
        calculateMetadata={calculateJadeLadderMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 24.8,
          fps: 25,
          rowTop: 1200,
          cardW: 238,
          imgH: 224,
          clearAtSeconds: 18.0, // "But none of these..."
          items: [
            { img: "cards/creatine.jpg", label: "Creatine", atSeconds: 0.62, crossOut: false },
            { img: "cards/vitamind.jpg", label: "Vitamin D", atSeconds: 7.35, crossOut: false },
            { img: "cards/magnesium.jpg", label: "Magnesium", atSeconds: 13.52, crossOut: false },
          ],
        }}
        durationInFrames={620}
        fps={25}
        width={1080}
        height={1920}
      />

      <Composition
        id="IronStackCards"
        component={JadeLadder}
        schema={jadeLadderSchema}
        calculateMetadata={calculateJadeLadderMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 26.13,
          fps: 25,
          rowTop: 1200,
          cardW: 238,
          imgH: 224,
          clearAtSeconds: 17.5, // "But none of this will help..."
          items: [
            { img: "cards/iron.jpg", label: "Iron", atSeconds: 0.35, crossOut: false },
            { img: "cards/vitaminc.jpg", label: "Vitamin C", atSeconds: 5.02, crossOut: false },
            // "and AVOID coffee" — crossed out so it never reads as "add coffee"
            { img: "cards/coffee.jpg", label: "Coffee", atSeconds: 11.87, crossOut: true },
          ],
        }}
        durationInFrames={653}
        fps={25}
        width={1080}
        height={1920}
      />

      <Composition
        id="ProteinStackCards"
        component={JadeLadder}
        schema={jadeLadderSchema}
        calculateMetadata={calculateJadeLadderMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 19.45,
          fps: 25,
          rowTop: 1200,
          cardW: 238,
          imgH: 224,
          clearAtSeconds: 17.84, // "But it won't work if you aren't eating properly"
          items: [
            { img: "cards/protein.jpg", label: "Protein", atSeconds: 0.62, crossOut: false },
            { img: "cards/creatine.jpg", label: "Creatine", atSeconds: 5.56, crossOut: false },
            { img: "cards/dumbbell.jpg", label: "Lift Daily", atSeconds: 12.41, crossOut: false },
          ],
        }}
        durationInFrames={486}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* ── Jul 29 women's-health batch — all reuse JadeEdit (clean captions + concept B-roll). ──
          The 3 ladder scripts are loop-edited: the repeated closing line is moved to the FRONT
          (starting on the same word the take originally opened with) and the original opener is
          dropped, so each reel opens on the hook and ends on its punchline. */}

      {/* "No stack fixes under-eating" — creatine ladder, twist = eating under 1500 cals */}
      <Composition
        id="UnderEating"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 24.8,
          fps: 25,
          // B-roll shows the thing she NAMES (supplement itself), not a metaphor,
          // and each cut lands on the word: creatine 0.59, vitamin 7.35,
          // magnesium 13.52, "eating under ... calories" 21.86-24.15.
          broll: [
            { src: "broll/b1_creatine.mp4", fromSeconds: 1.0, durationInSeconds: 2.8 }, // mixing the powder = creatine
            { src: "broll/b2_vitamind.mp4", fromSeconds: 7.2, durationInSeconds: 2.8 }, // capsules in hand = vitamin D
            { src: "broll/b3_sleep.mp4", fromSeconds: 13.4, durationInSeconds: 3.0 }, // bedside pills+clock = magnesium glycinate / sleep
            { src: "broll/b4_smallplate.mp4", fromSeconds: 21.6, durationInSeconds: 2.9 }, // tiny portion = eating under 1500 cals
          ],
        }}
        durationInFrames={620}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* "The fix for women's tiredness isn't a greens powder" — iron ladder, twist = heavy periods */}
      <Composition
        id="IronStack"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 26.07,
          fps: 25,
          // Retimed to the LOOPED timeline's actual words: iron 4.26, vitamin C
          // 10.72-11.31, "avoid coffee" 11.51-12.30, doctor 25.01. The citrus->coffee
          // pair runs back-to-back so the visuals mirror "with vitamin C and avoid coffee".
          broll: [
            { src: "broll/b1_afternoon_crash.mp4", fromSeconds: 2.2, durationInSeconds: 1.9 }, // "like shit at 3pm"
            { src: "broll/b2_ironfood.mp4", fromSeconds: 4.3, durationInSeconds: 2.1 }, // "take iron"
            { src: "broll/b3_vitaminc_citrus.mp4", fromSeconds: 10.5, durationInSeconds: 0.95 }, // "vitamin C"
            { src: "broll/b4_avoid_coffee.mp4", fromSeconds: 11.45, durationInSeconds: 1.75 }, // "avoid coffee"
            { src: "broll/b5_see_a_doctor.mp4", fromSeconds: 24.7, durationInSeconds: 1.4 }, // "see a doctor"
          ],
        }}
        durationInFrames={652}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* "The most underrated supplement for women isn't a supplement" — protein ladder.
          Card notes: the real PLATE OF FOOD must land first, before any bottle appears. */}
      <Composition
        id="ProteinStack"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 19.45,
          fps: 25,
          // Literal: protein FOOD (not a metaphor) on "protein daily" 0.60, the powder
          // on "creatine" 5.56, weights on "lift daily" 12.41, plate on "eating
          // properly" 18.75. Dropped the 2nd gym shot — two gym clips back-to-back
          // read as repetitive.
          broll: [
            { src: "broll/b1_realplate.mp4", fromSeconds: 0.8, durationInSeconds: 2.8 }, // FOOD FIRST (per card)
            { src: "broll/b2_creatine.mp4", fromSeconds: 5.4, durationInSeconds: 2.6 }, // then the powder
            { src: "broll/b3_lift.mp4", fromSeconds: 12.2, durationInSeconds: 2.8 }, // then weights
            { src: "broll/b5_shelfpunchline.mp4", fromSeconds: 17.9, durationInSeconds: 1.5 }, // punchline: eating properly
          ],
        }}
        durationInFrames={486}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* "The best food for period cramps isn't pineapple" — ginger reveal. No loop in this take. */}
      <Composition
        id="PeriodCramps"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 20.39,
          fps: 25,
          broll: [
            { src: "broll/b1_pineapple.mp4", fromSeconds: 3.3, durationInSeconds: 1.8 }, // "not pineapple"
            { src: "broll/b2_painkillers.mp4", fromSeconds: 5.3, durationInSeconds: 1.6 }, // "not even painkillers"
            // blurred so the ingredient stays hidden while she teases "one teaspoon of THIS"
            { src: "broll/b3_teaspoon.mp4", fromSeconds: 7.7, durationInSeconds: 1.8, blur: 14 },
            { src: "broll/b4_cramp_relief.mp4", fromSeconds: 9.8, durationInSeconds: 2.2 }, // "ease cramping"
            { src: "broll/b5_ginger_hero.mp4", fromSeconds: 13.3, durationInSeconds: 3.5 }, // GINGER reveal (hero)
          ],
        }}
        durationInFrames={510}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Avatar / painters-marketing talking head — reuses JadeEdit: clean white captions + concept B-roll (3 homeowner fears), no branding */}
      <Composition
        id="AvatarPainters"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 72,
          fps: 25,
          broll: [
            { src: "broll/painter.mp4", fromSeconds: 2.5, durationInSeconds: 4.5 }, // hook: 585 reviews of painting companies
            { src: "broll/waiting.mp4", fromSeconds: 17.8, durationInSeconds: 6.8 }, // #1 crew never showed up
            { src: "broll/crew.mp4", fromSeconds: 29.0, durationInSeconds: 8.0 }, // #2 photo of your actual crew = trust
            { src: "broll/contract.mp4", fromSeconds: 45.0, durationInSeconds: 8.0 }, // #3 deposit terms / money before work
          ],
        }}
        durationInFrames={1800}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Jade bodyfat — @mandohq split-screen recreation */}
      <Composition
        id="BodyFatSplit"
        component={BodyFatSplit}
        schema={bodyFatSplitSchema}
        calculateMetadata={calculateBodyFatMetadata}
        defaultProps={{
          videoSrc: "looped.mp4",
          captionsSrc: "looped-captions.json",
          durationInSeconds: 20.98,
          fps: 25,
          faces: [
            { pct: "40%", fromSeconds: 0, src: null },
            { pct: "35%", fromSeconds: 6.8, src: null },
            { pct: "30%", fromSeconds: 9.6, src: null },
            { pct: "25%", fromSeconds: 12.1, src: null },
            { pct: "20%", fromSeconds: 16.0, src: null },
          ],
        }}
        durationInFrames={525}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Jade magnesium — @drericberg clone: punch-in hook + medical B-roll + ending zoom */}
      <Composition
        id="MagnesiumEdit"
        component={MagnesiumEdit}
        schema={magnesiumSchema}
        calculateMetadata={calculateMagnesiumMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 38.64,
          fps: 25,
          hookText: "", // "Did you know this?" banner removed per revision
          hookFadeOutStart: 32.56,
          punchOrigin: "50% 34%",
          punchIns: [
            { atSeconds: 0, scale: 1.0 },
            { atSeconds: 1.43, scale: 1.15 },
            { atSeconds: 1.68, scale: 1.32 },
            { atSeconds: 3.77, scale: 1.0 },
          ],
          broll: [
            { src: "broll/m-artery.mp4", fromSeconds: 8.4, durationInSeconds: 4.1 },
            { src: "broll/m-joints.mp4", fromSeconds: 12.5, durationInSeconds: 3.9 },
            { src: "broll/m-vitamins.mp4", fromSeconds: 19.9, durationInSeconds: 4.5 },
            { src: "broll/m-stress.mp4", fromSeconds: 24.4, durationInSeconds: 3.5 },
            { src: "broll/m-cells.mp4", fromSeconds: 27.9, durationInSeconds: 4.5 },
          ],
          endingFromSeconds: 32.56,
          endingToScale: 1.22,
          endingOriginY: 42,
          endingSlideY: -28,
        }}
        durationInFrames={966}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Jade brain exercise — @vivetalobomd clone: text hook + B-roll + split-screen study */}
      <Composition
        id="BrainExerciseEdit"
        component={BrainExerciseEdit}
        schema={brainExerciseSchema}
        calculateMetadata={calculateBrainMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 43.85,
          fps: 25,
          hookText: "", // hook banner removed per revision (captions kept)
          hookOutSeconds: 5.76,
          broll: [
            { src: "broll/b-crossword.mp4", fromSeconds: 2.2, durationInSeconds: 1.45 },
            { src: "broll/b-supplement.mp4", fromSeconds: 3.65, durationInSeconds: 0.95 },
            { src: "broll/b-braingames.mp4", fromSeconds: 4.6, durationInSeconds: 1.16 },
            { src: "broll/b-brainscan.mp4", fromSeconds: 15.6, durationInSeconds: 3.6 },
            { src: "broll/b-weights.mp4", fromSeconds: 22.9, durationInSeconds: 3.0 },
            { src: "broll/b-hippocampus.mp4", fromSeconds: 25.9, durationInSeconds: 4.1 },
            {
              src: "broll/b-weights2.mp4",
              fromSeconds: 30.4,
              durationInSeconds: 3.2,
              objectPosition: "62% 50%",
            },
            { src: "broll/b-neurons.mp4", fromSeconds: 33.6, durationInSeconds: 4.3 },
            { src: "broll/b-neurons2.mp4", fromSeconds: 38.0, durationInSeconds: 5.85 },
          ],
          splits: [{ fromSeconds: 5.76, durationInSeconds: 8.66 }],
          studySrc: "study.png",
        }}
        durationInFrames={1096}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Jade nutrient targets — @explainingourbody clone: rapid-fire food pairings */}
      <Composition
        id="NutrientTargets"
        component={NutrientTargets}
        schema={nutrientSchema}
        calculateMetadata={calculateNutrientMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          durationInSeconds: 19.62,
          fps: 25,
          pairs: [
            {
              fromSeconds: 2.5,
              durationInSeconds: 2.14,
              brollSrc: "broll/b-eggs.mp4",
              amount: "50g PROTEIN",
              food: "8 EGGS",
            },
            {
              fromSeconds: 7.4,
              durationInSeconds: 1.96,
              brollSrc: "broll/b-orange.mp4",
              amount: "80mg VITAMIN C",
              food: "1 ORANGE",
            },
            {
              fromSeconds: 12.1,
              durationInSeconds: 2.78,
              brollSrc: "broll/b-milk.mp4",
              amount: "1000mg CALCIUM",
              food: "3–4 CUPS MILK",
            },
            {
              fromSeconds: 16.1,
              durationInSeconds: 3.52,
              brollSrc: "broll/b-sun.mp4",
              amount: "800 IU VITAMIN D",
              food: "10–30 MIN SUN",
            },
          ],
        }}
        durationInFrames={491}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Jade skipping breakfast — @jessie.schramm clone: talking-head + myth-flip */}
      <Composition
        id="SkipBreakfast"
        component={SkipBreakfast}
        schema={skipBreakfastSchema}
        calculateMetadata={calculateSkipBreakfastMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 36.375,
          fps: 25,
          broll: [
            { src: "broll/b-manpinch.mp4", fromSeconds: 0.6, durationInSeconds: 2.4 },
            { src: "broll/b-womancramp.mp4", fromSeconds: 3.1, durationInSeconds: 3.0 },
            { src: "broll/b-manfit.mp4", fromSeconds: 6.4, durationInSeconds: 5.4 },
            { src: "broll/b-tired.mp4", fromSeconds: 13.8, durationInSeconds: 4.8 },
            { src: "broll/b-chocolate.mp4", fromSeconds: 19.0, durationInSeconds: 3.7 },
            { src: "broll/b-breakfast.mp4", fromSeconds: 27.5, durationInSeconds: 4.9 },
          ],
          mythFrom: 0, // myth-flip motion graphic removed — B-roll only
          mythSwitch: 0,
          mythUntil: 0,
          wrongText: "Starvation mode",
          rightText: "Under-fed by 8pm",
        }}
        durationInFrames={909}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Jade bodyfat-for-women — @remf.fit clone: split-screen body-%-composition refs */}
      <Composition
        id="BodyFatWomen"
        component={BodyFatSplit}
        schema={bodyFatSplitSchema}
        calculateMetadata={calculateBodyFatMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 37.89,
          fps: 25,
          imageFit: "cover" as const, // fill the panel so the photo edges aren't visible
          imageBg: "#c3cbce",
          imageZoom: 1.2, // zoom in so she's larger + grey margins cropped
          imageObjPos: "50% 12%", // anchor high: keep her face + torso/hips, crop the feet
          faces: [
            { pct: "40%", fromSeconds: 0, src: "bodies/body-40.jpg" },
            { pct: "30%", fromSeconds: 7.4, src: "bodies/body-30.jpg" },
            { pct: "25%", fromSeconds: 15.3, src: "bodies/body-25.jpg" },
            { pct: "20%", fromSeconds: 24.5, src: "bodies/body-20.jpg" },
          ],
        }}
        durationInFrames={947}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Jade belly-fat vs six-pack — AI names 14 foods, Jade's clip gives the verdict */}
      <Composition
        id="BellySixPack"
        component={BellySixPack}
        schema={bellySixSchema}
        calculateMetadata={calculateBellySixMetadata}
        defaultProps={{
          fps: 25,
          foodPad: 0.3,
          aiLead: 0.06,
          foodY: 54,
          stampY: 1360,
          items: [
            { food: "Coffee", verdict: "belly" as const, aiSrc: "a01.m4a", aiDur: 0.6, neutralSrc: "neutralSoft.mp4", verdictSrc: "vb1.mp4", verdictDur: 0.84 },
            { food: "Tea", verdict: "six" as const, aiSrc: "a02.m4a", aiDur: 0.54, neutralSrc: "neutralAbs.mp4", verdictSrc: "vs1.mp4", verdictDur: 0.84 },
            { food: "Rice", verdict: "belly" as const, aiSrc: "a03.m4a", aiDur: 0.8, neutralSrc: "neutralSoft.mp4", verdictSrc: "vb2.mp4", verdictDur: 0.84 },
            { food: "Bread", verdict: "belly" as const, aiSrc: "a04.m4a", aiDur: 0.76, neutralSrc: "neutralSoft.mp4", verdictSrc: "vb1.mp4", verdictDur: 0.84 },
            { food: "Avocado", verdict: "six" as const, aiSrc: "a05.m4a", aiDur: 0.89, neutralSrc: "neutralAbs.mp4", verdictSrc: "vs2.mp4", verdictDur: 0.84 },
            { food: "Fruit juice", verdict: "six" as const, aiSrc: "a06.m4a", aiDur: 0.9, neutralSrc: "neutralAbs.mp4", verdictSrc: "vs1.mp4", verdictDur: 0.84 },
            { food: "Dark chocolate", verdict: "belly" as const, aiSrc: "a07.m4a", aiDur: 1.15, neutralSrc: "neutralSoft.mp4", verdictSrc: "vb2.mp4", verdictDur: 0.84 },
            { food: "Flavoured yogurt", verdict: "belly" as const, aiSrc: "a08.m4a", aiDur: 1.38, neutralSrc: "neutralSoft.mp4", verdictSrc: "vb1.mp4", verdictDur: 0.84 },
            { food: "Oats", verdict: "six" as const, aiSrc: "a09.m4a", aiDur: 0.43, neutralSrc: "neutralAbs.mp4", verdictSrc: "vs2.mp4", verdictDur: 0.84 },
            { food: "Smoothies", verdict: "six" as const, aiSrc: "a10.m4a", aiDur: 0.92, neutralSrc: "neutralAbs.mp4", verdictSrc: "vs1.mp4", verdictDur: 0.84 },
            { food: "Green tea", verdict: "six" as const, aiSrc: "a11.m4a", aiDur: 0.84, neutralSrc: "neutralAbs.mp4", verdictSrc: "vs2.mp4", verdictDur: 0.84 },
            { food: "Beer", verdict: "belly" as const, aiSrc: "a12.m4a", aiDur: 0.71, neutralSrc: "neutralSoft.mp4", verdictSrc: "vb2.mp4", verdictDur: 0.84 },
            { food: "Eggs", verdict: "six" as const, aiSrc: "a13.m4a", aiDur: 0.3, neutralSrc: "neutralAbs.mp4", verdictSrc: "vs1.mp4", verdictDur: 0.84 },
            { food: "Granola", verdict: "six" as const, aiSrc: "a14.m4a", aiDur: 0.76, neutralSrc: "neutralAbs.mp4", verdictSrc: "vs2.mp4", verdictDur: 0.84 },
          ],
        }}
        durationInFrames={676}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Jade belly-fat vs six-pack — OVERLAY on user's composed base: food name + popup photo + verdict stamped on photo */}
      <Composition
        id="BellySixOverlay"
        component={BellySixOverlay}
        schema={bellyOverlaySchema}
        calculateMetadata={calculateBellyOverlayMetadata}
        defaultProps={{
          videoSrc: "composed.mp4",
          fps: 30,
          durationInSeconds: 16.6,
          foodY: 54,
          cardTop: 1285,
          cardSize: 452,
          items: [
            { food: "Coffee", img: "foods/coffee.jpg", verdict: "belly" as const, nameStart: 0.08, verdictStart: 0.77, endT: 1.53, pos: "50% 50%" },
            { food: "Tea", img: "foods/tea.jpg", verdict: "six" as const, nameStart: 1.53, verdictStart: 1.95, endT: 2.68, pos: "50% 50%" },
            { food: "Rice", img: "foods/rice.jpg", verdict: "belly" as const, nameStart: 2.68, verdictStart: 3.09, endT: 4.16, pos: "50% 50%" },
            { food: "Bread", img: "foods/bread.jpg", verdict: "belly" as const, nameStart: 4.16, verdictStart: 4.51, endT: 5.47, pos: "50% 50%" },
            { food: "Avocado", img: "foods/avocado.jpg", verdict: "six" as const, nameStart: 5.47, verdictStart: 5.91, endT: 6.83, pos: "50% 50%" },
            { food: "Fruit juice", img: "foods/fruitjuice.jpg", verdict: "six" as const, nameStart: 6.83, verdictStart: 7.20, endT: 8.03, pos: "50% 50%" },
            { food: "Dark chocolate", img: "foods/darkchocolate.jpg", verdict: "belly" as const, nameStart: 8.03, verdictStart: 8.63, endT: 9.59, pos: "50% 50%" },
            { food: "Flavoured yogurt", img: "foods/yogurt.jpg", verdict: "belly" as const, nameStart: 9.59, verdictStart: 10.03, endT: 11.07, pos: "50% 50%" },
            { food: "Oats", img: "foods/oats.jpg", verdict: "six" as const, nameStart: 11.07, verdictStart: 11.63, endT: 12.41, pos: "50% 50%" },
            { food: "Smoothies", img: "foods/smoothie.jpg", verdict: "six" as const, nameStart: 12.41, verdictStart: 13.00, endT: 13.78, pos: "50% 50%" },
            { food: "Green tea", img: "foods/greentea.jpg", verdict: "six" as const, nameStart: 13.78, verdictStart: 14.37, endT: 15.09, pos: "50% 50%" },
            { food: "Beer", img: "foods/beer.jpg", verdict: "belly" as const, nameStart: 15.09, verdictStart: 15.49, endT: 16.60, pos: "50% 50%" },
          ],
        }}
        durationInFrames={498}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ── Jul 31 editing-queue batch — reuse JadeEdit (clean captions + literal concept B-roll,
             timed to the spoken word). No loops in these takes. ── */}

      {/* "You're already doing the thing" — WALKING / 10k steps */}
      <Composition
        id="WalkSteps"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          // Loop-cut: the take restates the opening hook at the end
          // ("...every day BECAUSE... Did you know this one thing can cut your
          // risk of death in half?"). The restatement is shorter than the fuller
          // opening (no "5 pounds of fat"), so we keep S1 as the opener and TRIM
          // the trailing repeat — ending on the punchline "...walk 10,000 steps
          // every day" at 37.84s (just before "because"), so it loops cleanly.
          durationInSeconds: 37.84,
          fps: 25,
          broll: [
            { src: "broll/b1_lifting.mp4", fromSeconds: 7.98, durationInSeconds: 2.4 }, // "not lifting weights"
            { src: "broll/b2_diet.mp4", fromSeconds: 13.03, durationInSeconds: 2.4 }, // "not your diet"
            { src: "broll/b3_supplement.mp4", fromSeconds: 17.73, durationInSeconds: 2.5 }, // "expensive supplement"
            { src: "broll/b4_phonesteps.mp4", fromSeconds: 25.04, durationInSeconds: 2.4 }, // "3,500 steps" (feet)
            { src: "broll/b5_watchsteps.mp4", fromSeconds: 31.22, durationInSeconds: 2.6 }, // "10,000 steps" (watch)
            { src: "broll/b6_walking.mp4", fromSeconds: 35.56, durationInSeconds: 2.28 }, // "walking 10,000 steps" — two women walking in activewear (was cane clip)
          ],
        }}
        durationInFrames={946}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* "What one clove a day actually does" — 30-day eugenol timeline */}
      <Composition
        id="CloveTimeline"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 50.12,
          fps: 25,
          broll: [
            { src: "broll/b1_clove.mp4", fromSeconds: 1.35, durationInSeconds: 2.3 }, // "chew one clove" — REAL whole cloves (macro), not turmeric
            { src: "broll/b2_cavity.mp4", fromSeconds: 9.7, durationInSeconds: 1.65 }, // "cavities, bad breath" — decayed/filled tooth
            { src: "broll/b2b_sore.mp4", fromSeconds: 11.4, durationInSeconds: 1.55 }, // "mouth problems" — canker sore (literal)
            { src: "broll/b3_bloating.mp4", fromSeconds: 14.85, durationInSeconds: 3.0 }, // "gas, bloating, cramps"
            { src: "broll/b4_aging.mp4", fromSeconds: 24.1, durationInSeconds: 3.0 }, // "reverse aging / antioxidants"
            { src: "broll/b5_painkiller.mp4", fromSeconds: 35.4, durationInSeconds: 3.0 }, // "like a painkiller"
            { src: "broll/b6_glucose.mp4", fromSeconds: 42.0, durationInSeconds: 3.3 }, // "blood sugar drops"
          ],
        }}
        durationInFrames={1253}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* "Night cravings aren't a code to decode" — craving -> deficiency mapping */}
      <Composition
        id="NightCravings"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 23.43,
          fps: 25,
          broll: [
            { src: "broll/b1_sweets.mp4", fromSeconds: 1.54, durationInSeconds: 1.7 }, // "sweets"
            { src: "broll/b2_protein.mp4", fromSeconds: 3.28, durationInSeconds: 2.4 }, // "protein"
            { src: "broll/b3_chips.mp4", fromSeconds: 5.96, durationInSeconds: 1.9 }, // "chips"
            { src: "broll/b4_water.mp4", fromSeconds: 8.0, durationInSeconds: 2.4 }, // "water"
            { src: "broll/b5_fastfood.mp4", fromSeconds: 10.6, durationInSeconds: 2.2 }, // "fast food"
            { src: "broll/b6_clock.mp4", fromSeconds: 12.98, durationInSeconds: 3.0 }, // "waited too long between meals"
          ],
        }}
        durationInFrames={586}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Night cravings — DUALITY treatment: bracketed nouns cut from VO, shown
          as white-outlined blocks (craving LEFT vs cause/nutrient RIGHT) on each
          "this". Timings below are for the ORIGINAL (un-cut) take — used for the
          layout preview; they get re-timed after the audio surgery. */}
      <Composition
        id="CravingsDuality"
        component={CravingDuality}
        schema={cravingDualitySchema}
        calculateMetadata={calculateCravingMetadata}
        defaultProps={{
          // video_precut.mp4 = the USER'S OWN cut (bracketed nouns already removed) —
          // treated as the LOCKED base (overlay only, no re-cut). 29.97fps → comp 30.
          videoSrc: "video_precut.mp4",
          captionsSrc: "captions_precut.json",
          durationInSeconds: 17.55,
          fps: 30,
          pairs: [
            {
              craving: { src: "cards/sweets.jpg", label: "SWEETS", atSeconds: 0.63 },
              cause: { src: "cards/protein.jpg", label: "PROTEIN", atSeconds: 2.4 },
              clearAtSeconds: 3.28,
            },
            {
              craving: { src: "cards/chips.jpg", label: "CHIPS", atSeconds: 3.28 },
              cause: { src: "cards/water.jpg", label: "WATER", atSeconds: 5.31 },
              clearAtSeconds: 6.42,
            },
            {
              craving: { src: "cards/fastfood.jpg", label: "FAST FOOD", atSeconds: 6.42 },
              cause: { src: "cards/clock.jpg", label: "WAITED TOO LONG BETWEEN MEALS", atSeconds: 8.32 },
              clearAtSeconds: 9.6,
            },
          ],
        }}
        durationInFrames={527}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* batch3 v1 — "A walk after dinner isn't burning off your meal".
          Loop-cut: the take restates its opening line ("After you've eaten, never ever
          sit, lay down, or even scroll") at 42.0, so we trim the trailing repeat and end
          on the punchline "...zero side effects" — the cut lands in the natural pause at
          41.74-42.21. The two percentages carry the whole argument, so they get on-screen
          number cards rather than passing by in the VO. */}
      <Composition
        id="WalkAfterDinner"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 41.95,
          fps: 25,
          broll: [
            { src: "broll/b1_sit.mp4", fromSeconds: 1.5, durationInSeconds: 2.5 }, // "never ever sit, lay down, or even scroll"
            { src: "broll/b2_walk.mp4", fromSeconds: 11.2, durationInSeconds: 2.8 }, // "taking a 10-minute walk"
            { src: "broll/b3_walk2.mp4", fromSeconds: 18.2, durationInSeconds: 2.6 }, // "60 seconds after eating, go for a 10-minute walk"
            { src: "broll/b4_artery.mp4", fromSeconds: 22.1, durationInSeconds: 3.0 }, // "moves the sugar from your blood into your muscles / arteries"
            { src: "broll/b5_hospital.mp4", fromSeconds: 28.5, durationInSeconds: 2.4 }, // "be put in hospital"
          ],
          stats: [
            { value: "60%", label: "HIGHER RISK OF DEATH", fromSeconds: 6.3, durationInSeconds: 3.2, tone: "bad" },
            { value: "43%", label: "LESS ARTERY INFLAMMATION", fromSeconds: 35.2, durationInSeconds: 3.4, tone: "good" },
          ],
        }}
        durationInFrames={1049}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v9 — "You're eating fibre. You're probably only eating one kind."
          The whole script is a two-category comparison, so it gets the duality treatment:
          SOLUBLE pops in on the word (6.98) and INSOLUBLE joins it at 17.67, both holding
          to the end so the closing line ("plenty of one and almost none of the other")
          lands with both actually on screen. No loop — it ends open. */}
      <Composition
        id="FibreTwoKinds"
        component={CravingDuality}
        schema={cravingDualitySchema}
        calculateMetadata={calculateCravingMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 32.96,
          fps: 25,
          pairs: [
            {
              craving: { src: "cards/soluble.jpg", label: "SOLUBLE", atSeconds: 6.98 },
              cause: { src: "cards/insoluble.jpg", label: "INSOLUBLE", atSeconds: 17.67 },
              clearAtSeconds: 32.96,
            },
          ],
        }}
        durationInFrames={824}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v10 — "eat less and move more, and a third of what you lose isn't fat".
          Three stacking steps (eat less+move more -> +protein -> +strength train), each
          card popping on the word that introduces it, all three still up for the summary
          line ("step one gets you skinny, two lean, three a fat-burning machine").
          Loop-cut: ends on "...fat-burning machine" at 33.12, before the "Because" that
          hands back to the opening. */}
      <Composition
        id="EatLessMoveMore"
        component={JadeLadder}
        schema={jadeLadderSchema}
        calculateMetadata={calculateJadeLadderMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 33.25,
          fps: 25,
          items: [
            { img: "cards/step1.jpg", label: "EAT LESS + MOVE MORE", atSeconds: 0.6 },
            { img: "cards/step2.jpg", label: "+ PROTEIN", atSeconds: 9.27 },
            { img: "cards/step3.jpg", label: "+ STRENGTH TRAIN", atSeconds: 21.16 },
          ],
          clearAtSeconds: 33.25, // cards hold through the summary line
          // These must be passed explicitly — zod defaults do NOT reach defaultProps at
          // runtime, and cardX() divides by cardW, so leaving them out yields NaN.
          rowTop: 1215,
          cardW: 238,
          imgH: 224,
        }}
        durationInFrames={831}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v5 — "Lifting doesn't just make you stronger".
          A twelve-link flywheel: lift -> stronger -> muscle -> burn at rest -> fat loss ->
          insulin sensitivity -> less body fat -> lower inflammation -> hormones -> energy
          -> train harder -> back to muscle. Spoken alone it's impossible to follow past
          link five, so each link lands as a pill and stays.
          Loop-cut at 43.35 (pause 43.13-43.67): ends on "...the more muscle you build",
          which hands straight back to the opening "The more you lift weights, the stronger
          you get" — the flywheel closes on itself. */}
      <Composition
        id="LiftingFlywheel"
        component={JadeChain}
        schema={jadeChainSchema}
        calculateMetadata={calculateJadeChainMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 43.35,
          fps: 25,
          maxVisible: 4,
          topY: 1215, // pass explicitly — zod defaults don't reach defaultProps at runtime
          links: [
            { text: "LIFT WEIGHTS", atSeconds: 0.64 },
            { text: "GET STRONGER", atSeconds: 1.68 },
            { text: "BUILD MUSCLE", atSeconds: 4.6 },
            { text: "BURN MORE AT REST", atSeconds: 7.47 },
            { text: "FAT LOSS GETS EASIER", atSeconds: 11.8 },
            { text: "BETTER INSULIN SENSITIVITY", atSeconds: 15.8 },
            { text: "LESS BODY FAT", atSeconds: 20.13 },
            { text: "LOWER INFLAMMATION", atSeconds: 25.03 },
            { text: "BETTER HORMONES", atSeconds: 29.16 },
            { text: "MORE ENERGY", atSeconds: 33.1 },
            { text: "TRAIN HARDER", atSeconds: 37.03 },
            { text: "BUILD MORE MUSCLE", atSeconds: 40.41 },
          ],
        }}
        durationInFrames={1084}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v6 — "Muscle loss doesn't start at seventy".
          The two percentages are the argument, so they get number cards (24% lower =
          green, 27% higher = red). The "everyday tasks become harder" beat deliberately
          has NO cutaway: every candidate for an older person struggling came back either
          empty (a stairwell with nobody in it) or wrong (a birthday party), and a
          misleading clip is worse than Jade's face.
          Loop-cut at 38.82: ends on "So remember that", handing back to the opening
          "This is the leg muscle of a 30-year-old that does lift weights." */}
      <Composition
        id="MuscleLossSeventy"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 38.82,
          fps: 25,
          broll: [
            { src: "broll/b1_legs.mp4", fromSeconds: 0.7, durationInSeconds: 3.1 }, // "the leg muscle of a 30-year-old that does lift weights"
            { src: "broll/b2_senior.mp4", fromSeconds: 29.3, durationInSeconds: 3.0 }, // "if you continue to strength train"
          ],
          stats: [
            { value: "24%", label: "LOWER CHANCE OF INJURY WHEN FALLING", fromSeconds: 11.8, durationInSeconds: 3.5, tone: "good" },
            { value: "27%", label: "HIGHER CHANCE OF BREAKING SOMETHING", fromSeconds: 16.9, durationInSeconds: 2.8, tone: "bad" },
          ],
        }}
        durationInFrames={971}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v5 v2 — the flywheel drawn as an actual RING instead of a linear
          stack. The linear version showed the twelve links but never showed them
          closing, which is the one thing the audio can't say. Here the arc draws
          link by link and completes the circle on the last one. */}
      <Composition
        id="LiftingFlywheelRing"
        component={JadeFlywheel}
        schema={jadeFlywheelSchema}
        calculateMetadata={calculateJadeFlywheelMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 43.35,
          fps: 25,
          centerY: 1545,
          radius: 268,
          broll: [],
          links: [
            { text: "LIFT WEIGHTS", atSeconds: 0.64 },
            { text: "GET STRONGER", atSeconds: 1.68 },
            { text: "BUILD MUSCLE", atSeconds: 4.6 },
            { text: "BURN MORE AT REST", atSeconds: 7.47 },
            { text: "FAT LOSS GETS EASIER", atSeconds: 11.8 },
            { text: "BETTER INSULIN SENSITIVITY", atSeconds: 15.8 },
            { text: "LESS BODY FAT", atSeconds: 20.13 },
            { text: "LOWER INFLAMMATION", atSeconds: 25.03 },
            { text: "BETTER HORMONES", atSeconds: 29.16 },
            { text: "MORE ENERGY", atSeconds: 33.1 },
            { text: "TRAIN HARDER", atSeconds: 37.03 },
            { text: "BUILD MORE MUSCLE", atSeconds: 40.41 },
          ],
        }}
        durationInFrames={1084}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v6 v2 — leg cross-sections per the client's reference: dense red
          muscle vs fat-marbled, side by side, same card compositing as the other
          graphics. Four states map to the four "this is..." sentences; the left
          leg (lifts) and right leg (doesn't) each update at 5.7/9.1 as she moves
          from the 30-year-old to the 70-year-old. */}
      <Composition
        id="MuscleLossLegs"
        component={MuscleCompare}
        schema={muscleCompareSchema}
        calculateMetadata={calculateMuscleCompareMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 38.82,
          fps: 25,
          rowTop: 1215,
          cardW: 452,
          // REAL axial thigh MRI, not a drawing — PMC5301428 Fig 1 (a)/(b),
          // "Three-dimensional comparison of intramuscular fat content between
          // young and old adults", BMC Medical Imaging, CC BY 4.0. Credit in
          // cards/leg_mri.credit.json.
          left: [
            { atSeconds: 0.6, fat: 0.06, label: "30 · LIFTS", img: "cards/leg_strong.png" },
            { atSeconds: 5.7, fat: 0.18, label: "70 · LIFTS", img: "cards/leg_strong.png" },
          ],
          right: [
            { atSeconds: 4.0, fat: 0.42, label: "30 · DOESN'T", img: "cards/leg_weak.png" },
            { atSeconds: 9.1, fat: 0.95, label: "70 · DOESN'T", img: "cards/leg_weak.png" },
          ],
          clearAtSeconds: 19.8, // clears at "See, without regular strength training..."
        }}
        durationInFrames={971}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v3 — "Chia seeds do almost nothing if you eat them dry".
          Five numbered mistakes, so every beat is a literal object she names —
          B-roll does the job and no graphic would earn its place. The "bloated or
          itchy" beat gets NO cutaway: four candidates all read wrong (body-image,
          shoulder pain, feeling cold).
          Loop-cut at 46.5 (after "go all in", before "because") so it ends on the
          instruction and hands back to "Did you know chia seeds are insanely healthy". */}
      <Composition
        id="ChiaMistakes"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 46.5,
          fps: 25,
          // RE-CUT: the first pass failed because three of five clips were the same
          // wooden flat-lay (the viewer saw one picture three times), and none showed
          // the gel — even though three of the five mistakes are ABOUT the gel.
          // Now the dry-seeds -> soaked-gel transformation is actually on screen.
          broll: [
            { src: "broll/chia.mp4", fromSeconds: 0.9, durationInSeconds: 2.4 }, // "chia seeds are insanely healthy"
            { src: "broll/m1_dryseeds.mp4", fromSeconds: 11.0, durationInSeconds: 2.8 }, // mistake 1 — bowls of DRY seeds
            { src: "broll/tablespoon.mp4", fromSeconds: 22.9, durationInSeconds: 2.6 }, // mistake 2 — "one or two tablespoons"
            { src: "broll/m3_gel.mp4", fromSeconds: 29.4, durationInSeconds: 2.8 }, // mistake 3 — soaked chia GEL (the payoff visual)
            { src: "broll/m4_hot.mp4", fromSeconds: 33.4, durationInSeconds: 2.6 }, // mistake 4 — kettle pouring, clearly hot
          ],
          stats: [],
          // Chapter markers: a five-item list without them plays as one monologue
          // and the viewer loses their place. Timed to "number one/two/three...".
          markers: [
            { text: "MISTAKE 1", fromSeconds: 10.72, durationInSeconds: 3.0 },
            { text: "MISTAKE 2", fromSeconds: 19.27, durationInSeconds: 3.0 },
            { text: "MISTAKE 3", fromSeconds: 25.17, durationInSeconds: 3.0 },
            { text: "MISTAKE 4", fromSeconds: 31.87, durationInSeconds: 3.0 },
            { text: "MISTAKE 5", fromSeconds: 37.57, durationInSeconds: 3.0 },
          ],
        }}
        durationInFrames={1163}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v4 — "Four of those five habits aren't ageing your skin".
          Does NOT loop; ends on habit five. Five habits, five literal objects, so
          again B-roll rather than graphics. Collagen (27.72) has zero free stock —
          verified across Pexels/Pixabay/Openverse — so that beat stays on Jade. */}
      <Composition
        id="SkinAgeingHabits"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 46.59,
          fps: 25,
          broll: [
            { src: "broll/water.mp4", fromSeconds: 8.5, durationInSeconds: 2.6 }, // habit 1 — "not drinking enough water"
            { src: "broll/skin.mp4", fromSeconds: 11.0, durationInSeconds: 2.2 }, // "skin elasticity"
            { src: "broll/exercise.mp4", fromSeconds: 15.3, durationInSeconds: 2.8 }, // habit 2 — "not exercising enough"
            { src: "broll/junk.mp4", fromSeconds: 22.9, durationInSeconds: 2.6 }, // habit 3 — "eating junk food often"
            { src: "broll/sleep3.mp4", fromSeconds: 32.6, durationInSeconds: 2.8 }, // habit 4 — "not sleeping enough"
            { src: "broll/stress.mp4", fromSeconds: 40.4, durationInSeconds: 2.8 }, // habit 5 — "high stress"
          ],
          stats: [],
        }}
        durationInFrames={1165}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v7 — "The reason to walk after dinner isn't blood sugar".
          Three reasons. Reason three ("it's free") is the money line — it lands as
          a number card rather than passing by in the VO, which is the one thing the
          audio can't do on its own.
          Loop-cut at 29.2 (after "just walk", before "because"). */}
      <Composition
        id="ThreeReasonsWalk"
        component={JadeChart}
        schema={jadeChartSchema}
        calculateMetadata={calculateJadeChartMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 29.2,
          fps: 25,
          // Reason 1 is a digestion claim, so it gets a medical animation of the
          // stomach rather than someone eating. Reason 2 IS the blood-sugar spike,
          // so it gets the curve — the literal shape of the claim, which no stock
          // clip can show (free "glucose" footage: zero results).
          broll: [
            { src: "broll/med_stomach.mp4", fromSeconds: 9.4, durationInSeconds: 3.0 },
            { src: "broll/blood-glucose-monitor.mp4", fromSeconds: 17.9, durationInSeconds: 2.6 },
          ],
          chartFromSeconds: 20.8,
          chartDurationInSeconds: 4.6,
          topY: 1195,
          highPeak: 0.92,
          lowPeak: 0.42,
          highLabel: "NO WALK",
          lowLabel: "AFTER-DINNER WALK",
          title: "POST-MEAL BLOOD SUGAR",
        }}
        durationInFrames={730}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* batch3 v8 — "You don't need to walk after every meal".
          The payoff ("your muscles will pull excess glucose from your blood") is a
          NUMBER, not an object — stock has zero usable glucose footage, and red
          blood cells would show generic biology rather than the actual claim. So
          it's a chart: same meal, red spike without the walk, green blunted peak
          with it, drawn in that order so the fix is revealed.
          Loop-cut at 19.6 — ends on "...during your walk", before the hanging
          "which is why" that hands back to the opening. */}
      <Composition
        id="BloodSugarWalk"
        component={JadeChart}
        schema={jadeChartSchema}
        calculateMetadata={calculateJadeChartMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 19.6,
          fps: 25,
          broll: [
            { src: "broll/pills.mp4", fromSeconds: 2.6, durationInSeconds: 2.4 },
            { src: "broll/shoes-walk.mp4", fromSeconds: 9.5, durationInSeconds: 3.0 },
          ],
          chartFromSeconds: 13.6,
          chartDurationInSeconds: 6.0,
          topY: 1195,
          highPeak: 0.92,
          lowPeak: 0.42,
          highLabel: "NO WALK",
          lowLabel: "10-MIN WALK",
          title: "BLOOD SUGAR AFTER A MEAL",
        }}
        durationInFrames={490}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* ── batch4 ────────────────────────────────────────────────────
          w1 — "Eat less, and you lose muscle". Structurally the lifting
          flywheel in reverse: the same closed circle, but it's a trap rather
          than a virtuous cycle, so the ring closes in RED. Seeing the loop shut
          is the whole point — spoken, "and when you don't lift weights, you
          lose muscle" is just another sentence. */}
      <Composition
        id="W1UnderEatingLoop"
        component={JadeFlywheel}
        schema={jadeFlywheelSchema}
        calculateMetadata={calculateJadeFlywheelMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 29.89,
          fps: 25,
          centerY: 1545,
          radius: 268,
          tone: "bad",
          broll: [],
          links: [
            { text: "EAT LESS", atSeconds: 0.13 },
            { text: "LOSE MUSCLE", atSeconds: 3.92 },
            { text: "METABOLISM DROPS", atSeconds: 7.44 },
            { text: "FAT LOSS STALLS", atSeconds: 11.36 },
            { text: "EAT EVEN LESS", atSeconds: 15.36 },
            { text: "LESS ENERGY", atSeconds: 18.56 },
            { text: "CRASH BY 3PM", atSeconds: 22.72 },
            { text: "DON'T LIFT", atSeconds: 26.45 },
          ],
        }}
        durationInFrames={747}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* w3 — "Nothing happens in the first three days" (30 days off sugar).
          A timeline, not a list: the viewer needs to know WHERE in the 30 days
          each claim sits, which the audio only says once and in passing. Day
          markers carry that. Loop-cut at 42.0, before the closing restatement. */}
      <Composition
        id="W3SugarThirtyDays"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 42.0,
          fps: 25,
          // Mute test: with sound off, each beat has to be legible from footage
          // + on-screen text alone. Markers gave the WHEN; these give the WHAT.
          broll: [
            { src: "broll/b1_sugar.mp4", fromSeconds: 0.6, durationInSeconds: 2.4 }, // "avoid added sugar"
            { src: "broll/b2_glucose.mp4", fromSeconds: 4.2, durationInSeconds: 2.6 }, // "blood sugar and insulin get steadier"
            { src: "broll/b3_headache.mp4", fromSeconds: 10.6, durationInSeconds: 2.8 }, // "headaches, tiredness, irritability"
            { src: "broll/b4_cravings.mp4", fromSeconds: 19.4, durationInSeconds: 2.6 }, // "cravings turning up less often"
            { src: "broll/b5_energy.mp4", fromSeconds: 24.4, durationInSeconds: 2.6 }, // "energy becomes more consistent"
            // Timed to the WORDS, not the sentence: "deeper sleep" lands 33.74-34.59
            // and "better concentration" 35.00-35.91. An earlier pass had the sleep
            // clip finishing before the word arrived, so the caption "DEEPER SLEEP"
            // played over the laptop shot — picture and text disagreeing.
            { src: "broll/b6_sleep.mp4", fromSeconds: 33.6, durationInSeconds: 1.4 }, // "deeper sleep"
            { src: "broll/b7_focus.mp4", fromSeconds: 35.0, durationInSeconds: 1.6 }, // "better concentration"
          ],
          stats: [],
          markers: [
            { text: "DAYS 1-3", fromSeconds: 3.4, durationInSeconds: 5.4 },
            { text: "DAYS 3-5", fromSeconds: 9.8, durationInSeconds: 8.2 },
            { text: "END OF WEEK 1", fromSeconds: 19.0, durationInSeconds: 4.0 },
            { text: "WEEK 2", fromSeconds: 23.7, durationInSeconds: 5.8 },
            { text: "WEEKS 2-3", fromSeconds: 30.2, durationInSeconds: 5.0 },
            { text: "DAY 30", fromSeconds: 35.9, durationInSeconds: 5.4 },
          ],
        }}
        durationInFrames={1050}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* w4 — "Ten minutes of skipping a day". Same timeline shape as w3. */}
      <Composition
        id="W4SkippingThirtyDays"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 49.44,
          fps: 25,
          broll: [
            { src: "broll/b1_rope.mp4", fromSeconds: 0.6, durationInSeconds: 2.6 }, // the hook — skipping
            { src: "broll/b2_rope2.mp4", fromSeconds: 4.2, durationInSeconds: 2.6 }, // "day one, 10 minutes feels like 30"
            { src: "broll/b3_hr.mp4", fromSeconds: 8.3, durationInSeconds: 2.4 }, // "heart rate skyrockets"
            { src: "broll/b4_jump.mp4", fromSeconds: 12.0, durationInSeconds: 2.8 }, // "every jump recruits her entire body"
            { src: "broll/b5_rest.mp4", fromSeconds: 30.8, durationInSeconds: 2.6 }, // day 15 — "burning calories after she stops"
            { src: "broll/b6_waist.mp4", fromSeconds: 36.2, durationInSeconds: 2.8 }, // day 20 — "waist gets more pronounced"
          ],
          stats: [],
          markers: [
            { text: "DAY 1", fromSeconds: 3.9, durationInSeconds: 4.0 },
            { text: "DAYS 2-3", fromSeconds: 10.7, durationInSeconds: 5.0 },
            { text: "DAY 7", fromSeconds: 20.6, durationInSeconds: 4.0 },
            { text: "DAY 15", fromSeconds: 30.5, durationInSeconds: 4.4 },
            { text: "DAY 20", fromSeconds: 35.7, durationInSeconds: 5.2 },
            { text: "DAY 30", fromSeconds: 41.9, durationInSeconds: 6.0 },
          ],
        }}
        durationInFrames={1236}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* w2 — "If you eat carbs, you'll be energised". The script literally
          accumulates: carbs, then +protein, then +fats, then +fibre, each adding
          its benefit. That's the ladder, and seeing the plate build is the point
          she makes at the end ("focus on what you can ADD"). Loop-cut at 32.5,
          on "starting with carbs", which hands back to the opening line. */}
      <Composition
        id="W2AddToYourPlate"
        component={JadeStack}
        schema={jadeStackSchema}
        calculateMetadata={calculateJadeStackMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 32.5,
          fps: 25,
          mode: "reveal",
          topY: 1150,
          rowH: 118,
          accent: "#3DDC84",
          // The script pairs each macro with a BENEFIT. Holding both on one row
          // is what the audio cannot do - it names them sequentially, the stack
          // keeps them together so the finished plate is visible at the end.
          rows: [
            { img: "cards/carbs.jpg", label: "CARBS", note: "ENERGISED", atSeconds: 0.56 },
            { img: "cards/protein.jpg", label: "PROTEIN", note: "SATISFIED", atSeconds: 2.86 },
            { img: "cards/fats.jpg", label: "FATS", note: "STEADY", atSeconds: 9.16 },
            { img: "cards/fibre.jpg", label: "FIBRE", note: "FULL", atSeconds: 18.22 },
          ],
          clearAtSeconds: 32.5,
        }}
        durationInFrames={813}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* w5 — "The best food after a workout is egg". Five foods in twelve
          seconds; at ~2.3s each a full-frame cutaway would be a strobe, so they
          build as cards instead and all five are still on screen at the CTA. */}
      <Composition
        id="W5PostWorkoutFoods"
        component={JadeStack}
        schema={jadeStackSchema}
        calculateMetadata={calculateJadeStackMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 14.72,
          fps: 25,
          // "highlight": all five are on screen from the first cue and only the
          // emphasis moves. Five separate pop-ins in twelve seconds is the
          // rapid-fire anti-pattern, and this way the viewer gets a complete,
          // screenshot-able list instead.
          mode: "highlight",
          topY: 1140,
          rowH: 104,
          accent: "#3DDC84",
          rows: [
            { img: "cards/egg.jpg", label: "AFTER A WORKOUT", note: "EGG", atSeconds: 1.5 },
            { img: "cards/yogurt.jpg", label: "SNACK", note: "YOGURT + FRUIT", atSeconds: 3.4 },
            { img: "cards/banana.jpg", label: "FRUIT", note: "BANANA", atSeconds: 5.9 },
            { img: "cards/water.jpg", label: "DRINK", note: "WATER", atSeconds: 8.3 },
            { img: "cards/rice.jpg", label: "MEAL", note: "RICE + PROTEIN", atSeconds: 11.2 },
          ],
          clearAtSeconds: 14.72,
        }}
        durationInFrames={368}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* w9 — "Your cravings aren't a nutrient code". Craving on the left, what
          the body actually wants on the right — the same duality treatment as the
          night-cravings video, because the script is built on the same pairing.
          Loop-cut at 29.3, before the trailing loop marker. */}
      <Composition
        id="W9CravingDecoder"
        component={JadeStack}
        schema={jadeStackSchema}
        calculateMetadata={calculateJadeStackMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 29.3,
          fps: 25,
          // Was side-by-side cards, which breaks the portrait rule. As a vertical
          // decoder table all four pairings are visible at once - the viewer can
          // find their own craving instead of waiting for it to be spoken.
          mode: "highlight",
          topY: 1170,
          rowH: 112,
          accent: "#3DDC84",
          rows: [
            { img: "cards/salty.jpg", label: "CRAVING SALTY", note: "ELECTROLYTES", atSeconds: 0.9 },
            { img: "cards/sugar.jpg", label: "CRAVING SUGAR", note: "PROTEIN", atSeconds: 7.6 },
            { img: "cards/carbs.jpg", label: "CRAVING CARBS", note: "ENERGY", atSeconds: 13.2 },
            { img: "cards/creamy.jpg", label: "CRAVING CREAMY", note: "HEALTHY FATS", atSeconds: 19.0 },
          ],
          clearAtSeconds: 29.3,
        }}
        durationInFrames={733}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* w6 — "The most protein-rich food isn't chicken". A quiz reveal: two
          clues, then spirulina. The two numbers ARE the payoff (72% protein,
          twice chicken), so they land as cards rather than passing by in the VO.
          Loop-cut at 40.3, before the trailing loop marker. */}
      <Composition
        id="W6Spirulina"
        component={JadeCompare}
        schema={jadeCompareSchema}
        calculateMetadata={calculateJadeCompareMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 40.3,
          fps: 25,
          topY: 1210,
          // Dropped the CLUE 1 / CLUE 2 chips and the "72%" card - she says all
          // three out loud, so they only retold. The claim the audio asserts but
          // cannot show is that spirulina is roughly DOUBLE the others.
          broll: [
            { src: "broll/b1_powder.mp4", fromSeconds: 16.6, durationInSeconds: 2.8 },
            { src: "broll/b2_algae.mp4", fromSeconds: 20.2, durationInSeconds: 2.4 },
          ],
          groups: [
            {
              fromSeconds: 23.2,
              durationInSeconds: 4.2,
              title: "PROTEIN BY WEIGHT",
              bars: [
                { label: "SPIRULINA", value: 72, display: "72%", tone: "good" },
                { label: "CHICKEN BREAST", value: 31, display: "31%", tone: "neutral" },
                { label: "BEEF", value: 26, display: "26%", tone: "neutral" },
              ],
            },
          ],
        }}
        durationInFrames={1008}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* w7 — "The best exercise for a flat stomach". NOTE: the source filename
          says "walking is underrated", but the script is the crunches-vs-fasted-
          walking argument — edited to the script. The 80/15 split is the whole
          case, so it gets a card. */}
      <Composition
        id="W7FlatStomach"
        component={JadeCompare}
        schema={jadeCompareSchema}
        calculateMetadata={calculateJadeCompareMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 41.17,
          fps: 25,
          topY: 1240,
          // B-roll now female throughout - the earlier cut used a man doing
          // crunches in a video addressed to women.
          broll: [
            { src: "broll/b1_crunch.mp4", fromSeconds: 1.8, durationInSeconds: 2.6 },
            { src: "broll/b3_walk.mp4", fromSeconds: 27.4, durationInSeconds: 2.8 },
          ],
          groups: [
            {
              fromSeconds: 12.6,
              durationInSeconds: 4.6,
              title: "WHERE FAT LOSS COMES FROM",
              bars: [
                { label: "DIET", value: 80, display: "80%", tone: "good" },
                { label: "EXERCISE", value: 15, display: "15%", tone: "bad" },
              ],
            },
          ],
        }}
        durationInFrames={1029}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* w8 — "What your daily numbers actually look like as food". Purpose-built
          comp: each abstract amount is paired with the food it equals, which is
          the entire point of the script. Loop-cut at 25.0. */}
      <Composition
        id="W8DailyNumbers"
        component={JadeStack}
        schema={jadeStackSchema}
        calculateMetadata={calculateJadeStackMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 25.0,
          fps: 25,
          // She lists these one at a time; the value is having all five together
          // as a reference the viewer can screenshot. That simultaneity is the
          // add - repeating "50g protein" as a caption card was not.
          mode: "highlight",
          topY: 1120,
          rowH: 104,
          accent: "#3DDC84",
          rows: [
            { img: "cards/eggs.jpg", label: "50g PROTEIN", note: "8 EGGS", atSeconds: 0.9 },
            { img: "cards/avocado.jpg", label: "60g FAT", note: "2 AVOCADOS", atSeconds: 5.4 },
            { img: "cards/orange.jpg", label: "80mg VIT C", note: "1 ORANGE", atSeconds: 9.9 },
            { img: "cards/milk.jpg", label: "1000mg CALCIUM", note: "3-4 CUPS MILK", atSeconds: 14.9 },
            { img: "cards/sun.jpg", label: "800 IU VIT D", note: "10-30 MIN SUN", atSeconds: 20.3 },
          ],
          clearAtSeconds: 25.0,
        }}
        durationInFrames={625}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* ── COLLAGEN ADS ───────────────────────────────────────────────
          Paid, not organic: the whole spend converts on whether the viewer types
          one word. So the CTA gets a real moment — that is NOT the "retelling"
          anti-pattern, because hearing "comment collagen" and SEEING the exact
          string to type are different jobs.
          Everything before the CTA still follows the organic discipline.

          Ad 1 — the hook rules out three alternatives in 3.4 seconds (retinol
          4.30, red light 4.97, injections 7.64). Three cutaways that fast would
          strobe, so the rule-outs are ONE stacked animation instead. */}
      <Composition
        id="CollagenAd1"
        component={JadeAdCta}
        schema={jadeAdCtaSchema}
        calculateMetadata={calculateJadeAdCtaMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 34.58,
          fps: 25,
          // "prolyl hydroxyproline" is cut from the VO (18.32-19.75) - it is a
          // mouthful that stalls the read - and shown on screen instead, where
          // it reads as credibility rather than a stumble.
          termText: "PROLYL-HYDROXYPROLINE",
          termFromSeconds: 17.9,
          termDurationInSeconds: 2.6,
          termTopY: 1230,
          rows: [],
          rowsFromSeconds: 0,
          rowsClearAtSeconds: 0,
          // Symptom cutaways on the hook, timed to the words and cut tight:
          // "crepey" 2.05, "saggy" 2.45, "skin" 2.95. Each one shows the actual
          // condition she names rather than a generic beauty shot.
          broll: [
            { src: "broll/s1_crepey.mp4", fromSeconds: 2.03, durationInSeconds: 0.42, crossOut: false, over: false },
            { src: "broll/s2_saggy.mp4", fromSeconds: 2.45, durationInSeconds: 0.48, crossOut: false, over: false },
            { src: "broll/s3_skin.mp4", fromSeconds: 2.93, durationInSeconds: 0.60, crossOut: false, over: false },
            { src: "broll/b5_skin.mp4", fromSeconds: 24.6, durationInSeconds: 2.0, crossOut: false, over: false },
          ],
          ctaFromSeconds: 31.3,
          ctaDurationInSeconds: 3.28,
          ctaWord: "COLLAGEN",
          ctaLine: "COMMENT THE WORD",
          ctaSub: "AND CHECK YOUR MESSAGES",
          // Head top measured at y~316 across the CTA window, so the block starts
          // at 60: the pill's lower edge lands on her hairline and the whole word
          // sits clear above her, with the matte keeping her in front of it.
          ctaTopY: 60,
          matteSrc: "matte/cta.webm",
          matteFromSeconds: 31.3,
          matteDurationInSeconds: 3.28,
          matteTrimBeforeSeconds: 0,
        }}
        durationInFrames={864}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Ad 1.2 — ad 1 complete with the pt-2 re-shoot APPENDED (client's call).
          Worth knowing: pt 2 re-records the same passage, so 15.0-36.0 replays
          at 35.6-51.1. CTA fires on the final one. */}
      <Composition
        id="CollagenAd1v2"
        component={JadeAdCta}
        schema={jadeAdCtaSchema}
        calculateMetadata={calculateJadeAdCtaMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          // SPLICE, not append: ad 1's hook (0-15.0) joined to the pt-2 re-shoot,
          // dropping ad 1's duplicate second half. 30s instead of 51s, and the
          // passage plays once. pt 2 never says the compound, so no cut needed.
          durationInSeconds: 30.07,
          fps: 25,
          termText: "",
          rows: [],
          rowsFromSeconds: 0,
          rowsClearAtSeconds: 0,
          // Same symptom cutaways as ad 1 - 1.2 shares the identical hook take,
          // so the word timings carry over unchanged.
          broll: [
            { src: "broll/s1_crepey.mp4", fromSeconds: 2.03, durationInSeconds: 0.42, crossOut: false, over: false },
            { src: "broll/s2_saggy.mp4", fromSeconds: 2.45, durationInSeconds: 0.48, crossOut: false, over: false },
            { src: "broll/s3_skin.mp4", fromSeconds: 2.93, durationInSeconds: 0.60, crossOut: false, over: false },
            { src: "broll/b5_skin.mp4", fromSeconds: 22.2, durationInSeconds: 1.8, crossOut: false, over: false },
          ],
          ctaFromSeconds: 27.6,
          ctaDurationInSeconds: 2.47,
          ctaWord: "COLLAGEN",
          ctaLine: "COMMENT THE WORD",
          ctaSub: "AND CHECK YOUR MESSAGES",
          ctaTopY: 60,
          matteSrc: "matte/cta.webm",
          matteFromSeconds: 27.6,
          matteDurationInSeconds: 2.47,
          matteTrimBeforeSeconds: 0,
        }}
        durationInFrames={752}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Ad 2 — the mistakes list. She says "five mistakes" but names four, so
          they are numbered 1-4 as spoken (client's call). One stacked animation
          rather than four markers plus four cutaways: at 42s the density budget
          is roughly 3-5 animations, not nine. */}
      <Composition
        id="CollagenAd2"
        component={JadeAdCta}
        schema={jadeAdCtaSchema}
        calculateMetadata={calculateJadeAdCtaMetadata}
        defaultProps={{
          // Base is now pt-2's take for everything up to "10 grams is" (0-29.85)
          // joined to the original's tail from "And number four" (30.95 on).
          // pt 2 is NATIVE 1080 where the original was upscaled from 720, so the
          // first 30s is genuinely sharper - see note below about the join.
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 40.91,
          fps: 25,
          termText: "",
          termFromSeconds: 0,
          termDurationInSeconds: 0,
          termTopY: 1230,
          rows: [
            { img: "cards/vitc.jpg", label: "1 · NO VITAMIN C", note: "CAN'T ABSORB", atSeconds: 9.4 },
            { img: "cards/weeks.jpg", label: "2 · QUITTING EARLY", note: "8-12 WEEKS", atSeconds: 18.4 },
            { img: "cards/scoop.jpg", label: "3 · UNDERDOSING", note: "10 GRAMS", atSeconds: 24.4 },
            { img: "cards/sun.jpg", label: "4 · SUN EXPOSURE", note: "UV BREAKS IT", atSeconds: 30.0 },
          ],
          rowsFromSeconds: 9.2,
          rowsClearAtSeconds: 36.8,
          rowsTopY: 1470,
          rowH: 84,
          broll: [
            { src: "broll/cov_vitc.mp4", fromSeconds: 8.95, durationInSeconds: 0.85, crossOut: false, over: true },
            { src: "broll/cov_powder.mp4", fromSeconds: 36.5, durationInSeconds: 0.9, crossOut: false, over: true },
          ],
          ctaFromSeconds: 36.9,
          ctaDurationInSeconds: 4.0,
          ctaWord: "COLLAGEN",
          ctaLine: "COMMENT THE WORD",
          ctaSub: "TO TRY IT TODAY",
          ctaTopY: 60,
          matteSrc: "matte/cta.webm",
          matteFromSeconds: 36.9,
          matteDurationInSeconds: 4.0,
          matteTrimBeforeSeconds: 0,
        }}
        durationInFrames={1023}
        fps={25}
        width={1080}
        height={1920}
      />

      {/* Albert — "how to steal any website design". NOT a Jade video: uses the
          Esteban caption track styling (Anton 100, white, centred, no stroke,
          soft shadow) rather than the Jade outline variant.
          Layout is screen-capture on top / talking head below, with his head
          starting around y870, so captions sit at y1500 - clear of his chin and
          well clear of the screen recording. */}
      <Composition
        id="AlbertStealDesign"
        component={JadeEdit}
        schema={jadeEditSchema}
        calculateMetadata={calculateJadeEditMetadata}
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 42.12,
          fps: 30,
          broll: [],
          stats: [],
          markers: [],
          captionVariant: "esteban",
          // Measured: the screen-capture panel ends at y731 and his head starts
          // at y865, so captions sit at y798 - in the gap, under the screen and
          // above his head. Single-line only (18-char chunks) so a caption can
          // never grow into either edge.
          captionCenterY: 798,
          // From 36.8s the framing goes full-face for the CTA, so captions drop
          // to under his chin.
          captionOverrides: [{ from: 36.8, to: 43, centerY: 1500 }],
        }}
        durationInFrames={1264}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* General Health Routines — icon overlay (boxes already in source video) */}
      <Composition
        id="HealthRoutines"
        component={HealthRoutines}
        durationInFrames={GHR_DURATION}
        fps={GHR_FPS}
        width={1080}
        height={1920}
      />

      {/* Homeowners Painters Picks Guide — TIGHT cut + Devin Jatho glow captions */}
      <Composition
        id="HomeownersPainters"
        component={HomeownersPainters}
        durationInFrames={HPG_DURATION}
        fps={HPG_FPS}
        width={1080}
        height={1920}
      />

      {/* Jade Jones — parameterized batch-render comp.
          Pass --props='{"videoSrc":"video.mp4","captionsSrc":"captions.json","durationInSeconds":N,"fps":25}'
          with --public-dir pointing at a folder containing video + captions. */}
      <Composition
        id="JadeShort"
        component={JadeShort}
        schema={jadeShortSchema}
        calculateMetadata={calculateJadeMetadata}
        // placeholder defaults (used only for studio preview if files exist)
        defaultProps={{
          videoSrc: "video.mp4",
          captionsSrc: "captions.json",
          durationInSeconds: 30,
          fps: 25,
        }}
        // these are overridden by calculateMetadata at render time
        durationInFrames={750}
        fps={25}
        width={1080}
        height={1920}
      />

      <Composition
        id="PhilVSL"
        component={PhilVSL}
        durationInFrames={PHIL_VSL_DURATION}
        fps={PHIL_VSL_FPS}
        width={1920}
        height={1080}
      />

      <Composition
        id="PhilVSL2"
        component={PhilVSL2}
        durationInFrames={PHIL_VSL_V2_DURATION}
        fps={PHIL_VSL_FPS}
        width={1920}
        height={1080}
      />

      <Composition
        id="Brandon30K"
        component={Brandon30K}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ─── Digital Products Are Dead — 7 Overlay Animations ─── */}
      <Folder name="DigitalProductsDead">
        <Composition
          id="DPD-1-DeathList"
          component={DeathList}
          durationInFrames={8 * DPD_FPS}
          fps={DPD_FPS}
          width={DPD_W}
          height={DPD_H}
        />
        <Composition
          id="DPD-2-InformationFree"
          component={InformationFree}
          durationInFrames={7 * DPD_FPS}
          fps={DPD_FPS}
          width={DPD_W}
          height={DPD_H}
        />
        <Composition
          id="DPD-3-ContentVsTransformation"
          component={ContentVsTransformation}
          durationInFrames={8 * DPD_FPS}
          fps={DPD_FPS}
          width={DPD_W}
          height={DPD_H}
        />
        <Composition
          id="DPD-4-TheFunnel"
          component={TheFunnel}
          durationInFrames={9 * DPD_FPS}
          fps={DPD_FPS}
          width={DPD_W}
          height={DPD_H}
        />
        <Composition
          id="DPD-5-TheProofLoop"
          component={TheProofLoop}
          durationInFrames={8 * DPD_FPS}
          fps={DPD_FPS}
          width={DPD_W}
          height={DPD_H}
        />
        <Composition
          id="DPD-6-NicheDown"
          component={NicheDown}
          durationInFrames={9 * DPD_FPS}
          fps={DPD_FPS}
          width={DPD_W}
          height={DPD_H}
        />
        <Composition
          id="DPD-7-DistributionStack"
          component={DistributionStack}
          durationInFrames={8 * DPD_FPS}
          fps={DPD_FPS}
          width={DPD_W}
          height={DPD_H}
        />
      </Folder>
      <Composition
        id="MimPrepRatingReel"
        component={MimPrepRatingReel}
        durationInFrames={Math.round(MIM_TRIM.duration * 30)}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="MimPrepResourceDesk"
        component={MimPrepResourceDesk}
        durationInFrames={Math.round(18.46 * 30)}
        fps={30}
        width={1080}
        height={1920}
      />
          <Composition
        id="ThomasEvent"
        component={ThomasEvent}
        defaultProps={{ id: "same-goal" }}
        calculateMetadata={thomasEventMetadata}
        durationInFrames={250}
        fps={25}
        width={1920}
        height={1080}
      />
      <Composition
        id="ThomasBackground"
        component={ThomasBackground}
        durationInFrames={Math.round(TBG_DUR * TBG_FPS)}
        fps={TBG_FPS}
        width={1080}
        height={1920}
      />
</>
  );
};
