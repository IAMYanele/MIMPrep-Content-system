"""Preview a 9:16 crop that uses only part of the frame height (a punch-in), for wide shots
where a full-height crop leaves the subject tiny. Usage:
   python punch.py out.jpg <clip> <in> <dur> <cx> <cy> <h_frac>[,<h_frac2>...]
h_frac is the fraction of the source height the crop uses; 1.0 is the normal full-height crop."""
import subprocess, io, sys
from PIL import Image, ImageDraw
out, clip, t_in, dur, cx, cy = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])
fracs = [float(x) for x in sys.argv[7].split(",")]
p = subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height",
                    "-of","csv=p=0",clip],capture_output=True,text=True).stdout.strip().splitlines()[0].split(",")
W,H = int(p[0]), int(p[1])
rows=[]
for fr in fracs:
    ch = int(H*fr)//2*2
    cw = int(round(ch*9/16))//2*2
    x0 = int(min(max(cx*W-cw/2, 0), W-cw))//2*2
    y0 = int(min(max(cy*H-ch/2, 0), H-ch))//2*2
    up = 1920/ch
    row=[]
    for t in (t_in+0.05, t_in+dur/2, t_in+dur-0.05):
        raw=subprocess.run(["ffmpeg","-nostdin","-v","error","-ss",f"{t:.3f}","-i",clip,"-frames:v","1",
                            "-vf",f"crop={cw}:{ch}:{x0}:{y0},scale=250:-2","-f","image2pipe","-vcodec","mjpeg","-"],
                           capture_output=True).stdout
        if raw: row.append(Image.open(io.BytesIO(raw)).convert("RGB"))
    if not row: continue
    h=max(r.height for r in row); im=Image.new("RGB",(250*len(row),h),(20,20,20))
    for k,r in enumerate(row):
        ImageDraw.Draw(r).line([r.width/2,0,r.width/2,r.height],fill=(255,230,0))
        im.paste(r,(k*250,0))
    d=ImageDraw.Draw(im); d.rectangle([0,0,190,16],fill=(0,0,0))
    d.text((3,3),f"h {fr}  {cw}x{ch}  upscale {up:.2f}x",fill=(255,230,0))
    rows.append(im)
w=max(r.width for r in rows); s=Image.new("RGB",(w,sum(r.height for r in rows)),(20,20,20)); y=0
for r in rows: s.paste(r,(0,y)); y+=r.height
s.save(out,quality=90); print(out)
