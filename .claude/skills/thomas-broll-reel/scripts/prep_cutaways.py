"""Cut each planned cutaway to a 1080x1920 clip cropped on its actual subject, and prove it moves.

Reads <job>/cutaways.json, a list like:
  [{"clip": "F:/thomas b-roll/fx30 SW20250925_0020.MP4", "in": 4.2, "dur": 2.1, "at": 10.2,
    "cx": null, "why": "Thomas at a laptop - over 'grew up in France'"}]
"at" is when it appears in base.mp4 (output time). "cx" is the horizontal centre of the
crop, 0-1. Leave it null and it is measured: faces and people across the whole window
(not one frame: a walking group drifts), centred on the group. A centre crop missed
people, and the 0:30 campus shot was first cropped on the EHL sign with the people at
the edge; the user had to ask for them in the middle.

Writes <job>/public/broll/NN.mp4, <job>/broll.json (for the comp) and
<job>/cutaways_sheet.jpg (first + last frame of each, with the centre line) to check.

usage:  python prep_cutaways.py --job <job>
"""
import argparse, json, subprocess
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageDraw

HOG = cv2.HOGDescriptor(); HOG.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
FACE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def probe(f):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height:stream_side_data=rotation:format=duration", "-of", "json", f],
                                  capture_output=True, text=True).stdout)
    s = j["streams"][0]; w, h = s["width"], s["height"]
    if any(abs(int(d.get("rotation", 0))) == 90 for d in s.get("side_data_list", []) or []):
        w, h = h, w
    return w, h, float(j["format"]["duration"])


def grab(f, t, width=960):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", f, "-frames:v", "1", "-vf",
                          f"scale={width}:-2", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    h = len(raw) // (width * 3)
    return np.frombuffer(raw, np.uint8).reshape(h, width, 3) if h else None


def subject_cx(f, t0, dur):
    xs = []
    for t in np.linspace(t0 + 0.1, t0 + dur - 0.1, 5):
        im = grab(f, t)
        if im is None:
            continue
        g = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY); W = g.shape[1]
        faces = FACE.detectMultiScale(g, 1.1, 5, minSize=(int(g.shape[0] * 0.05),) * 2)
        if len(faces):                     # faces are reliable; the body detector also fires on cushions and chairs
            boxes = list(faces)
        else:
            people, _ = HOG.detectMultiScale(g, winStride=(8, 8), scale=1.05)
            boxes = [p for p in people if p[3] > g.shape[0] * 0.25]
        if boxes:
            xs.append(np.mean([(x + w / 2) / W for x, y, w, h in boxes]))
    return (float(np.median(xs)), True) if xs else (0.5, False)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--job", required=True); ap.add_argument("--fps", type=int, default=25)
    a = ap.parse_args()
    job = Path(a.job)
    plan = json.load(open(job / "cutaways.json"))
    base_dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                     str(job / "public" / "base.mp4")], capture_output=True, text=True).stdout.strip())
    (job / "public" / "broll").mkdir(parents=True, exist_ok=True)
    out, tiles, last_end = [], [], 0.0
    for i, c in enumerate(sorted(plan, key=lambda c: c["at"]), 1):
        W, H, dur = probe(c["clip"])
        if c["in"] + c["dur"] > dur:
            raise SystemExit(f"cutaway {i}: {Path(c['clip']).name} is only {dur:.1f}s long")
        if c["at"] < last_end:
            print(f"WARNING cutaway {i} overlaps the previous one")
        if c["at"] + c["dur"] > base_dur:
            print(f"WARNING cutaway {i} runs past the end of base.mp4")
        last_end = c["at"] + c["dur"]
        if W > H:
            cx, found = (c["cx"], True) if c.get("cx") is not None else subject_cx(c["clip"], c["in"], c["dur"])
            cw = int(round(H * 9 / 16)) // 2 * 2
            x0 = int(np.clip(cx * W - cw / 2, 0, W - cw)) // 2 * 2
            vf = f"crop={cw}:{H}:{x0}:0,scale=1080:1920:flags=lanczos,fps={a.fps}"
        else:
            cx, found, x0, cw = 0.5, True, 0, W
            vf = f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps={a.fps}"
        dst = job / "public" / "broll" / f"{i:02d}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{c['in']:.3f}", "-i", c["clip"], "-t", f"{c['dur']:.3f}",
                        "-vf", vf, "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", str(dst)], check=True)
        f1, f2 = grab(str(dst), 0.15, 270), grab(str(dst), max(0.2, c["dur"] - 0.2), 270)
        motion = float(np.abs(f1.astype(float) - f2.astype(float)).mean()) if f1 is not None and f2 is not None else 0
        note = "" if found else "  NO SUBJECT FOUND - set cx by hand"
        note += "  (barely moves - fine for a still subject, otherwise pick another moment)" if motion < 2 else ""
        print(f"{i:02d} @{c['at']:6.2f}s {c['dur']:.1f}s  {Path(c['clip']).name}  in {c['in']:.2f}  cx {cx:.1%}  motion {motion:.1f}{note}")
        out.append({"src": f"broll/{i:02d}.mp4", "from": round(c["at"], 3), "dur": round(c["dur"], 3), "why": c.get("why", "")})
        for fr in (f1, f2):
            im = Image.fromarray(fr) if fr is not None else Image.new("RGB", (270, 480))
            d = ImageDraw.Draw(im); d.line([im.width / 2, 0, im.width / 2, im.height], fill=(255, 255, 0))
            d.rectangle([0, 0, im.width, 16], fill=(0, 0, 0)); d.text((3, 2), f"{i:02d} @{c['at']:.1f}s", fill=(255, 220, 0))
            tiles.append(im)
    json.dump(out, open(job / "broll.json", "w"), indent=1)
    cols = 8
    sheet = Image.new("RGB", (cols * 274, ((len(tiles) + cols - 1) // cols) * 484), (255, 255, 255))
    for k, t in enumerate(tiles):
        sheet.paste(t, ((k % cols) * 274, (k // cols) * 484))
    sheet.save(job / "cutaways_sheet.jpg", quality=85)
    total = sum(o["dur"] for o in out)
    print(f"{len(out)} cutaways, {total:.1f}s of {base_dur:.1f}s ({total / base_dur:.0%} b-roll) -> {job / 'cutaways_sheet.jpg'}")


if __name__ == "__main__":
    main()
