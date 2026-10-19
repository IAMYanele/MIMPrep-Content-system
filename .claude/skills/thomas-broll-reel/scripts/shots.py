"""Find the camera cuts in a landscape interview and the 9:16 crop that centres the face in each shot.

The first "Talk about your background" edit used ONE crop for the whole clip and both
faces sat left of centre. The source actually cut between two camera angles
(interviewer at 46.5% of frame width, Thomas at 56%) and a single crop can't centre
both. So: detect every cut, measure the face in each shot, crop per shot.

usage:
  python shots.py "<source.mp4>" --out <job>
writes <job>/shots.json and <job>/shots_sheet.jpg (one frame per shot with the crop
box and its centre line drawn on). Look at the sheet: the face should straddle the
line in every shot. Override any shot by editing "x0" in shots.json.
"""
import argparse, json, re, subprocess
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageDraw


def probe(src):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height:format=duration", "-of", "json", src],
                         capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    return j["streams"][0]["width"], j["streams"][0]["height"], float(j["format"]["duration"])


def cuts(src, threshold):
    """Scene changes from ffmpeg's scene score, analysed on a small copy for speed."""
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-vf",
                        f"scale=480:-2,select='gt(scene,{threshold})',showinfo", "-an", "-f", "null", "-"],
                       capture_output=True, text=True)
    return [float(m) for m in re.findall(r"pts_time:([\d.]+)", p.stderr)]


def grab(src, t, width=960):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1",
                          "-vf", f"scale={width}:-2", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    h = len(raw) // (width * 3)
    return np.frombuffer(raw, np.uint8).reshape(h, width, 3) if h else None


def face_x(img):
    fc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    fs = fc.detectMultiScale(g, 1.1, 5, minSize=(int(g.shape[0] * 0.08),) * 2)
    if not len(fs):
        return None
    x, y, w, h = max(fs, key=lambda r: r[2] * r[3])
    return (x + w / 2) / g.shape[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("--out", required=True)
    ap.add_argument("--threshold", type=float, default=0.12,
                    help="scene-change score; hard cuts between angles in one room score ~0.27, motion within a shot <0.03")
    ap.add_argument("--min-shot", type=float, default=0.6, help="ignore cuts closer together than this")
    a = ap.parse_args()
    W, H, dur = probe(a.src)
    if W <= H:
        raise SystemExit("Source is already vertical; no reframing needed. Use it as base.mp4 directly.")
    cw = int(round(H * 9 / 16)) // 2 * 2
    bounds = [0.0]
    for c in cuts(a.src, a.threshold):
        if c - bounds[-1] >= a.min_shot and dur - c >= a.min_shot:
            bounds.append(c)
    bounds.append(dur)

    shots, tiles = [], []
    for s, e in zip(bounds, bounds[1:]):
        ts = np.linspace(s + 0.25 * (e - s), e - 0.25 * (e - s), 5) if e - s > 1 else [(s + e) / 2]
        xs = [x for x in (face_x(f) for f in (grab(a.src, t) for t in ts) if f is not None) if x is not None]
        cx = float(np.median(xs)) if xs else 0.5
        x0 = int(np.clip(cx * W - cw / 2, 0, W - cw)) // 2 * 2
        shots.append({"start": round(s, 3), "end": round(e, 3), "face_cx": round(cx, 4), "x0": x0,
                      "crop_w": cw, "crop_h": H, "face_found": bool(xs)})
        f = grab(a.src, (s + e) / 2, 640)
        if f is not None:
            im = Image.fromarray(f); d = ImageDraw.Draw(im); k = 640 / W
            d.rectangle([x0 * k, 0, (x0 + cw) * k, im.height - 1], outline=(255, 0, 0), width=3)
            d.line([(x0 + cw / 2) * k, 0, (x0 + cw / 2) * k, im.height], fill=(255, 255, 0), width=1)
            d.rectangle([0, 0, 640, 18], fill=(0, 0, 0))
            d.text((4, 3), f"shot {len(shots)}  {s:.2f}-{e:.2f}s  face {cx:.1%}  x0={x0}"
                           + ("" if xs else "  NO FACE - check"), fill=(255, 220, 0))
            tiles.append(im)

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    json.dump({"src": a.src, "width": W, "height": H, "duration": dur, "shots": shots},
              open(out / "shots.json", "w"), indent=1)
    if tiles:
        sheet = Image.new("RGB", (640 * 2 + 6, (tiles[0].height + 6) * ((len(tiles) + 1) // 2)), (255, 255, 255))
        for i, t in enumerate(tiles):
            sheet.paste(t, ((i % 2) * 646, (i // 2) * (t.height + 6)))
        sheet.save(out / "shots_sheet.jpg", quality=85)
    for i, sh in enumerate(shots, 1):
        print(f"shot {i}: {sh['start']:6.2f}-{sh['end']:6.2f}s  face at {sh['face_cx']:.1%}  x0={sh['x0']}"
              + ("" if sh["face_found"] else "  (no face found: set x0 by hand)"))


if __name__ == "__main__":
    main()
