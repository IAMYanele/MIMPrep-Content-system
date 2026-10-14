// Pexels B-roll sourcer (no API key): curl-scrape search HTML → pick ~1080p rendition → download.
//   node pex-source.mjs "<query>" <outfile.mp4> [rank=0]
// Prints the top candidates so a different rank can be chosen if rank 0 is off-topic.
import fs from "fs";
import { execFileSync } from "child_process";

const [, , query, outfile, rankArg] = process.argv;
if (!query || !outfile) {
  console.error('Usage: node pex-source.mjs "<query>" <outfile.mp4> [rank]');
  process.exit(1);
}
const rank = parseInt(rankArg || "0", 10);
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function curl(url, binary) {
  const args = ["-sL", "-A", UA, url];
  if (binary) {
    return execFileSync("curl", ["--output", "-", ...args], {
      maxBuffer: 1024 * 1024 * 200,
      encoding: "buffer",
    });
  }
  return execFileSync("curl", args, { maxBuffer: 1024 * 1024 * 50, encoding: "utf8" });
}

let html = curl(`https://www.pexels.com/search/videos/${encodeURIComponent(query)}/`, false);
html = html.replace(/\\u002[fF]/g, "/");

const urlRe = /https:\/\/videos\.pexels\.com\/video-files\/\d+\/[^"\\ ]+?\.mp4/g;
const urls = [...new Set(html.match(urlRe) || [])];
const byId = {};
for (const u of urls) {
  const m = u.match(/video-files\/(\d+)\/[^_]*[-_](\d+)_(\d+)_\d+fps/);
  if (!m) continue;
  (byId[m[1]] ??= []).push({ url: u, w: +m[2], h: +m[3] });
}
// relevance order = first appearance of each id in the HTML
const order = [];
const seen = new Set();
for (const s of html.match(/video-files\/(\d+)\//g) || []) {
  const id = s.match(/(\d+)/)[1];
  if (!seen.has(id)) { seen.add(id); order.push(id); }
}
const ids = order.filter((id) => byId[id]);
const pick = (arr) => {
  const under = arr
    .filter((r) => Math.min(r.w, r.h) <= 1080)
    .sort((a, b) => Math.min(b.w, b.h) - Math.min(a.w, a.h));
  return under[0] || arr.slice().sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h))[0];
};

console.log(`query="${query}"  ${ids.length} videos`);
ids.slice(0, 8).forEach((id, i) => {
  const b = pick(byId[id]);
  console.log(`  [${i}] id=${id} ${b.w}x${b.h}`);
});

const chosen = ids[rank];
if (!chosen) { console.error("no candidate at rank", rank); process.exit(2); }
const best = pick(byId[chosen]);
console.log(`→ downloading rank ${rank} id=${chosen} ${best.w}x${best.h}`);
const buf = curl(best.url, true);
fs.writeFileSync(outfile, buf);
console.log(`saved ${outfile} ${(buf.length / 1e6).toFixed(1)}MB (${best.w}x${best.h})`);
