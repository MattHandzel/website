import frontmatter
import re
from pathlib import Path
from datetime import datetime

class HabitsParser:
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def parse_habits_files(self, habits_dir):
        habits_path = Path(habits_dir)
        
        for md_file in habits_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                self.extract_daily_habits(post.content, post.metadata)
                print(f"Processed habits file: {md_file.name}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def extract_daily_habits(self, content, metadata):
        lines = content.split('\n')
        current_date = None
        
        for line in lines:
            line = line.strip()
            
            date_match = re.match(r'## (\d{4}-\d{2}-\d{2})', line)
            if date_match:
                current_date = date_match.group(1)
                continue
            
            if current_date and line.startswith('- ['):
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
                        'id': f"{current_date}_{habit_name.lower().replace(' ', '_')}",
                        'date': current_date,
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
