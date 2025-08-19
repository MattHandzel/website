import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, Iterator, List, Optional, Tuple

try:
    import frontmatter
    from frontmatter import Post
except Exception:
    frontmatter = None
    Post = None  # type: ignore


INT_MAX = 2**63 - 1
NOTE_EXTENSIONS = {".md"}


def iter_notes(vault_root: Path, extensions: Optional[List[str]] = None, followlinks: bool = True) -> Iterator[Path]:
    exts = set([e.lower() if e.startswith(".") else f".{e.lower()}" for e in (extensions or list(NOTE_EXTENSIONS))])
    for root, dirs, files in os.walk(vault_root, followlinks=followlinks):
        for f in files:
            p = Path(root) / f
            if p.suffix.lower() in exts:
                yield p


def read_text(p: Path) -> Optional[str]:
    try:
        return p.read_text(encoding="utf-8")
    except Exception:
        return None


def parse_frontmatter_and_content(raw: str) -> Tuple[Dict[str, Any], str]:
    if frontmatter is not None:
        meta, content = frontmatter.parse(raw)
        return dict(meta or {}), content
    lines = raw.splitlines()
    if len(lines) >= 3 and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                meta_block = "\n".join(lines[1:i])
                content = "\n".join(lines[i + 1 :])
                return {}, content
    return {}, raw


def write_note(p: Path, meta: Dict[str, Any], content: str, raw_fallback: str) -> bool:
    try:
        if frontmatter is not None and Post is not None and meta:
            p.write_text(frontmatter.dumps(Post(content, **meta)), encoding="utf-8")
        else:
            p.write_text(content, encoding="utf-8")
        return True
    except Exception:
        try:
            p.write_text(raw_fallback, encoding="utf-8")
        except Exception:
            pass
        return False


def path_parents(p: Path, stop: Optional[Path] = None) -> List[str]:
    parts: List[str] = []
    cur = p.parent
    stop = stop.resolve() if stop else None
    while True:
        if stop and cur.resolve() == stop:
            break
        if cur == cur.parent:
            break
        parts.append(cur.name)
        cur = cur.parent
    parts.reverse()
    return parts


Predicate = Callable[[Path, Dict[str, Any], str, Path], bool]
Processor = Callable[[Path, Dict[str, Any], str, Path, Dict[str, Any]], Tuple[Dict[str, Any], str, bool]]


class Router:
    def __init__(self) -> None:
        self.routes: List[Tuple[Predicate, List[Processor]]] = []

    def add_route(self, predicate: Predicate, processors: List[Processor]) -> None:
        self.routes.append((predicate, processors))

    def match(self, note_path: Path, meta: Dict[str, Any], content: str, vault_root: Path) -> List[Processor]:
        for pred, procs in self.routes:
            try:
                if pred(note_path, meta, content, vault_root):
                    return procs
            except Exception:
                continue
        return []


def has_tag(meta: Dict[str, Any], tag_val: str) -> bool:
    tags = meta.get("tags")
    if isinstance(tags, str):
        return tag_val in re.split(r"[\s,;]+", tags)
    if isinstance(tags, list):
        return tag_val in [str(t) for t in tags]
    return False


def parent_contains(note_path: Path, name: str) -> bool:
    return any(part.lower() == name.lower() for part in path_parents(note_path))


def predicate_dailies(note_path: Path, meta: Dict[str, Any], content: str, vault_root: Path) -> bool:
    if parent_contains(note_path, "dailies"):
        return True
    if has_tag(meta, "daily") or has_tag(meta, "dailies"):
        return True
    return False


def processor_noop(note_path: Path, meta: Dict[str, Any], content: str, vault_root: Path, ctx: Dict[str, Any]) -> Tuple[Dict[str, Any], str, bool]:
    return {}, content, False


