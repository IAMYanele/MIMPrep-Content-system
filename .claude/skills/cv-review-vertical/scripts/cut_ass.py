"""Re-time an existing ASS around removed spans, keeping straddling lines.

Dropping any line that touches a cut is what lost a "GPA" caption once. A line is
dropped only when MOST of it lies inside a cut; otherwise it is kept and clamped,
so a line that merely overlaps a cut edge survives with a slightly shorter life.
"""
import io, re, sys


def sec(t):
    h, m, rest = t.split(":"); s, cs = rest.split(".")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(cs) / 100


def ts(x):
    cs = int(round(max(0.0, x) * 100))
    h, cs = divmod(cs, 360000); m, cs = divmod(cs, 6000); s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def cut(src, dst, cuts):
    cuts = sorted(cuts)
    shift = lambda t: sum(b - a for a, b in cuts if b <= t)
    head, rows = [], []
    for l in io.open(src, encoding="utf-8"):
        if not l.startswith("Dialogue"):
            head.append(l); continue
        q = l.rstrip("\n").split(",", 9)
        s, e = sec(q[1]), sec(q[2])
        dur = max(e - s, 1e-6)
        inside = sum(max(0.0, min(e, b) - max(s, a)) for a, b in cuts)
        if inside > 0.5 * dur:
            continue
        ns, ne = s - shift(s), e - shift(e)
        if ne <= ns:
            ne = ns + 0.12
        q[1], q[2] = ts(ns), ts(ne)
        rows.append((ns, ",".join(q)))
    rows.sort(key=lambda r: r[0])
    out = []
    for i, (_, r) in enumerate(rows):
        f = r.split(",", 9)
        if i + 1 < len(rows):
            nxt = rows[i + 1][0]
            if sec(f[2]) > nxt:
                f[2] = ts(max(sec(f[1]) + 0.05, nxt - 0.01))
        out.append(",".join(f))
    io.open(dst, "w", encoding="utf-8").write("".join(head) + "\n".join(out) + "\n")
    return len(rows)


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    cuts = [tuple(float(x) for x in w.split(",")) for w in sys.argv[3:]]
    print(f"{cut(src, dst, cuts)} lines -> {dst}")
