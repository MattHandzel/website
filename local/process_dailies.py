import argparse
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


SECTION_HABITS = re.compile(r"^\s*#{3,}\s*Habits\s*$", re.IGNORECASE)
SECTION_DAILY_REFLECTION = re.compile(r"^\s*#{2,}\s*Daily Reflection\s*$", re.IGNORECASE)
SECTION_CBT = re.compile(r"^\s*#{3,}\s*Cognitive Behavioral Therapy\s*$", re.IGNORECASE)

CHECKBOX_LINE = re.compile(r"^\s*-\s*\[(?P<mark>[ xX])\]\s*(?P<label>.+?)\s*$")
BOLD_Q = re.compile(r"^\s*\*\*(?P<q>[^*]+)\*\*\s*$")
TABLE_SEP = re.compile(r"^\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*-{3,}\s*\|\s*$")
TABLE_ROW = re.compile(r"^\s*\|\s*(?P<a>.+?)\s*\|\s*(?P<b>.+?)\s*\|\s*(?P<c>.+?)\s*\|\s*$")


def extract_habits(lines: List[str], start_idx: int) -> Tuple[List[Dict[str, Any]], int]:
    items: List[Dict[str, Any]] = []
    i = start_idx + 1
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith("#"):
            break
        m = CHECKBOX_LINE.match(line)
        if m:
            mark = m.group("mark").lower()
            label = m.group("label").strip()
            items.append({"label": label, "completed": mark == "x"})
        i += 1
    return items, i


def extract_daily_reflection(lines: List[str], start_idx: int) -> Tuple[Dict[str, str], int]:
    res: Dict[str, str] = {}
    i = start_idx + 1
    cur_q: Optional[str] = None
    buf: List[str] = []
    def flush():
        nonlocal buf, cur_q
        if cur_q is not None:
            res[cur_q] = "\n".join(x for x in buf).strip()
        buf = []
        cur_q = None
    while i < len(lines):
        line = lines[i]
        if SECTION_CBT.match(line) or line.strip().startswith("### "):
            flush()
            break
        if line.strip().startswith("#"):
            flush()
            break
        m = BOLD_Q.match(line)
        if m:
            flush()
            cur_q = m.group("q").strip()
        else:
            buf.append(line)
        i += 1
    flush()
    return res, i


def extract_cbt_table(lines: List[str], start_idx: int) -> Tuple[List[Dict[str, str]], int]:
    rows: List[Dict[str, str]] = []
    i = start_idx + 1
    while i < len(lines) and lines[i].strip() == "":
        i += 1
    if i < len(lines) and lines[i].strip().startswith("|"):
        i += 1
    if i < len(lines) and TABLE_SEP.match(lines[i]):
        i += 1
    while i < len(lines):
        line = lines[i]
        if not line.strip().startswith("|"):
            break
        m = TABLE_ROW.match(line)
        if m:
            rows.append({
                "thought": m.group("a").strip(),
                "distortion": m.group("b").strip(),
                "balanced": m.group("c").strip(),
            })
        else:
            break
        i += 1
    return rows, i


def parse_daily_note_content(content: str) -> Dict[str, Any]:
    lines = content.splitlines()
    i = 0
    habits: List[Dict[str, Any]] = []
    reflection: Dict[str, str] = {}
    cbt_rows: List[Dict[str, str]] = []
    while i < len(lines):
        line = lines[i]
        if SECTION_HABITS.match(line):
            h, i = extract_habits(lines, i)
            habits.extend(h)
            continue
        if SECTION_DAILY_REFLECTION.match(line):
            dr, i = extract_daily_reflection(lines, i)
            reflection.update(dr)
            continue
        if SECTION_CBT.match(line):
            rows, i = extract_cbt_table(lines, i)
            cbt_rows.extend(rows)
            continue
        i += 1
    completed = sum(1 for x in habits if x.get("completed"))
    total = len(habits)
    return {
        "habits": habits,
        "habits_completed": completed,
        "habits_total": total,
        "daily_reflection": reflection,
        "cbt": cbt_rows,
    }


def process_daily_note(note_path: Path, meta: Dict[str, Any], content: str, vault_root: Path, ctx: Dict[str, Any]):
    data = parse_daily_note_content(content)
    out_dir = ctx.get("out_dir")
    if out_dir:
        rel = note_path.relative_to(vault_root)
        out_path = Path(out_dir) / "dailies" / rel.with_suffix(".json").name
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    bm = {
        "habits_completed": data.get("habits_completed"),
        "habits_total": data.get("habits_total"),
    }
    return bm, content, False


def cli():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", type=Path, required=True)
    args = parser.parse_args()
    raw = args.file.read_text(encoding="utf-8")
    meta = {}
    parsed = parse_daily_note_content(raw)
    print(json.dumps(parsed, indent=2))


if __name__ == "__main__":
    cli()