def run_pipeline(
    vault_root: Path,
    router: Router,
    max_notes: int = INT_MAX,
    dry_run: bool = False,
    clear_bottom_matter: bool = False,
    bottom_matter_project: str = "",
    banned_folders: Optional[List[str]] = None,
    base_ctx: Optional[Dict[str, Any]] = None,
    extensions: Optional[List[str]] = None,
) -> Dict[str, Any]:
    processed = 0
    stats = {"processed": 0, "updated": 0, "skipped": 0, "errors": 0}
    bm_header = f"\n---\n\n**{bottom_matter_project}**" if bottom_matter_project else ""
    banned = [b.lower() for b in (banned_folders or [])]

    for note in iter_notes(vault_root, extensions=extensions):
        if processed >= max_notes:
            break

        if any(parent_contains(note, b) for b in banned):
            stats["skipped"] += 1
            processed += 1
            continue

        raw = read_text(note)
        if not raw:
            stats["skipped"] += 1
            processed += 1
            continue

        meta, content = parse_frontmatter_and_content(raw)
        if clear_bottom_matter and bm_header and bm_header in content:
            content = content.split(bm_header)[0]

        processors = router.match(note, meta, content, vault_root)
        if not processors:
            stats["skipped"] += 1
            processed += 1
            continue

        ctx: Dict[str, Any] = dict(base_ctx or {})
        aggregated_bm: Dict[str, Any] = {}
        updated = False
        for proc in processors:
            try:
                bm, new_content, did_update = proc(note, meta, content, vault_root, ctx)
                if bm:
                    aggregated_bm.update(bm)
                if did_update:
                    content = new_content
                    updated = True
            except Exception:
                stats["errors"] += 1

        if aggregated_bm:
            content = _update_bottom_matter(content, aggregated_bm, bm_header or "\n---\n\n**AUTO**")

        if updated or aggregated_bm:
            stats["updated"] += 1
            if not dry_run:
                ok = write_note(note, meta, content, raw)
                if not ok:
                    stats["errors"] += 1

        stats["processed"] += 1
        processed += 1

    return stats


def _update_bottom_matter(content: str, data: Dict[str, Any], header: str) -> str:
    base = content
    if header in base:
        base = base.split(header)[0]
    lines = [base, header, ""]
    for k, v in data.items():
        if isinstance(v, list):
            v = ", ".join(str(x) for x in v)
        lines.append(f"{k}: {v}")
    if data:
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Process a Second Brain vault with pluggable routing based on tags/metadata/folders.")
    parser.add_argument("--vault", type=Path, required=True, help="Path to the Obsidian vault root")
    parser.add_argument("--max-notes", type=int, default=INT_MAX)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--clear-bottom-matter", action="store_true")
    parser.add_argument("--bottom-matter-project", type=str, default="RELATED_NOTES_BOT")
    parser.add_argument("--out-json", type=Path, default=None, help="Optional path to write a summary JSON report")
    parser.add_argument("--report-json", type=Path, default=None, help="Alias of --out-json")
    parser.add_argument("--out-dir", type=Path, default=None, help="Optional base output directory for processors")
    parser.add_argument("--ban", action="append", default=[], help="Folder name to skip (can be specified multiple times)")
    parser.add_argument("--type", choices=["all", "dailies"], default="all", help="Restrict processing to a specific note type")
    parser.add_argument("--ext", action="append", default=[], help="Note file extensions to include (repeatable), e.g. --ext md")
    args = parser.parse_args()

    router = Router()

    try:
        from .process_dailies import process_daily_note  # type: ignore
    except Exception:
        def process_daily_note(note_path, meta, content, vault_root, ctx):
            return {}, content, False

    if args.type in ("all", "dailies"):
        router.add_route(predicate_dailies, [process_daily_note])

    router.add_route(lambda p, m, c, r: False, [processor_noop])

    base_ctx: Dict[str, Any] = {}
    if args.out_dir:
        base_ctx["out_dir"] = str(args.out_dir)

    exts = list(args.ext or []) or list(NOTE_EXTENSIONS)

    stats = run_pipeline(
        vault_root=args.vault.resolve(),
        router=router,
        max_notes=args.max_notes,
        dry_run=args.dry_run,
        clear_bottom_matter=args.clear_bottom_matter,
        bottom_matter_project=args.bottom_matter_project,
        banned_folders=list(args.ban or []),
        base_ctx=base_ctx,
        extensions=exts,
    )

    out_path = args.out_json or args.report_json
    if out_path:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(stats, indent=2), encoding="utf-8")

    print(json.dumps(stats))


if __name__ == "__main__":
    main()
