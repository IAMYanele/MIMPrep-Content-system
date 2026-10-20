"""Hide the student's face in a 16:9 Zoom cut: a face-only MOSAIC, or a soft BLUR over the head.

MiM Prep has no authorization to show students (Thomas, 2026-10-20), so this runs on every
session reel before anything else. Make both variants: Thomas asked for the mosaic and the user
asked to keep the soft blur as the alternative.

  mosaic  square blocks (~9 across the face) on an ellipse from forehead to chin; hair and
          background untouched. A block is mosaicked when its centre is inside the ellipse,
          so the edge is whole blocks, the classic mosaic look.
  blur    pixelate to 1/22 then Gaussian, on a feathered ellipse well past the head.

Tracking: Haar frontal, then profile both ways, inside the student's tile; keep the detection
nearest the last one (a cushion or a hand can fire); interpolate gaps, hold at the ends,
smooth +-5 frames (size never shrinks below the nearby max). Zoom's green speaker border is
replaced by the pixels just inside it before averaging, or it tints the bottom blocks/blur
green whenever the student talks. Prints how much of each detected face the mosaic covers:
it must be 100%. Audio is copied untouched.

usage:
  python hide_student.py "<cut.mp4>" "<cut - mosaic.mp4>" --layout <job>/layout.json --mode mosaic --boxes <job>/boxes.json
  python hide_student.py "<cut.mp4>" "<cut - blur.mp4>"   --layout <job>/layout.json --mode blur   --boxes <job>/boxes.json
(--boxes caches the tracking: the second run skips detection.)
"""
import argparse, json, os, subprocess
import cv2, numpy as np


