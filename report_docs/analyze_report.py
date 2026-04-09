"""One-off / CLI: word count, page estimate, duplicate paragraphs on a report .docx."""
from __future__ import annotations

import re
import sys
from collections import Counter

from docx import Document


def word_count(s: str) -> int:
    return len(re.findall(r"[A-Za-z0-9']+", s))


def analyze(path: str) -> None:
    d = Document(path)
    paras = [p.text.strip() for p in d.paragraphs]
    full_text = "\n".join(paras)

    try:
        idx = next(i for i, t in enumerate(paras) if t == "APPENDICES")
        body_paras = paras[:idx]
        app_paras = paras[idx:]
    except StopIteration:
        body_paras = paras
        app_paras = []

    body_w = word_count("\n".join(body_paras))
    all_w = word_count(full_text)
    app_w = all_w - body_w

    consec: list[str] = []
    for i in range(len(paras) - 1):
        if paras[i] and paras[i] == paras[i + 1]:
            consec.append(paras[i][:100])

    long = [t for t in paras if len(t) > 40]
    c = Counter(long)
    dups = [(t, n) for t, n in c.items() if n > 1]

    print("File:", path)
    print("Total words (approx):", all_w)
    print("Body words (before APPENDICES):", body_w)
    print("Appendix words (approx):", app_w)
    for label, w in [("Total", all_w), ("Body", body_w)]:
        print(f"  {label} est. pages @250 wpg: {w / 250:.1f}  @300 wpg: {w / 300:.1f}")

    print("Consecutive duplicate paragraphs:", len(consec))
    for x in consec[:8]:
        print(" ", x)

    print("Non-consecutive duplicate long paragraphs:", len(dups))
    for t, n in sorted(dups, key=lambda x: -x[1])[:15]:
        print(n, (t[:120] + "...") if len(t) > 120 else t)

    print(
        "Module note: 5005CMD handout targets ~5000 words of report narrative (citations excluded); "
        "use Word Review -> Word Count on included sections only for the title-page declaration."
    )


if __name__ == "__main__":
    p = sys.argv[1] if len(sys.argv) > 1 else None
    if not p:
        print("Usage: python analyze_report.py <path.docx>")
        sys.exit(1)
    analyze(p)
