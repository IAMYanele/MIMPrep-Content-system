# Caption corrections: per-clip wrong words + systemic % and decimal faults.
import re

# (pattern words) -> (replacement words), matched case-insensitively on consecutive words
# Per batch: fill these in your job copy (they are specific to one batch's audio, and name
# fixes would put students' names in the shared skill). Shape:
#   clip: [(["words","whisper","heard"], ["words","actually","said"]), ...]
# Typical fixes from past batches: "AIATS" -> "ATS", "selection company" -> "selection committee",
# "in the court" -> "in the cohort", "your core" -> "your cohort", "say space" -> "save space".
FIXES = {
}

# decimals Whisper splits into two tokens
GENERIC = [
 (["5","5","over","10"], ["5.5","over","10"]),
 (["6","5","over","10"], ["6.5","over","10"]),
 (["6","5","7","over","10"], ["6.5","7","over","10"]),
 (["7","5","over","10"], ["7.5","over","10"]),
 # same grades, but this speaker also says "out of 10" rather than "over 10"
 (["5","5","out","of","10"], ["5.5","out","of","10"]),
 (["6","5","out","of","10"], ["6.5","out","of","10"]),
 (["6","5","7","out","of","10"], ["6.5","7","out","of","10"]),
 (["7","5","out","of","10"], ["7.5","out","of","10"]),
 (["Top","3"], ["Top","3%"]),
]

def _norm(s): return (s or "").strip().lower()

def apply_rules(words, rules):
    """words: (start, end, text, brk). Replace consecutive matches, keeping the time span and
    the sentence-break flag of the last word in the match."""
    out, i = [], 0
    while i < len(words):
        hit = False
        for pat, rep in rules:
            n = len(pat)
            if i + n <= len(words) and all(_norm(words[i+k][2]) == _norm(pat[k]) for k in range(n)):
                s, e = words[i][0], words[i+n-1][1]
                brk = words[i+n-1][3] if len(words[i+n-1]) > 3 else False
                step = (e - s) / max(1, len(rep))
                for j, w in enumerate(rep):
                    out.append((s + j*step, s + (j+1)*step, w, brk if j == len(rep)-1 else False))
                i += n; hit = True; break
        if not hit:
            out.append(words[i]); i += 1
    return out

def merge_percent(words):
    """Whisper emits '%' as an empty token; glue it onto the number before it."""
    out = []
    for w in words:
        s, e, t = w[0], w[1], w[2]
        brk = w[3] if len(w) > 3 else False
        if not t.strip():
            if out and re.fullmatch(r"\d+([.,]\d+)?", out[-1][2].strip()):
                p = out[-1]; out[-1] = (p[0], e, p[2].strip() + "%", p[3] or brk)
            continue
        out.append((s, e, t, brk))
    return out

def fix_words(clip, words):
    words = merge_percent(words)
    words = apply_rules(words, GENERIC)
    words = apply_rules(words, FIXES.get(clip, []))
    return words
