import json
import subprocess
from datetime import datetime
from pathlib import Path


class TaskWarriorParser:
    """Parser for TaskWarrior data - exports tasks directly from TaskWarrior"""
    
    def __init__(self, db_manager=None, logger=None):
        self.db_manager = db_manager
        self.logger = logger
    
    def export_tasks(self):
        """Export all tasks from TaskWarrior using the 'task export' command"""
        try:
            result = subprocess.run(
                ['task', 'export'],
                capture_output=True,
                text=True,
                check=True
            )
            
            tasks_raw = json.loads(result.stdout)
            tasks = self._process_tasks(tasks_raw)
            
            if self.logger:
                self.logger.info(f"Exported {len(tasks)} tasks from TaskWarrior")
            
            print(f"Exported {len(tasks)} tasks from TaskWarrior")
            return tasks
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Error running 'task export': {e}"
            print(error_msg)
            if self.logger:
                self.logger.error(error_msg)
            return []
        except json.JSONDecodeError as e:
            error_msg = f"Error parsing TaskWarrior JSON: {e}"
            print(error_msg)
            if self.logger:
                self.logger.error(error_msg)
            return []
    
    def _process_tasks(self, tasks_raw):
        """Process and normalize task data"""
        processed_tasks = []
        
        for task in tasks_raw:
            processed_task = {
                'id': task.get('id', 0),
                'uuid': task.get('uuid', ''),
                'description': task.get('description', ''),
                'status': task.get('status', 'pending'),
                'entry': task.get('entry'),  # When task was created
                'modified': task.get('modified'),
                'due': task.get('due'),
                'end': task.get('end'),  # When task was completed/deleted
                'priority': task.get('priority', ''),
                'project': task.get('project', ''),
                'tags': task.get('tags', []),
                'urgency': task.get('urgency', 0),
                
                # Custom attributes
                'utility': task.get('utility'),
                'effort': task.get('effort'),
                'next_action': task.get('next-action', ''),
                
                # Computed fields for frontend
                'created_date': self._parse_date(task.get('entry')),
                'completed_date': self._parse_date(task.get('end')) if task.get('status') in ['completed', 'deleted'] else None,
                'due_date': self._parse_date(task.get('due')),
                'lead_time_days': self._calculate_lead_time(task),
            }
            
            processed_tasks.append(processed_task)
        
        return processed_tasks
    
    def _parse_date(self, date_str):
        """Parse TaskWarrior date format to ISO string"""
        if not date_str:
            return None
        
        try:
            # TaskWarrior uses format: 20250901T171658Z
            dt = datetime.strptime(date_str, '%Y%m%dT%H%M%SZ')
            return dt.isoformat()
        except (ValueError, TypeError):
            return None
    
    def _calculate_lead_time(self, task):
        """Calculate lead time in days (entry to completion)"""
        if task.get('status') not in ['completed'] or not task.get('end'):
            return None
        
        try:
            entry_date = datetime.strptime(task['entry'], '%Y%m%dT%H%M%SZ')
            end_date = datetime.strptime(task['end'], '%Y%m%dT%H%M%SZ')
            delta = end_date - entry_date
            return delta.days
        except (ValueError, KeyError, TypeError):
            return None
