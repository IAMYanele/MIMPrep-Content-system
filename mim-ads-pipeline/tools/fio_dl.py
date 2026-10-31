"""Frame.io public-share downloader (no browser).

usage: python fio_dl.py list <share_id>...
       python fio_dl.py get <out_dir> <quality> <share_id>...   quality = original | 1080 | 720 | 540
"""
import base64, json, os, sys, uuid, urllib.request

API = "https://api.frame.io/graphql"
SID = str(uuid.uuid4())

DL_Q = """query($id: ID!) { asset(assetId: $id) { id name __typename
  ... on VideoAsset { media { duration original { downloadUrl filesizeInBytes }
      videoTranscodes { key height downloadUrl filesizeInBytes encodeStatus } } }
  ... on DocumentAsset { media { original { downloadUrl filesizeInBytes } } }
  ... on ImageAsset { media { original { downloadUrl filesizeInBytes } } } } }"""


def gql(share, query, variables=None):
    req = urllib.request.Request(API, data=json.dumps({"query": query, "variables": variables or {}}).encode(), headers={
        "content-type": "application/json",
        "x-frameio-share-authentication": base64.b64encode(share.encode()).decode(),
        "x-frameio-session-id": SID,
        "apollographql-client-name": "web-app",
        "apollographql-client-version": "@frameio/next-web-app@744.0",
        "origin": "https://next.frame.io",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    })
    try:
        out = json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:   # validation errors come back as 400 with a JSON body
        out = json.loads(e.read() or b"{}")
        if not out.get("errors"):
            raise
    if out.get("errors"):
        raise RuntimeError(out["errors"])
    return out["data"]


def files(share):
    """Yield (path, asset) for every non-folder asset in the share."""
    top = gql(share, '{ share(shareId:"%s"){ name ... on AdHocAssetsShare { assets(page:{first:200}){ nodes { id name __typename } } } } }' % share)["share"]
    for n in top["assets"]["nodes"]:
        if n["__typename"] == "FolderAsset":
            sub = gql(share, '{ asset(assetId:"%s"){ ... on FolderAsset { descendants(page:{first:500}){ nodes { id name __typename } } } } }' % n["id"])
            for d in sub["asset"]["descendants"]["nodes"]:
                if d["__typename"] != "FolderAsset":
                    yield top["name"], n["name"], d
        else:
            yield top["name"], "", n


def detail(share, aid):
    return gql(share, DL_Q, {"id": aid})["asset"]


def pick(a, quality):
    m = a.get("media") or {}
    if quality != "original":
        for t in m.get("videoTranscodes") or []:
            if str(t.get("height")) == quality and t.get("downloadUrl"):
                return t["downloadUrl"], t.get("filesizeInBytes") or 0
    o = m.get("original") or {}
    return o.get("downloadUrl"), o.get("filesizeInBytes") or 0


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "list":
        for share in sys.argv[2:]:
            for sname, folder, n in files(share):
                a = detail(share, n["id"])
                m = a.get("media") or {}
                size = ((m.get("original") or {}).get("filesizeInBytes") or 0) / 1e6
                tr = ",".join(str(t["height"]) for t in (m.get("videoTranscodes") or []) if t.get("downloadUrl"))
                print(f"{sname} | {folder} | {a['name']} | {size:.0f} MB | dur {m.get('duration')} | transcodes {tr}")
    else:
        out, quality = sys.argv[2], sys.argv[3]
        for share in sys.argv[4:]:
            for sname, folder, n in files(share):
                if os.environ.get("SKIP_COPIES") and __import__("re").search(r"_\d+\.\w+$", n["name"]):
                    continue
                a = detail(share, n["id"])
                url, size = pick(a, quality)
                if not url:
                    continue
                d = os.path.join(out, sname)
                os.makedirs(d, exist_ok=True)
                dest = os.path.join(d, a["name"])
                if os.path.exists(dest) and size and os.path.getsize(dest) == size:
                    print("have", dest); continue
                print(f"get {dest} ({size/1e6:.0f} MB)", flush=True)
                __import__("subprocess").run(["curl", "-sSL", "--fail", "-A", "Mozilla/5.0", "-o", dest, url], check=True)
