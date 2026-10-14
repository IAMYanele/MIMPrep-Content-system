# Remotion Operations & Migration Guide

> Portable handover for the short-form video-production system in `C:\Users\yanel\Documents\remotion`.
> Written for another AI assistant (or engineer) to operate the system without re-discovering it.
> **No secrets are included** — API keys/tokens are referenced only by their environment-variable names.

---

## Executive Summary

This repo is a **code-as-video factory**: [Remotion](https://remotion.dev) 4.0.501 (React that renders to MP4) on top of a Next.js 16 shell. Its day job is producing **vertical 1080×1920 Instagram reels** for the **"Jade Jones" health/fitness clone workflow** — talking-head takes that get captioned, cut, and dressed with concept B-roll or on-screen graphics, then delivered to `F:\jade jones\videos\EDITED\`. Several other one-off client comps also live here (PhilVSL, TwoBrands, AIAgentExplainer, etc.).

**The mental model:** every video is one entry in `src/remotion/Root.tsx` (a `<Composition>`), whose *edit decisions live as data in `defaultProps`* (B-roll windows, hook text, card timings). A small set of **reusable components** in `src/remotion/JadeJones/` provide the "treatments" (clean captions + B-roll, building supplement cards, split-screen study, etc.), and a set of **root-level `.mjs`/`.sh` scripts** provide the pipeline (transcribe, source B-roll, loop-cut, render). You rarely write new rendering code — you fill in props and point the renderer at a per-video asset folder.

**The three things that make this system fast and reliable:**
1. **`render-fast.mjs`** — a warm "bundle-once" render harness (bundle ~45 s once, then ~15 s/frame). Use it instead of `npx remotion render` for anything with multiple stills or a verify-then-final loop.
2. **The Pexels/Pixabay API sourcers** (`pex-api.mjs`, `pex-img.mjs`, `pix-api.mjs`) — instant, portrait-native, attribution-capturing B-roll, no scraping.
3. **A rigorous verify habit** — because renders are headless, you *always* extract frames and read them (or read waveforms) before calling anything done. Most defects are caught here, not by assumption.

**Two environmental constraints you must respect:**
- The **C: drive is ~95 % full**, so renders redirect scratch to `F:` (`TMP/TEMP=F:/remotion-temp`) and bump the Node heap (`NODE_OPTIONS=--max-old-space-size=6144`), and each video renders against a **minimal per-video `--public-dir`** (`F:\jade jones\render\<name>\`) instead of the 750 MB shared `public/`.
- `webpack-override.mjs` sets `cache:false` (a Node-22 workaround) — which is *why* the CLI pays a full cold bundle every call, and *why* `render-fast.mjs` exists.

If you read nothing else, read **§4 Fastest Reliable Workflow**, **§7 Operational Knowledge**, and the **Quick Start** at the end.

---

# 1. PROJECT MAP

This is a **Remotion 4.0.501** (React-in-video) monorepo layered on top of a **Next.js 16** app. It started life as the official Remotion + Next.js + Lambda starter (original author: Mohit Yadav, in `package.json`) and has been grown into a personal/agency **short-form video factory** — every client/campaign lives as its own composition folder under `src/remotion/`, and the Next.js shell (`src/app`, `src/components`, `src/lambda`) is the mostly-untouched starter used for browser/Lambda rendering.

Root of everything: `C:\Users\yanel\Documents\remotion`

## 1.1 Directory structure

```
C:\Users\yanel\Documents\remotion\
│
├─ package.json                 Deps + scripts (dev / build / remotion studio / render / deploy)
├─ tsconfig.json                TS config (strict, jsx: react-jsx; excludes remotion.config.ts)
├─ next.config.js               Next.js config (only reactStrictMode: true)
├─ remotion.config.ts           Remotion CLI config: JPEG image format + webpackOverride hookup
├─ config.mjs                   Lambda deploy config (region/function/site names) — read by deploy.mjs
├─ deploy.mjs                   `npm run deploy` — provisions the Lambda function + deploys the site
├─ vercel.json / .npmrc / .prettierrc / eslint.config.mjs / postcss.config.mjs   Tooling
├─ .env.example                 Template for AWS/Lambda env vars (real .env NOT committed)
│
├─ render-fast.mjs      ★ Node-API "warm bundle-once" render harness (see §1.4) — the main render path
├─ process-jade.ps1     ★ Batch pipeline: copy→extract audio→whisper→ffprobe→render JadeShort (see §1.4)
├─ process-jade2.ps1      Variant of the above batch pipeline
├─ jade-loopcut.sh        ffmpeg loop-cut + re-transcribe for the 3 "hook-repeat" Jade takes
├─ render-env.sh          One-off ffmpeg concat/xfade+subtitle burn for the EnvironmentVideo
│
├─ transcribe-any.mjs   ★ Generic whisper.cpp transcriber: WAV(16k mono) → captions.json (see §1.3)
├─ transcribe.mjs / transcribe-environment.mjs / avatar-transcribe.mjs / e167-transcribe.mjs
│                         Per-video wrappers around the same @remotion/install-whisper-cpp flow
├─ pex-*.mjs / pix-api.mjs / ov-foods.mjs   Pexels / Pixabay B-roll + stock-image fetch helpers
│
├─ whisper.cpp/           (generated) whisper.cpp binary + medium.en model, installed by transcribe-any.mjs
│
├─ src/
│  ├─ app/                Next.js App Router — the render UI + Lambda API
│  │   ├─ page.tsx            Home page (render controls demo)
│  │   ├─ layout.tsx
│  │   └─ api/lambda/
│  │        ├─ render/route.ts     POST → kick off a Lambda render
│  │        └─ progress/route.ts   POST → poll render progress
│  ├─ components/         Starter UI (RenderControls, ProgressBar, DownloadButton, Button, Input…)
│  ├─ helpers/            use-rendering.ts (client render state machine) + api-response.ts
│  ├─ lambda/api.ts       Typed client for the /api/lambda endpoints
│  ├─ lib/utils.ts        cn() tailwind-merge helper
│  │
│  └─ remotion/          ★ THE VIDEO SOURCE ROOT
│      ├─ index.ts            Entry point → registerRoot(RemotionRoot) (see §1.2)
│      ├─ Root.tsx            Composition registry — every <Composition> lives here (see §1.2)
│      ├─ webpack-override.mjs  Tailwind-v4 enable + md4→md5 / undefined-hash polyfills + cache:false (see §1.4)
│      │
│      ├─ MyComp/             Original starter comps: Main, NextLogo, Rings, TextFade
│      │
│      ├─ JadeJones/     ★ Largest active area — "Jade Jones" IG health-clone reels (11 comp files)
│      │     JadeShort.tsx       Parameterized Ken-Burns+captions comp for BATCH rendering
│      │     JadeEdit.tsx        Clean captions + concept B-roll (reused by many comps)
│      │     JadeLadder.tsx      On-screen supplement "cards that build up" treatment
│      │     JadeCaptions.tsx    Shared caption renderer
│      │     BodyFatSplit / MagnesiumEdit / BrainExerciseEdit / NutrientTargets /
│      │     SkipBreakfast / BellySixPack / BellySixOverlay.tsx   per-video edits
│      │
│      ├─ DigitalProductsDead/ 7 overlay animations (1920×1080) grouped in a Remotion <Folder>
│      ├─ PhilVSL/            Vita Bella VSL (1920×1080 @25fps), two cuts (PhilVSL, PhilVSL2)
│      ├─ AIAgentExplainer/   9:16 explainer
│      ├─ YaneleTalkingHead/  9:16 talking-head
│      ├─ EnvironmentVideo/   9:16 "Your Environment…" (also assembled via render-env.sh)
│      ├─ TwoBrands/          @estenick × @getsellers.io 9:16
│      ├─ Clonify/            1280×720 clone demo
│      ├─ HealthRoutines/     9:16 icon-overlay
│      ├─ HomeownersPainters/ 9:16 tight-cut + glow captions
│      └─ Brandon30K/         1920×1080 single comp
│
├─ public/              ★ DEFAULT Remotion public dir — shared assets (see §1.4 for the per-video override)
│      *.mp4 / *.wav / *.json (video + audio + captions per project), broll/, sfx/, env-clips/, phil-vsl/
│
├─ styles/global.css     Tailwind entry (imported by src/remotion/index.ts)
├─ types/
│      constants.ts      COMP_NAME, DURATION_IN_FRAMES, VIDEO_FPS/WIDTH/HEIGHT, defaultMyCompProps
│      schema.ts         zod schema for the starter Main comp
└─ out/                  Render output (per render-env.sh etc.)
```

### External working drive — `F:\jade jones\` (reachable)

The big media for the Jade pipeline lives off-project on the `F:` drive (the `C:` disk is ~95% full — see §1.4). High-level:

```
F:\jade jones\
├─ videos\               Source talking-head takes (.mp4, human-named by hook line)
│    └─ EDITED\          Cleaned/re-cut source takes fed into the pipeline
├─ voiceovers\           ElevenLabs + per-video .mp3 voiceovers
└─ render\               Per-video render workdirs (undereat, iron, supp, magnesium, brain,
                         nutrient, cramps, bodyfat, bellysix, bellyover, avatar, skipbf, _raw, _food …)
```
Related scratch dirs at `F:\` root: `F:\remotion-temp` (TMP/TEMP redirect), `F:\jade-tmp` / `F:\jade2-tmp` (batch workdirs), `F:\remotion-renders` / `F:\ghr-render`.

## 1.2 Entry point & how compositions are wired

- **Entry point:** `src/remotion/index.ts` — 4 lines. It imports the global Tailwind CSS, imports `RemotionRoot` from `./Root`, and calls `registerRoot(RemotionRoot)`. Both the CLI/Studio and the Node-API bundler (`render-fast.mjs` uses `entryPoint: src/remotion/index.ts`) resolve everything from this file.

- **Registry:** `src/remotion/Root.tsx` is a single React fragment returning ~30 `<Composition>` elements — this is the **one place every renderable video is declared**. Each entry maps a string `id` (the target you pass to `remotion render <id>` / `render-fast.mjs <id>`) to a component, dimensions, fps and `durationInFrames`. The 7 `DigitalProductsDead` comps are nested in a `<Folder name="DigitalProductsDead">` purely for Studio-sidebar grouping.

- **Two composition styles:**
  1. **Fixed** — hardcoded `durationInFrames`/`fps`/`width`/`height` and (optionally) inline `defaultProps` (e.g. `AIAgentExplainer`, `TwoBrands`, `PhilVSL`, all `DPD-*`).
  2. **Parameterized + `calculateMetadata`** — the Jade family (`JadeShort`, `JadeEdit`, `BodyFatSplit`, etc.) each ship a zod `schema` and a `calculate*Metadata` fn so that **duration/fps are derived from `--props` at render time**. `JadeShort` is the pure batch template: its Root.tsx `defaultProps` are placeholders, overridden per video by the props JSON that `process-jade.ps1` writes.

- **Composition id cheat-sheet (what to pass to the renderer):** `HelloWorld`(=`COMP_NAME`), `NextLogo`, `Clonify`, `AIAgentExplainer`, `YaneleTalkingHead`, `EnvironmentVideo`, `TwoBrands`, `JadeEdit`, `UnderEatingCards`/`IronStackCards`/`ProteinStackCards` (JadeLadder), `UnderEating`/`IronStack`/`ProteinStack`/`PeriodCramps`/`AvatarPainters` (JadeEdit), `BodyFatSplit`, `MagnesiumEdit`, `BrainExerciseEdit`, `NutrientTargets`, `SkipBreakfast`, `BodyFatWomen`, `BellySixPack`, `BellySixOverlay`, `HealthRoutines`, `HomeownersPainters`, `JadeShort`, `PhilVSL`, `PhilVSL2`, `Brandon30K`, and `DPD-1-DeathList` … `DPD-7-DistributionStack`.

Note: `types/constants.ts` supplies `COMP_NAME` and the base video dims used by the starter `Main` comp and by the Next.js/Lambda render UI.

## 1.3 Dependencies

All `@remotion/*` packages are pinned to **4.0.501** and must stay in lockstep with `remotion` itself.

| Package | Version | What it's used for |
|---|---|---|
| `remotion` | 4.0.501 | Core: `Composition`, `Folder`, `registerRoot`, `Sequence`, `interpolate`, `AbsoluteFill`, hooks. Base of every comp. |
| `@remotion/media` | 4.0.501 | Newer media components (video/audio playback primitives) used inside comps. |
| `@remotion/bundler` | 4.0.501 | `bundle()` — used by `render-fast.mjs` to webpack the project once from the Node API. |
| `@remotion/renderer` | 4.0.501 | `selectComposition`, `renderStill`, `renderMedia` — the actual frame/video renderer in `render-fast.mjs`. |
| `@remotion/cli` | 4.0.501 | `remotion studio` / `remotion render` / bundled `remotion ffmpeg` + `ffprobe`; also exports `Config` used in `remotion.config.ts`. |
| `@remotion/lambda` | 4.0.501 | AWS Lambda distributed rendering — powers `deploy.mjs`, `config.mjs`, `src/lambda/api.ts` and the `/api/lambda/*` routes. |
| `@remotion/google-fonts` | 4.0.501 | Load Google Fonts inside compositions (deterministic font loading for renders). |
| `@remotion/install-whisper-cpp` | 4.0.501 | Installs & drives **whisper.cpp** for local transcription — `installWhisperCpp({version:"1.5.5"})`, `downloadWhisperModel({model:"medium.en"})`, `transcribe()`, `toCaptions()` in `transcribe-any.mjs`. Produces the `captions.json` every captioned comp consumes. |
| `@remotion/tailwind-v4` | 4.0.501 | `enableTailwind()` in `webpack-override.mjs` — wires Tailwind v4 into the Remotion webpack build. |
| `@remotion/captions` | 4.0.501 | Caption data model / `toCaptions` typing shared by transcriber + `JadeCaptions`. |
| `@remotion/transitions` | 4.0.501 | Scene transition primitives. |
| `@remotion/shapes` / `@remotion/paths` | 4.0.501 | SVG shape + path helpers (motion-graphics comps, e.g. DigitalProductsDead). |
| `@remotion/light-leaks` | 4.0.501 | Light-leak overlay effect. |
| `@remotion/player` | 4.0.501 | `<Player>` for in-browser preview in the Next.js UI. |
| `zod` | 4.4.3 | Composition prop schemas (`jadeShortSchema`, `bodyFatSplitSchema`, …) + `types/schema.ts`; drives Studio's props editor and `calculateMetadata`. |
| `next` | 16.1.5 | Next.js App Router shell hosting the render UI + Lambda API routes. |
| `react` / `react-dom` | 19.2.3 | React 19 — the rendering runtime for all compositions. |
| `webpack` | 5.98.0 | Pinned (also in `overrides`) so the CLI, `@remotion/bundler`, and Next agree on one webpack; the polyfills in `webpack-override.mjs` target exactly this 5.98 + modern-Node combo. |
| `lucide-react` `1.20.0`, `clsx` `2.1.1`, `tailwind-merge` `3.0.1` | — | Icons + className utilities used in comps and UI. |

**whisper.cpp note:** it is not an npm dependency — `@remotion/install-whisper-cpp` downloads and builds the whisper.cpp binary (pinned `version: "1.5.5"`) plus the `medium.en` model into a local `whisper.cpp/` folder on first run of `transcribe-any.mjs`. Captions are generated **offline/local**, not via any cloud API.

## 1.4 Rendering setup

There are **three** render paths; the Node-API harness is the day-to-day one.

**A) `render-fast.mjs` — the "warm bundle-once" Node-API harness (primary).**
`node render-fast.mjs <CompID> --public-dir <dir> [--stills 30,185] [--stills-out <dir>] [--out final.mp4] [--scale 0.5] [--frames a-b] [--concurrency 4] [--props file.json]`
It calls `bundle()` **once** (the ~60s webpack cost), then reuses that single in-memory `serveUrl` for `selectComposition` + any number of `renderStill` (frame verification) and one `renderMedia` (final H.264). This is what makes "check a frame, then render" fast — everything after the first bundle skips webpack entirely. It imports the same `webpackOverride` as the CLI so output matches the CLI exactly.

**B) Remotion CLI / Studio.** `npm run remotion` (`remotion studio`) for interactive preview; `npm run render` / `remotion render <id> <out>` for one-offs. Driven by `remotion.config.ts` (JPEG image format + `Config.overrideWebpackConfig(webpackOverride)`). Note the config file does **not** apply to the Node API — `render-fast.mjs` passes options directly.

**C) `process-jade.ps1` batch pipeline (CLI-based).** For each source `.mp4`: copy to an `F:\jade-tmp\<name>` workdir → `remotion ffmpeg` extract 16k-mono WAV → `remotion ffprobe` duration → `node transcribe-any.mjs` (whisper) → write a **`props.json` file** → `npx remotion render JadeShort <out> --public-dir=<workdir> --props=<props.json> --concurrency=4`.

**The per-video `--public-dir` pattern (important).** The Jade comps reference assets by bare relative paths (`video.mp4`, `captions.json`, `broll/*.mp4`). Instead of dumping every video's assets into the shared `public/`, each render points `--public-dir` (CLI) / `publicDir` (harness `bundle()`) at that **one video's** workdir. So the same comp (`JadeShort`/`JadeEdit`) renders many different videos just by swapping the public dir + props — keeping `public/` small and per-video assets isolated on `F:`.

**Disk / heap workaround (why `F:\remotion-temp` + `NODE_OPTIONS`).** The `C:` drive is ~95% full, so `process-jade.ps1` redirects `$env:TMP` and `$env:TEMP` to `F:\remotion-temp` (keeps webpack/ffmpeg scratch off `C:`) and sets `$env:NODE_OPTIONS = "--max-old-space-size=6144"` to give Node a 6 GB heap for bundling large projects. It also forces `InvariantCulture` so durations serialize with a dot decimal (a comma would break the `--props` JSON).

**`webpack-override.mjs` — `cache: false` and the polyfills (why).**
- `cache: false` deliberately **disables webpack persistent filesystem caching**. The in-file comment explains: on 4.0.501 the fs cache no longer crashes, but it cost ~1.4 GB to save only ~25% rebuild time on an almost-full disk — not worth it. The real speed-up for repeat bundles is the warm bundle-once harness (B/A) / Studio, which costs no disk.
- `output.hashFunction: "sha256"` forces a Node-native hash.
- Two `crypto.createHash` polyfills for **webpack 5.98 + modern Node (22)**: (1) `md4` was removed from Node's OpenSSL, so it's aliased to `md5`; (2) Node 22 throws `ERR_INVALID_ARG_TYPE` when `Hash.update()` gets `undefined`/`null` (which webpack's `FileSystemInfo` fingerprinting hits), so the wrapper treats `undefined`/`null` as a no-op like older Node did. Without these, bundling crashes.
- Everything is wrapped in `enableTailwind(...)` so Tailwind v4 works in the render build.

**Lambda path (secondary, mostly starter).** `deploy.mjs` + `config.mjs` provision an AWS Lambda function and deploy the bundled site; the Next.js `/api/lambda/render` and `/api/lambda/progress` routes (via `src/lambda/api.ts` and `src/helpers/use-rendering.ts`) drive browser-triggered distributed renders. Credentials come from a local `.env` (template: `.env.example`) — not committed, and no secret values are reproduced here.

---

**Key file paths for the next section author:**
- Composition registry: `C:\Users\yanel\Documents\remotion\src\remotion\Root.tsx`
- Entry: `C:\Users\yanel\Documents\remotion\src\remotion\index.ts`
- Render harness: `C:\Users\yanel\Documents\remotion\render-fast.mjs`
- Batch pipeline: `C:\Users\yanel\Documents\remotion\process-jade.ps1`
- Transcriber: `C:\Users\yanel\Documents\remotion\transcribe-any.mjs`
- Webpack override: `C:\Users\yanel\Documents\remotion\src\remotion\webpack-override.mjs`

# 2. COMPOSITIONS & TEMPLATES

All compositions are registered in `C:\Users\yanel\Documents\remotion\src\remotion\Root.tsx`. There are **37** registered `<Composition>` entries (30 top-level + a 7-comp `DigitalProductsDead` folder). The bulk of active work is the **Jade Jones women's-health batch** (ids 8–24 below), which is driven by a small set of reusable, zod-schema'd, `calculateMetadata`-sized components in `src\remotion\JadeJones\`. Every Jade comp renders at **1080×1920 vertical, 25 fps** (except `BellySixOverlay` at 30 fps) and pulls all media through `staticFile()`, so each is rendered against its own `--public-dir` asset folder.

Shared conventions across the Jade components:
- **Duration is derived**, not hard-coded: each has a `calculate*Metadata` that returns `durationInFrames = round(durationInSeconds * fps)`. The `durationInFrames` literal in `Root.tsx` is only a fallback for Studio preview.
- **Base video carries the VO.** The talking-head `<Video>` (from `@remotion/media`) plays full-frame with audio; all B-roll `<Video>` clips are `muted` cutaways layered on top for their window.
- **Captions on top.** `JadeCaptions` (Anton 100, white, all-caps, black outline + soft shadow) renders above everything, fetching its own JSON.

---

## Jade Jones batch (JadeJones/*)

### 2.1 `JadeEdit` — component `JadeEdit` (`JadeJones/JadeEdit.tsx`)
- **Purpose:** default clean-caption + concept-B-roll pass. Full-frame loop-edited talking head, no zoom/graphics, muted B-roll cutaways over the VO, captions on top.
- **Size:** 1080×1920, 25 fps, 873 frames (`calculateJadeEditMetadata`).
- **Schema (`jadeEditSchema`):** `videoSrc`, `captionsSrc`, `durationInSeconds`, `fps`, `broll[]` — each `{ src, fromSeconds, durationInSeconds, blur=0, objectPosition="50% 50%" }`.
- **Example defaultProps (trimmed):**
  ```
  videoSrc:"looped.mp4", captionsSrc:"looped-captions.json",
  durationInSeconds:34.94, fps:25,
  broll:[ {src:"broll/c-blood.mp4", fromSeconds:3.2, durationInSeconds:3.8}, … ]
  ```
- **Assets (`--public-dir`):** `looped.mp4` (or `video.mp4`), `looped-captions.json` (or `captions.json`), `broll/*.mp4`.
- **Fonts/components:** Anton (via `JadeCaptions`), `@remotion/media` `Video`.
- **Timing:** B-roll via `<Sequence from={round(fromSeconds*fps)} durationInFrames={round(durationInSeconds*fps)} premountFor={fps}>`; captions self-timed from the JSON. `blur` obscures a reveal (e.g. `PeriodCramps` teaspoon shot); `objectPosition` re-frames a clip.

### 2.2 `UnderEating` / `IronStack` / `ProteinStack` / `PeriodCramps` / `AvatarPainters` — component `JadeEdit`
Five more registrations of the same `JadeEdit` component, differing only in props:
- `UnderEating` — 620f, creatine ladder, twist "eating under 1500 cals". B-roll: `broll/b1_creatine.mp4`…`b4_smallplate.mp4`.
- `IronStack` — 652f, iron/vitamin-C/avoid-coffee. B-roll: `broll/b1_afternoon_crash.mp4`…`b5_see_a_doctor.mp4`.
- `ProteinStack` — 486f, protein-food-first. B-roll: `broll/b1_realplate.mp4`…`b5_shelfpunchline.mp4`.
- `PeriodCramps` — 510f, ginger reveal (no loop). B-roll `broll/b1_pineapple.mp4`…`b5_ginger_hero.mp4`; `b3_teaspoon.mp4` uses `blur:14`.
- `AvatarPainters` — 1800f (72 s), painters-marketing avatar, 4 homeowner-fear cutaways (`broll/painter.mp4`, `waiting.mp4`, `crew.mp4`, `contract.mp4`).
- All: 1080×1920, 25 fps, `video.mp4` + `captions.json` + `broll/*` in their own public dir.

### 2.3 `UnderEatingCards` / `IronStackCards` / `ProteinStackCards` — component `JadeLadder` (`JadeJones/JadeLadder.tsx`)
- **Purpose:** "building supplement stack" treatment — on-screen photo cards pop in one-by-one as each item is named, the group re-centres, then all clear on the twist line so the punchline lands on her face. `crossOut:true` draws a red ✕ (used for "AVOID coffee").
- **Sizes:** `UnderEatingCards` 620f, `IronStackCards` 653f, `ProteinStackCards` 486f. All 1080×1920, 25 fps (`calculateJadeLadderMetadata`).
- **Schema (`jadeLadderSchema`):** `videoSrc`, `captionsSrc`, `durationInSeconds`, `fps`, `clearAtSeconds`, `rowTop=1215`, `cardW=238`, `imgH=224`, `items[]` — each `{ img, label, atSeconds, crossOut=false }`.
- **Example defaultProps (trimmed):**
  ```
  videoSrc:"video.mp4", captionsSrc:"captions.json", durationInSeconds:24.8, fps:25,
  rowTop:1200, cardW:238, imgH:224, clearAtSeconds:18.0,
  items:[ {img:"cards/creatine.jpg", label:"Creatine", atSeconds:0.62, crossOut:false}, … ]
  ```
- **Assets:** `video.mp4`, `captions.json`, `cards/*.jpg` (creatine, vitamind, magnesium, iron, vitaminc, coffee, protein, dumbbell).
- **Fonts/components:** Anton (labels + `+` glyph + captions), `Img`, `@remotion/media` `Video`, `JadeCaptions`.
- **Timing:** each card appears at `round(atSeconds*fps)` with a `spring` pop; cards ease to a re-centred layout on the newest entry; whole group fades over `[clearF, clearF+7]` where `clearF = round(clearAtSeconds*fps)`.

### 2.4 `BodyFatSplit` / `BodyFatWomen` — component `BodyFatSplit` (`JadeJones/BodyFatSplit.tsx`)
- **Purpose:** split-screen body-fat-% reference recreation (@mandohq / @remf.fit). Top ⅔ (0–`SEAM=1180`) shows a reference face/body image at the current %, big italic "%" label top-left; bottom ⅓ is Jade's talking head; captions sit near the seam (`centerY=SEAM-40`).
- **Sizes:** `BodyFatSplit` 525f (20.98 s); `BodyFatWomen` 947f (37.89 s). Both 1080×1920, 25 fps (`calculateBodyFatMetadata`).
- **Schema (`bodyFatSplitSchema`):** `videoSrc`, `captionsSrc`, `durationInSeconds`, `fps`, `faces[]` (`{ pct, fromSeconds, src|null }`), `imageFit="cover"`, `imageBg="#e7e7e7"`, `imageZoom=1`, `imageObjPos="50% 50%"`.
- **Example defaultProps (`BodyFatWomen`, trimmed):**
  ```
  videoSrc:"video.mp4", captionsSrc:"captions.json", durationInSeconds:37.89, fps:25,
  imageFit:"cover", imageBg:"#c3cbce", imageZoom:1.2, imageObjPos:"50% 12%",
  faces:[ {pct:"40%", fromSeconds:0, src:"bodies/body-40.jpg"}, … {pct:"20%", fromSeconds:24.5, src:"bodies/body-20.jpg"} ]
  ```
- **Assets:** `video.mp4`, `captions.json`, `bodies/body-40.jpg…body-20.jpg` (or `null` → labeled grey placeholder renders in place).
- **Fonts/components:** **Inter 800 italic** (`@remotion/google-fonts/Inter`) for the % label, Anton via `JadeCaptions`, `Img`, `Video`.
- **Timing:** active face = last entry whose `fromSeconds <= t` (no `Sequence`; swap-on-threshold). `BodyFatSplit` (525f) defaults all `src:null` (placeholders).

### 2.5 `MagnesiumEdit` — component `MagnesiumEdit` (`JadeJones/MagnesiumEdit.tsx`)
- **Purpose:** @drericberg clone — hook **punch-in** (hard scale steps on power words), optional persistent text-hook pill, medical B-roll, and an **ending slide-zoom** push-in on the reveal.
- **Size:** 1080×1920, 25 fps, 966f (`calculateMagnesiumMetadata`).
- **Schema (`magnesiumSchema`):** `videoSrc`, `captionsSrc`, `durationInSeconds`, `fps`, `hookText="Did you know this?"`, `hookFadeOutStart=32.56`, `punchOrigin="50% 34%"`, `punchIns[]` (`{atSeconds,scale}`), `broll[]` (`{src,fromSeconds,durationInSeconds}`), `endingFromSeconds=null`, `endingToScale=1.22`, `endingOriginY=42`, `endingSlideY=-28`.
- **Example defaultProps (trimmed):**
  ```
  videoSrc:"video.mp4", captionsSrc:"captions.json", durationInSeconds:38.64, fps:25,
  hookText:"" (banner removed), punchOrigin:"50% 34%",
  punchIns:[{atSeconds:0,scale:1.0},{atSeconds:1.43,scale:1.15},{atSeconds:1.68,scale:1.32},{atSeconds:3.77,scale:1.0}],
  broll:[{src:"broll/m-artery.mp4",fromSeconds:8.4,durationInSeconds:4.1}, … m-cells.mp4],
  endingFromSeconds:32.56, endingToScale:1.22, endingOriginY:42, endingSlideY:-28
  ```
- **Assets:** `video.mp4`, `captions.json`, `broll/m-artery.mp4, m-joints.mp4, m-vitamins.mp4, m-stress.mp4, m-cells.mp4`.
- **Fonts/components:** Anton (hook pill + captions), `Video`, `JadeCaptions`, `Easing.inOut`.
- **Timing:** punch scale = last `punchIn` whose `atSeconds<=t` (hard step). Ending zoom `interpolate(t,[endingFromSeconds,durationInSeconds],…)`. B-roll via `Sequence`. Hook pill fades `[hookFadeOutStart-0.35, hookFadeOutStart]`; hidden when `hookText===""`.

### 2.6 `BrainExerciseEdit` — component `BrainExerciseEdit` (`JadeJones/BrainExerciseEdit.tsx`)
- **Purpose:** @vivetalobomd clone — B-roll on each ruled-out option, then a **split-screen study screenshot** (top, 0–`SEAM=609`) over a time-synced Jade clip (bottom, `trimBefore={from}` keeps VO in lockstep), optional text hook.
- **Size:** 1080×1920, 25 fps, 1096f (`calculateBrainMetadata`).
- **Schema (`brainExerciseSchema`):** `videoSrc`, `captionsSrc`, `durationInSeconds`, `fps`, `hookText`, `hookOutSeconds=5.76`, `broll[]` (`{src,fromSeconds,durationInSeconds,objectPosition}`), `splits[]` (`{fromSeconds,durationInSeconds}`), `studySrc`.
- **Example defaultProps (trimmed):**
  ```
  videoSrc:"video.mp4", captionsSrc:"captions.json", durationInSeconds:43.85, fps:25,
  hookText:"" , hookOutSeconds:5.76,
  broll:[{src:"broll/b-crossword.mp4",fromSeconds:2.2,durationInSeconds:1.45}, … b-neurons2.mp4 (9 clips)],
  splits:[{fromSeconds:5.76, durationInSeconds:8.66}], studySrc:"study.png"
  ```
- **Assets:** `video.mp4`, `captions.json`, `study.png` (976×550 → 1080×609 seam), `broll/b-crossword.mp4, b-supplement.mp4, b-braingames.mp4, b-brainscan.mp4, b-weights.mp4, b-hippocampus.mp4, b-weights2.mp4, b-neurons.mp4, b-neurons2.mp4`.
- **Fonts/components:** Anton (hook + captions), `Img` (study), two `Video` layers, `JadeCaptions`.
- **Timing:** B-roll + splits are `Sequence`s. Split bottom video uses `trimBefore={from}` so it resumes exactly where the main VO is.

### 2.7 `NutrientTargets` — component `NutrientTargets` (`JadeJones/NutrientTargets.tsx`)
- **Purpose:** @explainingourbody clone — rapid-fire "daily target = food" pairings. Cuts from talking head to a food B-roll with a glass "AMOUNT NUTRIENT = FOOD" card. **No word-by-word captions** — the pairing card is the on-screen text.
- **Size:** 1080×1920, 25 fps, 491f (`calculateNutrientMetadata`).
- **Schema (`nutrientSchema`):** `videoSrc`, `durationInSeconds`, `fps`, `pairs[]` — each `{ fromSeconds, durationInSeconds, brollSrc, amount, food }`. (Note: no `captionsSrc`.)
- **Example defaultProps (trimmed):**
  ```
  videoSrc:"video.mp4", durationInSeconds:19.62, fps:25,
  pairs:[ {fromSeconds:2.5,durationInSeconds:2.14,brollSrc:"broll/b-eggs.mp4",amount:"50g PROTEIN",food:"8 EGGS"}, … b-sun.mp4 ]
  ```
- **Assets:** `video.mp4`, `broll/b-eggs.mp4, b-orange.mp4, b-milk.mp4, b-sun.mp4`.
- **Fonts/components:** Anton (card, yellow `#ffd24d` food line), `Video`. No `JadeCaptions`.
- **Timing:** each pair is a `Sequence`; card enters with a `spring` + top scrim gradient over the food clip.

### 2.8 `SkipBreakfast` — component `SkipBreakfast` (`JadeJones/SkipBreakfast.tsx`)
- **Purpose:** @jessie.schramm clone — talking head + concept B-roll, with an **optional myth-flip chip** ("STARVATION MODE ✕" struck-through → "UNDER-FED BY 8PM ✓"). By default the myth graphic is **off** (`mythFrom/Switch/Until=0`) — B-roll only.
- **Size:** 1080×1920, 25 fps, 909f (`calculateSkipBreakfastMetadata`).
- **Schema (`skipBreakfastSchema`):** `videoSrc`, `captionsSrc`, `durationInSeconds`, `fps`, `broll[]`, `mythFrom`, `mythSwitch`, `mythUntil`, `wrongText="Starvation mode"`, `rightText="Under-fed by 8pm"`.
- **Example defaultProps (trimmed):**
  ```
  videoSrc:"video.mp4", captionsSrc:"captions.json", durationInSeconds:36.375, fps:25,
  broll:[{src:"broll/b-manpinch.mp4",fromSeconds:0.6,durationInSeconds:2.4}, … b-breakfast.mp4 (6 clips)],
  mythFrom:0, mythSwitch:0, mythUntil:0, wrongText:"Starvation mode", rightText:"Under-fed by 8pm"
  ```
- **Assets:** `video.mp4`, `captions.json`, `broll/b-manpinch.mp4, b-womancramp.mp4, b-manfit.mp4, b-tired.mp4, b-chocolate.mp4, b-breakfast.mp4`.
- **Fonts/components:** Anton (chip + captions), `Video`, `JadeCaptions`.
- **Timing:** B-roll `Sequence`s; myth chip only renders when `mythUntil > mythFrom`, flipping wrong→right at `round((mythSwitch-mythFrom)*fps)`.

### 2.9 `BellySixPack` — component `BellySixPack` (`JadeJones/BellySixPack.tsx`)
- **Purpose:** "belly fat vs six pack" food quiz built **from raw clips**. Per food: a **food beat** (neutral stand clip + ElevenLabs AI audio naming the food + food-name pill) then a **verdict beat** (Jade's pointing clip + red ✕ "BELLY FAT" / green ✓ "SIX PACK" stamp). 14 foods, self-assembling timeline.
- **Size:** 1080×1920, 25 fps, 676f — **duration computed from the items** (`calculateBellySixMetadata` sums per-item `food+verdict` beats; also hard-sets width/height 1080×1920).
- **Schema (`bellySixSchema`):** `fps=25`, `foodPad=0.3`, `aiLead=0.06`, `foodY=1140`, `stampY=1380`, `items[]` — each `{ food, verdict:"belly"|"six", aiSrc, aiDur, neutralSrc, verdictSrc, verdictDur }`. (Note: no `videoSrc`/`captionsSrc` — it stitches per-item clips.)
- **Example defaultProps (trimmed):**
  ```
  fps:25, foodPad:0.3, aiLead:0.06, foodY:54, stampY:1360,
  items:[ {food:"Coffee",verdict:"belly",aiSrc:"a01.m4a",aiDur:0.6,neutralSrc:"neutralSoft.mp4",verdictSrc:"vb1.mp4",verdictDur:0.84}, … (14 total) ]
  ```
- **Assets:** AI audio `a01.m4a…a14.m4a`; neutral stand clips `neutralSoft.mp4` / `neutralAbs.mp4`; verdict clips `vb1.mp4,vb2.mp4` (belly) / `vs1.mp4,vs2.mp4` (six). No captions JSON.
- **Fonts/components:** Anton (pill + stamp), `Video`, `Audio`. `spring` pop on label/stamp.
- **Timing:** food beat = `round((aiDur+foodPad)*fps)`; AI audio starts `round(aiLead*fps)` in; verdict beat = `round(verdictDur*fps)`; beats concatenated sequentially with a running cursor.

### 2.10 `BellySixOverlay` — component `BellySixOverlay` (`JadeJones/BellySixOverlay.tsx`)
- **Purpose:** the **overlay-only** variant — graphics layered on top of a **pre-composed base `.mp4`** (which already has the AI VO + Jade's verdicts baked in). Per food: top name pill + centered popup **food photo** + red/green verdict stamp on the photo when spoken.
- **Size:** 1080×1920, **30 fps**, 498f (`calculateBellyOverlayMetadata`, also hard-sets 1080×1920).
- **Schema (`bellyOverlaySchema`):** `videoSrc`, `fps=30`, `durationInSeconds`, `foodY=54`, `cardTop=1285`, `cardSize=452`, `items[]` — each `{ food, img, verdict, nameStart, verdictStart, endT, pos="50% 50%" }` (all times in **seconds**).
- **Example defaultProps (trimmed):**
  ```
  videoSrc:"composed.mp4", fps:30, durationInSeconds:16.6, foodY:54, cardTop:1285, cardSize:452,
  items:[ {food:"Coffee",img:"foods/coffee.jpg",verdict:"belly",nameStart:0.08,verdictStart:0.77,endT:1.53,pos:"50% 50%"}, … (12 foods) ]
  ```
- **Assets:** `composed.mp4` (base, keeps own audio) + `foods/coffee.jpg, tea.jpg, rice.jpg, bread.jpg, avocado.jpg, fruitjuice.jpg, darkchocolate.jpg, yogurt.jpg, oats.jpg, smoothie.jpg, greentea.jpg, beer.jpg`.
- **Fonts/components:** Anton (pill + stamp), `Img`, `Video`. `spring` pops.
- **Timing:** per food `Sequence from={round(nameStart*fps)} durationInFrames={round((endT-nameStart)*fps)}`; verdict stamp appears at `round((verdictStart-nameStart)*fps)` inside that window.

### 2.11 `JadeShort` — component `JadeShort` (`JadeJones/JadeShort.tsx`)
- **Purpose:** generic **batch-render** comp — full-bleed source video + gentle continuous Ken-Burns (scale 1.00↔1.08 on a 10 s sine) + Jade captions. Intended for CLI batch: pass `--props='{"videoSrc":…,"captionsSrc":…,"durationInSeconds":N,"fps":25}'` with `--public-dir`.
- **Size:** 1080×1920, 25 fps; `durationInFrames:750` is a placeholder — `calculateJadeMetadata` overrides at render time.
- **Schema (`jadeShortSchema`):** `videoSrc`, `captionsSrc`, `durationInSeconds`, `fps`.
- **Assets:** `video.mp4`, `captions.json`.
- **Fonts/components:** Anton via `JadeCaptions`, `Video`.

---

## Non-Jade compositions

These have **no zod schema / defaultProps in Root.tsx** — timing and assets are internal to each component (their own `Captions.tsx`, `Overlays.tsx`, etc.). Listed for completeness with the specs declared in `Root.tsx`:

| id | component | file | W×H | fps | frames | notes |
|---|---|---|---|---|---|---|
| `MyComp` | `Main` | `MyComp/Main.tsx` | 1280×720 | 30 | 200 | Remotion/Next starter; `defaultProps:{title:"Next.js and Remotion"}` (`CompositionProps`). |
| `NextLogo` | `NextLogo` | `MyComp/NextLogo.tsx` | 140×140 | 30 | 300 | `defaultProps:{outProgress:0}`. |
| `Clonify` | `ClonifyMain` | `Clonify/ClonifyMain.tsx` | 1280×720 | 30 | 375 | SaaS promo (Hero/Features/Dashboard/CTA scenes). |
| `AIAgentExplainer` | `AIAgentExplainer` | `AIAgentExplainer/AIAgentExplainer.tsx` | 1080×1920 | 30 | 1329 | 44.3 s explainer; own Captions/Overlays/SaaSAnimations + `useVideoZoom`. |
| `YaneleTalkingHead` | `YaneleTalkingHead` | `YaneleTalkingHead/…tsx` | 1080×1920 | 30 | 1962 | 65.4 s; own Captions/ConceptAnimations/Overlays. |
| `EnvironmentVideo` | `EnvironmentVideo` | `EnvironmentVideo/…tsx` | 1080×1920 | 30 | 1122 | 37.4 s; own Captions. |
| `TwoBrands` | `TwoBrands` | `TwoBrands/TwoBrands.tsx` | 1080×1920 | 30 | 983 | @estenick × @getsellers.io; BrandKit/theme + beat scenes. |
| `HealthRoutines` | `HealthRoutines` | `HealthRoutines/…tsx` | 1080×1920 | 25 | 1194 | icon overlay; `GHR_FPS=25`, `GHR_DURATION=ceil(47.76*25)`. |
| `HomeownersPainters` | `HomeownersPainters` | `HomeownersPainters/…tsx` | 1080×1920 | 25 | 1361 | tight cut + Devin-Jatho glow captions; `HPG_FPS=25`, `HPG_DURATION=ceil(54.44*25)`. |
| `PhilVSL` | `PhilVSL` | `PhilVSL/PhilVSL.tsx` | 1920×1080 | 25 | 5458 | Vita Bella VSL v1 (3:38); ceil(218.32*25). |
| `PhilVSL2` | `PhilVSL2` | `PhilVSL/PhilVSL.tsx` | 1920×1080 | 25 | 5181 | VSL v2, faster take (3:27); ceil(207.24*25). |
| `Brandon30K` | `Brandon30K` | `Brandon30K/Brandon30K.tsx` | 1920×1080 | 30 | 150 | 5 s. |
| `DPD-1-DeathList` | `DeathList` | `DigitalProductsDead/DeathList.tsx` | 1920×1080 | 30 | 240 | in `<Folder name="DigitalProductsDead">`. |
| `DPD-2-InformationFree` | `InformationFree` | `…/InformationFree.tsx` | 1920×1080 | 30 | 210 | |
| `DPD-3-ContentVsTransformation` | `ContentVsTransformation` | `…/ContentVsTransformation.tsx` | 1920×1080 | 30 | 240 | |
| `DPD-4-TheFunnel` | `TheFunnel` | `…/TheFunnel.tsx` | 1920×1080 | 30 | 270 | |
| `DPD-5-TheProofLoop` | `TheProofLoop` | `…/TheProofLoop.tsx` | 1920×1080 | 30 | 240 | |
| `DPD-6-NicheDown` | `NicheDown` | `…/NicheDown.tsx` | 1920×1080 | 30 | 270 | |
| `DPD-7-DistributionStack` | `DistributionStack` | `…/DistributionStack.tsx` | 1920×1080 | 30 | 240 | |

The 7 `DPD-*` comps share `DPD_FPS=30`, `DPD_W=1920`, `DPD_H=1080` and `DigitalProductsDead/shared.ts` + `Overlays.tsx`; each is `N*DPD_FPS` seconds. These are transparent-overlay animations meant to composite over base footage.

---

## Reusable component → comps → treatment

| Component (file) | Comps that use it | Treatment it gives |
|---|---|---|
| **`JadeCaptions`** (`JadeJones/JadeCaptions.tsx`) | JadeEdit, JadeLadder, JadeShort, BodyFatSplit, MagnesiumEdit, BrainExerciseEdit, SkipBreakfast (all Jade comps except NutrientTargets, BellySixPack, BellySixOverlay) | Anton-100 white all-caps captions, black outline + soft shadow; fetches its own `captions.json`; chunks whisper tokens into ≤18-char / ≤2.5 s pages; `centerY` overridable (BodyFatSplit puts them at the seam). |
| **`JadeEdit`** (`JadeJones/JadeEdit.tsx`) | JadeEdit, UnderEating, IronStack, ProteinStack, PeriodCramps, AvatarPainters | Clean captions + **full-frame concept B-roll** cutaways over the VO; no zoom/graphics; optional per-clip `blur` + `objectPosition`. The default workhorse. |
| **`JadeLadder`** (`JadeJones/JadeLadder.tsx`) | UnderEatingCards, IronStackCards, ProteinStackCards | **Building supplement cards** — photo cards pop in per named item, group re-centres, red-✕ cross-out option, all clear on the twist. |
| **`BodyFatSplit`** (`JadeJones/BodyFatSplit.tsx`) | BodyFatSplit, BodyFatWomen | **Split-screen % reference** — reference body/face image (top ⅔) swapped per body-fat %, Jade talking head (bottom ⅓), captions at seam. |
| **`MagnesiumEdit`** (`JadeJones/MagnesiumEdit.tsx`) | MagnesiumEdit | **Punch-in hook + medical B-roll + ending slide-zoom**; optional persistent text-hook pill. |
| **`BrainExerciseEdit`** (`JadeJones/BrainExerciseEdit.tsx`) | BrainExerciseEdit | **Split-screen study screenshot** over a `trimBefore`-synced Jade clip, plus ruled-out-option B-roll and optional text hook. |
| **`NutrientTargets`** (`JadeJones/NutrientTargets.tsx`) | NutrientTargets | **Rapid-fire "AMOUNT = FOOD" pairing cards** over food B-roll; no word captions (card is the text). |
| **`SkipBreakfast`** (`JadeJones/SkipBreakfast.tsx`) | SkipBreakfast | Talking head + concept B-roll + **optional myth-flip chip** (strike-through wrong → check-mark right); myth off by default. |
| **`BellySixPack`** (`JadeJones/BellySixPack.tsx`) | BellySixPack | **Assembles a food quiz from raw clips** — neutral+AI-audio food beat then Jade verdict clip + red/green stamp; timeline sized from items. |
| **`BellySixOverlay`** (`JadeJones/BellySixOverlay.tsx`) | BellySixOverlay | **Graphics over a pre-composed base `.mp4`** — food name pill + popup photo + verdict stamp; 30 fps. |

**Batch-render note:** any schema'd comp can be re-rendered against a fresh asset folder without editing `Root.tsx` — pass `--props='{…}'` matching the comp's schema and point `--public-dir` at the folder holding its `video.mp4` / `captions.json` / `broll` / `cards` / `bodies` / `foods` / `study.png` assets (see the project's render workaround). `durationInFrames` auto-sizes from `durationInSeconds * fps` via each comp's `calculateMetadata`.

# 3. HELPER SCRIPTS & PRODUCTION PIPELINE

All scripts live at the repo root `C:\Users\yanel\Documents\remotion\`. Two runtimes are used: **Node ESM** (`.mjs`, run with `node <script>.mjs`), **Bash** (`.sh`, run under Git Bash), **PowerShell** (`.ps1`), and one **Python** file. All are run with the repo root as CWD (scripts resolve `.env`, `whisper.cpp/`, `.api-cache/`, and `broll-credits.txt` relative to `process.cwd()`).

## 3.0 Shared conventions (read first)

- **Two different ffmpeg binaries are used deliberately:**
  - `npx remotion ffmpeg` / `npx remotion ffprobe` — Remotion's bundled build. Used for the simple/lossless operations: audio extraction (`-ar 16000 -ac 1`), segment cuts, `concat`, duration probing. Used in `jade-loopcut.sh`, `process-jade.ps1`, `process-jade2.ps1`.
  - **System ffmpeg (the one with `fps`/`crop` filters):**
    `C:\Users\yanel\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe`
    This is **Gyan.FFmpeg 8.0.1**, installed via WinGet, and is what resolves as bare `ffmpeg` on PATH. It is required for B-roll normalization and montage vetting because the Remotion-bundled build lacks some filters. Being a Windows `.exe`, it needs **Windows-style paths** (`F:/...`, not `/f/...`).
- **API keys** are stored in the gitignored `.env` at repo root and auto-loaded by each sourcer script (regex-parsed, no `dotenv` dependency). Referenced by name only here: `PEXELS_API_KEY`, `PIXABAY_API_KEY`, `GEMINI_API_KEY`. Openverse (`ov-foods.mjs`) needs no key.
- **Whisper** is pinned to `whisper.cpp` **v1.5.5**, model **`medium.en`**, `tokenLevelTimestamps: true`. First run auto-installs into `./whisper.cpp/` and downloads the model (slow, one-time). `toCaptions()` emits an array of caption objects `{ text, startMs, endMs, timestampMs, confidence }` (the pipeline mainly uses `text/startMs/endMs`).
- **Attribution side-effect:** every stock sourcer writes a `<outfile>.credit.json` sidecar and appends a line to the shared `broll-credits.txt` log. Diff the `id` fields across a batch to guarantee no clip is reused across two videos posted together.

---

## 3.1 Per-script reference

### `transcribe-any.mjs`  (the canonical transcriber)
- **Purpose:** Generic Whisper transcription — any 16 kHz mono WAV → captions JSON.
- **Usage:** `node transcribe-any.mjs <input.wav> <output.json>`
- **Reads:** the WAV at the given path; installs/uses `./whisper.cpp/` (v1.5.5, `medium.en`).
- **Writes:** `<output.json>` = pretty-printed array of token-level captions; prints `Done! N entries`.
- **Gotchas:** Input **must already be 16 kHz mono** (`-ar 16000 -ac 1`) — it does not resample. First invocation downloads whisper + model. Token boundaries drift ±0.3–0.5 s and sometimes mislabel which word a boundary belongs to (critical for the loop-cut seam — see pipeline step 3).

### `render-fast.mjs`  (warm bundle-once render harness)
- **Purpose:** Bundle the Remotion project **once**, then render any number of verification stills + the final MP4 off that single in-memory bundle, skipping webpack (~60 s) on every render after the first.
- **Usage:**
  ```
  node render-fast.mjs <CompID> --public-dir <dir> \
    [--stills 30,185,246] [--stills-out <dir>] \
    [--out <final.mp4>] [--scale 0.5] [--frames a-b] \
    [--concurrency 4] [--props <file.json>]
  ```
- **Reads:** `src/remotion/index.ts` (entry), the `--public-dir` assets, optional `--props` JSON (parsed to `inputProps`).
- **Writes:** stills to `--stills-out` (default `.fast-stills/`, named `f<frame>.png`); final video to `--out`. Prints timing for each phase.
- **Gotchas:** `--public-dir` is **required** (per the render workaround, you point it at a minimal per-video dir, not the giant repo `public/`). `--frames` is a hyphen range `a-b`; `--stills` is a comma list. Final render is h264 / jpeg frames / configurable `--concurrency`.

### `pex-api.mjs`  (PRIMARY B-roll sourcer — Pexels VIDEO, official API)
- **Purpose:** Fetch a portrait stock **video** from the official Pexels API. Returns native 1080×1920 clips — no bot-challenge, no scrape retries.
- **Usage:** `node pex-api.mjs "<query>" <out.mp4> [rank=0]`  (`PEXELS_API_KEY` auto-loaded from `.env`)
- **Reads:** Pexels `videos/search` (`per_page=30&orientation=portrait&size=medium`, auth header `Authorization: <key>` — raw, no "Bearer").
- **Writes:** `<out.mp4>`, `<out>.credit.json`, appends to `broll-credits.txt`. Prints the top 8 candidates with dims so you can re-run with a different `[rank]`.
- **Gotchas:** Excludes `quality:"hls"` renditions (those are `.m3u8`, not downloadable) and picks the largest MP4 whose **short side ≤ 1080**. Rate limit ~200/hr + ~20–25k/mo. rank-0 relevance is usually good but still vet (montage) — some queries are traps ("supplement bottles shelf" → same essential-oils flat-lay).

### `pex-img.mjs`  (Pexels PHOTO, official API — for ladder/popup cards)
- **Purpose:** Fetch a stock **photo** from the official Pexels API (same key). Used for `JadeLadder`/`BellySixOverlay` card images.
- **Usage:** `node pex-img.mjs "<query>" <out.jpg> [rank=0] [orientation=square]`  (orientation: `square`|`portrait`|`landscape`)
- **Reads:** Pexels `v1/search` (`per_page=30`). **Writes:** photo + `.credit.json` + `broll-credits.txt`. Downloads `src.large` (~940 px long edge — plenty for a ~250 px card).
- **Gotchas:** Pexels' **square supplement pool is essentially one stock series** ("Supplements On Demand") — the same white-tub shot returns for creatine/protein/magnesium. Pick for contrast within a video and crop tight onto the substance (`crop=360:360:75:150`-style) before use; diff `.credit.json` ids.

### `pix-api.mjs`  (Pixabay video/photo — FALLBACK)
- **Purpose:** Pixabay sourcer for photo or video (second key). Fallback when Pexels lacks the shot.
- **Usage:** `node pix-api.mjs <video|photo> "<query>" <outfile> [rank=0]`  (`PIXABAY_API_KEY` from `.env`)
- **Reads:** `pixabay.com/api/videos/` (`video_type=film`) or `pixabay.com/api/` (`image_type=photo&orientation=vertical`). **Caches the search JSON** in `.api-cache/pixabay-<mode>-<hash>.json` and reuses it for < 24 h (Pixabay TOS requires caching).
- **Writes:** file + `.credit.json` + `broll-credits.txt`.
- **Gotchas:** **Pixabay VIDEO is LANDSCAPE-only** (no portrait filter) → needs a 9:16 crop, so Pexels stays primary for vertical B-roll. Video picks smallest rendition with `height ≥ 1080` (falls back to tallest). Photos cap at `largeImageURL` (1280 px on free tier). Rate limit 100 req/60 s; **no systematic mass downloads** (only cache what you actually use).

### `ov-foods.mjs`  (Openverse batch food photos — no key)
- **Purpose:** Batch-fetch commercial-licensed food photos from Openverse (Flickr-hosted, no bot-challenge unlike Pexels photo scrape). Saves 3 candidates per food.
- **Usage:** `node ov-foods.mjs <outdir>`
- **Reads:** a **hardcoded `FOODS` list** (coffee, tea, rice, bread, avocado, orange juice, dark chocolate, yogurt, oats, smoothie, green tea, beer) → `api.openverse.org/v1/images/` (`license_type=commercial&mature=false`). **Writes:** `<outdir>/<name>_r0.jpg … _r2.jpg`.
- **Gotchas:** Query list is edited **inside the file**, not a CLI arg. Skips images < 8 KB (broken/tiny). Tile the candidates and eyeball; re-query weak ones by editing the list.

### `pex-source.mjs`  (Pexels VIDEO scraper — legacy, no key)
- **Purpose:** Original no-key Pexels B-roll sourcer that curl-scrapes the search HTML. **Superseded by `pex-api.mjs`**; keep as a keyless fallback.
- **Usage:** `node pex-source.mjs "<query>" <out.mp4> [rank=0]`
- **Reads:** `pexels.com/search/videos/<query>/` HTML (unescapes `\u002F`, regexes `videos.pexels.com/video-files/...mp4`, orders by first-appearance = relevance, picks largest min-side ≤ 1080). **Writes:** the MP4 (no credit sidecar).
- **Gotchas:** Intermittently returns **0 results** (bot-challenge page) — retry 3–5×. rank-0 is often wrong; vet with a montage. `pex-photo.mjs` is the equivalent photo scraper (also unreliable, bot-challenged — prefer `pex-img.mjs`/`ov-foods.mjs`).

### `jade-loopcut.sh`  (loop-edit + re-transcribe)
- **Purpose:** For the 3 Jade videos whose opening hook is **repeated at the end**, rebuild the take with the closing hook moved to the front, then re-extract audio and re-transcribe.
- **Usage:** `bash jade-loopcut.sh` (no args — three `do_video` calls are hardcoded with per-video `first_end` and `hook_start` seconds).
- **New order:** `[segA: hook_start → end]` + `[segB: first_end → hook_start]`, concatenated.
- **Reads:** sources under `F:/jade jones/videos/*.mp4`. **Writes** per video into `F:/jade2-tmp/<folder>/`: `segA.mp4`, `segB.mp4`, `list.txt`, `looped.mp4`, `looped-audio.wav`, `looped-captions.json`; prints the looped duration via ffprobe.
- **Gotchas:** Uses `npx remotion ffmpeg` (libx264 veryfast crf18, aac 48k) for the cuts, `-c copy` concat, then `transcribe-any.mjs` on the looped audio. Cutpoints were tuned by re-transcribing the looped file and reading the leaked filler token (see pipeline step 3). The move-to-front variant needs this script; the far more common **trim-the-trailing-repeat** case needs no ffmpeg at all (just shrink the comp's `durationInSeconds` and truncate the captions JSON to `tokens.filter(t => t.startMs < cutMs)`).

### `gen-faces.py`  (Gemini body-fat face generator)
- **Purpose:** Generate 5 same-woman faces at progressively lower body-fat % (40/35/30/25/20) for the `BodyFatSplit` split-screen comp. The 40% image is the anchor; leaner variants reference it for identity consistency.
- **Usage:** `python gen-faces.py`  (needs `GEMINI_API_KEY`; model `gemini-3-pro-image-preview`, aspect `3:4`).
- **Reads:** the anchor `out/faces/face-40.png` when generating 35–20. **Writes:** `out/faces/face-{40,35,30,25,20}.png`.
- **Gotchas:** No CLI args — prompts are in-file. In practice the `GEMINI_API_KEY` had **no prepaid image credits**, so faces were generated in **Google Flow's web UI** (free daily tier) instead; this script is the API-path alternative. Prompts are deliberately clinical/educational (non-sexualized) for the sensitive body-composition content.

### Other root scripts (noted, not primary)
- `avatar-transcribe.mjs`, `e167-transcribe.mjs`, `transcribe.mjs`, `transcribe-environment.mjs` — **single-purpose forks of `transcribe-any.mjs`** with hardcoded `public/<name>-audio.wav` → `public/<name>-captions.json` paths. Use `transcribe-any.mjs` for anything new.
- `process-jade.ps1` — batch pipeline for an earlier folder: copy → 16k audio → whisper → ffprobe duration → render `JadeShort`. Sets `TMP/TEMP` to `F:\remotion-temp` and `NODE_OPTIONS=--max-old-space-size=6144`; **forces InvariantCulture** so durations format with a dot decimal (a locale comma breaks the props JSON), and writes props to a **file** (inline `--props` JSON gets its quotes stripped by Windows).
- `process-jade2.ps1` — lighter batch: just extract audio + transcribe all `F:\jade jones\videos\*.mp4` into `F:\jade2-tmp\<safe>\captions.json`.
- `render-env.sh` — one-off `xfade`-crossfade concat + burned SRT for the Environment video (uses system `ffmpeg`, not the pipeline).
- `pex-photo.mjs` — legacy Pexels photo scraper (see above).

---

## 3.2 End-to-end video pipeline (Jade Jones clone workflow)

Ordered, with the exact tool at each step. Working scratch lives on `F:` (the `C:` drive is near-full — see the render-workaround memo).

**1. Get the source video + editing notes.**
Source reels live in `F:/jade jones/videos/*.mp4`. The matching ClickUp card (Instagram board → FILMING/EDITING) holds *Original transcript → Rewritten script → B-roll notes → Production notes*. Jade sometimes films the **original** script even when the card shows a rewrite, so always transcribe **her actual video** and let the B-roll notes drive the cutaways.

**2. Transcribe (Whisper `medium.en`, token-level).**
Extract 16 kHz mono audio, then run the transcriber:
```
npx remotion ffmpeg -y -i "<src>.mp4" -ar 16000 -ac 1 audio.wav
node transcribe-any.mjs audio.wav captions.json
```
Output is the captions JSON of `{ text, startMs, endMs, ... }` used both for the caption preset and for retiming every B-roll cutaway onto the exact spoken word.

**3. Cut / loop-edit.**
The user's standing rule: **always trim the loop** — move the repeated closing hook to the **front**, cut the original opener, and the moved segment must begin on the **same word** the take originally opened with, and **end on the punchline** (not on a trailing connector). Two failure modes: (a) a filler/connector ("because", "so", "but once you do…") precedes the restatement and must be excluded — whisper often stamps the filler at the same `startMs` as the real first word, so key off the filler's `endMs`; (b) `segB` must end **before** that connector or the reel ends on a dangling phrase.
Because whisper token boundaries are unreliable here (±0.3–0.5 s, wrong-word labels), the reliable seam-finder is: make the cut, **re-transcribe the looped file** (`jade-loopcut.sh` does exactly this), and read its first tokens — the leaked filler's duration tells you precisely how much more to shave (`newHookStart = oldCut + fillerEndMs`). If still off, render a waveform of the boundary (`showwavespic=s=1100x200` + `drawgrid=w=100` = 100 ms/gridline) and read the syllable blobs directly.
When the move-to-front is not wanted (last delivery shorter, or the hook needs the strong opener), just **trim the trailing repeat**: no re-encode — set the comp `durationInSeconds` to the cut time and truncate captions to `tokens.filter(t => t.startMs < cutMs)`.

**4. Source B-roll / photos, then normalize.**
Primary = **Pexels VIDEO API** (`node pex-api.mjs "<query>" out.mp4 [rank]`) — returns native 1080×1920 portrait, so **no crop needed**. Fallbacks: **Pixabay** (`pix-api.mjs`, video is landscape → needs crop) and **Openverse** (`ov-foods.mjs`, food photos). Rule: **show the literal thing she names** (creatine → powder scooped; vitamin D → pills; "avoid coffee" → coffee cups with a red ✕), never a metaphor or the outcome, and never reuse a clip across two videos in the same batch (diff `.credit.json` ids).
**Vet before use:** download rank-0 of many queries, extract one mid-clip frame each at `-ss dur*0.45`, pad + `tile=NxM` into a grid, Read the montage, and pick (rank-0 is often wrong — e.g. "crossword" is at rank 2).
**Normalize** any non-portrait source with **system ffmpeg** (Gyan build) to short-side 1080 @ 25 fps; the comp's `objectFit:"cover"` then crops to true 9:16:
```
"C:\Users\yanel\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe" ^
  -i in.mp4 -vf "scale='if(gt(iw,ih),-2,1080)':'if(gt(iw,ih),1080,-2)'" -r 25 -an -c:v libx264 -crf 21 out.mp4
```
This scales the short side to 1080 (portrait) or the height to 1080 (landscape, then cover-cropped in-comp), forces 25 fps, drops audio (`-an`), CRF 21. It's slow — background it. Use Windows paths for the `.exe`.

**5. Build/register a Composition in `Root.tsx`.**
Comps live in `src/remotion/JadeJones/` and are registered in `src/remotion/Root.tsx`. The workhorse is `JadeEdit` (plain captions + B-roll); variants: `JadeLadder`, `BodyFatSplit`, `MagnesiumEdit`, `BrainExerciseEdit`, `NutrientTargets`, `SkipBreakfast`, `BellySixPack`, `BellySixOverlay`. `JadeEdit`/`JadeLadder` run at **fps 25** and derive `durationInFrames` from a `calculateMetadata` fn (`round(durationInSeconds * fps)`); B-roll items are `{ src, fromSeconds, durationInSeconds, blur?, objectPosition? }` and use `@remotion/media`'s `<Video>` (not `OffthreadVideo`, which times out). Each video's beats live in the comp's **`defaultProps`**, and it's rendered with `--public-dir` pointing at a per-video folder — so no `--props` file is needed for most.

**6. Render via `render-fast.mjs`.**
Point `--public-dir` at the per-video dir (`video.mp4` / `captions.json` / `broll/`), render verification stills first, then the final:
```
node render-fast.mjs JadeEdit --public-dir "F:/jade jones/render/<name>" \
  --stills 30,185,246 --out "F:/jade jones/videos/EDITED/<name>.mp4"
```
Bundling happens once; every still and the final reuse it.

**7. Verify by extracting + reading frames.**
Use the `--stills` output (or extract frames from the final MP4) and actually **Read the PNGs** to confirm B-roll lands on the right word, no clip contradicts the VO, captions are synced, and no white margins from a bad crop.

**8. Deliver.**
Final files go to **`F:/jade jones/videos/EDITED/`**, named to match the source file.

---

**Quick reference — the two exact values requested:**
- **ffmpeg normalize filter (short-side 1080 / 25 fps, cover-cropped in-comp):**
  `-vf "scale='if(gt(iw,ih),-2,1080)':'if(gt(iw,ih),1080,-2)'" -r 25 -an -c:v libx264 -crf 21`
- **System ffmpeg path (Gyan.FFmpeg 8.0.1, WinGet):**
  `C:\Users\yanel\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe`

---

# 4. Fastest Reliable Workflow

The goal is a finished reel from a source take in the fewest passes, **without shipping a wrong render**. Order of operations matters more than raw speed — most lost time is *rework* (wrong B-roll, clipped caption, letterboxed clip) caught late.

## 4.1 The order of operations (talking-head reel, the common case)

1. **Get the assets.** Source take on `F:\jade jones\videos\` (named by its hook line) + the ClickUp card's **B-roll notes** (read via browser — see §5). Confirm up front: *does a composed base already exist, or am I cutting from scratch?* (Skipping this once caused a full wasted rebuild.)
2. **Extract audio + transcribe.** `ffmpeg -i take.mp4 -ac 1 -ar 16000 a.wav` → `node transcribe-any.mjs a.wav out.json`. Runs in the background (~1–2 min); overlaps with sourcing.
3. **Cut, if the script loops** (repeats its opening line at the end). Loop-cut per §7. **Re-transcribe the cut file** so captions match.
4. **Decide the treatment** (pick the component — see §6.2). Talking-head → `JadeEdit`. "If you take X… X+Y… X+Y+Z" ladder → `JadeLadder` cards. Body-fat % → `BodyFatSplit`. Study reference → `BrainExerciseEdit`.
5. **Source B-roll / images in parallel** with the transcription. Fire `pex-api.mjs` per concept; the concept list comes from the card notes, so you don't need timings yet. **Vet with a montage, always** (rank-0 is usually right now, but not always).
6. **Normalize** every clip to `1080×1920 / 25fps / muted / cover` (§4.3).
7. **Register/point a `<Composition>`** in `Root.tsx` with `defaultProps` — B-roll windows timed to the **spoken word** (pull ms from the captions JSON), not eyeballed.
8. **Render + verify in ONE warm bundle** via `render-fast.mjs` with `--stills <frames>` **and** `--out final.mp4`. Read the stills; if good, the final is already done.
9. **Deliver** to `F:\jade jones\videos\EDITED\<source name>.mp4` and send.

## 4.2 Practical checklist (copy this)

- [ ] Source take located; composed-base-vs-scratch confirmed
- [ ] Transcribed (looped file re-transcribed if cut)
- [ ] Loop opens on the **original opening word**, ends on the **punchline** (no dangling connector)
- [ ] Treatment/component chosen
- [ ] B-roll shows **the literal thing she names** (not a metaphor/outcome), and **doesn't contradict** the line
- [ ] B-roll vetted in a montage; **no clip id reused across a batch** (diff `.credit.json`)
- [ ] Clips normalized to 1080×1920/25fps/cover (no letterbox)
- [ ] Cutaways timed to the spoken word
- [ ] `@remotion/media <Video>` uses `objectFit="cover"` **as a prop**, not in `style` (else landscape clips letterbox)
- [ ] Captions legible over the footage (white + black outline; check over light shirts/backgrounds)
- [ ] Rendered via `render-fast.mjs`; frames extracted and **actually read**
- [ ] Delivered + "B-roll via Pexels" noted for the caption

## 4.3 Reusable commands

```bash
# env every render needs (near-full C:, heap bump)
export TMP="F:/remotion-temp" TEMP="F:/remotion-temp" NODE_OPTIONS="--max-old-space-size=6144"

# system ffmpeg/ffprobe (has fps/crop; Windows .exe needs Windows paths like F:/...)
FF="/c/Users/yanel/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe"

# transcribe
ffmpeg -i take.mp4 -ac 1 -ar 16000 a.wav
node transcribe-any.mjs a.wav captions.json

# source B-roll (portrait, from .env key) + food photos + Pixabay fallback
node pex-api.mjs "creatine powder scoop" clip.mp4 0        # video
node pex-img.mjs "cup of coffee" card.jpg 0 square         # photo (Pexels)
node pix-api.mjs video "brain mri scan" clip.mp4 0         # Pixabay fallback (24h-cached)

# NORMALIZE to full-bleed 9:16 (cover, no letterbox) — the correct filter:
"$FF" -y -i raw.mp4 -t 6 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=25" \
  -an -c:v libx264 -crf 21 -pix_fmt yuv420p -movflags +faststart broll/clip.mp4

# render + verify in one warm bundle, then final:
node render-fast.mjs <CompID> --public-dir "F:/jade jones/render/<name>" \
  --stills 60,200,370 --stills-out "F:/remotion-temp/chk" \
  --out "F:/jade jones/videos/EDITED/<Source Name>.mp4" --concurrency 4

# verify: extract frames and READ them
"$FF" -y -ss 8 -i "F:/jade jones/videos/EDITED/<Source Name>.mp4" -frames:v 1 chk.png
```

## 4.4 What to automate vs. what needs a human/agent eye

| Automate | Needs judgement (agent must look) |
|---|---|
| transcription, audio extraction | which B-roll clip actually reads at 240 px / full-frame |
| API sourcing + credit capture | whether a clip **contradicts** the line |
| normalize + render (`render-fast.mjs`) | loop-cut boundary when whisper is wrong (read the waveform) |
| frame extraction + montage tiling | caption legibility over the specific footage |
| props/frame-math from the transcript | treatment choice + client-brand tone |

## 4.5 Avoiding rework & render failures

- **Bundle warm, verify before the final** — combine `--stills` + `--out` in one `render-fast.mjs` call so a caught defect costs one re-run, not seven cold bundles.
- **Draft fast** while iterating: `--scale 0.5` and `--frames a-b` render a fraction of the work; full-res only for the final.
- **Never trust the CLI's whole-`public/` copy** — always pass a minimal `--public-dir`, or you'll hit `ENOSPC`/OOM.
- **Editing comp code invalidates the warm bundle** — a code change needs a fresh `render-fast.mjs` run (or keep **Remotion Studio** open for hot-reload while iterating on layout).

---

# 5. DATA, INTEGRATIONS & EXTERNAL SERVICES

This project pulls stock footage/photos, transcribes audio, sources research screenshots, and (optionally) renders in the cloud. Every external dependency is listed below with what it does, how it is wired up, which files touch it, and what a new assistant must have to use it. All secrets are referenced by **environment-variable name only** — never paste a key value into code, chat, or a committed file.

> Secret hygiene: real keys live in the git-ignored `.env` at the repo root. `.env.example` ships only empty placeholders. The media scripts auto-read `.env` themselves (see below), so you rarely need to export anything manually. Never commit `.env`, never echo a key, and if you open `.env` to check a name, do not reproduce its contents.

---

## 5.1 Pexels API — stock video + photo (primary B-roll source)

- **Purpose:** Portrait-first stock video and photos for B-roll and popup cards. This is the primary vertical/9:16 source.
- **Env var:** `PEXELS_API_KEY`. Both scripts auto-load it from `.env` if not already in the environment (regex-parsed, no dotenv dependency), so `node pex-api.mjs ...` "just works" from the repo root.
- **Files that use it:**
  - `pex-api.mjs` — video. `node pex-api.mjs "<query>" <out.mp4> [rank=0]`. Requests `orientation=portrait&size=medium&per_page=30`, then picks the largest downloadable MP4 rendition whose short side is ≤1080 (skips HLS `.m3u8` manifests).
  - `pex-img.mjs` — photo. `node pex-img.mjs "<query>" <out.jpg> [rank=0] [orientation=square]`. Uses the `src.large` (~940px) rendition.
  - (`pex-source.mjs` is the older HTML-scrape approach it replaced — prefer the API scripts.)
- **Endpoints:** `https://api.pexels.com/videos/search`, `https://api.pexels.com/v1/search`. Auth via HTTP header `Authorization: <key>` (sent through `curl -H`).
- **Rate limits:** 200 requests/hour, ~25,000/month (default free tier). Each `pex-api.mjs`/`pex-img.mjs` run = 1 search call + 1 download; batch queries deliberately.
- **Attribution (required by Pexels API terms):** every download writes a `<outfile>.credit.json` sidecar (photographer, photographer URL, Pexels URL, id) and appends a human-readable line to `broll-credits.txt`. Keep these; they are how we satisfy the attribution requirement when a video ships.
- **Access a new assistant needs:** a Pexels API key set as `PEXELS_API_KEY` in `.env`. Free to obtain at pexels.com/api. `curl` must be on PATH (scripts shell out to it).

## 5.2 Pixabay API — stock video + photo (fallback / landscape + vertical photos)

- **Purpose:** Secondary stock source. Photos support `orientation=vertical` (great for food popups); **video is landscape-only** (Pixabay has no portrait filter) — so for vertical B-roll fall back to Pexels.
- **Env var:** `PIXABAY_API_KEY`, auto-loaded from `.env` the same way as Pexels.
- **File that uses it:** `pix-api.mjs` — `node pix-api.mjs <video|photo> "<query>" <outfile> [rank=0]`. Photos: `image_type=photo&orientation=vertical`, picks `largeImageURL`. Videos: `video_type=film`, picks smallest rendition with height ≥1080.
- **Endpoints:** `https://pixabay.com/api/` (photos), `https://pixabay.com/api/videos/` (video). Key passed as a `key=` query param to the API host (not in a shipped URL — internal fetch only).
- **Rate limit:** 100 requests / 60 seconds.
- **Mandatory 24-hour caching (Pixabay TOS):** the script caches every JSON API response in `.api-cache/` (filename = `pixabay-<mode>-<md5(url)>.json`) and reuses it if younger than 24h. Do **not** disable this and do **not** do mass/bulk downloads — both violate the TOS. Downloads go to disk (no hotlinking), which the script already enforces.
- **Attribution:** writes the same `<outfile>.credit.json` sidecar + `broll-credits.txt` line (author, page URL, id).
- **Access a new assistant needs:** a Pixabay API key set as `PIXABAY_API_KEY` in `.env`; `curl` on PATH; leave `.api-cache/` in place.

## 5.3 Openverse API — openly-licensed photos (no-key fallback)

- **Purpose:** Free, no-authentication fallback for photos (commercially-licensed, largely Flickr-hosted). Used to batch-fetch food imagery.
- **Env var:** none — no key required.
- **File that uses it:** `ov-foods.mjs` — `node ov-foods.mjs <outdir>`. Iterates a hardcoded food list, saves up to 3 candidates each (`<name>_r0..2.jpg`), filtering `license_type=commercial&mature=false` and skipping tiny/broken files.
- **Endpoint:** `https://api.openverse.org/v1/images/` (sends a browser-like User-Agent via `curl -A`).
- **Rate limits:** Openverse throttles anonymous clients; for heavier use register for a client ID/secret (not currently wired in). Current usage is light batch fetches only.
- **Attribution:** Openverse results carry per-image license/attribution metadata. `ov-foods.mjs` does **not** currently write credit sidecars, so if you ship an Openverse image, capture its license/creator manually from the API result.
- **Access a new assistant needs:** nothing beyond internet + `curl`. Zero credentials.

## 5.4 whisper.cpp (via `@remotion/install-whisper-cpp`) — local audio transcription

- **Purpose:** Local, offline speech-to-text to generate caption JSON (token-level timestamps) for talking-head/caption edits. No cloud API, no cost, no key.
- **Package:** `@remotion/install-whisper-cpp` (`4.0.501`, in `package.json`). Downloads and builds the whisper.cpp binary and model on first run.
- **Setup (done automatically by the scripts):** `installWhisperCpp({ to: ./whisper.cpp, version: "1.5.5" })` then `downloadWhisperModel({ model: "medium.en", folder: ./whisper.cpp })`. The binary and the **medium.en** model land in `./whisper.cpp/` at the repo root.
- **Files that use it:** `transcribe-any.mjs` (generic: `node transcribe-any.mjs <input.wav> <output.json>`) plus the purpose-built variants `transcribe.mjs`, `transcribe-environment.mjs`, `avatar-transcribe.mjs`, `e167-transcribe.mjs`. All expect **16 kHz mono WAV** input and emit Remotion `@remotion/captions` JSON via `toCaptions()`.
- **Access a new assistant needs:** no credentials. Requirements are local: a C/C++ build toolchain for the first-run compile, disk space (medium.en model is ~1.5 GB), and `ffmpeg` upstream to produce 16 kHz mono WAV. First run is slow (download + build); subsequent runs reuse `./whisper.cpp/`. `./whisper.cpp/` is a build artifact — do not commit it.

## 5.5 Europe PMC REST API — research-study screenshots (brain/health videos)

- **Purpose:** Source scientific-study references and render them as on-screen "study" screenshots for the split-screen brain/health edits (a study panel sits above the talking head).
- **Env var:** none — Europe PMC's REST API is public and key-free.
- **How it's used:** the study text/metadata is fetched from Europe PMC, laid into a **local HTML page**, and captured with **headless Chrome** to produce a static image. That image is then referenced by the Remotion composition. In `src/remotion/JadeJones/BrainExerciseEdit.tsx` the composition takes a `studySrc` prop — "screenshot of the study, shown in the split-screen top region" — loaded via `staticFile(studySrc)` from `public/`. The composition consumes the finished screenshot; the fetch + headless-Chrome capture is a manual pre-production step (no committed fetch script), so the endpoint and capture are run ad hoc, not from a checked-in `.mjs`.
- **Endpoint:** Europe PMC REST API — `https://www.ebi.ac.uk/europepmc/webservices/rest/...` (public REST search/article endpoints).
- **Access a new assistant needs:** no credentials for Europe PMC. To reproduce the screenshots you need a headless Chrome (Puppeteer/`@remotion/renderer`'s bundled Chromium both work) and the study image dropped into `public/` so `staticFile()` can resolve it.

## 5.6 ClickUp (MCP integration) — production board comms only

- **Purpose:** Interact with the ClickUp production board (attachments, comments, task housekeeping). Used for pulling reference material and posting deliverables/notes back.
- **Available MCP tools (LIMITED):** only four are exposed on this connection —
  - `clickup_create_comment` (comment on a task)
  - `clickup_download_task_attachment` (pull an attachment)
  - `clickup_merge_tasks`
  - `clickup_request_attachment_upload` (upload an attachment)

  There is **no task-listing or task-reading** tool. To see what is on the board (task titles, statuses, descriptions), **read it in the browser** — you cannot enumerate tasks through the MCP.
- **Key reference:** the Instagram board lives at ClickUp list **`901522374004`** (list id `li/901522374004`). Task IDs must be obtained from the browser first, then fed into the MCP tools above.
- **Access a new assistant needs:** the ClickUp MCP server must be **authorized** (this session reports it as an OAuth connector that has to be connected via claude.ai connector settings, or `claude mcp` / `/mcp` in an interactive session — it cannot be authorized non-interactively). Plus browser access to the ClickUp workspace to read the board. Posting comments/attachments back writes to a shared production board — treat as a send-on-behalf action and confirm before creating comments or uploading.

## 5.7 AWS Lambda — Remotion Lambda cloud rendering (scaffolded, not the default path)

- **Purpose:** Render compositions in the cloud (Remotion Lambda) instead of locally. Fully scaffolded but optional — day-to-day rendering is local (`npm run render` / Remotion Studio). This is **not free** (AWS Lambda + S3 charges apply).
- **Env vars:** `REMOTION_AWS_ACCESS_KEY_ID`, `REMOTION_AWS_SECRET_ACCESS_KEY` (the code also accepts the standard `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` as fallbacks). Declared empty in `.env.example`.
- **Files that make up the integration:**
  - `config.mjs` — deployment constants: `REGION="us-east-1"`, `SITE_NAME="my-next-app"`, `RAM=3009` MB, `DISK=10240` MB, `TIMEOUT=240` s.
  - `deploy.mjs` (`npm run deploy`) — `deployFunction` + `getOrCreateBucket` + `deploySite` (entry `src/remotion/index.ts`). Exits early with a setup hint if the AWS env vars are absent. Re-run after changing the template, `config.mjs`, or upgrading Remotion.
  - `src/app/api/lambda/render/route.ts` — Next.js POST route; calls `renderMediaOnLambda` (h264, `framesPerLambda: 10`, forced download `video.mp4`). Throws a clear error if the AWS keys are missing.
  - `src/app/api/lambda/progress/route.ts` — POST route; polls `getRenderProgress`.
  - `src/lambda/api.ts` — client helpers (`renderVideo`, `getProgress`) the front-end calls.
  - `vercel.json` — `"buildCommand": "node deploy.mjs && next build"`, so a Vercel deploy runs `deploy.mjs` first (needs the AWS env vars set in Vercel, or it no-ops with a warning).
- **Important operational note:** Lambda renders read the site bundle and write output to **S3** in `us-east-1`. Any footage/assets a composition needs must be reachable by the Lambda — local `public/` files that aren't part of the deployed site bundle won't exist in Lambda, so **footage must be uploaded to S3** (or otherwise made fetchable) for cloud renders. Remotion version across all `@remotion/*` packages is `4.0.501`; `deploy.mjs` must be re-run after any Remotion upgrade.
- **Access a new assistant needs:** an AWS account with a Remotion-Lambda IAM user (the specific IAM policy from the Remotion Lambda setup docs), keys set as `REMOTION_AWS_ACCESS_KEY_ID` / `REMOTION_AWS_SECRET_ACCESS_KEY`, and awareness that this incurs cost. If those vars are unset, everything degrades gracefully to "Lambda not set up" and local rendering is unaffected. Creating IAM users, entering AWS credentials into consoles, or standing up billing is a user-side action — direct the user to do it; do not perform account/credential setup yourself.

---

## 5.8 Environment variables reference

| Env var | Purpose | Used by | Required? |
|---|---|---|---|
| `PEXELS_API_KEY` | Auth for Pexels video + photo API (primary vertical B-roll) | `pex-api.mjs`, `pex-img.mjs` (auto-read from `.env`) | Required for Pexels sourcing |
| `PIXABAY_API_KEY` | Auth for Pixabay video + photo API (fallback / vertical photos) | `pix-api.mjs` (auto-read from `.env`) | Required for Pixabay sourcing |
| `REMOTION_AWS_ACCESS_KEY_ID` | AWS access key for Remotion Lambda deploy + cloud render | `deploy.mjs`, `src/app/api/lambda/render/route.ts`, `progress/route.ts` | Only for cloud (Lambda) rendering; optional for local work |
| `REMOTION_AWS_SECRET_ACCESS_KEY` | AWS secret key for Remotion Lambda | same as above | Only for cloud (Lambda) rendering; optional for local work |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Standard-AWS fallback the Lambda code also accepts | `deploy.mjs`, Lambda API routes | Optional (alternative to the `REMOTION_*` pair) |

**No key needed:** Openverse API (`ov-foods.mjs`), Europe PMC REST API, and whisper.cpp (`transcribe*.mjs`) all run without credentials. **Not an env var:** the ClickUp connection is an OAuth MCP server (authorize via connector settings), and the RapidAPI "clonify"/Instagram-scraper keys referenced in other pipelines are separate and not part of this section's files.

---

### Quick start for a new assistant

1. Copy `.env.example` to `.env` and fill in `PEXELS_API_KEY` and `PIXABAY_API_KEY` (both free) — this unlocks all stock sourcing.
2. Leave the two `REMOTION_AWS_*` vars empty unless the user explicitly wants cloud rendering (it costs money and requires S3 for footage). Local rendering needs no AWS keys.
3. Ensure `curl` and `ffmpeg` are on PATH; the first `transcribe-any.mjs` run will download+build whisper.cpp and the ~1.5 GB `medium.en` model into `./whisper.cpp/`.
4. Preserve attribution artifacts (`*.credit.json`, `broll-credits.txt`) and the Pixabay `.api-cache/` directory — both are TOS-compliance, not clutter.
5. For ClickUp, read the board in the browser (list `901522374004`); the MCP can only comment, merge, and move attachments — and it must be authorized in an interactive session first.

Relevant files (all absolute): `C:\Users\yanel\Documents\remotion\pex-api.mjs`, `C:\Users\yanel\Documents\remotion\pex-img.mjs`, `C:\Users\yanel\Documents\remotion\pix-api.mjs`, `C:\Users\yanel\Documents\remotion\ov-foods.mjs`, `C:\Users\yanel\Documents\remotion\transcribe-any.mjs`, `C:\Users\yanel\Documents\remotion\src\remotion\JadeJones\BrainExerciseEdit.tsx`, `C:\Users\yanel\Documents\remotion\config.mjs`, `C:\Users\yanel\Documents\remotion\deploy.mjs`, `C:\Users\yanel\Documents\remotion\src\lambda\api.ts`, `C:\Users\yanel\Documents\remotion\src\app\api\lambda\render\route.ts`, `C:\Users\yanel\Documents\remotion\src\app\api\lambda\progress\route.ts`, `C:\Users\yanel\Documents\remotion\vercel.json`, `C:\Users\yanel\Documents\remotion\.npmrc`, `C:\Users\yanel\Documents\remotion\.env.example`.

---

# 6. Operating Instructions for a New AI Assistant

A concise playbook for handling an incoming video request end to end.

## 6.1 Understand the request

- The unit of work is usually **one ClickUp card** on the Instagram board (`li/901522374004`), moving `IDEATION → SCRIPTING → FILMING → EDITING/DESIGNING → UPLOADING`. Cards in **EDITING/DESIGNING** are ready to edit; their filmed take is on `F:\jade jones\videos\` named by the hook line.
- A card holds, in order: **Original transcript → Rewritten script → B-roll notes (the visual instructions — the important part) → Production notes (health-claim reframes)**.
- **Jade sometimes films the *original* script, not the rewrite.** So the source of truth is **her actual take** — transcribe it; let the B-roll notes decide what to show.

## 6.2 Choose the treatment (which component)

| If the script is… | Use | Composition example |
|---|---|---|
| Plain talking-head with concept cutaways | `JadeEdit` | `UnderEating`, `AvatarPainters` |
| "If you take X… X and Y… X, Y and Z" ladder | `JadeLadder` (building cards) | `UnderEatingCards`, `IronStackCards` |
| A body-fat / body-composition % comparison | `BodyFatSplit` | `BodyFatWomen` |
| References a published study | `BrainExerciseEdit` (split-screen study) | `BrainExerciseEdit` |
| Rapid-fire "amount = food" pairings | `NutrientTargets` | `NutrientTargets` |
| Punch-in hook on power words + ending zoom | `MagnesiumEdit` | `MagnesiumEdit` |
| Myth-flip / male-vs-female duality | `SkipBreakfast` | `SkipBreakfast` |
| A separate AI VO names items, footage gives verdicts | `BellySixPack` (build) or `BellySixOverlay` (overlay a user-composed base) | `BellySixOverlay` |

**Create a new component only** when no treatment fits; otherwise reuse an existing one and just add a `<Composition>` with new `defaultProps` (the data-driven path). New videos should be *data, not code*, wherever possible.

## 6.3 Gather missing inputs — ask only what you can't derive

- **Derive silently:** word timings (transcript), B-roll concepts (card notes), durations (`calculateMetadata`).
- **Ask the user only for genuine forks:** caption style (clean white vs branded vs karaoke), whether to add B-roll at all, branding level, and — for a large batch — *which* videos and *how many*. Confirm **composed-base-vs-cut-from-scratch** before building. Use one consolidated multiple-choice question, not a drip of them.

## 6.4 Edit safely

- Change **`defaultProps` in `Root.tsx`** for timing/asset/beat changes — no component code needed.
- Component code changes affect **every video using that component** (e.g. `JadeCaptions`, `JadeEdit`) — verify you're not regressing other comps. Prefer optional props defaulted to current behavior.
- Keep assets in the video's own `F:\jade jones\render\<name>\` (`video.mp4`, `captions.json`, `broll/`, `cards/`, `study.png`).

## 6.5 Preview, render, troubleshoot, verify

- **Preview/iterate on layout:** Remotion Studio (`npm run remotion`, port 3000) — hot-reload, scrub any frame, no render.
- **Render:** `render-fast.mjs` (warm bundle). CLI `npx remotion render` only for a one-off (it cold-bundles every call).
- **Troubleshoot:** `ENOSPC`/OOM → you forgot `--public-dir`/heap env. Landscape clip letterboxed → use `objectFit="cover"` prop. Caption word missing → whisper dropped a short leading word; pad the audio before transcribing or insert the token. Loop opens on the wrong word → read the boundary **waveform**, don't trust whisper ms.
- **Verify (non-negotiable):** extract frames and **read them**; for audio sync/loop-cuts read a `silencedetect`/`showwavespic` waveform. Never assume a render is correct.

## 6.6 Communicate

- State plainly what's done, what's in-flight (background renders), and the one thing you *can't* verify (e.g. subjective audio sync — hand that to the user).
- When you make a judgement call the user didn't specify (e.g. "used oranges instead of a pill bottle for vitamin C"), flag it so they can override.

---

# 7. Operational Knowledge

> **These are hard-won lessons and standing decisions that are NOT obvious from the code.** Treat this as the most important section.

## 7.1 Loop-cut rules (the user's explicit standing instruction)

- **ALWAYS trim the loop** when a take repeats its opening line at the end — *even if a card note says "the loop is deliberate, leave it."* The user overrode that: use the **looped ending as the START**, delete the original opening, and the moved segment **must begin on the exact same word** the take originally opened with.
- The restatement is preceded by a **connector/filler** ("because", "so", "even", "but once you do remember that"). Exclude it. **whisper often stamps the filler at the same `startMs` as the real first word** — use the filler's `endMs`, not its `startMs`.
- **`segB` must also END before that connector**, so the reel ends on the punchline/twist — not a dangling "…but once you do remember."
- **whisper timings are unreliable for this** (±0.3–0.5 s drift; mislabels which word a boundary belongs to). Reliable method: make the cut → **re-transcribe the looped file** → read its first tokens; a leaked filler's duration tells you exactly how much more to shave. If still off, render a **waveform of the boundary** (`showwavespic=s=1100x200` over ~1.1 s, `drawgrid=w=100` = 100 ms/line) and read the syllable blobs directly. (This is how iron's "if" was pinned at 26.70 s when whisper said 26.38 and 26.89.)
- **whisper also drops very short leading words** ("If", "you") from the transcript even when clearly audible. Fix: pad ~0.5 s of silence before transcribing (`adelay`) then shift the times back, or manually prepend the token to the captions JSON.
- Simpler variant: if the *last* delivery is just a trailing repeat (no new content), **don't re-cut** — set the comp's `durationInSeconds` to the cut time and truncate the captions JSON (`tokens.filter(t=>t.startMs<cutMs)`). No ffmpeg re-encode.

## 7.2 B-roll: SHOW THE THING SHE NAMES, LITERALLY (user's #1 complaint)

- The user rejected a whole batch — *"the b-roll you chose sucks"* — because clips showed the *outcome/vibe* not the *named object*. When the VO names a supplement/food/object, **show that object**: "creatine" → powder scooped, "vitamin D" → capsules, "magnesium…sleep" → bedside pill bottle + clock, "protein daily" → a plate of chicken+rice, "iron" → lentils, "vitamin C" → citrus, "avoid coffee" → coffee cups (crossed out in a card treatment), "see a doctor" → a clinician. A gym for "creatine" or a sunny window for "vitamin D" reads as vague — **rejected**.
- **Never let a clip contradict the line.** A woman happily making a big fresh salad under "eating under 1,500 calories" reads as the *opposite*; the fix was a tiny portion on a large plate.
- **Time every cutaway to the spoken word** (pull ms from the captions JSON). Approximate placement drifts (lentils landing on "vitamin C").
- **Never reuse the same clip across two videos in a batch** — they post together. Diff `.credit.json` `id` fields (Pexels id 7508452 once slipped into two).
- **Query traps:** "supplement/vitamin bottles shelf" almost always returns the same yellow essential-oils flat-lay; "pharmacy shelf" once returned a baby in a stroller. For a shelf-of-bottles, stock is thin — use a sparse/empty-plate shot or shoot on a phone. "crossword" rank-0 is always the same man-with-newspaper; a real crossword close-up was rank 2.
- **Always vet** downloaded clips in an ffmpeg montage before use, even though API rank-0 is usually right.

## 7.3 The `@remotion/media <Video>` objectFit trap (4.0.501)

- `@remotion/media`'s `<Video>` **ignores `objectFit` set in `style`** — you must pass it as a **prop**: `<Video objectFit="cover" …>`. If you leave it in `style`, **landscape clips (1920×1080) letterbox** (content band + black bars) while portrait clips happen to look fine — which is exactly the "half-screen B-roll" bug. There is **no `objectPosition` prop**; do framing/zoom with a CSS `transform` on a wrapping div instead.

## 7.4 Rendering & environment

- **`render-fast.mjs` is the render path.** Bundle-once (~45 s) then ~15 s/frame; a verify-batch+final that was ~7 cold CLI bundles (~7–10 min) becomes ~1 bundle. Warm bundle is valid **only within one process run** — code edits need a fresh run.
- **`webpack-override.mjs` has `cache:false`** deliberately (a Node-22 hash crash workaround; re-enabling the filesystem cache saved only ~25 % and wrote 1.4 GB to the 95 %-full C: — not worth it).
- **`npx remotion upgrade` fails on Windows** (`spawn npm ENOENT`) — run the `npm i --save-exact …@<version>` command it prints, yourself.
- C: is ~95 % full → always `TMP/TEMP=F:/remotion-temp`, `NODE_OPTIONS=--max-old-space-size=6144`, and a **minimal `--public-dir`**.

## 7.5 Captions

- `JadeCaptions` = Anton 100 px, white, ALL-CAPS, ≤18 chars / ≤2.5 s per page, at y≈1100. It **rebuilds whole words from whisper sub-word tokens** and drops dashes.
- Captions now carry a **crisp black outline** (added so white text reads on light backgrounds like a white shirt) — invisible on dark clips, so it's a safe universal upgrade.

## 7.6 Study screenshots (BrainExerciseEdit)

- When a note says "show the study," build from a **real citation** (e.g. SMART trial, PMID 25444575) — never invent one. Live PubMed 403s under headless Chrome, so the technique is: fetch metadata from the **Europe PMC REST API** → build a local HTML page → screenshot with headless Chrome at `--force-device-scale-factor=2`.
- **BUT if the user pastes a screenshot and says "use THIS," use their actual pixels — do not substitute an HTML re-creation** (doing that once made the user angry). Grab their pasted image off the Windows clipboard via PowerShell (`[System.Windows.Forms.Clipboard]::GetImage().Save(...)`), and **resize the split to fit the image** rather than cropping it (their 976×550 landscape shot → `SEAM=609` = round(1080·550/976) so the whole page fills the top with no crop; Jade fills the taller bottom).

## 7.7 Ladder cards (JadeLadder)

- Cards **build up** as each item is named (1 → `+`2 → `+`3), the group re-centering each time; all **clear at the twist line** so the punchline lands on her face. Card times = the exact ms she says the word.
- Card = square royalty-free photo, 5 px white border, double drop-shadow, small caps label under it. Per-item `crossOut:true` draws a red ✕ (used for "avoid coffee" so it never reads as "add coffee").
- **Pexels' square supplement pool is basically one stock series** ("Supplements On Demand") — 45 downloads yielded 31 unique ids. Pick for **contrast within a video** (tub vs softgel jar vs capsule jar), diff ids to avoid reuse, and **crop tight onto the substance** (the shots waste half the frame on props). Citrus beats a pill bottle for "vitamin C" when an iron bottle is already on screen.

## 7.8 Sourcing & attribution facts

- **Pexels API is primary** for video (portrait-native, no bot-challenge). Same key does photos (`api.pexels.com/v1/search`). Exclude `quality:"hls"` renditions. Rate limit 200/hr + ~25k/mo. **Attribution:** each pull writes a `.credit.json` sidecar + a line to `broll-credits.txt`; drop "B-roll via Pexels" in the IG caption (it's also what unlocks a free unlimited-rate tier).
- **Pixabay** is the fallback; its **video is landscape-only** (needs 9:16 crop), and its TOS **requires 24 h caching** (`.api-cache/`) and **forbids mass downloads** — so no bulk B-roll library building; cache only what real videos use.
- **Openverse** (`ov-foods.mjs`, no key, Flickr-hosted) is a further fallback for food photos.
- **Music:** neither key does music (Pexels dropped it; Pixabay music has no API). Default to delivering **voice-clean** and let the user add trending audio in the IG app (better reach + cleanly licensed); use Jamendo's API only if a baked-in track is required, ducked under the VO.

## 7.9 ClickUp reality

- The connected ClickUp MCP exposes **only** comment / download-attachment / merge / request-upload — **no task listing or reading**. So you **cannot** discover or read the editing queue through the MCP; read the board in the **browser** (real Chrome via the extension, since login is required), or have the user paste card links/notes. Attachments can be pulled via the MCP once you have the task+attachment id.

## 7.10 Misc standing facts

- **Two client brands** share this repo: the Jade Jones health reels (primary) and **getsellers.io × @estenick** (Esteban Andrade's real-estate lead-gen brand; dark theme, gold `#FACC15`/purple `#8C45FF`). Don't mix their looks.
- Body-composition reference images are generated in **Google Flow** (free daily tier) and land in `C:\Users\yanel\Downloads\`; map fullest→leanest 40→30→25→20.
- **`git` user is `IAMYanele`; default branch `main`.** Commit/push only when asked.

---

---

# Quick Start — produce your first video in ~10 minutes

Assumes: a source take at `F:\jade jones\videos\<hook>.mp4`, `PEXELS_API_KEY` in `.env`, deps installed (`npm i`).

```bash
cd /c/Users/yanel/Documents/remotion
export TMP="F:/remotion-temp" TEMP="F:/remotion-temp" NODE_OPTIONS="--max-old-space-size=6144"
FF="/c/Users/yanel/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe"
NAME="my-video"; SRC="F:/jade jones/videos/<hook>.mp4"
mkdir -p "F:/jade jones/render/$NAME/broll"

# 1) transcribe
"$FF" -y -i "$SRC" -ac 1 -ar 16000 /tmp/a.wav
node transcribe-any.mjs /tmp/a.wav "F:/jade jones/render/$NAME/captions.json"
cp "$SRC" "F:/jade jones/render/$NAME/video.mp4"

# 2) read the captions to get word timings for B-roll placement
node -e "const t=require('F:/jade jones/render/$NAME/captions.json'); let s='',st=null; t.forEach(x=>{if(st==null)st=x.startMs; s+=x.text; if(/[.?!]/.test(x.text)){console.log((st/1000).toFixed(1)+': '+s.trim());s='';st=null;}});"

# 3) source + vet + normalize one concept clip (repeat per beat)
node pex-api.mjs "the literal thing she says" "F:/jade jones/render/$NAME/broll-raw.mp4" 0
"$FF" -y -i "F:/jade jones/render/$NAME/broll-raw.mp4" -t 5 \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=25" \
  -an -c:v libx264 -crf 21 -pix_fmt yuv420p "F:/jade jones/render/$NAME/broll/b1.mp4"
```

Then in `src/remotion/Root.tsx`, add a `<Composition id="MyVideo" component={JadeEdit} … />` (copy the `UnderEating` block), setting `videoSrc:"video.mp4"`, `captionsSrc:"captions.json"`, `durationInSeconds` = take length, `fps:25`, and `broll:[{src:"broll/b1.mp4", fromSeconds:<word time>, durationInSeconds:3}]`. Ensure `JadeEdit`'s `<Video>` uses `objectFit="cover"` **as a prop**.

```bash
# 4) render + verify in one warm bundle
node render-fast.mjs MyVideo --public-dir "F:/jade jones/render/$NAME" \
  --stills 60,200 --stills-out "F:/remotion-temp/chk" \
  --out "F:/jade jones/videos/EDITED/My Video.mp4" --concurrency 4
# 5) read the stills, fix if needed, deliver
```

---

# Migration Checklist

**Files a new assistant must have / read (in priority order):**

| Item | Path | Why |
|---|---|---|
| This guide | `REMOTION_OPS_GUIDE.md` (repo root) | The map |
| Composition registry | `src/remotion/Root.tsx` | Every video + its props |
| Reusable components | `src/remotion/JadeJones/*.tsx` | The treatments |
| Render harness | `render-fast.mjs` | The fast render path |
| Transcriber | `transcribe-any.mjs` | Captions |
| B-roll sourcers | `pex-api.mjs`, `pex-img.mjs`, `pix-api.mjs`, `ov-foods.mjs` | Assets |
| Loop-cut helper | `jade-loopcut.sh` | Cut logic |
| Webpack override | `src/remotion/webpack-override.mjs` | Why bundles are cold |
| Render/Lambda config | `remotion.config.ts`, `config.mjs`, `deploy.mjs`, `src/lambda/` | Rendering setup |
| Attribution log | `broll-credits.txt` (repo root) | Credits per video |

**Environment variables to set (values live only in `.env`, never in git):**

| Env var | Purpose | Used by | Required? |
|---|---|---|---|
| `PEXELS_API_KEY` | Pexels video+photo API | `pex-api.mjs`, `pex-img.mjs` | Yes (primary B-roll) |
| `PIXABAY_API_KEY` | Pixabay video+photo API | `pix-api.mjs` | Optional (fallback) |
| `REMOTION_AWS_ACCESS_KEY_ID` | AWS Lambda render | `deploy.mjs`, `src/lambda/` | Only for Lambda |
| `REMOTION_AWS_SECRET_ACCESS_KEY` | AWS Lambda render | `deploy.mjs`, `src/lambda/` | Only for Lambda |
| RapidAPI key (IG scraper) | Download IG source reels | IG-reel download flow | Only to fetch source reels |

**Access a new assistant needs:**
- Read/write to `C:\Users\yanel\Documents\remotion` and to the `F:\jade jones\` working drive (`videos/`, `videos/EDITED/`, `render/`) + `F:\remotion-temp`.
- `node`, `npm`, `curl`, and the system **ffmpeg/ffprobe** (Gyan WinGet build) on PATH; **headless Chrome** for study screenshots.
- A **Pexels API key** (free) at minimum. Pixabay/AWS optional.
- To read the ClickUp board: the **Chrome extension** signed into ClickUp (the MCP can't list tasks). To download IG source reels: the RapidAPI key.
- The four **memory files** (session knowledge) if migrating within Claude Code: `…/memory/jade-clone-video-pipeline.md`, `remotion-render-workaround.md`, `client-brands-getsellers-estenick.md`, `MEMORY.md`.

**External services in play:** Pexels API, Pixabay API, Openverse API, whisper.cpp (local), Europe PMC REST API, Google Flow (manual, image gen), AWS Lambda (optional, scaffolded), ClickUp (via browser), RapidAPI Instagram scraper.

---

# Gaps to Resolve

Things that are uncertain, inaccessible, or deliberately out of scope — **do not guess these**:

- **AWS Lambda is scaffolded but unconfigured** — `deploy.mjs`/`config.mjs`/`src/lambda/` exist, but there's no evidence it has ever been deployed. It is **not free** and needs a user-created IAM user + billing. Local `render-fast.mjs` is the working render path. Confirm with the user before assuming Lambda works.
- **The RapidAPI Instagram-scraper key** lives outside this repo (referenced at `C:\Users\yanel\Documents\ai.agents\workflow-agents\scraping agent\config.json`). A migrating assistant needs that file or the key re-provisioned; not verified reachable in this handover.
- **Google Flow** (body-composition image gen) is a **manual, browser-based** step on a free daily tier — not automatable here; outputs are dropped into `Downloads/` by hand.
- **ClickUp task discovery** cannot be done via the MCP (comment/attachment/merge only). Reading the editing queue depends on the browser + a signed-in session; automate-ability is limited.
- **Disk pressure (C: ~95 % full)** is an ongoing risk. Biggest reclaimable items (whisper.cpp model ~1.5 GB, `public/phil-vsl` ~564 MB, `videos/`) are user assets — ask before deleting.
- **Music** has no wired-in source (see §7.8). If a video ever needs baked-in music, Jamendo API integration is a to-do.
- **One open task at handover time:** `BrainExerciseEdit` half-screen B-roll fix is diagnosed but not finished — see the tracked "RESUME" task / §7.3. The fix is the `objectFit` prop change plus a full-screen hippocampus clip and a split-caption/scale tweak.
- **The non-Jade comps** (PhilVSL, TwoBrands, AIAgentExplainer, DigitalProductsDead, etc.) are documented structurally but their per-video asset provenance and current status weren't audited in depth — treat as archival unless the user reactivates one.

