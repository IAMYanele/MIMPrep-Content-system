// Pexels PHOTO sourcer (no API key): curl-scrape search HTML → square-crop → download.
//   node pex-photo.mjs "<query>" <outfile.jpg> [rank=0]
import fs from "fs";
import { execFileSync } from "child_process";

const [, , query, outfile, rankArg] = process.argv;
if (!query || !outfile) {
  console.error('Usage: node pex-photo.mjs "<query>" <outfile.jpg> [rank]');
  process.exit(1);
}
const rank = parseInt(rankArg || "0", 10);
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function curl(url, binary) {
  const args = ["-sL", "-A", UA, url];
  if (binary) {
    return execFileSync("curl", ["--output", "-", ...args], {
      maxBuffer: 1024 * 1024 * 100,
      encoding: "buffer",
    });
  }
  return execFileSync("curl", args, { maxBuffer: 1024 * 1024 * 50, encoding: "utf8" });
}

let html = curl(`https://www.pexels.com/search/${encodeURIComponent(query)}/`, false);
html = html.replace(/\\u002[fF]/g, "/");

// relevance order = first appearance of each photo id
const order = [];
const seen = new Set();
for (const s of html.match(/images\.pexels\.com\/photos\/(\d+)\//g) || []) {
  const id = s.match(/(\d+)/)[1];
  if (!seen.has(id)) {
    seen.add(id);
    order.push(id);
  }
}

console.log(`query="${query}"  ${order.length} photos`);
order.slice(0, 8).forEach((id, i) => console.log(`  [${i}] id=${id}`));

const chosen = order[rank];
if (!chosen) {
  console.error("no candidate at rank", rank);
  process.exit(2);
}
// build a clean 800x800 center-crop URL
const url = `https://images.pexels.com/photos/${chosen}/pexels-photo-${chosen}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=800`;
console.log(`→ downloading rank ${rank} id=${chosen}`);
const buf = curl(url, true);
fs.writeFileSync(outfile, buf);
console.log(`saved ${outfile} ${(buf.length / 1e3).toFixed(0)}KB`);
