"""Compare crop centres with the frame's centre line drawn on. Usage:
   python cxtest.py out.jpg <clip> <in> <dur> cx1,cx2,cx3..."""
import subprocess, io, sys
from PIL import Image, ImageDraw
out, clip, t_in, dur = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
cxs = [float(x) for x in sys.argv[5].split(",")]
p = subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries",
                    "stream=width,height","-of","csv=p=0",clip],
                   capture_output=True,text=True).stdout.strip().splitlines()[0].split(",")
W,H = int(p[0]), int(p[1]); cw = int(round(H*9/16))//2*2
rows=[]
for cx in cxs:
    x0 = int(min(max(cx*W-cw/2,0),W-cw))//2*2
    row=[]
    for t in (t_in+0.05, t_in+dur/2, t_in+dur-0.05):
        raw=subprocess.run(["ffmpeg","-nostdin","-v","error","-ss",f"{t:.3f}","-i",clip,"-frames:v","1",
                            "-vf",f"crop={cw}:{H}:{x0}:0,scale=250:-2","-f","image2pipe","-vcodec","mjpeg","-"],
                           capture_output=True).stdout
        if raw: row.append(Image.open(io.BytesIO(raw)).convert("RGB"))
    if not row: continue
    h=max(r.height for r in row); im=Image.new("RGB",(250*len(row),h),(20,20,20))
    for k,r in enumerate(row):
        ImageDraw.Draw(r).line([r.width/2,0,r.width/2,r.height],fill=(255,230,0))
        im.paste(r,(k*250,0))
    d=ImageDraw.Draw(im); d.rectangle([0,0,96,16],fill=(0,0,0)); d.text((3,3),f"cx {cx}",fill=(255,230,0))
    rows.append(im)
w=max(r.width for r in rows); im=Image.new("RGB",(w,sum(r.height for r in rows)),(20,20,20))
y=0
for r in rows: im.paste(r,(0,y)); y+=r.height
im.save(out,quality=88); print(out)
