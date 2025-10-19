import frontmatter
import re
from pathlib import Path
from datetime import datetime
from .utils import strip_html_comments


class IdeasParser:
    """Parser for the ideas.md file that contains a numbered list of project ideas"""
    
    def __init__(self, db_manager, logger=None):
        self.db_manager = db_manager
        self.logger = logger
    
    def parse_ideas_file(self, ideas_file_path):
        """Parse the ideas markdown file and extract individual ideas from the numbered list"""
        ideas_path = Path(ideas_file_path)
        
        if not ideas_path.exists():
            print(f"Ideas file not found at {ideas_path}")
            if self.logger:
                self.logger.warning(f"Ideas file not found at {ideas_path}")
            return []
        
        try:
            with open(ideas_path, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            # Extract metadata from frontmatter
            file_metadata = post.metadata
            content = strip_html_comments(post.content)
            
            # Parse the numbered list of ideas
            ideas = self._parse_numbered_list(content)
            
            if self.logger:
                self.logger.info(f"Parsed {len(ideas)} ideas from {ideas_path}")
            
            print(f"Parsed {len(ideas)} project ideas from {ideas_path.name}")
            
            return ideas
            
        except Exception as e:
            print(f"Error parsing ideas file: {e}")
            if self.logger:
                self.logger.error(f"Error parsing ideas file: {e}")
            return []
    
    def _parse_numbered_list(self, content):
        """Parse numbered list items from markdown content"""
        ideas = []
        
        # Pattern to match numbered list items (e.g., "1. ", "23. ")
        # This captures multi-line items by looking ahead to the next number or end of string
        pattern = r'^\d+\.\s+(.+?)(?=^\d+\.\s+|\Z)'
        
        matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
        
        for idx, match in enumerate(matches, start=1):
            idea_text = match.group(1).strip()
            
            # Clean up the text - remove extra whitespace and newlines
            idea_text = ' '.join(idea_text.split())
            
            # Extract title (first sentence or first 100 chars)
            title = self._extract_title(idea_text)
            
            ideas.append({
                'id': idx,
                'title': title,
                'description': idea_text
            })
        
        return ideas
    
    def _extract_title(self, text):
        """Extract a title from the idea text (first sentence or first 100 chars)"""
        # Try to get the first sentence
        sentence_end = re.search(r'[.!?]\s', text)
        if sentence_end:
            title = text[:sentence_end.start() + 1].strip()
        else:
            title = text
        
        # If title is too long, truncate to 100 chars
        if len(title) > 100:
            title = title[:97] + '...'
        
        return title
