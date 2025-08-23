import frontmatter
import re
from pathlib import Path
from datetime import datetime

class ThoughtsParser:
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def parse_thoughts_files(self, thoughts_dir):
        thoughts_path = Path(thoughts_dir)
        
        if not thoughts_path.exists():
            print(f"Thoughts directory not found: {thoughts_path}")
            return
        
        pattern = re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2}\.md$')
        
        for md_file in thoughts_path.glob("*.md"):
            if not pattern.match(md_file.name):
                print(f"Skipping file with invalid pattern: {md_file.name}")
                continue
                
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                if not post.metadata.get('capture_id'):
                    print(f"Skipping file without capture_id: {md_file.name}")
                    continue
                
                tags = post.metadata.get('tags', [])
                if 'public' not in tags:
                    print(f"Skipping private thought: {md_file.name}")
                    continue
                
                content = post.content
                if content.startswith('## Content\n'):
                    content = content[12:]
                
                thought_data = {
                    'id': post.metadata.get('id', md_file.stem),
                    'capture_id': post.metadata.get('capture_id'),
                    'timestamp': post.metadata.get('timestamp'),
                    'content': content.strip(),
                    'modalities': post.metadata.get('modalities', []),
                    'context': post.metadata.get('context', []),
                    'sources': post.metadata.get('sources', []),
                    'tags': tags,
                    'location': post.metadata.get('location', {}),
                    'processing_status': post.metadata.get('processing_status', 'raw'),
                    'created_date': post.metadata.get('created_date', datetime.now().isoformat()),
                    'last_edited_date': post.metadata.get('last_edited_date', datetime.now().isoformat()),
                    'metadata': {
                        'file_path': str(md_file),
                        'aliases': post.metadata.get('aliases', [])
                    }
                }
                
                self.db_manager.insert_thought(thought_data)
                print(f"Processed thought: {thought_data['capture_id']}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
