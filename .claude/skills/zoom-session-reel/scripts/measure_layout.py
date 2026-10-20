"""Find the tutor's and the student's Zoom tiles in a recording and the crop for each 9:16 panel.

A Fathom recording of a Zoom call with its notetaker is 1280x720: the two people side by side in
the top row (640x360 each), the notetaker tile below. Those are the default tiles; pass --tiles
for any other layout (read the rects off a frame). Faces are detected on frames every 2s, and
each crop is the largest 9:8 box (the 1080x960 panel shape) that fits inside its tile:
  - 6px inside the tile, because Zoom draws a green border round whoever is talking
  - clear of the name label in the tile's bottom-left corner (the student's FULL NAME is on it)
  - centred on the median face, with the face about 40% down where the tile allows
Writes layout.json and layout.png (the rects drawn on a frame). LOOK at layout.png before
going on: the right person in each tile, no label, no border, no neighbouring tile.

usage: python measure_layout.py "<cut.mp4>" --out <job>/layout.json [--tutor left|right] [--tiles "x,y,w,h;x,y,w,h"]
"""
import argparse, json
import cv2, numpy as np

LABEL_H, BORDER = 30, 6


def label_width(frames, tile):
    """Width of Zoom's name label (dark box, bottom-left of the tile): columns from the left edge
    that have dark pixels in the bottom rows, up to the first 6 light columns in a row. Anything
    dark right after the label (a shirt) only makes this wider, which only makes the crop safer."""
    tx, ty, tw, th = tile
    dark = np.zeros(tw, bool)
    for f in frames:
        g = cv2.cvtColor(f[ty + th - LABEL_H + 4:ty + th - 4, tx:tx + tw], cv2.COLOR_BGR2GRAY)
        dark |= np.percentile(g, 10, axis=0) < 70
    light = 0
    for x in range(4, tw):
        light = 0 if dark[x] else light + 1
        if light >= 6:
            return x - 5 + 4
    return tw


def crop_for(tile, face, label_w):
    tx, ty, tw, th = tile
    h = th - 40; w = int(round(h * 9 / 8))
    if w > tw - 2 * BORDER:
        w = tw - 2 * BORDER; h = int(round(w * 8 / 9))
    cx, cy = face[0], face[1]
    x = int(np.clip(cx - w / 2, tx + BORDER, tx + tw - BORDER - w))
    bottom = ty + th - (LABEL_H if x < tx + label_w else BORDER)      # the label's band, or just the border
    y = int(np.clip(cy - 0.4 * h, ty + BORDER, bottom - h))
    return [x, y, w, h]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("--out", required=True)
    ap.add_argument("--tutor", choices=("left", "right"), default="left", help="which tile is the MiM Prep tutor")
    ap.add_argument("--tiles", help='"x,y,w,h;x,y,w,h" (left tile first); default: the top-row halves')
    a = ap.parse_args()
    cap = cv2.VideoCapture(a.src)
    W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps, n = cap.get(cv2.CAP_PROP_FPS), int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    tiles = ([[int(v) for v in t.split(",")] for t in a.tiles.split(";")] if a.tiles
             else [[0, 0, W // 2, H // 2], [W // 2, 0, W // 2, H // 2]])
    casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces, ref, samples = [[] for _ in tiles], None, []
    for t in np.arange(1, max(2, n / fps - 1), 2.0):
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
        if not ok:
            continue
        ref = f if ref is None else ref
        if len(samples) < 6:
            samples.append(f)
        g = cv2.equalizeHist(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY))
        for k, (tx, ty, tw, th) in enumerate(tiles):
            d = casc.detectMultiScale(g[ty:ty + th, tx:tx + tw], 1.1, 5, minSize=(th // 7, th // 7))
            if len(d):
                x, y, w, h = max(d, key=lambda r: r[2] * r[3])
                faces[k].append((tx + x + w / 2, ty + y + h / 2, float(w)))
    med = []
    for k, fs in enumerate(faces):
        if not fs:
            raise SystemExit(f"no face found in tile {tiles[k]}: check the layout and pass --tiles")
        arr = np.array(fs); med.append([float(v) for v in np.median(arr, 0)])
        print(f"tile {tiles[k]}: face in {len(fs)} samples, cx {arr[:, 0].min():.0f}-{arr[:, 0].max():.0f}, "
              f"cy {arr[:, 1].min():.0f}-{arr[:, 1].max():.0f}, width ~{med[-1][2]:.0f}")
    ti, si = (0, 1) if a.tutor == "left" else (1, 0)
    lw = [label_width(samples, t) for t in tiles]
    print(f"name label widths: {lw}")
    layout = {"frame": [W, H], "tutor_tile": tiles[ti], "student_tile": tiles[si],
              "tutor_crop": crop_for(tiles[ti], med[ti], lw[ti]), "student_crop": crop_for(tiles[si], med[si], lw[si]),
              "student_face": [round(v, 1) for v in med[si]]}
    json.dump(layout, open(a.out, "w"), indent=1)
    vis = ref.copy()
    for key, col in (("tutor_tile", (255, 160, 0)), ("student_tile", (0, 160, 255))):
        x, y, w, h = layout[key]; cv2.rectangle(vis, (x, y), (x + w - 1, y + h - 1), col, 1)
    for key, col in (("tutor_crop", (255, 255, 0)), ("student_crop", (0, 255, 255))):
        x, y, w, h = layout[key]; cv2.rectangle(vis, (x, y), (x + w - 1, y + h - 1), col, 2)
    cv2.imwrite(a.out.replace(".json", ".png"), vis)
    print(json.dumps(layout))


if __name__ == "__main__":
    main()
