"""Scan video footage for cover-grade frames of Thomas: big, sharp, still face, mouth closed.

Samples every --step seconds, scores each frame, keeps the best few per clip (at least
--gap seconds apart) and writes a labelled contact sheet plus a JSON list. Every tile
carries its own "file @ time" label drawn into the image, so a missing tile can never
shift the labels (an ffmpeg tile sheet did exactly that and mislabelled clips).

Use the RAW footage of the shoot (4K if it exists), not the edited reel: edited reels
have burned-in captions across his chest and are often cropped from 1080p.

usage:
  python find_frames.py --out scan "F:/cv review dubao/INDIVIDUAL CVS UNCLIPPED"
  python find_frames.py --out scan raw/q6-4k.mp4 raw/q8-4k.mp4 --step 0.5 --top 40
"""
import argparse, json, os
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

VIDEO = (".mp4", ".mov", ".m4v", ".mkv")


def scan(args):
    path, step, keep, gap = args
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    dur = cap.get(cv2.CAP_PROP_FRAME_COUNT) / fps
    fc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    rows = []
    for t in np.arange(1.0, max(1.0, dur - 1.0), step):
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, fr = cap.read()
        if not ok:
            continue
        H, W = fr.shape[:2]
        s = 960 / max(H, W)
        g = cv2.cvtColor(cv2.resize(fr, None, fx=s, fy=s), cv2.COLOR_BGR2GRAY)
        faces = fc.detectMultiScale(g, 1.1, 6, minSize=(int(min(g.shape) * 0.12),) * 2)
        if not len(faces):
            continue
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
        face = g[y:y + h, x:x + w].astype(np.float32)
        cap.set(cv2.CAP_PROP_POS_MSEC, (t + 0.25) * 1000); ok2, fr2 = cap.read()
        if not ok2:
            continue
        g2 = cv2.cvtColor(cv2.resize(fr2, None, fx=s, fy=s), cv2.COLOR_BGR2GRAY).astype(np.float32)
        motion = float(np.abs(g2[y:y + h, x:x + w] - face).mean())
        my = int(h * 0.65)                               # lower face: moving = talking
        mouth = float(np.abs(g2[y + my:y + h, x:x + w] - face[my:]).mean())
        sharp = float(cv2.Laplacian(face.astype(np.uint8), cv2.CV_64F).var())
        expo = float(face.mean())
        score = sharp / (1 + motion * 0.6) / (1 + mouth * 0.4) * (w * h) ** 0.25
        if expo < 50 or expo > 215:
            score *= 0.4
        rows.append({"file": path, "t": round(float(t), 2), "score": score, "res": [W, H],
                     "face": [int(v / s) for v in (x, y, w, h)]})
    rows.sort(key=lambda r: -r["score"])
    picked = []
    for r in rows:
        if all(abs(r["t"] - p["t"]) >= gap for p in picked):
            picked.append(r)
        if len(picked) >= keep:
            break
    return picked


def tile(r, size=(300, 420)):
    cap = cv2.VideoCapture(r["file"]); cap.set(cv2.CAP_PROP_POS_MSEC, r["t"] * 1000); ok, fr = cap.read()
    if not ok:
        return None
    x, y, w, h = r["face"]
    H, W = fr.shape[:2]
    cw = min(W, int(w * 4.2)); ch = min(H, int(cw * 1.4))
    cx, cy = x + w // 2, y + int(h * 1.4)
    l = int(np.clip(cx - cw / 2, 0, W - cw)); t = int(np.clip(cy - ch / 2, 0, H - ch))
    im = Image.fromarray(cv2.cvtColor(fr[t:t + ch, l:l + cw], cv2.COLOR_BGR2RGB)).resize(size)
    d = ImageDraw.Draw(im)
    label = f"{Path(r['file']).stem[-18:]} @{r['t']:.1f}s"
    d.rectangle([0, 0, size[0], 20], fill=(0, 0, 0)); d.text((4, 3), label, fill=(255, 220, 0))
    d.text((4, size[1] - 16), f"{r['res'][0]}x{r['res'][1]}", fill=(255, 255, 255))
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inputs", nargs="+", help="video files or folders")
    ap.add_argument("--out", required=True)
    ap.add_argument("--step", type=float, default=1.0)
    ap.add_argument("--per-clip", type=int, default=6)
    ap.add_argument("--gap", type=float, default=2.0)
    ap.add_argument("--top", type=int, default=36)
    ap.add_argument("--workers", type=int, default=4)
    a = ap.parse_args()
    files = []
    for i in a.inputs:
        p = Path(i)
        files += sorted(str(f) for f in p.iterdir() if f.suffix.lower() in VIDEO) if p.is_dir() else [str(p)]
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    with ProcessPoolExecutor(min(a.workers, len(files)) or 1) as ex:
        res = [r for rs in ex.map(scan, [(f, a.step, a.per_clip, a.gap) for f in files]) for r in rs]
    res.sort(key=lambda r: -r["score"])
    res = res[:a.top]
    json.dump(res, open(out / "frames.json", "w"), indent=1)
    tiles = [t for t in (tile(r) for r in res) if t is not None]
    cols = 6
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 304, max(1, rows) * 424), (20, 20, 20))
    for k, t in enumerate(tiles):
        sheet.paste(t, ((k % cols) * 304, (k // cols) * 424))
    sheet.save(out / "frames_sheet.jpg", quality=85)
    print(f"{len(files)} clips -> {len(res)} candidate frames: {out / 'frames_sheet.jpg'}")
    print("Ranked by sharpness and stillness only. Look at the sheet: pick a composed pose, eyes on or near")
    print("camera, mouth closed. The score cannot judge expression.")


if __name__ == "__main__":
    main()
