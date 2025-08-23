import frontmatter
import re
from pathlib import Path
from datetime import datetime

class HabitsParser:
    def __init__(self, db_manager, start_date=None, logger=None):
        self.db_manager = db_manager
        self.start_date = start_date
        self.logger = logger
    
    def parse_dailies_files(self, dailies_dir):
        dailies_path = Path(dailies_dir)
        
        for md_file in dailies_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                if self._should_skip_file(post.metadata, md_file.stem):
                    continue
                
                self.extract_daily_habits(post.content, post.metadata, md_file.stem)
                print(f"Processed daily file: {md_file.name}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def extract_daily_habits(self, content, metadata, date_str):
        lines = content.split('\n')
        in_habits_section = False
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            if line == '#### Habits':
                in_habits_section = True
                continue
            
            if line.startswith('#'):
                in_habits_section = False
                continue
            
            if in_habits_section and line.startswith('- ['):
                habit_match = re.match(r'- \[([ x])\] (.+?)(?:\((.+?)\))?$', line)
                if habit_match:
                    completed = habit_match.group(1) == 'x'
                    habit_name = habit_match.group(2).strip()
                    duration_str = habit_match.group(3)
                    
                    duration = None
                    if duration_str:
                        duration_match = re.search(r'(\d+)', duration_str)
                        if duration_match:
                            duration = int(duration_match.group(1))
                    
                    habit_data = {
                        'id': f"{date_str}_{habit_name.lower().replace(' ', '_').replace(',', '').replace('.', '')}",
                        'date': date_str,
                        'habit_name': habit_name,
                        'completed': completed,
                        'duration': duration,
                        'notes': duration_str if duration_str else '',
                        'created_date': metadata.get('created_date', datetime.now().isoformat())
                    }
                    
                    self.db_manager.insert_habit(habit_data)
    
    def calculate_habit_streaks(self, habit_name):
        habits = self.db_manager.get_habits()
        habit_records = [h for h in habits if h['habit_name'] == habit_name]
        habit_records.sort(key=lambda x: x['date'])
        
        current_streak = 0
        max_streak = 0
        
        for record in habit_records:
            if record['completed']:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
        
        return {
            'current_streak': current_streak,
            'max_streak': max_streak,
            'completion_rate': len([r for r in habit_records if r['completed']]) / len(habit_records) if habit_records else 0
        }
    
    def _should_skip_file(self, metadata, date_str):
        """Check if file should be skipped based on start_date filter"""
        if not self.start_date:
            return False
        
        try:
            file_date = datetime.strptime(date_str, '%Y-%m-%d')
            
            if file_date < self.start_date:
                if self.logger:
                    self.logger.debug(f"Skipping {date_str}: file date is before start date {self.start_date.strftime('%Y-%m-%d')}")
                print(f"Skipping {date_str}: before start date")
                return True
                
        except ValueError as e:
            if self.logger:
                self.logger.warning(f"Could not parse date from filename {date_str}: {e}")
        
        return False
