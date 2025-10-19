#!/usr/bin/env python3

import re
from pathlib import Path
from .utils import strip_html_comments


class LineDancingParser:
    """Parser for line dancing markdown files with table format"""

    def __init__(self, db_manager=None):
        self.db_manager = db_manager

    def parse_line_dancing_file(self, file_path):
        """Parse line dancing markdown file and extract both tables"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            print(f"Line dancing file not found at {file_path}")
            return {"dances_i_know": [], "dances_to_learn": []}

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Strip HTML comments from the content
        content = strip_html_comments(content)

        result = {
            "dances_i_know": self._parse_table_section(content, "Dances I Know"),
            "dances_to_learn": self._parse_table_section(content, "Dances I Want to Learn"),
        }

        return result

    def _parse_table_section(self, content, section_header):
        """Parse a specific table section from the markdown content"""
        dances = []
        
        # Find the section
        section_pattern = rf'### {re.escape(section_header)}(.*?)(?=###|\Z)'
        section_match = re.search(section_pattern, content, re.DOTALL)
        
        if not section_match:
            print(f"Section '{section_header}' not found")
            return dances
        
        section_content = section_match.group(1)
        
        # Split into lines
        lines = section_content.strip().split('\n')
        
        # Find table header and separator
        header_index = None
        for i, line in enumerate(lines):
            if '|' in line and 'Name' in line:
                header_index = i
                break
        
        if header_index is None or header_index + 2 >= len(lines):
            print(f"Table not found in section '{section_header}'")
            return dances
        
        # Parse table rows (skip header and separator)
        for line in lines[header_index + 2:]:
            line = line.strip()
            if not line or not line.startswith('|'):
                continue
            
            # Split by | and clean up
            cells = [cell.strip() for cell in line.split('|')[1:-1]]
            
            if len(cells) >= 6:
                name = cells[0].strip()
                artist = cells[1].strip()
                tutorial_link = cells[3].strip()
                my_video = cells[4].strip()
                notes = cells[5].strip() if len(cells) > 5 else ""
                
                # Skip empty rows or rows with no name
                if not name:
                    continue
                
                # Create dance entry
                dance = {
                    "name": name,
                    "artist": artist if artist else None,
                    "tutorial_link": tutorial_link if tutorial_link else None,
                    "my_video": my_video if my_video else None,
                    "notes": notes if notes else None,
                }
                
                dances.append(dance)
        
        return dances
