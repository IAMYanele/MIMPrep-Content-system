"""See what the b-roll pool actually contains, with labels you can trust.

Overview: three frames per clip (20/50/80%) in one row, the clip's number, name,
length and resolution drawn INTO the row. The number maps to broll_index.json, which
is written from the same list that drew the rows. An ffmpeg tile sheet silently
dropped tiles that failed to extract and shifted every index after them: clips
labelled "Thomas" were a different presenter. That can't happen here.

Detail: one clip sampled every --step seconds with the time on each frame, to choose
an in-point.

usage:
  python broll_sheet.py --out <job>/broll "F:/thomas b-roll" "F:/thomas content/b-rolls"
  python broll_sheet.py --out <job>/broll --clip "F:/thomas b-roll/fx30 SW20250925_0020.MP4" --step 0.5
"""
import argparse, json, subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

VID = (".mp4", ".mov", ".m4v")


def probe(f):
    try:
        out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                              "stream=width,height:stream_side_data=rotation:format=duration", "-of", "json", f],
                             capture_output=True, text=True, timeout=60).stdout
        j = json.loads(out); s = j["streams"][0]
        w, h = s["width"], s["height"]
        rot = next((abs(int(d.get("rotation", 0))) for d in s.get("side_data_list", []) or []), 0)
        if rot == 90:
            w, h = h, w
        return w, h, float(j["format"]["duration"])
    except Exception:
        return None


def frame(f, t, box=240):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", f, "-frames:v", "1", "-vf",
                          f"scale={box}:{box}:force_original_aspect_ratio=decrease,pad={box}:{box}:(ow-iw)/2:(oh-ih)/2",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    if len(raw) != box * box * 3:
        return Image.new("RGB", (box, box), (60, 0, 0))     # a failed grab stays visible as a red tile
    return Image.fromarray(np.frombuffer(raw, np.uint8).reshape(box, box, 3))


def overview(folders, out, recursive):
    files = []
    for d in folders:
        it = Path(d).rglob("*") if recursive else Path(d).iterdir()
        files += sorted(str(p) for p in it if p.is_file() and p.suffix.lower() in VID)
    meta = list(ThreadPoolExecutor(6).map(probe, files))
    rows = [(f, m) for f, m in zip(files, meta) if m]
    index = []
    def row(item):
        i, (f, (w, h, dur)) = item
        tiles = [frame(f, dur * p) for p in (0.2, 0.5, 0.8)]
        r = Image.new("RGB", (240 * 3 + 8, 240), (15, 15, 15))
        for k, t in enumerate(tiles):
            r.paste(t, (k * 244, 0))
        d = ImageDraw.Draw(r); d.rectangle([0, 0, 732, 18], fill=(0, 0, 0))
        d.text((4, 3), f"#{i}  {Path(f).name[-40:]}  {dur:.1f}s  {w}x{h}", fill=(255, 220, 0))
        return r
    items = list(enumerate(rows))
    for i, (f, (w, h, dur)) in items:
        index.append({"n": i, "path": f, "duration": round(dur, 2), "width": w, "height": h})
    imgs = list(ThreadPoolExecutor(6).map(row, items))
    json.dump(index, open(out / "broll_index.json", "w"), indent=1)
    per = 16
    for s in range(0, len(imgs), per):
        chunk = imgs[s:s + per]; cols = 2
        sheet = Image.new("RGB", (cols * 740, ((len(chunk) + 1) // cols) * 246), (255, 255, 255))
        for k, im in enumerate(chunk):
            sheet.paste(im, ((k % cols) * 740, (k // cols) * 246))
        sheet.save(out / f"broll_sheet_{s // per}.jpg", quality=85)
    print(f"{len(index)} clips indexed -> {out}/broll_index.json and broll_sheet_*.jpg")


def detail(clip, out, step):
    m = probe(clip)
    if not m:
        raise SystemExit(f"cannot read {clip}")
    w, h, dur = m
    ts = list(np.arange(0.2, dur - 0.1, step))
    tiles = list(ThreadPoolExecutor(6).map(lambda t: frame(clip, t, 200), ts))
    cols = 8
    sheet = Image.new("RGB", (cols * 204, ((len(tiles) + cols - 1) // cols) * 204), (255, 255, 255))
    for k, (t, im) in enumerate(zip(ts, tiles)):
        d = ImageDraw.Draw(im); d.rectangle([0, 0, 60, 16], fill=(0, 0, 0)); d.text((3, 2), f"{t:.1f}s", fill=(255, 220, 0))
        sheet.paste(im, ((k % cols) * 204, (k // cols) * 204))
    name = Path(clip).stem.replace(" ", "_")
    sheet.save(out / f"detail_{name}.jpg", quality=85)
    print(f"{Path(clip).name}: {dur:.1f}s {w}x{h} -> {out}/detail_{name}.jpg")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folders", nargs="*"); ap.add_argument("--out", required=True)
    ap.add_argument("--clip"); ap.add_argument("--step", type=float, default=0.5)
    ap.add_argument("--recursive", action="store_true")
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    if a.clip:
        detail(a.clip, out, a.step)
    else:
        overview(a.folders, out, a.recursive)


if __name__ == "__main__":
    main()
