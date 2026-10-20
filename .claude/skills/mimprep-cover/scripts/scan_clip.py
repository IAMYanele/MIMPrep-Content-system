"""Contact sheet of face crops through a clip (time + face sharpness on each tile) to pick a flattering moment:
mouth closed, natural smile, eyes open, sharp. usage: python scan_clip.py <clip> <out.jpg> [step_seconds]"""
import subprocess, sys, shutil
import numpy as np, cv2
clip, out = sys.argv[1], sys.argv[2]; step = float(sys.argv[3]) if len(sys.argv) > 3 else 0.4
ff = shutil.which("ffmpeg") or "ffmpeg"
raw = subprocess.run([ff, "-v", "error", "-i", clip, "-vf", f"fps={1/step},scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 1920, 1080, 3)
fc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
tiles = []
for i, f in enumerate(fr):
    fs = fc.detectMultiScale(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[::2, ::2], 1.1, 5, minSize=(60, 60))
    x, y, w, h = [v * 2 for v in max(fs, key=lambda r: r[2] * r[3])] if len(fs) else (340, 500, 400, 400)
    s = int(w * 1.6); cx, cy = x + w // 2, y + h // 2
    crop = f[max(0, cy - s // 2):cy + s // 2 + s // 3, max(0, cx - s // 2):cx + s // 2]
    sharp = cv2.Laplacian(cv2.cvtColor(f[y:y + h, x:x + w], cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()
    t = cv2.resize(crop, (220, 290)); cv2.putText(t, f"{i * step:.1f}s {sharp:.0f}", (4, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2); tiles.append(t)
while len(tiles) % 10: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite(out, np.vstack([np.hstack(tiles[k:k + 10]) for k in range(0, len(tiles), 10)])); print(out, len(fr), "frames")
