"""Download one public Drive file by id. usage: python drive_get.py <fileId> <out>"""
import sys, urllib.request, shutil
fid, out = sys.argv[1], sys.argv[2]
with urllib.request.urlopen(f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t", timeout=600) as r, open(out, "wb") as f:
    shutil.copyfileobj(r, f)
print(out)
