import frontmatter
import os
from pathlib import Path
from datetime import datetime
from .utils import strip_html_comments


class BooksParser:
    def __init__(self, db_manager, start_date=None, logger=None):
        self.db_manager = db_manager
        self.start_date = start_date
        self.logger = logger

    def parse_books_files(self, books_dir):
        books_path = Path(books_dir)

        if not books_path.exists():
            print(f"Books directory not found at {books_path}")
            return

        for book_dir in books_path.iterdir():
            if not book_dir.is_dir():
                continue

            book_title = book_dir.name.replace("-", " ").title()
            book_notes = []
            has_public_notes = False

            for md_file in book_dir.glob("*.md"):
                try:
                    with open(md_file, "r", encoding="utf-8") as f:
                        post = frontmatter.load(f)

                    public = post.metadata.get("public", False)
                    if public:
                        has_public_notes = True

                    note_data = {
                        "id": f"{book_dir.name}-{md_file.stem}",
                        "title": post.metadata.get(
                            "title", md_file.stem.replace("-", " ").title()
                        ),
                        "type": "book",
                        "public": public,
                        "created_date": post.metadata.get(
                            "created_date", datetime.now().isoformat()
                        ),
                        "last_edited_date": post.metadata.get(
                            "last_edited_date", datetime.now().isoformat()
                        ),
                        "content": strip_html_comments(post.content) if public else "",
                        "metadata": {
                            "file_path": str(md_file),
                            "book_title": post.metadata.get("book_title", book_title),
                            "author": post.metadata.get("author", ""),
                            "rating": post.metadata.get("rating"),
                            "status": post.metadata.get("status", ""),
                            "tags": post.metadata.get("tags", []),
                            "book_directory": book_dir.name,
                            "note_type": md_file.stem,
                        },
                    }

                    book_notes.append(note_data)

                except Exception as e:
                    print(f"Error processing {md_file}: {e}")

            if book_notes or True:
                book_entry = {
                    "id": f"book-{book_dir.name}",
                    "title": book_title,
                    "type": "book",
                    "public": has_public_notes,
                    "created_date": datetime.now().isoformat(),
                    "last_edited_date": datetime.now().isoformat(),
                    "content": f"Book: {book_title}",
                    "metadata": {
                        "book_directory": book_dir.name,
                        "has_public_notes": has_public_notes,
                        "notes_count": len(book_notes),
                    },
                }

                self.db_manager.insert_content(book_entry)
                print(
                    f"Processed book: {book_title} ({len(book_notes)} notes, {has_public_notes and 'has {} public notes' or 'no public notes'})"
                )

                for note in book_notes:
                    self.db_manager.insert_content(note)

    def _should_skip_file(self, metadata, filename):
        if not self.start_date:
            return False

        created_date_str = metadata.get("created_date")
        last_edited_str = metadata.get("last_edited_date")

        try:
            file_date = None
            if created_date_str:
                file_date = datetime.fromisoformat(
                    created_date_str.replace("Z", "+00:00")
                )
            elif last_edited_str:
                file_date = datetime.fromisoformat(
                    last_edited_str.replace("Z", "+00:00")
                )

            if file_date and file_date.replace(tzinfo=None) < self.start_date:
                if self.logger:
                    self.logger.debug(
                        f"Skipping {filename}: file date {file_date.strftime('%Y-%m-%d')} is before start date {self.start_date.strftime('%Y-%m-%d')}"
                    )
                print(f"Skipping {filename}: before start date")
                return True

        except (ValueError, TypeError) as e:
            if self.logger:
                self.logger.warning(f"Could not parse date for {filename}: {e}")

        return False
