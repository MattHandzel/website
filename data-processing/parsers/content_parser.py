import frontmatter
import re
from pathlib import Path
from datetime import datetime

class ContentParser:
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def parse_content_files(self, content_dir):
        content_path = Path(content_dir)
        
        for md_file in content_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                content_data = {
                    'id': post.metadata.get('id', md_file.stem),
                    'title': post.metadata.get('title', md_file.stem.replace('-', ' ').title()),
                    'type': post.metadata.get('type', 'content'),
                    'public': post.metadata.get('public', True),
                    'created_date': post.metadata.get('created_date', datetime.now().isoformat()),
                    'last_edited_date': post.metadata.get('last_edited_date', datetime.now().isoformat()),
                    'content': post.content,
                    'metadata': {
                        'file_path': str(md_file),
                        'aliases': post.metadata.get('aliases', []),
                        'tags': post.metadata.get('tags', [])
                    }
                }
                
                self.db_manager.insert_content(content_data)
                print(f"Processed content: {content_data['title']}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def extract_content_sections(self, content):
        sections = {}
        current_section = None
        current_content = []
        
        for line in content.split('\n'):
            if line.startswith('#'):
                if current_section:
                    sections[current_section] = '\n'.join(current_content)
                
                current_section = line.strip('#').strip()
                current_content = []
            else:
                current_content.append(line)
        
        if current_section:
            sections[current_section] = '\n'.join(current_content)
        
        return sections
