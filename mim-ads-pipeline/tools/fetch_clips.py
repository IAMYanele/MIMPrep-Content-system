"""Download named library clips (by file name, from broll-index/library.json) at a given transcode.
usage: python fetch_clips.py <out_dir> <quality: 360|540|720|1080|2160|original> <name>...
"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
import fio_dl

SH = "de634cf2-ad86-4b1e-afef-d4148555feaf"
out, q = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
lib = json.load(open(os.path.join(os.path.dirname(__file__), "..", "broll-index", "library.json")))
for name in sys.argv[3:]:
    hits = [x for x in lib if x["name"].lower().startswith(name.lower())]
    if not hits:
        print("NOT IN LIBRARY:", name); continue
    a = fio_dl.detail(SH, hits[0]["id"])
    m = a.get("media") or {}
    tr = {str(t.get("height")): t for t in (m.get("videoTranscodes") or []) if t.get("downloadUrl")}
    t = tr.get(q) if q != "original" else None
    url = t["downloadUrl"] if t else (m.get("original") or {}).get("downloadUrl")
    if q != "original" and not t:
        print(f"{name}: no {q} transcode (have {sorted(tr)}), skipping"); continue
    dest = os.path.join(out, os.path.splitext(hits[0]["name"])[0] + ".mp4")
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        print("have", dest); continue
    subprocess.run(["curl", "-sSL", "--fail", "-A", "Mozilla/5.0", "-o", dest, url], check=True)
    bad = subprocess.run(["ffmpeg", "-v", "error", "-i", dest, "-f", "null", "-"], capture_output=True, text=True).stderr.strip()
    print(("CORRUPT " if bad else "ok ") + dest, f"{os.path.getsize(dest) / 1e6:.1f} MB", bad[:120])
