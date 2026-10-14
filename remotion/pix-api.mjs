// Pixabay sourcer via the official API (needs PIXABAY_API_KEY, auto-loaded from .env).
//   node pix-api.mjs <video|photo> "<query>" <outfile> [rank=0]
// Photos: high-res, orientation=vertical (great for food popups).
// Videos: LANDSCAPE only (Pixabay has no portrait filter) — fallback to Pexels for vertical B-roll.
// Pixabay terms: download to disk (no hotlinking) — we do. Rate limit 100 req / 60s.
import fs from "fs";
import crypto from "crypto";
import { execFileSync } from "child_process";

if (!process.env.PIXABAY_API_KEY && fs.existsSync(".env")) {
  const m = fs.readFileSync(".env", "utf8").match(/PIXABAY_API_KEY\s*=\s*"?([^"\n\r]+)"?/);
  if (m) process.env.PIXABAY_API_KEY = m[1];
}
const KEY = process.env.PIXABAY_API_KEY;
const [, , mode, query, outfile, rankArg] = process.argv;
if (!KEY) { console.error("set PIXABAY_API_KEY"); process.exit(1); }
if (!["video", "photo"].includes(mode) || !query || !outfile) {
  console.error('usage: node pix-api.mjs <video|photo> "<query>" <outfile> [rank]');
  process.exit(1);
}
const rank = parseInt(rankArg || "0", 10);
const dl = (url, out) => execFileSync("curl", ["-s", "-L", "-o", out, url], { maxBuffer: 1e8 });

const base = mode === "video"
  ? `https://pixabay.com/api/videos/?key=${KEY}&q=${encodeURIComponent(query)}&per_page=30&safesearch=true&video_type=film`
  : `https://pixabay.com/api/?key=${KEY}&q=${encodeURIComponent(query)}&per_page=30&safesearch=true&image_type=photo&orientation=vertical`;

// Pixabay TOS: "requests must be cached for 24 hours." Cache the JSON response by query, reuse if <24h.
const CACHE_DIR = ".api-cache";
fs.mkdirSync(CACHE_DIR, { recursive: true });
const cacheFile = `${CACHE_DIR}/pixabay-${mode}-${crypto.createHash("md5").update(base).digest("hex").slice(0, 12)}.json`;
const fresh = fs.existsSync(cacheFile) && Date.now() - fs.statSync(cacheFile).mtimeMs < 24 * 3600 * 1000;
if (!fresh) {
  const raw = execFileSync("curl", ["-s", base], { maxBuffer: 1e8, encoding: "utf8" });
  fs.writeFileSync(cacheFile, raw);
}
console.log(fresh ? "(cached <24h)" : "(fresh fetch)");
const data = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
const hits = data.hits || [];
console.log(`[${mode}] query="${query}"  total=${data.total}  returned=${hits.length}`);

const chosen = hits[rank];
if (!chosen) { console.error("no result at rank", rank); process.exit(2); }

let link, dims;
if (mode === "video") {
  // pick smallest rendition whose height >= 1080, else the largest available
  const rends = Object.values(chosen.videos).filter((v) => v.url);
  const tall = rends.filter((v) => v.height >= 1080).sort((a, b) => a.height - b.height);
  const pick = tall[0] || rends.sort((a, b) => b.height - a.height)[0];
  link = pick.url; dims = `${pick.width}x${pick.height}`;
} else {
  link = chosen.largeImageURL || chosen.webformatURL;
  dims = `${chosen.imageWidth}x${chosen.imageHeight}`;
}

hits.slice(0, 6).forEach((h, i) =>
  console.log(`  [${i}] id=${h.id} by ${h.user}  tags="${(h.tags || "").slice(0, 46)}"`),
);
console.log(`-> downloading rank ${rank} id=${chosen.id} ${dims} by ${chosen.user}`);
dl(link, outfile);

const credit = { file: outfile, mode, query, author: chosen.user, page_url: chosen.pageURL, id: chosen.id };
fs.writeFileSync(outfile.replace(/\.[^.]+$/, "") + ".credit.json", JSON.stringify(credit, null, 2));
fs.appendFileSync("broll-credits.txt", `${mode} by ${credit.author} on Pixabay (${credit.page_url})\n`);
console.log(`saved ${outfile} ${(fs.statSync(outfile).size / 1e6).toFixed(1)}MB  | credit: ${credit.author}`);
