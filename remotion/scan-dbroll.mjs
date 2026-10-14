// One-off inventory of every video on the D: drive, grouped into practical
// categories so the reusable stock can be told apart from client footage,
// screen recordings and copyrighted TV rips.
//   node scan-dbroll.mjs > report.txt
import fs from "fs";
import path from "path";

const ROOT = "D:/";
const VID = /\.(mp4|mov|mkv|webm|m4v)$/i;
const out = [];

(function walk(d, depth) {
  if (depth > 6) return;
  let ents;
  try {
    ents = fs.readdirSync(d, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of ents) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (!/\$RECYCLE|System Volume/i.test(e.name)) walk(p, depth + 1);
    } else if (VID.test(e.name)) {
      let sz = 0;
      try {
        sz = fs.statSync(p).size;
      } catch {}
      out.push({ name: e.name, rel: p.slice(3).split(path.sep).join("/"), sz });
    }
  }
})(ROOT, 0);

const cat = (f) => {
  const n = f.name.toLowerCase();
  const r = f.rel.toLowerCase();
  if (/pexels|pixabay|videvo|coverr/.test(n)) return "STOCK - royalty-free";
  if (/overlay|light ?leak|lens ?flare|film ?(grain|dust|burn)|green ?screen|chroma/.test(r))
    return "OVERLAYS / effects";
  if (/motion background|animated background|3d grid|sci ?fi|particle|loop background/.test(n))
    return "MOTION BACKGROUNDS";
  if (r.startsWith("moviestvseriesbroll")) return "MOVIE / TV clips (copyrighted)";
  if (
    r.startsWith("screenrecordings") ||
    /^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}/.test(n) ||
    /screen ?rec|obs/.test(n)
  )
    return "SCREEN RECORDINGS";
  if (/^20\d{6}_\d{6}/.test(n) || /^(img|vid)[-_]?\d{8}/i.test(n)) return "PHONE / personal";
  if (/official (music )?video|official audio|lyrics|remix|\bsong\b/.test(n)) return "MUSIC / audio";
  if (r.startsWith("squire videos") || /^florida squire/.test(n)) return "CLIENT - Squire";
  if (r.startsWith("dr mini")) return "CLIENT - Dr Mini";
  if (/^(michelle|lauren|brent|matt ortiz)/.test(r)) return "CLIENT - other";
  if (/videoplayback/.test(n)) return "YOUTUBE rips (unlabelled)";
  return "UNSORTED / misc";
};

const groups = {};
for (const f of out) {
  const c = cat(f);
  (groups[c] = groups[c] || []).push(f);
}
const GB = (b) => (b / 1e9).toFixed(2);

console.log(
  `D: DRIVE VIDEO INVENTORY - ${out.length} files, ${GB(out.reduce((a, b) => a + b.sz, 0))} GB\n`,
);
for (const [c, list] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`### ${c}  -  ${list.length} files, ${GB(list.reduce((a, b) => a + b.sz, 0))} GB`);
  const byDir = {};
  list.forEach((f) => {
    const d = path.dirname(f.rel);
    byDir[d] = (byDir[d] || 0) + 1;
  });
  Object.entries(byDir)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .forEach(([d, n]) => console.log(`    ${n}x  ${d}`));
  console.log("");
}

console.log("\n=== STOCK CLIPS (directly reusable) ===");
(groups["STOCK - royalty-free"] || [])
  .sort((a, b) => a.rel.localeCompare(b.rel))
  .forEach((f) => {
    const m = f.name.match(/(\d{6,})/);
    console.log(`  id=${m ? m[1] : "?"}  ${(f.sz / 1e6).toFixed(1)}MB  ${f.rel}`);
  });
