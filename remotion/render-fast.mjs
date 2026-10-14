// Warm bundle-once render harness. Bundles the project a SINGLE time, then
// renders any number of stills + the final video off that one in-memory bundle
// — so verify-frames and the final export skip webpack entirely after the first
// ~60s. Same output quality as the CLI (bundling is deterministic translation).
//
//   node render-fast.mjs <CompID> --public-dir <dir> \
//     [--stills 30,185,246] [--stills-out <dir>] \
//     [--out <final.mp4>] [--scale 0.5] [--frames a-b] \
//     [--concurrency 4] [--props <file.json>]
import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill, renderMedia } from "@remotion/renderer";
import { webpackOverride } from "./src/remotion/webpack-override.mjs";

const args = process.argv.slice(2);
const compId = args[0];
const flag = (n, d = null) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const publicDir = flag("--public-dir");
const stills = flag("--stills");
const stillsOut = flag("--stills-out", ".fast-stills");
const out = flag("--out");
const scale = Number(flag("--scale", "1"));
const framesArg = flag("--frames");
const concurrency = Number(flag("--concurrency", "4"));
const propsFile = flag("--props");

if (!compId || !publicDir) {
  console.error('usage: node render-fast.mjs <CompID> --public-dir <dir> [--stills 30,185] [--stills-out dir] [--out final.mp4] [--scale 0.5] [--frames a-b] [--concurrency N] [--props file.json]');
  process.exit(1);
}
const inputProps = propsFile ? JSON.parse(fs.readFileSync(propsFile, "utf8")) : {};
const secs = (start) => ((Date.now() - start) / 1000).toFixed(1);

// 1) BUNDLE ONCE — the expensive step, paid a single time.
let s = Date.now();
console.log("⏳ Bundling once (one-time cost)...");
const serveUrl = await bundle({
  entryPoint: path.resolve("src/remotion/index.ts"),
  publicDir: path.resolve(publicDir),
  webpackOverride,
  onProgress: () => {},
});
console.log(`✅ bundle: ${secs(s)}s  (everything below reuses it)`);

// 2) SELECT COMPOSITION ONCE
s = Date.now();
const composition = await selectComposition({ serveUrl, id: compId, inputProps });
console.log(`✅ selectComposition: ${secs(s)}s  — ${composition.width}x${composition.height} ${composition.durationInFrames}f @ ${composition.fps}fps`);

// 3) VERIFY STILLS — each just renders, no re-bundle.
if (stills) {
  fs.mkdirSync(stillsOut, { recursive: true });
  for (const f of stills.split(",").map(Number)) {
    s = Date.now();
    const output = path.join(stillsOut, `f${f}.png`);
    await renderStill({ composition, serveUrl, output, frame: f, scale, imageFormat: "png", inputProps });
    console.log(`   🖼  still f${f}: ${secs(s)}s -> ${output}`);
  }
}

// 4) FINAL VIDEO — reuses the same bundle.
if (out) {
  s = Date.now();
  const frameRange = framesArg ? framesArg.split("-").map(Number) : undefined;
  await renderMedia({
    composition, serveUrl, codec: "h264", outputLocation: path.resolve(out),
    inputProps, scale, concurrency, imageFormat: "jpeg", frameRange,
    onProgress: ({ progress }) => process.stdout.write(`\r   🎬 render ${(progress * 100).toFixed(0)}%   `),
  });
  process.stdout.write("\n");
  console.log(`   🎬 renderMedia: ${secs(s)}s -> ${path.resolve(out)}`);
}
console.log("DONE");
