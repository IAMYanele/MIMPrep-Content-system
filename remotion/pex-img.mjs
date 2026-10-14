// Pexels PHOTO sourcer via the OFFICIAL API (key auto-loaded from .env).
//   node pex-img.mjs "<query>" <outfile.jpg> [rank=0] [orientation=square]
// Writes a .credit.json sidecar (Pexels API terms ask for attribution).
import fs from "fs";
import { execFileSync } from "child_process";

if (!process.env.PEXELS_API_KEY && fs.existsSync(".env")) {
  const m = fs.readFileSync(".env", "utf8").match(/PEXELS_API_KEY\s*=\s*"?([^"\n\r]+)"?/);
  if (m) process.env.PEXELS_API_KEY = m[1];
}
const KEY = process.env.PEXELS_API_KEY;
const [, , query, outfile, rankArg, orient] = process.argv;
if (!KEY) { console.error("set PEXELS_API_KEY"); process.exit(1); }
if (!query || !outfile) { console.error('usage: node pex-img.mjs "<query>" <out.jpg> [rank] [orientation]'); process.exit(1); }
const rank = parseInt(rankArg || "0", 10);
const orientation = orient || "square";

const api = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&orientation=${orientation}`;
const raw = execFileSync("curl", ["-s", "-H", `Authorization: ${KEY}`, api], { maxBuffer: 1e8, encoding: "utf8" });
const data = JSON.parse(raw);
const photos = data.photos || [];
console.log(`query="${query}" [${orientation}]  total=${data.total_results}  page=${photos.length}`);
photos.slice(0, 6).forEach((p, i) => console.log(`  [${i}] id=${p.id} ${p.width}x${p.height} by ${p.photographer}`));

const p = photos[rank];
if (!p) { console.error("no photo at rank", rank); process.exit(2); }
// large is capped ~940px on the long edge — plenty for a ~250px card
const link = p.src.large || p.src.medium || p.src.original;
execFileSync("curl", ["-s", "-L", "-o", outfile, link], { maxBuffer: 1e8 });
fs.writeFileSync(
  outfile.replace(/\.[^.]+$/, "") + ".credit.json",
  JSON.stringify({ file: outfile, query, id: p.id, photographer: p.photographer, url: p.url }, null, 2),
);
fs.appendFileSync("broll-credits.txt", `Photo by ${p.photographer} on Pexels (${p.url})\n`);
console.log(`saved ${outfile} ${(fs.statSync(outfile).size / 1e3).toFixed(0)}KB | id=${p.id} by ${p.photographer}`);
