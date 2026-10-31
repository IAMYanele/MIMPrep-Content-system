"""Index the Thomas/MiM Frame.io b-roll library from the shell: every video's name, folder,
duration and poster thumbnail, then one labelled contact sheet per folder.

usage: python index_library.py <out_dir> [share_id]
writes <out_dir>/library.json and <out_dir>/sheets/<folder>.jpg (nothing but thumbnails is downloaded)
"""
import json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
import fio_dl
from PIL import Image, ImageDraw, ImageFont

out = Path(sys.argv[1]); (out / "sheets").mkdir(parents=True, exist_ok=True)
SH = sys.argv[2] if len(sys.argv) > 2 else "de634cf2-ad86-4b1e-afef-d4148555feaf"
NODE = "id name __typename ... on VideoAsset { thumbnailImageUrl { url } media { duration } parent { id name } }"

top = fio_dl.gql(SH, '{ share(shareId:"%s"){ ... on AdHocAssetsShare { assets(page:{first:200}){ nodes { id name __typename } } } } }' % SH)
lib = []
for f in top["share"]["assets"]["nodes"]:
    if f["__typename"] != "FolderAsset":
        continue
    after = None
    while True:
        page = '{first:500%s}' % (f', after:"{after}"' if after else "")
        d = fio_dl.gql(SH, '{ asset(assetId:"%s"){ ... on FolderAsset { descendants(page:%s){ pageInfo { endCursor hasNextPage } nodes { %s } } } } }'
                       % (f["id"], page, NODE))["asset"]["descendants"]
        for n in d["nodes"]:
            if n["__typename"] == "VideoAsset" and n.get("thumbnailImageUrl"):
                lib.append({"id": n["id"], "name": n["name"], "top": f["name"].strip(),
                            "folder": (n.get("parent") or {}).get("name", "").strip(),
                            "dur": (n.get("media") or {}).get("duration"), "thumb": n["thumbnailImageUrl"]["url"]})
        if not d["pageInfo"]["hasNextPage"]:
            break
        after = d["pageInfo"]["endCursor"]
    print(f"{f['name'].strip()}: {sum(1 for x in lib if x['top'] == f['name'].strip())} videos", flush=True)
json.dump(lib, open(out / "library.json", "w"), indent=0)


def thumb(x):
    try:
        req = urllib.request.Request(x["thumb"] + "&width=240", headers={"user-agent": "Mozilla/5.0"})
        return x["id"], Image.open(BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert("RGB")
    except Exception as e:
        return x["id"], None


with ThreadPoolExecutor(12) as ex:
    imgs = dict(ex.map(thumb, lib))

font = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 13)
groups = {}
for x in lib:
    groups.setdefault(f"{x['top']} -- {x['folder']}" if x["folder"] != x["top"] else x["top"], []).append(x)
TW, TH, COLS = 240, 150, 10
for g, items in groups.items():
    items.sort(key=lambda x: x["name"])
    for p in range(0, len(items), 80):          # 80 per sheet keeps them readable
        chunk = items[p:p + 80]
        rows = (len(chunk) + COLS - 1) // COLS
        sheet = Image.new("RGB", (COLS * TW, rows * (TH + 18)), (20, 20, 20))
        dr = ImageDraw.Draw(sheet)
        for i, x in enumerate(chunk):
            X, Y = (i % COLS) * TW, (i // COLS) * (TH + 18)
            im = imgs.get(x["id"])
            if im:
                im.thumbnail((TW, TH)); sheet.paste(im, (X + (TW - im.width) // 2, Y))
            dr.text((X + 2, Y + TH + 1), f"{x['name'][:26]} {x['dur'] or 0:.0f}s", fill=(255, 255, 0), font=font)
        name = re.sub(r"[^\w\- ]+", "_", g)[:90] + (f" p{p // 80 + 1}" if len(items) > 80 else "")
        sheet.save(out / "sheets" / f"{name}.jpg", quality=80)
print(len(lib), "videos indexed,", len(groups), "folders")
