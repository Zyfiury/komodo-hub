"""
Build submission-ready report: embed appendix screenshots, expand references,
set public GitHub URL. Requires PNGs from: npm run screenshots:appendix (dev server running).

Output: Omar_Zakhama_14498572_SUBMIT_READY_SUBMISSION.docx
"""
from __future__ import annotations

import os
import shutil

from docx import Document
from docx.oxml import OxmlElement
from docx.shared import Inches
from docx.text.paragraph import Paragraph


def insert_paragraph_after(paragraph: Paragraph, text: str = "") -> Paragraph:
    new_p = OxmlElement("w:p")
    paragraph._p.addnext(new_p)
    new_para = Paragraph(new_p, paragraph._parent)
    if text:
        new_para.add_run(text)
    return new_para


def insert_picture_after(paragraph: Paragraph, image_path: str, width_inches: float = 6.2) -> Paragraph:
    new_para = insert_paragraph_after(paragraph, "")
    run = new_para.add_run()
    if os.path.isfile(image_path):
        run.add_picture(image_path, width=Inches(width_inches))
    else:
        run.add_text(f"[Missing screenshot: {image_path}]")
    return new_para


def fix_encoding(doc: Document) -> None:
    for p in doc.paragraphs:
        if "\ufffd" in p.text:
            p.text = p.text.replace("\ufffd", "'")


def insert_apa7_note_after_references_heading(doc: Document) -> None:
    note = "The reference list follows American Psychological Association (APA) style, 7th edition."
    if note in "\n".join(p.text for p in doc.paragraphs):
        return
    for p in doc.paragraphs:
        if p.text.strip() == "REFERENCES":
            insert_paragraph_after(p, note)
            return


def convert_existing_reference_line_to_apa7(text: str) -> str | None:
    """Map known Coventry/Harvard-style lines to APA 7 reference list entries. Returns None if unknown."""
    t = text.strip()
    if not t:
        return None
    if t.startswith("Hapsara, M."):
        return (
            "Hapsara, M. (2023). Komodo Hub: A digital platform for community-supported animal conservation "
            "[Teaching case study]. Coventry University."
        )
    if t.startswith("Talekar, A. (2025c)"):
        return (
            "Talekar, A. (2025c). 5005CMD how to produce your project report [Unpublished course handout]. "
            "Coventry University."
        )
    if t.startswith("Talekar, A. (2025a)"):
        return (
            "Talekar, A. (2025a). 5005CMD how to manage your team and project [Unpublished course handout]. "
            "Coventry University."
        )
    if t.startswith("Talekar, A. (2025b)"):
        return (
            "Talekar, A. (2025b). 5005CMD how to perform your role [Unpublished course handout]. Coventry University."
        )
    if t.startswith("Talekar, A. (2025d)"):
        return (
            "Talekar, A. (2025d). 5005CMD student assignment brief 2025/26 [Unpublished course handout]. "
            "Coventry University."
        )
    if t.startswith("International Organisation for Standardization") or t.startswith(
        "International Organization for Standardization"
    ):
        return (
            "International Organization for Standardization. (2019). ISO 9241-210:2019 Ergonomics of human-system "
            "interaction - Part 210: Human-centred design for interactive systems. "
            "https://www.iso.org/standard/77520.html"
        )
    if t.startswith("Vercel") and "nextjs.org" in t:
        return "Vercel. (2026). Next.js documentation. https://nextjs.org/docs"
    # Already APA-shaped lines we added previously — normalise retrieval wording
    if t.startswith("Schwaber, K.") and "scrum guide" in t.lower():
        return (
            "Schwaber, K., & Sutherland, J. (2020). The scrum guide. Scrum Guides. "
            "https://scrumguides.org/scrum-guide.html"
        )
    if t.startswith("Prisma") and "prisma.io" in t:
        return "Prisma. (2026). Prisma ORM documentation. https://www.prisma.io/docs"
    if t.startswith("OWASP"):
        return (
            "OWASP Foundation. (2023). Password storage cheat sheet. OWASP Cheat Sheet Series. "
            "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
        )
    if t.startswith("W3C") and "WCAG" in t:
        return (
            "W3C. (2023). Web content accessibility guidelines (WCAG) 2.2. W3C. https://www.w3.org/TR/WCAG22/"
        )
    if t.startswith("IUCN"):
        return "IUCN. (2024). The IUCN red list of threatened species. https://www.iucnredlist.org/"
    if t.startswith("Sommerville, I.") or t.startswith("Somerville, I."):
        return "Sommerville, I. (2016). Software engineering (10th ed.). Pearson Education."
    if t.startswith("Nielsen, J."):
        return (
            "Nielsen, J. (2012). Usability 101: Introduction to usability. Nielsen Norman Group. "
            "https://www.nngroup.com/articles/usability-101-introduction-to-usability/"
        )
    return None


def apply_apa7_reference_list(doc: Document) -> None:
    in_refs = False
    for p in doc.paragraphs:
        raw = p.text.strip()
        if raw == "REFERENCES":
            in_refs = True
            continue
        if in_refs and raw == "APPENDICES":
            break
        if in_refs and raw:
            converted = convert_existing_reference_line_to_apa7(p.text)
            if converted is not None:
                p.text = converted


