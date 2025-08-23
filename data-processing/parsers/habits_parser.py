import frontmatter
import re
from pathlib import Path
from datetime import datetime

class HabitsParser:
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def parse_dailies_files(self, dailies_dir):
        dailies_path = Path(dailies_dir)
        
        for md_file in dailies_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                self.extract_daily_habits_and_objectives(post.content, post.metadata, md_file.stem)
                print(f"Processed daily file: {md_file.name}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def extract_daily_habits_and_objectives(self, content, metadata, date_str):
        lines = content.split('\n')
        in_habits_section = False
        in_objectives_section = False
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            if line == '#### Habits':
                in_habits_section = True
                in_objectives_section = False
                continue
            
            if '### Objectives' in line:
                in_habits_section = False
                in_objectives_section = True
                continue
                
            if line.startswith('#') and line not in ['#### Habits', '### Objectives']:
                in_habits_section = False
                in_objectives_section = False
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
            
            if in_objectives_section and re.match(r'^\d+\.\s+(.+)', line):
                objective_match = re.match(r'^(\d+)\.\s+(.+)', line)
                if objective_match:
                    priority = int(objective_match.group(1))
                    objective_text = objective_match.group(2).strip()
                    
                    if objective_text:
                        objective_data = {
                            'id': f"{date_str}_objective_{priority}",
                            'date': date_str,
                            'habit_name': f"Objective {priority}: {objective_text}",
                            'completed': False,
                            'duration': None,
                            'notes': f"Priority: {priority}",
                            'created_date': metadata.get('created_date', datetime.now().isoformat())
                        }
                        
                        self.db_manager.insert_habit(objective_data)
    
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
