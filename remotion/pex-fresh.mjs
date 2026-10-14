// Pexels B-roll sourcer that NEVER re-uses a clip we've already shipped.
//   node pex-fresh.mjs "<query>" <outfile.mp4> [skipCount=0]
// Scans every *.credit.json under F:/jade jones/render for asset ids already
// used in past videos, then walks the search results and downloads the first
// one that isn't in that set. Re-using a clip across weeks is the thing the
// client notices, so this guard runs on every pull.
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

if (!process.env.PEXELS_API_KEY && fs.existsSync(".env")) {
  const m = fs.readFileSync(".env", "utf8").match(/PEXELS_API_KEY\s*=\s*"?([^"\n\r]+)"?/);
  if (m) process.env.PEXELS_API_KEY = m[1];
}
const KEY = process.env.PEXELS_API_KEY;
const [, , query, outfile, skipArg] = process.argv;
if (!KEY) { console.error("set PEXELS_API_KEY"); process.exit(1); }
if (!query || !outfile) {
  console.error('usage: node pex-fresh.mjs "<query>" <out.mp4> [skipCount]');
  process.exit(1);
}
const skipCount = parseInt(skipArg || "0", 10);

// ── Build the "already used" id set from every credit sidecar on disk ──
const RENDER_ROOT = "F:/jade jones/render";
const used = new Set();
(function walk(dir) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".credit.json")) {
      // Skip the file we're about to write, so re-runs of the same target
      // don't count their own previous attempt as "used elsewhere".
      if (path.resolve(p) === path.resolve(outfile.replace(/\.[^.]+$/, "") + ".credit.json")) continue;
      try {
        const j = JSON.parse(fs.readFileSync(p, "utf8"));
        if (j.id) used.add(String(j.id));
      } catch {}
    }
  }
})(RENDER_ROOT);

const api = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=40&orientation=portrait&size=medium`;
const raw = execFileSync("curl", ["-s", "-H", `Authorization: ${KEY}`, api], { maxBuffer: 1e8, encoding: "utf8" });
const data = JSON.parse(raw);
const vids = data.videos || [];

const pickRendition = (v) => {
  const mp4 = v.video_files.filter(
    (f) => f.quality !== "hls" && (f.file_type || "").includes("mp4") && f.width && f.height,
  );
  const under = mp4.filter((f) => Math.min(f.width, f.height) <= 1080);
  under.sort((a, b) => Math.min(b.width, b.height) - Math.min(a.width, a.height));
  return under[0] || mp4[0];
};

const fresh = vids.filter((v) => !used.has(String(v.id)) && pickRendition(v));
const reused = vids.length - fresh.length;
console.log(`query="${query}"  total=${data.total_results}  page=${vids.length}  already-used=${reused}  fresh=${fresh.length}`);

const chosen = fresh[skipCount];
if (!chosen) { console.error(`no FRESH video at skip=${skipCount} (${fresh.length} available)`); process.exit(2); }
const r = pickRendition(chosen);
execFileSync("curl", ["-s", "-L", "-o", outfile, r.link], { maxBuffer: 1e8 });

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
console.log(`saved ${outfile} ${(fs.statSync(outfile).size / 1e6).toFixed(1)}MB  id=${chosen.id}  | credit: ${credit.photographer}`);
