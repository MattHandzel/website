import frontmatter
import re
from pathlib import Path
from datetime import datetime
import hashlib
from .utils import strip_html_comments

def generate_principle_id(title, level, parent_id='root'):
    return hashlib.md5(f"{parent_id}-{title}-{level}".encode()).hexdigest()

class PrinciplesParser:
    def __init__(self, db_manager, start_date=None, logger=None):
        self.db_manager = db_manager
        self.start_date = start_date
        self.logger = logger

    def parse_principles_files(self, principles_dir):
        self.db_manager.clear_principles()
        principles_path = Path(principles_dir)

        for md_file in principles_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)

                if self._should_skip_file(post.metadata, md_file.name):
                    continue

                self._parse_and_store_principles(post)

            except Exception as e:
                print(f"Error processing {md_file}: {e}")

    def _parse_and_store_principles(self, post):
        lines = post.content.split('\n')
        principles = []
        current_principle = None

        for line in lines:
            match = re.match(r'^(#+)\s+(.*)', line)
            if match:
                if current_principle:
                    principles.append(current_principle)
                
                level = len(match.group(1))
                title = match.group(2).strip()
                current_principle = {
                    'title': title,
                    'level': level,
                    'content': '',
                    'created_date': post.metadata.get('created_date', datetime.now().isoformat()),
                    'last_edited_date': post.metadata.get('last_edited_date', datetime.now().isoformat()),
                }
            elif current_principle:
                current_principle['content'] += line + '\n'
        
        if current_principle:
            principles.append(current_principle)

        parent_stack = []
        for p in principles:
            if p['title'].lower() == 'principles':
                continue

            while parent_stack and parent_stack[-1]['level'] >= p['level']:
                parent_stack.pop()
            
            parent_id = parent_stack[-1]['id'] if parent_stack else None
            p['parent_id'] = parent_id
            p['id'] = generate_principle_id(p['title'], p['level'], parent_id)
            p['content'] = strip_html_comments(p['content'].strip())
            
            self.db_manager.insert_principle(p)
            parent_stack.append(p)

    def _should_skip_file(self, metadata, filename):
        """Check if file should be skipped based on start_date filter"""
        if not self.start_date:
            return False
        
        created_date_str = metadata.get('created_date')
        last_edited_str = metadata.get('last_edited_date')
        
        try:
            file_date = None
            if created_date_str:
                file_date = datetime.fromisoformat(created_date_str.replace('Z', '+00:00'))
            elif last_edited_str:
                file_date = datetime.fromisoformat(last_edited_str.replace('Z', '+00:00'))
            
            if file_date and file_date.replace(tzinfo=None) < self.start_date:
                if self.logger:
                    self.logger.debug(f"Skipping {filename}: file date {file_date.strftime('%Y-%m-%d')} is before start date {self.start_date.strftime('%Y-%m-%d')}")
                print(f"Skipping {filename}: before start date")
                return True
                
        except (ValueError, TypeError) as e:
            if self.logger:
                self.logger.warning(f"Could not parse date for {filename}: {e}")
        
        return False
