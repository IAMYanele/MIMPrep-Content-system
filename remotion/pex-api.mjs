// Pexels B-roll sourcer via the OFFICIAL API (needs PEXELS_API_KEY env).
// Replaces the HTML-scrape (pex-source.mjs) — no bot-challenge, no retries.
//   PEXELS_API_KEY=... node pex-api.mjs "<query>" <outfile.mp4> [rank=0]
// Picks the largest rendition whose SHORT side is <=1080, portrait-first.
import fs from "fs";
import { execFileSync } from "child_process";

// Auto-load PEXELS_API_KEY from .env if not already in the environment.
if (!process.env.PEXELS_API_KEY && fs.existsSync(".env")) {
  const m = fs.readFileSync(".env", "utf8").match(/PEXELS_API_KEY\s*=\s*"?([^"\n\r]+)"?/);
  if (m) process.env.PEXELS_API_KEY = m[1];
}
const KEY = process.env.PEXELS_API_KEY;
const [, , query, outfile, rankArg] = process.argv;
if (!KEY) { console.error("set PEXELS_API_KEY"); process.exit(1); }
if (!query || !outfile) { console.error('usage: node pex-api.mjs "<query>" <out.mp4> [rank]'); process.exit(1); }
const rank = parseInt(rankArg || "0", 10);

// per_page max is 80 (docs) — pull 30 candidates for better ranking at no extra request cost.
const api = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=30&orientation=portrait&size=medium`;
const raw = execFileSync("curl", ["-s", "-H", `Authorization: ${KEY}`, api], { maxBuffer: 1e8, encoding: "utf8" });
const data = JSON.parse(raw);
const vids = data.videos || [];

console.log(`query="${query}"  total=${data.total_results}  page=${vids.length}`);
// Only downloadable MP4 renditions (exclude quality:"hls" .m3u8 manifests), short side <= 1080, largest first.
const pickRendition = (v) => {
  const mp4 = v.video_files.filter(
    (f) => f.quality !== "hls" && (f.file_type || "").includes("mp4") && f.width && f.height,
  );
  const under = mp4.filter((f) => Math.min(f.width, f.height) <= 1080);
  under.sort((a, b) => Math.min(b.width, b.height) - Math.min(a.width, a.height));
  return under[0] || mp4.sort((a, b) => Math.min(a.width, a.height) - Math.min(b.width, b.height))[0];
};
vids.slice(0, 8).forEach((v, i) => {
  const r = pickRendition(v);
  console.log(`  [${i}] id=${v.id} ${v.width}x${v.height} ${v.duration}s -> dl ${r ? `${r.width}x${r.height}` : "NO-MP4"}  by ${v.user?.name}`);
});

const chosen = vids[rank];
if (!chosen) { console.error("no video at rank", rank); process.exit(2); }
const r = pickRendition(chosen);
if (!r) { console.error("no downloadable mp4 rendition for id", chosen.id); process.exit(3); }
console.log(`-> downloading rank ${rank} id=${chosen.id} ${r.width}x${r.height}  by ${chosen.user?.name}`);
execFileSync("curl", ["-s", "-L", "-o", outfile, r.link], { maxBuffer: 1e8 });

// Attribution capture (Pexels API terms): sidecar + running credits log.
const credit = {
  file: outfile,
  query,
  photographer: chosen.user?.name,
  photographer_url: chosen.user?.url,
  pexels_url: chosen.url,
  id: chosen.id,
};
fs.writeFileSync(outfile.replace(/\.[^.]+$/, "") + ".credit.json", JSON.stringify(credit, null, 2));
fs.appendFileSync("broll-credits.txt", `Video by ${credit.photographer} on Pexels (${credit.pexels_url})\n`);
console.log(`saved ${outfile} ${(fs.statSync(outfile).size / 1e6).toFixed(1)}MB  | credit: ${credit.photographer}`);
