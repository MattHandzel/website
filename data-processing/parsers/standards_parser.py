#!/usr/bin/env python3

import frontmatter
from pathlib import Path
from .utils import strip_html_comments


class StandardsParser:
    """Parser for standards markdown file"""

    def __init__(self, db_manager=None):
        self.db_manager = db_manager

    def parse_standards_file(self, file_path):
        """Parse standards markdown file and extract content"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            print(f"Standards file not found at {file_path}")
            return {
                "title": "Standards",
                "content": "",
                "created_date": "",
                "last_edited_date": ""
            }

        with open(file_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)

        result = {
            "title": post.metadata.get("id", "Standards").title(),
            "content": strip_html_comments(post.content),
            "created_date": post.metadata.get("created_date", ""),
            "last_edited_date": post.metadata.get("last_edited_date", ""),
        }

        return result
