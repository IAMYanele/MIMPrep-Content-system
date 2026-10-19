"""Rank a photo library for cover-grade portraits of Thomas and draw labelled contact sheets.

Walks the folders (jpg/png/webp/heic), scores each image on resolution, face size and
face sharpness, and writes sheets with the FILENAME drawn on every tile, so picks are
never mislabelled. Scores are cached in <out>/photo_index.json (by path + mtime), so
re-runs over the same library only open new files.

usage:
  python photo_sheet.py --out photos "F:/thomas pics" "F:/thomas content/b-roll stills"
  python photo_sheet.py --out photos "F:/thomas pics" --top 48 --min-mp 6
"""
import argparse, json, os
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageOps, ImageDraw

EXT = (".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif")


def open_image(p, max_side=1600):
    try:
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        pass
    im = Image.open(p)
    full = im.size
    if im.getexif().get(274) in (5, 6, 7, 8):      # EXIF orientation rotates it 90 degrees
        full = (full[1], full[0])
    im.draft("RGB", (max_side, max_side))
    im = ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((max_side, max_side))
    return im, full


def score(p):
    try:
        im, full = open_image(p)
    except Exception as e:
        return {"path": p, "error": str(e)}
    g = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2GRAY)
    fc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = fc.detectMultiScale(g, 1.1, 6, minSize=(int(min(g.shape) * 0.06),) * 2)
    mp = full[0] * full[1] / 1e6
    r = {"path": p, "mp": round(mp, 1), "w": full[0], "h": full[1], "faces": int(len(faces))}
    if len(faces):
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        r["face_frac"] = round(w * h / (g.shape[0] * g.shape[1]), 4)
        r["sharp"] = round(float(cv2.Laplacian(g[y:y + h, x:x + w], cv2.CV_64F).var()), 1)
        r["score"] = round(r["sharp"] ** 0.5 * min(r["face_frac"] * 40, 1.5) * min(mp / 8, 1.5), 2)
    else:
        r["score"] = 0.0
    return r


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folders", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--top", type=int, default=60)
    ap.add_argument("--min-mp", type=float, default=2.0, help="skip images below this many megapixels")
    ap.add_argument("--include-no-face", action="store_true", help="also show images with no detected face")
    ap.add_argument("--workers", type=int, default=6)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    idx_path = out / "photo_index.json"
    cache = json.load(open(idx_path)) if idx_path.exists() else {}
    files = [str(p) for f in a.folders for p in Path(f).rglob("*") if p.suffix.lower() in EXT]
    key = lambda p: f"{p}|{os.path.getmtime(p):.0f}"
    todo = [p for p in files if key(p) not in cache]
    if todo:
        with ProcessPoolExecutor(a.workers) as ex:
            for p, r in zip(todo, ex.map(score, todo, chunksize=4)):
                cache[key(p)] = r
        json.dump(cache, open(idx_path, "w"), indent=0)
    rows = [cache[key(p)] for p in files]
    rows = [r for r in rows if "error" not in r and r["mp"] >= a.min_mp and (r["faces"] or a.include_no_face)]
    rows.sort(key=lambda r: -r["score"])
    rows = rows[:a.top]
    json.dump(rows, open(out / "photos_ranked.json", "w"), indent=1)

    cols, tw, th = 6, 300, 400
    per = cols * 4
    for s in range(0, len(rows), per):
        chunk = rows[s:s + per]
        sheet = Image.new("RGB", (cols * (tw + 4), ((len(chunk) + cols - 1) // cols) * (th + 4)), (20, 20, 20))
        for k, r in enumerate(chunk):
            im, _ = open_image(r["path"], 800)
            im = ImageOps.fit(im, (tw, th), centering=(0.5, 0.35))
            d = ImageDraw.Draw(im)
            d.rectangle([0, 0, tw, 20], fill=(0, 0, 0)); d.text((4, 3), Path(r["path"]).name[-30:], fill=(255, 220, 0))
            d.text((4, th - 16), f"{r['mp']}MP {r['w']}x{r['h']}", fill=(255, 255, 255))
            sheet.paste(im, ((k % cols) * (tw + 4), (k // cols) * (th + 4)))
        sheet.save(out / f"photos_sheet_{s // per}.jpg", quality=85)
    print(f"{len(files)} images, {len(todo)} newly scored -> {len(rows)} on sheets in {out}")


if __name__ == "__main__":
    main()
