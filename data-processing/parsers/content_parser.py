import frontmatter
import re
from pathlib import Path
from datetime import datetime

class ContentParser:
    def __init__(self, db_manager, start_date=None, logger=None):
        self.db_manager = db_manager
        self.start_date = start_date
        self.logger = logger
    
    def parse_content_files(self, content_dir):
        content_path = Path(content_dir)
        
        for md_file in content_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                if self._should_skip_file(post.metadata, md_file.name):
                    continue
                
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
                if md_file.name == "about-this-site.md":
                    print("SUCCESS: about-this-site.md was parsed and added to the database.")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def parse_blog_files(self, blog_dir):
        blog_path = Path(blog_dir)
        
        for md_file in blog_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                public = post.metadata.get('public', False)
                if not public:
                    print(f"Skipping private blog post: {md_file.name}")
                    continue
                
                if self._should_skip_file(post.metadata, md_file.name):
                    continue
                
                content_data = {
                    'id': post.metadata.get('id', md_file.stem),
                    'title': post.metadata.get('title', md_file.stem.replace('-', ' ').title()),
                    'type': 'blog',
                    'public': public,
                    'created_date': post.metadata.get('created_date', datetime.now().isoformat()),
                    'last_edited_date': post.metadata.get('last_edited_date', datetime.now().isoformat()),
                    'content': post.content,
                    'metadata': {
                        'file_path': str(md_file),
                        'aliases': post.metadata.get('aliases', []),
                        'tags': post.metadata.get('tags', []),
                        'author': post.metadata.get('author', ''),
                        'status': post.metadata.get('status', 'draft'),
                        'reading_time_minutes': post.metadata.get('reading_time_minutes'),
                        'excerpt': post.metadata.get('excerpt', ''),
                        'featured_image': post.metadata.get('featured_image', ''),
                        'seo_title': post.metadata.get('seo_title', ''),
                        'seo_description': post.metadata.get('seo_description', ''),
                        'revision_history': post.metadata.get('revision_history', [])
                    }
                }
                
                self.db_manager.insert_content(content_data)
                print(f"Processed blog post: {content_data['title']}")
                
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
