# Transcribe a FINISHED clip's audio so caption times are already in output time.
import os, sys, json, subprocess, urllib.request, mimetypes, uuid
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from cvpaths import WORK as W
KEY = os.environ["OPENAI_API_KEY"]

def post(url, fields, files):
    b = uuid.uuid4().hex; body = b""
    for k, v in fields:
        body += f"--{b}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
    for k, p in files:
        fn = os.path.basename(p); ct = mimetypes.guess_type(fn)[0] or "application/octet-stream"
        body += (f"--{b}\r\nContent-Disposition: form-data; name=\"{k}\"; filename=\"{fn}\"\r\n"
                 f"Content-Type: {ct}\r\n\r\n").encode() + open(p, "rb").read() + b"\r\n"
    body += f"--{b}--\r\n".encode()
    r = urllib.request.Request(url, data=body, method="POST")
    r.add_header("Authorization", f"Bearer {KEY}")
    r.add_header("Content-Type", f"multipart/form-data; boundary={b}")
    return json.loads(urllib.request.urlopen(r, timeout=900).read().decode())

def transcribe_clip(clip, video_path):
    out = f"{W}/captions/clip{clip}_final.json"
    if os.path.exists(out):
        print(f"clip{clip}: cached"); return out
    mp3 = f"{W}/captions/clip{clip}.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video_path, "-vn",
                    "-ac", "1", "-ar", "16000", "-b:a", "64k", mp3], check=True)
    res = post("https://api.openai.com/v1/audio/transcriptions",
               [("model", "whisper-1"), ("response_format", "verbose_json"),
                ("timestamp_granularities[]", "word"), ("language", "en")],
               [("file", mp3)])
    json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"clip{clip}: {len(res.get('words') or [])} words, dur {res.get('duration')}")
    return out

if __name__ == "__main__":
    transcribe_clip(int(sys.argv[1]), sys.argv[2])
