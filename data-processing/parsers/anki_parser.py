import csv
import json
import sqlite3
from pathlib import Path
from datetime import datetime

class AnkiParser:
    def __init__(self, db_manager, start_date=None, logger=None):
        self.db_manager = db_manager
        self.start_date = start_date
        self.logger = logger
    
    def parse_anki_files(self, anki_dir):
        anki_path = Path(anki_dir)
        
        for file_path in anki_path.glob("*.txt"):
            try:
                self.parse_text_export(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        for file_path in anki_path.glob("*.db"):
            try:
                self.parse_anki_database(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
    
    def parse_text_export(self, file_path):
        print(f"Processing Anki text export: {file_path.name}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            
            for i, row in enumerate(reader):
                if len(row) >= 2:
                    card_data = {
                        'id': f"{file_path.stem}_{i}",
                        'card_id': f"text_export_{i}",
                        'deck_name': file_path.stem,
                        'note_content': ' | '.join(row),
                        'review_date': datetime.now().isoformat(),
                        'created_date': datetime.now().isoformat(),
                        'metadata': {
                            'source_file': str(file_path),
                            'export_type': 'text',
                            'field_count': len(row)
                        }
                    }
                    
                    self.db_manager.insert_anki_review(card_data)
    
    def parse_anki_database(self, db_path):
        print(f"Processing Anki database: {db_path.name}")
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT r.id, r.cid, r.ease, r.ivl, r.lastIvl, r.factor, r.time, r.type,
                       c.did, n.flds
                FROM revlog r
                LEFT JOIN cards c ON r.cid = c.id
                LEFT JOIN notes n ON c.nid = n.id
                ORDER BY r.id DESC
                LIMIT 1000
            ''')
            
            reviews = cursor.fetchall()
            
            for review in reviews:
                review_id, card_id, ease, interval, last_interval, factor, time_ms, review_type, deck_id, note_fields = review
                
                review_date = datetime.fromtimestamp(review_id / 1000)
                
                if self._should_skip_review(review_date):
                    continue
                
                review_data = {
                    'id': str(review_id),
                    'card_id': str(card_id),
                    'deck_name': f"deck_{deck_id}" if deck_id else "unknown",
                    'note_content': note_fields[:200] if note_fields else "",
                    'review_date': review_date.isoformat(),
                    'ease_button': ease,
                    'interval_days': interval if interval > 0 else None,
                    'previous_interval_days': last_interval if last_interval > 0 else None,
                    'ease_factor': factor,
                    'time_spent_ms': time_ms,
                    'review_type': review_type,
                    'created_date': datetime.now().isoformat(),
                    'metadata': {
                        'source_file': str(db_path),
                        'export_type': 'database'
                    }
                }
                
                self.db_manager.insert_anki_review(review_data)
            
            conn.close()
            print(f"Processed {len(reviews)} Anki reviews")
            
        except sqlite3.Error as e:
            print(f"SQLite error processing {db_path}: {e}")
    
    def _should_skip_review(self, review_date):
        """Check if Anki review should be skipped based on start_date filter"""
        if not self.start_date:
            return False
        
        if review_date < self.start_date:
            if self.logger:
                self.logger.debug(f"Skipping Anki review: review date {review_date.strftime('%Y-%m-%d')} is before start date {self.start_date.strftime('%Y-%m-%d')}")
            return True
        
        return False
