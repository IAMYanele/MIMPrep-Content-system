"""Bake one cutaway into its own 1080x1920 25 fps clip: a single 9:16 crop, or a 2-up / 3-up stack.

usage: python bake.py <out.mp4> <dur> <panels.json | inline json list>
panel: {"src": path, "in": seconds, "cx": 0-1, "cy": 0-1, "zoom": >=1}  (n comes from the number of panels)
Each panel crops its source to the panel's aspect (9:16, 9:8 or 27:16) around (cx, cy); zoom crops tighter.
"""
import json, os, subprocess, sys


def probe(src):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                        "-of", "csv=p=0:s=x", src], capture_output=True, text=True).stdout.strip().split("\n")[0]
    w, h = map(int, o.split("x")[:2])
    return w, h


def crop_box(W, H, n, cx, cy, zoom):
    aspect = 1080 / (1920 / n)                      # panel width / height
    h = H / zoom
    w = h * aspect
    if w > W:                                        # wider than the source: limit by width
        w = W; h = w / aspect
    w, h = int(w) // 2 * 2, int(h) // 2 * 2
    x = min(max(0, cx * W - w / 2), W - w)
    y = min(max(0, cy * H - h / 2), H - h)
    return int(x), int(y), w, h


def bake(out, dur, panels):
    n = len(panels)
    ph = 1920 // n
    args, chains = [], []
    for i, p in enumerate(panels):
        W, H = probe(p["src"])
        x, y, w, h = crop_box(W, H, n, p.get("cx", .5), p.get("cy", .5), p.get("zoom", 1.0))
        args += ["-ss", f"{p['in']:.3f}", "-t", f"{dur + 0.2:.3f}", "-i", p["src"]]
        chains.append(f"[{i}:v]fps=25,crop={w}:{h}:{x}:{y},scale=1080:{ph}:flags=lanczos,setsar=1,setpts=PTS-STARTPTS[p{i}]")
    if n == 1:
        graph = chains[0].replace("[p0]", "[v]")
    else:
        graph = ";".join(chains) + ";" + "".join(f"[p{i}]" for i in range(n)) + f"vstack=inputs={n}[v]"
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", *args, "-filter_complex", graph, "-map", "[v]",
                    "-t", f"{dur:.3f}", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p",
                    out], check=True)


if __name__ == "__main__":
    spec = sys.argv[3]
    panels = json.load(open(spec)) if os.path.exists(spec) else json.loads(spec)
    bake(sys.argv[1], float(sys.argv[2]), panels)
    print(sys.argv[1])
