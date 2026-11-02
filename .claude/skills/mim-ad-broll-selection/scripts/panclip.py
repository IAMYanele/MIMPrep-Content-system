"""Bake a 1080x1920 cutaway with a slow, perfectly even horizontal pan out of a 4K 16:9 source.

ffmpeg's crop moves in whole pixels, so a pan computed from time rounds unevenly and hitches
(measured: steps alternating 2 and 3 px at 1080 wide). Here the strip the pan crosses is
upscaled SS x, and the crop advances by an exact INTEGER number of those pixels per frame
(x = start + n*step) - nothing to round, so every frame moves the same sub-pixel amount after
the downscale. The requested end point is nudged by under a pixel to make the step whole.

usage: python panclip.py <src> <out> <t0> <dur> <cx_start> <cx_end> <cy> <hfrac>
cx/cy: crop centre as fractions of the source. hfrac: share of source height used (1.0 = full).
env PAN_SS: supersample factor (default 4)."""
import os, subprocess, sys
src, out = sys.argv[1], sys.argv[2]
t0, dur, cxa, cxb, cy, hf = map(float, sys.argv[3:9])
SS = int(os.environ.get("PAN_SS", "4"))
p = subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height,r_frame_rate",
                    "-of","csv=p=0",src],capture_output=True,text=True).stdout.strip().splitlines()[0].split(",")
W, H = int(p[0]), int(p[1]); num, den = map(int, p[2].split("/")); fps = num/den
frames = int(round(dur*25))                           # output is 25 fps
ch = int(H*hf)//2*2
cw = int(round(ch*9/16))//2*2
U = 1920*SS / ch                                      # source px -> supersampled px
xa = min(max(cxa*W - cw/2, 0), W - cw)
xb = min(max(cxb*W - cw/2, 0), W - cw)
step = round((xb - xa)*U / frames)                    # whole supersampled px per output frame
xb = xa + step*frames/U                               # the end point that step actually reaches
y0 = int(min(max(cy*H - ch/2, 0), H - ch))//2*2
rx = int(max(0, min(xa, xb)))//2*2
rw = min(int(max(xa, xb) + cw - rx + 4)//2*2, W - rx)
uw, uh = int(rw*U)//2*2, 1920*SS
ow = int(round(cw*U))//2*2
start = int(round((xa - rx)*U))
vf = (f"fps=25,crop={rw}:{ch}:{rx}:{y0},scale={uw}:{uh}:flags=lanczos,"
      f"crop={ow}:{uh}:x='min({uw-ow},max(0,{start}+n*{step}))':y=0,"
      f"scale=1080:1920:flags=lanczos,setsar=1")
subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{t0}","-i",src,"-t",f"{dur}","-vf",vf,
                "-an","-c:v","libx264","-crf","16","-preset","medium","-pix_fmt","yuv420p",out], check=True)
print(out, f"window {cw}x{ch}, pan {xb-xa:+.1f}px source over {dur}s, "
           f"{step*1080/ow:+.3f}px per output frame")
