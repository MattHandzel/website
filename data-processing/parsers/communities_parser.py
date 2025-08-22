import frontmatter
import re
from pathlib import Path
from datetime import datetime

class CommunitiesParser:
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def parse_communities_files(self, content_dir):
        content_path = Path(content_dir)
        
        for md_file in content_path.glob("*communities*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                communities = self.extract_communities_table(post.content)
                
                for community in communities:
                    community_data = {
                        'id': f"{post.metadata.get('id', md_file.stem)}_{community['name'].lower().replace(' ', '_')}",
                        'community_name': community['name'],
                        'description': community['description'],
                        'personal_affiliation': community['affiliation'],
                        'created_date': post.metadata.get('created_date', datetime.now().isoformat()),
                        'metadata': {
                            'source_file': str(md_file),
                            'file_id': post.metadata.get('id', md_file.stem)
                        }
                    }
                    
                    self.db_manager.insert_community(community_data)
                
                print(f"Processed {len(communities)} communities from {md_file.name}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def extract_communities_table(self, content):
        """Extract community data from markdown table"""
        communities = []
        lines = content.split('\n')
        
        table_start = None
        for i, line in enumerate(lines):
            if '| Community' in line and '| Description' in line and '| Personal Affiliation' in line:
                table_start = i + 2
                break
        
        if table_start is None:
            return communities
        
        for line in lines[table_start:]:
            line = line.strip()
            if not line or not line.startswith('|'):
                break
            
            parts = [part.strip() for part in line.split('|')[1:-1]]
            
            if len(parts) >= 3:
                community_name = parts[0].strip()
                description = parts[1].strip()
                affiliation_str = parts[2].strip()
                
                affiliation = None
                if affiliation_str and affiliation_str != '':
                    try:
                        affiliation = float(affiliation_str)
                    except ValueError:
                        affiliation = None
                
                if community_name and description:
                    communities.append({
                        'name': community_name,
                        'description': description,
                        'affiliation': affiliation
                    })
        
        return communities
