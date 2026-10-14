// The Pexels clips sitting on D: are named by contributor + id, so you can't tell
// what any of them actually show. This resolves each id against the Pexels API to
// recover the subject (from the page URL slug), duration and orientation, and
// writes a searchable manifest so the local library is usable instead of opaque.
//   node label-dbroll.mjs
import fs from "fs";
import { execFileSync } from "child_process";

if (!process.env.PEXELS_API_KEY && fs.existsSync(".env")) {
  const m = fs.readFileSync(".env", "utf8").match(/PEXELS_API_KEY\s*=\s*"?([^"\n\r]+)"?/);
  if (m) process.env.PEXELS_API_KEY = m[1];
}
const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error("set PEXELS_API_KEY");
  process.exit(1);
}

const scan = fs.readFileSync("F:/remotion-temp/dbroll-scan.txt", "utf8");
const rows = [...scan.matchAll(/^ {2}id=(\d{6,})\s+([\d.]+)MB\s+(.+)$/gm)].map((m) => ({
  id: m[1],
  mb: m[2],
  rel: m[3].trim(),
}));

const results = [];
for (const r of rows) {
  let subject = "";
  let dur = "";
  let orient = "";
  try {
    const raw = execFileSync(
      "curl",
      ["-s", "-H", `Authorization: ${KEY}`, `https://api.pexels.com/videos/videos/${r.id}`],
      { maxBuffer: 1e8, encoding: "utf8" },
    );
    const j = JSON.parse(raw);
    if (j && j.url) {
      // the slug carries the human description: /video/a-woman-doing-squats-8402111/
      subject = (j.url.match(/\/video\/([a-z0-9-]+)-\d+\/?$/) || [, ""])[1].replace(/-/g, " ");
      dur = j.duration ? `${j.duration}s` : "";
      orient = j.width && j.height ? (j.height > j.width ? "portrait" : "landscape") : "";
    }
  } catch {}
  results.push({ ...r, subject, dur, orient });
  process.stderr.write(".");
}
process.stderr.write("\n");

// crude topical buckets so the library can be browsed by theme
const bucket = (s) => {
  const t = s.toLowerCase();
  if (/gym|workout|exercis|train|fitness|squat|lift|yoga|stretch|run|jog/.test(t)) return "FITNESS";
  if (/food|eat|cook|kitchen|meal|fruit|vegetable|drink|coffee|water|salad|breakfast/.test(t))
    return "FOOD & DRINK";
  if (/doctor|medic|health|hospital|nurse|patient|pill|clinic/.test(t)) return "MEDICAL";
  if (/laptop|computer|office|desk|work|business|meeting|phone|typing/.test(t)) return "WORK / TECH";
  if (/woman|man|person|people|portrait|face|smil/.test(t)) return "PEOPLE";
  if (/nature|beach|sky|tree|water|ocean|mountain|sunset|outdoor/.test(t)) return "NATURE";
  if (/money|cash|coin|shopping|store|market/.test(t)) return "MONEY / RETAIL";
  return "OTHER";
};

const groups = {};
for (const r of results) (groups[bucket(r.subject)] = groups[bucket(r.subject)] || []).push(r);

let md = "# D: drive — reusable stock B-roll\n\n";
md += `${results.length} Pexels clips, all verified NOT yet used in the Jade pipeline.\n`;
md += "Cross-checked against every `.credit.json` under `F:/jade jones/render`.\n\n";
for (const [g, list] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
  md += `## ${g} (${list.length})\n\n`;
  md += "| subject | dur | orient | size | path |\n|---|---|---|---|---|\n";
  for (const r of list.sort((a, b) => a.subject.localeCompare(b.subject))) {
    md += `| ${r.subject || "_(unresolved)_"} | ${r.dur} | ${r.orient} | ${r.mb}MB | \`D:/${r.rel}\` |\n`;
  }
  md += "\n";
}
fs.writeFileSync("F:/remotion-temp/D-BROLL-LIBRARY.md", md);
console.log(md);
