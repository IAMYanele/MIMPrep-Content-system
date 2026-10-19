# Re-split an existing ASS into <=2-word / <=11-char lines.
# Used only for clips 5/12/13, whose word-level JSON is gone and whose audio
# cannot be re-transcribed (OpenAI credits exhausted). Within a source line the
# split time is interpolated by character count, so it is approximate.
import re, io, sys, os

MAX_W, MAX_CH = 2, 11

def split_line(a, b, text):
    ws = text.split()
    if not ws: return []
    groups, cur = [], []
    for w in ws:
        if cur and (len(cur) >= MAX_W or len(" ".join(cur)) + 1 + len(w) > MAX_CH):
            groups.append(cur); cur = []
        cur.append(w)
    if cur: groups.append(cur)
    if len(groups) == 1: return [(a, b, text)]
    total = sum(len(" ".join(g)) for g in groups)
    out, t = [], a
    for i, g in enumerate(groups):
        share = (b - a) * (len(" ".join(g)) / total)
        e = b if i == len(groups) - 1 else min(b, t + share)
        out.append((t, e, " ".join(g)))
        t = e
    return out

def ts(x):
    cs = int(round(x * 100)); h, cs = divmod(cs, 360000); m, cs = divmod(cs, 6000); s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"
def sec(t):
    h, m, rest = t.split(':'); s, cs = rest.split('.')
    return int(h)*3600 + int(m)*60 + int(s) + int(cs)/100

def convert(src, dst):
    head, ev = [], []
    for L in io.open(src, encoding="utf-8"):
        if L.startswith("Dialogue"):
            p = L.rstrip("\n").split(",", 9)
            tags = "".join(re.findall(r'\{[^}]*\}', p[9]))
            txt = re.sub(r'\{[^}]*\}', '', p[9]).strip()
            ev.append((sec(p[1]), sec(p[2]), txt, p, tags))
        else:
            head.append(L)
    out = []
    for a, b, txt, p, tags in ev:
        for (s, e, t) in split_line(a, b, txt):
            q = list(p); q[1] = ts(s); q[2] = ts(max(s + 0.08, e)); q[9] = tags + t
            out.append((s, ",".join(q)))
    out.sort(key=lambda x: x[0])
    # never let a line outlive the next one
    rows = [r[1] for r in out]
    fixed = []
    for i, r in enumerate(rows):
        f = r.split(",", 9)
        if i + 1 < len(rows):
            nxt = sec(rows[i+1].split(",", 9)[1])
            if sec(f[2]) > nxt: f[2] = ts(max(sec(f[1]) + 0.05, nxt - 0.01))
        fixed.append(",".join(f))
    io.open(dst, "w", encoding="utf-8").write("".join(head) + "\n".join(fixed) + "\n")
    return len(ev), len(fixed)


if __name__ == "__main__":
    for clip in (5, 12, 13):
        s = os.path.join(os.path.dirname(os.path.abspath(__file__)), "render", f"clip{clip}_trim.ass")
        bak = s.replace(".ass", "_3word.ass")
        if not os.path.exists(bak): io.open(bak,"w",encoding="utf-8").write(io.open(s,encoding="utf-8").read())
        n0, n1 = convert(bak, s)
        print(f"clip{clip}: {n0} lines -> {n1} lines")
