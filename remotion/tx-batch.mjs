// Batch-transcribe every remaining WAV in ONE process. transcribe-any.mjs pays
// the whisper install-check + model-load cost per invocation, which dominates
// runtime on 14s clips. base.en is plenty here — this is topic matching, not
// caption timing, so the accuracy of medium.en buys nothing.
import path from "path";
import fs from "fs";
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const TX = "F:/remotion-temp/tx";
const DIRS = ["F:/remotion-temp/reel-audio", "F:/remotion-temp/local-audio"];
const to = path.join(process.cwd(), "whisper.cpp");

await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ model: "base.en", folder: to });

const jobs = [];
for (const d of DIRS) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith(".wav")) continue;
    const b = f.replace(/\.wav$/, "");
    if (fs.existsSync(`${TX}/${b}.json`)) continue;
    jobs.push({ b, wav: `${d}/${f}` });
  }
}
console.log(`${jobs.length} to transcribe`);

for (const { b, wav } of jobs) {
  const t0 = Date.now();
  const out = await transcribe({
    model: "base.en",
    whisperPath: to,
    whisperCppVersion: "1.5.5",
    inputPath: path.resolve(wav),
    tokenLevelTimestamps: true,
  });
  const { captions } = toCaptions({ whisperCppOutput: out });
  fs.writeFileSync(`${TX}/${b}.json`, JSON.stringify(captions, null, 2));
  console.log(`${b}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
console.log("ALL DONE");
