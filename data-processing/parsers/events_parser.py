import os
import yaml
from pathlib import Path
from datetime import datetime

class EventsParser:
    def __init__(self, config):
        self.config = config
        self.events_dir = config.get_directory_path('events')
    
    def parse_events(self):
        events = []
        
        if not self.events_dir.exists():
            print(f"Events directory not found: {self.events_dir}")
            return events
        
        for file_path in self.events_dir.glob("*.md"):
            try:
                event_data = self._parse_event_file(file_path)
                if event_data:
                    events.append(event_data)
            except Exception as e:
                print(f"Error parsing event file {file_path}: {e}")
        
        return events
    
    def _parse_event_file(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                frontmatter = yaml.safe_load(parts[1])
                body = parts[2].strip()
            else:
                return None
        else:
            return None
        
        if not frontmatter.get('public', False):
            return None
        
        event_data = {
            'id': frontmatter.get('id', file_path.stem),
            'title': frontmatter.get('title', ''),
            'location': frontmatter.get('location', ''),
            'start_date': frontmatter.get('start_date', ''),
            'end_date': frontmatter.get('end_date', ''),
            'latitude': frontmatter.get('latitude'),
            'longitude': frontmatter.get('longitude'),
            'event_type': frontmatter.get('event_type', ''),
            'tags': frontmatter.get('tags', []),
            'public': frontmatter.get('public', False),
            'content': body,
            'created_date': frontmatter.get('created_date', ''),
            'last_edited_date': frontmatter.get('last_edited_date', ''),
            'metadata': {
                'file_path': str(file_path),
                'file_name': file_path.name
            }
        }
        
        return event_data