def detect(gray, tile, casc, prof):
    x0, y0, w0, h0 = tile
    t = gray[y0:y0 + h0, x0:x0 + w0]
    out = [tuple(r) for r in casc.detectMultiScale(t, 1.08, 4, minSize=(h0 // 7, h0 // 7))]
    if not out:
        out = [tuple(r) for r in prof.detectMultiScale(t, 1.08, 4, minSize=(h0 // 7, h0 // 7))]
        flip = cv2.flip(t, 1)
        out += [(w0 - x - w, y, w, h) for x, y, w, h in prof.detectMultiScale(flip, 1.08, 4, minSize=(h0 // 7, h0 // 7))]
    return [(x0 + x + w / 2, y0 + y + h / 2, float(w)) for x, y, w, h in out]


def track(src, tile, default):
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    prof = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
    cap = cv2.VideoCapture(src)
    raw, last = [], tuple(default)
    fw = default[2]
    while True:                                     # boxes only: holding every frame would need ~5GB
        ok, f = cap.read()
        if not ok:
            break
        cands = detect(cv2.equalizeHist(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)), tile, casc, prof)
        cands = [c for c in cands if 0.6 * fw <= c[2] <= 1.75 * fw and abs(c[0] - last[0]) < 1.1 * fw and abs(c[1] - last[1]) < fw]
        if cands:
            last = min(cands, key=lambda c: abs(c[0] - last[0]) + abs(c[1] - last[1]))
            raw.append(last)
        else:
            raw.append(None)
    n = len(raw); hits = [i for i, r in enumerate(raw) if r]
    boxes = []
    for i in range(n):
        if raw[i]:
            boxes.append(raw[i]); continue
        prv = max((k for k in hits if k < i), default=None); nxt = min((k for k in hits if k > i), default=None)
        if prv is None and nxt is None:
            boxes.append(tuple(default))
        elif prv is None or nxt is None:
            boxes.append(raw[prv if nxt is None else nxt])
        else:
            u = (i - prv) / (nxt - prv)
            boxes.append(tuple(raw[prv][k] + u * (raw[nxt][k] - raw[prv][k]) for k in range(3)))
    b = np.array(boxes); k = 5
    sm = np.array([b[max(0, i - k):i + k + 1].mean(0) for i in range(n)])
    sm[:, 2] = [b[max(0, i - k):i + k + 1, 2].max() for i in range(n)]
    print(f"{n} frames, face found in {len(hits)} ({100 * len(hits) / max(n, 1):.0f}%), the rest interpolated/held")
    return raw, sm


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--layout", required=True, help="measure_layout.py output")
    ap.add_argument("--mode", choices=("mosaic", "blur"), default="mosaic")
    ap.add_argument("--boxes", help="tracking cache (written on the first run, reused after)")
    a = ap.parse_args()
    lay = json.load(open(a.layout))
    tile = lay["student_tile"]
    if a.boxes and os.path.exists(a.boxes):
        c = json.load(open(a.boxes)); raw = [tuple(r) if r else None for r in c["raw"]]; sm = np.array(c["smooth"])
        print(f"tracking reused from {a.boxes}")
    else:
        raw, sm = track(a.src, tile, lay["student_face"])
        if a.boxes:
            json.dump({"raw": [list(r) if r else None for r in raw], "smooth": sm.round(1).tolist()}, open(a.boxes, "w"))

    cap = cv2.VideoCapture(a.src)
    fps = cap.get(cv2.CAP_PROP_FPS); W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", f"{fps}",
                           "-i", "-", "-i", a.src, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", "16",
                           "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", a.out], stdin=subprocess.PIPE)
    tx, ty, tw, th = tile
    B = max(10, int(round(float(np.median(sm[:, 2])) / 9)))   # ~9 blocks across the face, one size for the whole clip
    gw, gh = tw // B, th // B
    yy, xx = np.mgrid[0:gh, 0:gw]
    bcx, bcy = xx * B + B / 2, yy * B + B / 2
    cover, low = [], 0
    for i, (cx, cy, w) in enumerate(sm):
        ok, f = cap.read()
        if not ok:
            break
        tilepx = f[ty:ty + th, tx:tx + tw]
        src = tilepx.copy()
        src[:6] = src[6]; src[-6:] = src[-7]; src[:, :6] = src[:, 6:7]; src[:, -6:] = src[:, -7:-6]
        if a.mode == "mosaic":
            ex, ey, ax, ay = cx - tx, cy - ty + 0.05 * w, 0.62 * w, 0.82 * w
            blk = ((bcx - ex) / ax) ** 2 + ((bcy - ey) / ay) ** 2 <= 1.0
            small = cv2.resize(src[:gh * B, :gw * B], (gw, gh), interpolation=cv2.INTER_AREA)
            mos = cv2.resize(small, (gw * B, gh * B), interpolation=cv2.INTER_NEAREST)
            m = np.kron(blk, np.ones((B, B), bool))
            region = tilepx[:gh * B, :gw * B]
            region[m] = mos[m]
            if i < len(raw) and raw[i]:
                rx, ry, rw = raw[i]
                full = np.zeros((th, tw), bool); full[:gh * B, :gw * B] = m
                x0, x1 = int(rx - tx - 0.35 * rw), int(rx - tx + 0.35 * rw)
                y0, y1 = int(ry - ty - 0.35 * rw), int(ry - ty + 0.35 * rw)
                c = full[max(0, y0):y1, max(0, x0):x1].mean()
                cover.append(c); low += c < 0.98
        else:
            small = cv2.resize(src, (tw // 22, th // 22), interpolation=cv2.INTER_AREA)
            heavy = cv2.GaussianBlur(cv2.resize(small, (tw, th), interpolation=cv2.INTER_LINEAR), (0, 0), 14)
            mask = np.zeros((th, tw), np.float32)
            cv2.ellipse(mask, (int(cx - tx), int(cy - ty - 0.08 * w)), (int(0.95 * w), int(1.35 * w)), 0, 0, 360, 1.0, -1)
            mask = cv2.GaussianBlur(mask, (0, 0), 0.12 * w)[..., None]
            f[ty:ty + th, tx:tx + tw] = (tilepx * (1 - mask) + heavy * mask).astype(np.uint8)
        ff.stdin.write(f.tobytes())
    ff.stdin.close(); ff.wait()
    if cover:
        print(f"mosaic block {B}px; face core covered: min {min(cover):.0%}, frames under 98%: {low} of {len(cover)}")
        if low:
            print("NOT SAFE TO POST: part of the face shows in those frames. Widen the ellipse or fix the tracking.")
    print("wrote", a.out)


if __name__ == "__main__":
    main()
