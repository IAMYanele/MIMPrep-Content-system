// Batch-render the Thomas animation events.
//
// `npx remotion render` re-bundles the whole project on every call, which for 27
// short events costs far more than the renders themselves. This bundles once and
// reuses it.
//
//   node render-thomas.mjs            # everything that has its assets
//   node render-thomas.mjs valley     # just these ids
//   node render-thomas.mjs --force    # re-render even if the file exists

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = import.meta.dirname;
const OUT = path.join(ROOT, "out/thomas");
const PUBLIC = path.join(ROOT, ".render-public");
const ASSEMBLY = path.join(PUBLIC, "thomas/assembly.mp4");
const TUESDAY = path.join(PUBLIC, "thomas/tuesday.jpg");

const src = readFileSync(path.join(ROOT, "src/remotion/Thomas/events.ts"), "utf8");
const EVENTS = [...src.matchAll(/id: "([^"]+)",\s*channel: "([^"]+)"/g)].map((m) => ({
  id: m[1],
  channel: m[2],
}));

// which events can't render until something else exists
const NEEDS_BASE = new Set(
  EVENTS.filter((e) => e.channel === "yellow").map((e) => e.id),
);
const NEEDS = (id) => {
  if (id === "ordinary-tuesday") return existsSync(TUESDAY) ? null : "tuesday.jpg";
  if (NEEDS_BASE.has(id)) return existsSync(ASSEMBLY) ? null : "assembly.mp4";
  return null;
};

const argv = process.argv.slice(2);
const force = argv.includes("--force");
const only = argv.filter((a) => !a.startsWith("--"));

mkdirSync(OUT, { recursive: true });
console.log("bundling once...");
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "src/remotion/index.ts"),
  publicDir: PUBLIC,
});

let done = 0;
let skipped = 0;
for (const { id } of EVENTS) {
  if (only.length && !only.includes(id)) continue;
  const outPath = path.join(OUT, `${id}.mp4`);
  if (!force && existsSync(outPath)) {
    console.log(`= ${id} (already rendered)`);
    continue;
  }
  const blocked = NEEDS(id);
  if (blocked) {
    console.log(`- ${id} (waiting on ${blocked})`);
    skipped++;
    continue;
  }
  const started = Date.now();
  // Other compositions in this Root load Google Fonts at module scope, so every
  // render touches the network whether it needs to or not and a transient failure
  // used to kill the whole batch.
  let composition;
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      composition = await selectComposition({ serveUrl, id: "ThomasEvent", inputProps: { id } });
      await renderMedia({
        composition,
        serveUrl,
        codec: "h264",
        crf: 17,
        outputLocation: outPath,
        inputProps: { id },
        concurrency: 4,
        logLevel: "error",
      });
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      console.log(`  ! ${id} attempt ${attempt} failed: ${err.message?.slice(0, 60)}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  if (lastErr) {
    console.log(`x ${id} gave up after 4 attempts`);
    skipped++;
    continue;
  }
  done++;
  console.log(`+ ${id}  ${composition.durationInFrames}f  ${((Date.now() - started) / 1000).toFixed(0)}s`);
}
console.log(`\nrendered ${done}, waiting on assets ${skipped}`);
