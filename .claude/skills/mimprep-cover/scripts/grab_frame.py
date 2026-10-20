"""Save the sharpest full-resolution frame within +-0.2 s of a time. usage: python grab_frame.py <clip> <seconds> <out.png>"""
import subprocess, sys, shutil, json
import numpy as np, cv2
clip, t, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
ff = shutil.which("ffmpeg") or "ffmpeg"; fp = shutil.which("ffprobe") or "ffprobe"
probe = json.loads(subprocess.run([fp, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation", "-of", "json", clip], capture_output=True, text=True).stdout)["streams"][0]
W, H = probe["width"], probe["height"]
if any(abs(sd.get("rotation", 0)) == 90 for sd in probe.get("side_data_list", [])): W, H = H, W   # ffmpeg auto-rotates phone clips
raw = subprocess.run([ff, "-v", "error", "-ss", str(max(0, t - 0.2)), "-t", "0.4", "-i", clip, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
fc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
def score(f):
    fs = fc.detectMultiScale(cv2.cvtColor(f[::2, ::2], cv2.COLOR_BGR2GRAY), 1.1, 5, minSize=(60, 60))
    x, y, w, h = [v * 2 for v in max(fs, key=lambda r: r[2] * r[3])] if len(fs) else (W // 3, H // 4, W // 3, W // 3)
    return cv2.Laplacian(cv2.cvtColor(f[y:y + h, x:x + w], cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()
b = int(np.argmax([score(f) for f in fr])); cv2.imwrite(out, fr[b]); print(out, f"{max(0, t - 0.2) + b / 30:.2f}s", W, "x", H)