def main() -> None:
    base = os.path.dirname(os.path.abspath(__file__))
    src = os.path.join(base, "Omar_Zakhama_14498572_SUBMIT_READY_CITATIONS.docx")
    if not os.path.isfile(src):
        src = os.path.join(base, "Omar_Zakhama_14498572_SUBMIT_READY_ENHANCED.docx")
    out = os.path.join(base, "Omar_Zakhama_14498572_SUBMIT_READY_SUBMISSION.docx")
    shot_dir = os.path.join(base, "appendix_screenshots")

    try:
        shutil.copy2(src, out)
    except OSError:
        out = os.path.join(base, "Omar_Zakhama_14498572_SUBMIT_READY_SUBMISSION_APA7.docx")
        shutil.copy2(src, out)
    doc = Document(out)
    fix_encoding(doc)
    insert_apa7_note_after_references_heading(doc)
    apply_apa7_reference_list(doc)
    blob = "\n".join(p.text for p in doc.paragraphs)

    # Public repo URL everywhere
    gh = "https://github.com/Zyfiury/komodo-hub.git"
    for p in doc.paragraphs:
        if "[YOUR_USERNAME]" in p.text or "[YOUR_REPO]" in p.text:
            p.text = (
                p.text.replace("https://github.com/[YOUR_USERNAME]/[YOUR_REPO]", gh.rstrip(".git"))
                .replace("[YOUR_USERNAME]/[YOUR_REPO]", "Zyfiury/komodo-hub")
            )

    # Embed screenshots after figure captions
    mapping = [
        ("Figure A1.", os.path.join(shot_dir, "appendix-a-landing.png")),
        ("Figure B1.", os.path.join(shot_dir, "appendix-b-teacher.png")),
        ("Figure C1.", os.path.join(shot_dir, "appendix-c-wildlife.png")),
        ("Figure D1.", os.path.join(shot_dir, "appendix-d-foundation.png")),
    ]
    for prefix, img in mapping:
        for i, p in enumerate(doc.paragraphs):
            if p.text.strip().startswith(prefix):
                # Avoid duplicate images on re-run
                nxt_idx = i + 1
                if nxt_idx < len(doc.paragraphs):
                    nxt = doc.paragraphs[nxt_idx]
                    if nxt._element.xpath(".//w:drawing"):
                        continue
                insert_picture_after(p, img)
                break

    def _has_drawing(paragraph: Paragraph) -> bool:
        xml = paragraph._element.xml
        if isinstance(xml, bytes):
            return b"drawing" in xml
        return "drawing" in xml

    # Optional Figure A2: public library after A1 image
    lib_img = os.path.join(shot_dir, "appendix-public-library.png")
    if os.path.isfile(lib_img) and "Figure A2." not in blob:
        for i, p in enumerate(doc.paragraphs):
            if not p.text.strip().startswith("Figure A1."):
                continue
            # paragraph after A1 caption that contains the screenshot
            for j in range(i + 1, min(i + 5, len(doc.paragraphs))):
                if _has_drawing(doc.paragraphs[j]):
                    cap = insert_paragraph_after(doc.paragraphs[j], "")
                    cap.add_run(
                        "Figure A2. Public library browse (anonymous access to approved materials) (Hapsara, 2023)."
                    )
                    insert_picture_after(cap, lib_img)
                    break
            break

    # Extra references in APA 7th edition (dedupe by distinctive substring)
    blob = "\n".join(p.text for p in doc.paragraphs)
    extras_refs = [
        ("Schwaber, K., & Sutherland", "Schwaber, K., & Sutherland, J. (2020). The scrum guide. Scrum Guides. https://scrumguides.org/scrum-guide.html"),
        ("Prisma. (2026)", "Prisma. (2026). Prisma ORM documentation. https://www.prisma.io/docs"),
        ("OWASP Foundation. (2023)", "OWASP Foundation. (2023). Password storage cheat sheet. OWASP Cheat Sheet Series. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"),
        ("W3C. (2023)", "W3C. (2023). Web content accessibility guidelines (WCAG) 2.2. W3C. https://www.w3.org/TR/WCAG22/"),
        ("IUCN. (2024)", "IUCN. (2024). The IUCN red list of threatened species. https://www.iucnredlist.org/"),
        ("Sommerville, I. (2016)", "Sommerville, I. (2016). Software engineering (10th ed.). Pearson Education."),
        ("Nielsen, J. (2012", "Nielsen, J. (2012). Usability 101: Introduction to usability. Nielsen Norman Group. https://www.nngroup.com/articles/usability-101-introduction-to-usability/"),
    ]
    anchor = None
    for p in doc.paragraphs:
        if p.text.startswith("International Organization for Standardization") or p.text.startswith(
            "International Organisation for Standardization"
        ):
            anchor = p
            break
    if anchor:
        cur = anchor
        for key, line in extras_refs:
            if key not in blob:
                cur = insert_paragraph_after(cur, line)
                blob += line

    # Appendix K at end of document (after all other appendices)
    blob = "\n".join(p.text for p in doc.paragraphs)
    if "Appendix K. Supplementary evidence" not in blob:
        anchor_end = None
        for p in reversed(doc.paragraphs):
            if p.text.strip():
                anchor_end = p
                break
        if anchor_end is not None:
            cur = anchor_end
            for line in [
                "",
                "Appendix K. Supplementary evidence list (submission checklist)",
                "• A to D: live prototype screenshots (embedded in this document).",
                "• E: public source repository and configuration template.",
                "• F to G: execution steps and seeded role credentials for assessors.",
                "• H to J: contact, AI use, and originality.",
                "• Diagram sources (UML/DFD/ERD) should match files stored in the repository or linked OneDrive as described in Appendix E (Talekar, 2025c).",
                "",
            ]:
                cur = insert_paragraph_after(cur, line)

    # Second pass: normalise any newly inserted lines that still matched Harvard phrasing
    apply_apa7_reference_list(doc)

    doc.save(out)
    print("Wrote:", out)


if __name__ == "__main__":
    main()
