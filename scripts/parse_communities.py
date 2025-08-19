import argparse
import csv
import json
import re
import shutil
import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional

TABLE_ROW_RE = re.compile(r"^\s*\|+\s*(.+?)\s*\|\s*$")

def parse_markdown_table(md_lines: List[str]) -> List[Dict[str, Any]]:
    rows: List[List[str]] = []
    headers: List[str] = []
    in_table = False
    for line in md_lines:
        if line.strip().startswith("|") and TABLE_ROW_RE.match(line):
            cells = [c.strip() for c in TABLE_ROW_RE.match(line).group(1).split("|")]
            if not in_table:
                headers = cells
                in_table = True
            else:
                if set(cells) == set(["-"] * len(cells)) or all(re.match(r"^-{3,}$", c) for c in cells):
                    continue
                rows.append(cells)
        elif in_table and line.strip() == "":
            break

    if not headers or not rows:
        return []

    data: List[Dict[str, Any]] = []
    for r in rows:
        rec = {}
        for i, h in enumerate(headers):
            key = re.sub(r"\s+", "_", h.strip().lower())
            rec[key] = r[i].strip() if i < len(r) else ""
        data.append(rec)
    return data

def to_float_or_none(val: str) -> Optional[float]:
    v = val.strip()
    if v == "" or v == "—":
        return None
    try:
        return float(v)
    except ValueError:
        return None

def create_db(db_path: Path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("""
        create table if not exists communities (
            id integer primary key,
            community text,
            description text,
            estimated_size_in_san_francisco real,
            online_community_irl_community text,
            personal_affiliation real
        )
    """)
    conn.commit()
    return conn

def insert_records(conn, records: List[Dict[str, Any]]):
    cur = conn.cursor()
    for rec in records:
        community = rec.get("community", "")
        description = rec.get("description", "")
        size = to_float_or_none(rec.get("estimated_size_in_san_francisco", ""))
        online_irl = rec.get("online_community_;_irl_community", "") or rec.get("online_community_irl_community", "")
        affiliation = to_float_or_none(rec.get("personal_affiliation", ""))
        cur.execute("""
            insert into communities (community, description, estimated_size_in_san_francisco, online_community_irl_community, personal_affiliation)
            values (?, ?, ?, ?, ?)
        """, (community, description, size, online_irl, affiliation))
    conn.commit()

def export_csv(conn, out_csv: Path):
    cur = conn.cursor()
    rows = cur.execute("select community, description, estimated_size_in_san_francisco, online_community_irl_community, personal_affiliation from communities").fetchall()
    with out_csv.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["community", "description", "estimated_size_in_san_francisco", "online_community_irl_community", "personal_affiliation"])
        writer.writerows(rows)

def export_json(records: List[Dict[str, Any]], out_json: Path):
    out_json.parent.mkdir(parents=True, exist_ok=True)
    transformed = []
    for rec in records:
        combined = rec.get("online_community_;_irl_community", "") or rec.get("online_community_irl_community", "")
        online = ""
        irl = ""
        if combined:
            parts = [p.strip() for p in combined.split(";")]
            if len(parts) >= 1:
                online = parts[0]
            if len(parts) >= 2:
                irl = parts[1]
        transformed.append({
            "name": rec.get("community", ""),
            "description": rec.get("description", ""),
            "estSizeSF": to_float_or_none(rec.get("estimated_size_in_san_francisco", "")),
            "online": online,
            "irl": irl,
            "personalAffiliation": to_float_or_none(rec.get("personal_affiliation", "")),
        })
    out_json.write_text(json.dumps(transformed, indent=2), encoding="utf-8")

def main():
    parser = argparse.ArgumentParser(description="Parse COMMUNITIES.md markdown table into a SQLite database and optional JSON export.")
    parser.add_argument("--md", type=Path, default=Path(__file__).resolve().parents[1] / "COMMUNITIES.md", help="Path to COMMUNITIES.md")
    parser.add_argument("--db", type=Path, default=Path(__file__).resolve().parents[1] / "data" / "communities.db", help="Path to SQLite DB to create/update")
    parser.add_argument("--csv", type=Path, default=None, help="Optional path to export CSV")
    parser.add_argument("--json", type=Path, default=Path(__file__).resolve().parents[1] / "data" / "communities.json", help="Optional path to export JSON")
    parser.add_argument("--public-json", action="store_true", help="Also copy the JSON to site/public/communities.json for the frontend")
    args = parser.parse_args()

    md_path: Path = args.md
    db_path: Path = args.db
    db_path.parent.mkdir(parents=True, exist_ok=True)

    if not md_path.exists():
        print(f"Missing markdown file: {md_path}")
        return

    lines = md_path.read_text(encoding="utf-8").splitlines()
    records = parse_markdown_table(lines)
    if not records:
        print("No records parsed from markdown table.")
        return

    conn = create_db(db_path)
    insert_records(conn, records)

    if args.csv:
        export_csv(conn, args.csv)

    if args.json:
        export_json(records, args.json)
        if args.public_json:
            public_path = Path(__file__).resolve().parents[1] / "site" / "public" / "communities.json"
            public_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(args.json, public_path)

    conn.close()
    print(f"Imported {len(records)} communities into {db_path}")
    if args.json:
        print(f"Exported JSON to {args.json}")
if __name__ == "__main__":
    main()
