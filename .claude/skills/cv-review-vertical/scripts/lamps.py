from PIL import Image
import numpy as np, sys, itertools

def lamps(arr, thr=195, minrows=25):
    """bright vertical bars -> list of (xc, x0, x1, ytop, ybot)"""
    m = arr > thr
    colcnt = m.sum(axis=0)
    out, run = [], None
    for x, v in enumerate(colcnt):
        if v >= minrows:
            run = [x, x] if run is None else [run[0], x]
        else:
            if run and run[1]-run[0] >= 2: out.append(run)
            run = None
    if run and run[1]-run[0] >= 2: out.append(run)
    res = []
    for x0, x1 in out:
        sub = m[:, x0:x1+1]
        rows = np.where(sub.sum(axis=1) >= max(1,(x1-x0+1)//2))[0]
        if len(rows) < minrows: continue
        res.append(((x0+x1)/2.0, x0, x1, int(rows.min()), int(rows.max())))
    return res

REF_K = 1080.0/800.0   # screenshot(800) -> reference panel(1080) coords


if __name__ == "__main__":
    ref = np.asarray(Image.open(sys.argv[1]).convert("L").crop((0,0,800,474)), dtype=np.float64)
    src = np.asarray(Image.open(sys.argv[2]).convert("L"), dtype=np.float64)

    rl = [(xc*REF_K, x0*REF_K, x1*REF_K, yt*REF_K, yb*REF_K) for (xc,x0,x1,yt,yb) in lamps(ref, 195, 18)]
    sl = lamps(src, 195, 25)
    print("REFERENCE lamps (1080x640 panel coords):")
    for l in rl: print(f"   xc={l[0]:7.1f}  x[{l[1]:.0f}..{l[2]:.0f}] w={l[2]-l[1]:5.1f}  y[{l[3]:.0f}..{l[4]:.0f}] h={l[4]-l[3]:.0f}")
    print("SOURCE lamps (1920x1080):")
    for l in sl: print(f"   xc={l[0]:7.1f}  x[{l[1]}..{l[2]}] w={l[2]-l[1]:5.1f}  y[{l[3]}..{l[4]}] h={l[4]-l[3]}")

    # solve: pick 2 ref lamps and 2 source lamps -> scale s and origin (cx, cy)
    cands = []
    for (ra, rb) in itertools.combinations(range(len(rl)), 2):
        for (sa, sb) in itertools.permutations(range(len(sl)), 2):
            dref = rl[rb][0]-rl[ra][0]; dsrc = sl[sb][0]-sl[sa][0]
            if abs(dsrc) < 20 or dref*dsrc <= 0: continue
            s = dref/dsrc
            Wc = 1080.0/s; Hc = 640.0/s
            if not (700 <= Wc <= 1920) or Hc > 1080: continue
            cx = sl[sa][0] - rl[ra][0]/s
            if cx < -5 or cx+Wc > 1925: continue
            # width agreement of the bars
            werr = abs((sl[sa][2]-sl[sa][1])*s - (rl[ra][2]-rl[ra][1])) \
                 + abs((sl[sb][2]-sl[sb][1])*s - (rl[rb][2]-rl[rb][1]))
            cands.append((werr, s, Wc, Hc, cx, (ra,rb,sa,sb)))
    cands.sort()
    print("\nconsistent solutions (lowest bar-width error first):")
    for c in cands[:6]:
        print(f"   werr={c[0]:5.2f}  zoom={1920/c[2]:.3f}x  crop {c[2]:.0f}x{c[3]:.0f}  x={c[4]:.0f}  pairing={c[5]}")
