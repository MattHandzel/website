#!/usr/bin/env python3

import frontmatter
import re
from pathlib import Path
from datetime import datetime
from .utils import strip_html_comments


class VictoriesParser:
    """Parser for victories markdown file with date-based entries"""

    def __init__(self, db_manager=None):
        self.db_manager = db_manager

    def parse_date(self, date_str):
        """Parse various date formats and return ISO format date"""
        date_str = date_str.strip()
        
        # Try different date formats
        formats = [
            "%B %Y",           # "September 2025"
            "%B %d %Y",        # "September 15 2025"
            "%B %dth %Y",      # "April 23rd 2025"
            "%B %dst %Y",      # "April 21st 2025"
            "%B %dnd %Y",      # "April 22nd 2025"
            "%B %drd %Y",      # "April 23rd 2025"
            "%Y",              # "2025"
            "%b %Y",           # "Sep 2025"
        ]
        
        # Remove ordinal suffixes (st, nd, rd, th)
        cleaned_date = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)
        
        for fmt in formats:
            try:
                parsed_date = datetime.strptime(cleaned_date, fmt)
                return parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                continue
        
        # If no format matches, try to extract year and month
        year_match = re.search(r'\b(20\d{2})\b', date_str)
        month_match = re.search(r'\b(January|February|March|April|May|June|July|August|September|October|November|December|Fall|Spring|Summer|Winter)\b', date_str, re.IGNORECASE)
        
        if year_match:
            year = year_match.group(1)
            if month_match:
                month_str = month_match.group(1)
                # Map seasons to months
                season_map = {
                    'spring': '03',
                    'summer': '06',
                    'fall': '09',
                    'winter': '12'
                }
                if month_str.lower() in season_map:
                    return f"{year}-{season_map[month_str.lower()]}-01"
                else:
                    try:
                        month_num = datetime.strptime(month_str, "%B").month
                        return f"{year}-{month_num:02d}-01"
                    except ValueError:
                        pass
            return f"{year}-01-01"
        
        # Default to unknown date
        return "Unknown"

    def parse_victories_file(self, file_path):
        """Parse victories markdown file and extract date-based entries"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            print(f"Victories file not found at {file_path}")
            return []

        with open(file_path, "r", encoding="utf-8") as f:
            post = frontmatter.load(f)

        # Extract metadata
        metadata = {
            "created_date": post.metadata.get("created_date", ""),
            "last_edited_date": post.metadata.get("last_edited_date", ""),
        }

        # Parse content - each line with "Date: Description" format
        content = strip_html_comments(post.content)
        victories = []
        
        # Pattern to match lines like "September 2025: Description"
        pattern = r'^([^:]+):\s*(.+)$'
        
        for idx, line in enumerate(content.strip().split('\n'), start=1):
            line = line.strip()
            
            # Skip empty lines, headers, and markdown links
            if not line or line.startswith('#') or line.startswith('[') or line.startswith('---'):
                continue
            
            match = re.match(pattern, line)
            if match:
                date_str = match.group(1).strip()
                description = match.group(2).strip()
                
                parsed_date = self.parse_date(date_str)
                
                victories.append({
                    "id": idx,
                    "date": parsed_date,
                    "date_display": date_str,
                    "description": description,
                    "created_date": metadata["created_date"],
                    "last_edited_date": metadata["last_edited_date"]
                })

        # Sort by date (most recent first)
        victories.sort(key=lambda x: (x["date"] == "Unknown", x["date"]), reverse=True)
        
        # Reassign IDs after sorting
        for idx, victory in enumerate(victories, start=1):
            victory["id"] = idx

        print(f"Parsed {len(victories)} victories from {file_path.name}")
        return victories
