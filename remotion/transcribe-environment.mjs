import path from "path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import fs from "fs";

const to = path.join(process.cwd(), "whisper.cpp");

console.log("Installing whisper.cpp...");
await installWhisperCpp({
  to,
  version: "1.5.5",
});

console.log("Downloading whisper model (medium.en)...");
await downloadWhisperModel({
  model: "medium.en",
  folder: to,
});

console.log("Transcribing environment audio...");
const whisperCppOutput = await transcribe({
  model: "medium.en",
  whisperPath: to,
  whisperCppVersion: "1.5.5",
  inputPath: path.join(process.cwd(), "public", "environment-audio.wav"),
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({
  whisperCppOutput,
});

fs.writeFileSync(
  path.join(process.cwd(), "public", "environment-captions.json"),
  JSON.stringify(captions, null, 2)
);

console.log(`Done! Generated ${captions.length} caption entries.`);
console.log("Saved to public/environment-captions.json");
