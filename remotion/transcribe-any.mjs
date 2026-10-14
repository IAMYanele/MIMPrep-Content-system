// Generic whisper transcription — pass in WAV (16kHz mono) and output JSON path.
//   node transcribe-any.mjs <input.wav> <output.json>
import path from "path";
import fs from "fs";
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const [, , wavPath, outJson] = process.argv;
if (!wavPath || !outJson) {
  console.error("Usage: node transcribe-any.mjs <input.wav> <output.json>");
  process.exit(1);
}

const to = path.join(process.cwd(), "whisper.cpp");
await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ model: "medium.en", folder: to });

const whisperCppOutput = await transcribe({
  model: "medium.en",
  whisperPath: to,
  whisperCppVersion: "1.5.5",
  inputPath: path.resolve(wavPath),
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput });
fs.writeFileSync(path.resolve(outJson), JSON.stringify(captions, null, 2));
console.log(`Done! ${captions.length} entries → ${outJson}`);
