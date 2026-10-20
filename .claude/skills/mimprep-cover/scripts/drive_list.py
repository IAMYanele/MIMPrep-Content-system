"""List the UGC creators' public ("anyone with the link") Drive folders recursively, no login needed,
and optionally build a thumbnail contact sheet (2 clips per sub-folder) to pick the best-looking takes.
usage: python drive_list.py --out <dir> [--sheet] <folderId>:<Name> [<folderId>:<Name> ...]
Writes <dir>/index.json (id, path) and <dir>/thumbs.json + <dir>/sheet.jpg with --sheet."""
import argparse, html, io, json, re, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageDraw

def ls(fid):
    h = urllib.request.urlopen(f"https://drive.google.com/embeddedfolderview?id={fid}", timeout=30).read().decode("utf-8", "ignore")
    for m in re.finditer(r'<div class="flip-entry" id="entry-([A-Za-z0-9_-]+)".*?href="([^"]+)".*?flip-entry-title">([^<]+)<', h, re.S):
        yield m.group(1), "/folders/" in html.unescape(m.group(2)), html.unescape(m.group(3))
def walk(fid, path, out):
    for eid, is_dir, title in ls(fid):
        if is_dir: walk(eid, f"{path}/{title}", out)
        else: out.append({"id": eid, "path": f"{path}/{title}"})

ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); ap.add_argument("--sheet", action="store_true"); ap.add_argument("folders", nargs="+")
a = ap.parse_args(); out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
res = []
for f in a.folders:
    fid, name = f.split(":", 1); walk(fid, name, res)
json.dump(res, open(out / "index.json", "w"), indent=1)
print(len(res), "files ->", out / "index.json")
if a.sheet:
    vids = [r for r in res if r["path"].lower().endswith((".mov", ".mp4", ".jpg", ".jpeg", ".png", ".heic"))]
    pick = []
    for r in vids:
        folder = r["path"].rsplit("/", 1)[0]
        if sum(p["path"].rsplit("/", 1)[0] == folder for p in pick) < 2: pick.append(r)
    def th(r):
        try: return r, Image.open(io.BytesIO(urllib.request.urlopen(f"https://drive.google.com/thumbnail?id={r['id']}&sz=w600", timeout=30).read())).convert("RGB")
        except Exception: return r, None
    with ThreadPoolExecutor(8) as ex: got = [x for x in ex.map(th, pick) if x[1] is not None]
    json.dump([r for r, _ in got], open(out / "thumbs.json", "w"), indent=1)
    cols = 12; rows = (len(got) + cols - 1) // cols; sheet = Image.new("RGB", (200 * cols, 380 * rows))
    for i, (r, im) in enumerate(got):
        im.thumbnail((200, 356)); c = Image.new("RGB", (200, 380)); c.paste(im, (0, 24)); d = ImageDraw.Draw(c)
        d.text((3, 2), f"{i} {r['path'].split('/')[0]}", fill=(255, 80, 80)); d.text((3, 12), r["path"].split("/")[-2][:30], fill=(255, 255, 0))
        sheet.paste(c, ((i % cols) * 200, (i // cols) * 380))
    sheet.save(out / "sheet.jpg", quality=85); print(len(got), "thumbnails ->", out / "sheet.jpg (index i = thumbs.json[i])")
