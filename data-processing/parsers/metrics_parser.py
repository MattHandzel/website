import frontmatter
import re
from pathlib import Path
from datetime import datetime

class MetricsParser:
    def __init__(self, db_manager, start_date=None, logger=None):
        self.db_manager = db_manager
        self.start_date = start_date
        self.logger = logger
    
    def parse_metrics_files(self, metrics_dir):
        metrics_path = Path(metrics_dir)
        
        for md_file in metrics_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                if self._should_skip_file(post.metadata, md_file.name):
                    continue
                
                self.extract_physiological_metrics(post.content, post.metadata)
                print(f"Processed metrics file: {md_file.name}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def extract_physiological_metrics(self, content, metadata):
        lines = content.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('## '):
                current_section = line.replace('## ', '').strip()
                continue
            
            if current_section and line.startswith('- '):
                self.parse_metric_line(line, current_section, metadata)
    
    def parse_metric_line(self, line, section, metadata):
        date_value_patterns = [
            r'- (\d{4}-\d{2}-\d{2}): ([\d.]+) hours?, (\d+)% quality',
            r'- (\d{4}-\d{2}-\d{2}): ([\d.]+) hours?',
            r'- (.+?): ([\d.]+)([a-zA-Z/%]+)?',
            r'- (.+?): ([\d,]+)([a-zA-Z/%]+)?'
        ]
        
        for pattern in date_value_patterns:
            match = re.match(pattern, line)
            if match:
                if pattern.startswith(r'- (\d{4}-\d{2}-\d{2})'):
                    date = match.group(1)
                    value = float(match.group(2))
                    unit = 'hours' if 'hours' in line else ''
                    
                    metric_data = {
                        'id': f"{date}_{section.lower().replace(' ', '_')}",
                        'date': date,
                        'metric_type': 'physiological',
                        'metric_name': section,
                        'value': value,
                        'unit': unit,
                        'metadata': {'section': section},
                        'created_date': metadata.get('created_date', datetime.now().isoformat())
                    }
                    
                    self.db_manager.insert_metric(metric_data)
                    
                    if len(match.groups()) > 2 and match.group(3):
                        quality_value = float(match.group(3))
                        quality_metric = {
                            'id': f"{date}_{section.lower().replace(' ', '_')}_quality",
                            'date': date,
                            'metric_type': 'physiological',
                            'metric_name': f"{section} Quality",
                            'value': quality_value,
                            'unit': '%',
                            'metadata': {'section': section, 'type': 'quality'},
                            'created_date': metadata.get('created_date', datetime.now().isoformat())
                        }
                        self.db_manager.insert_metric(quality_metric)
                
                else:
                    metric_name = match.group(1).strip()
                    value_str = match.group(2).replace(',', '')
                    unit = match.group(3) if len(match.groups()) > 2 and match.group(3) else ''
                    
                    try:
                        value = float(value_str)
                        
                        metric_data = {
                            'id': f"current_{metric_name.lower().replace(' ', '_')}",
                            'date': datetime.now().strftime('%Y-%m-%d'),
                            'metric_type': 'physiological',
                            'metric_name': metric_name,
                            'value': value,
                            'unit': unit,
                            'metadata': {'section': section, 'type': 'current'},
                            'created_date': metadata.get('created_date', datetime.now().isoformat())
                        }
                        
                        self.db_manager.insert_metric(metric_data)
                        
                    except ValueError:
                        continue
                
                break
    
    def calculate_metric_trends(self, metric_name, days=7):
        metrics = self.db_manager.get_metrics(limit=days*2)
        relevant_metrics = [m for m in metrics if m['metric_name'] == metric_name]
        relevant_metrics.sort(key=lambda x: x['date'])
        
        if len(relevant_metrics) < 2:
            return {'trend': 'insufficient_data', 'change': 0}
        
        recent_avg = sum(m['value'] for m in relevant_metrics[-days:]) / min(len(relevant_metrics), days)
        older_avg = sum(m['value'] for m in relevant_metrics[:-days]) / max(1, len(relevant_metrics) - days)
        
        change = recent_avg - older_avg
        trend = 'improving' if change > 0 else 'declining' if change < 0 else 'stable'
        
        return {
            'trend': trend,
            'change': change,
            'recent_average': recent_avg,
            'previous_average': older_avg
        }
    
    def _should_skip_file(self, metadata, filename):
        """Check if file should be skipped based on start_date filter"""
        if not self.start_date:
            return False
        
        created_date_str = metadata.get('created_date')
        
        try:
            if created_date_str:
                file_date = datetime.fromisoformat(created_date_str.replace('Z', '+00:00'))
                
                if file_date.replace(tzinfo=None) < self.start_date:
                    if self.logger:
                        self.logger.debug(f"Skipping {filename}: file date {file_date.strftime('%Y-%m-%d')} is before start date {self.start_date.strftime('%Y-%m-%d')}")
                    print(f"Skipping {filename}: before start date")
                    return True
                    
        except (ValueError, TypeError) as e:
            if self.logger:
                self.logger.warning(f"Could not parse date for {filename}: {e}")
        
        return False
