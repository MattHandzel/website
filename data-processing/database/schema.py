import sqlite3
import json
from pathlib import Path

class DatabaseManager:
    def __init__(self, db_path="database/website.db"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
    
    def init_database(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS content (
                id TEXT PRIMARY KEY,
                title TEXT,
                type TEXT,
                public BOOLEAN,
                created_date TEXT,
                last_edited_date TEXT,
                content TEXT,
                metadata TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS habits (
                id TEXT PRIMARY KEY,
                date TEXT,
                habit_name TEXT,
                completed BOOLEAN,
                duration INTEGER,
                notes TEXT,
                created_date TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS financial_data (
                id TEXT PRIMARY KEY,
                month TEXT,
                category TEXT,
                subcategory TEXT,
                amount REAL,
                type TEXT,
                created_date TEXT,
                metadata TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS metrics (
                id TEXT PRIMARY KEY,
                date TEXT,
                metric_type TEXT,
                metric_name TEXT,
                value REAL,
                unit TEXT,
                metadata TEXT,
                created_date TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS communities (
                id TEXT PRIMARY KEY,
                community_name TEXT,
                description TEXT,
                personal_affiliation REAL,
                what_ive_done TEXT,
                related_notes TEXT,
                blog_posts TEXT,
                media_links TEXT,
                website_sections TEXT,
                projects TEXT,
                events_attended TEXT,
                contribution_level TEXT,
                created_date TEXT,
                metadata TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS anki_reviews (
                id TEXT PRIMARY KEY,
                card_id TEXT,
                deck_name TEXT,
                note_content TEXT,
                review_date TEXT,
                ease_button INTEGER,
                interval_days INTEGER,
                previous_interval_days INTEGER,
                ease_factor INTEGER,
                time_spent_ms INTEGER,
                review_type INTEGER,
                created_date TEXT,
                metadata TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS thoughts (
                id TEXT PRIMARY KEY,
                capture_id TEXT,
                timestamp TEXT,
                content TEXT,
                modalities TEXT,
                context TEXT,
                sources TEXT,
                tags TEXT,
                location_latitude REAL,
                location_longitude REAL,
                location_city TEXT,
                location_country TEXT,
                location_timezone TEXT,
                processing_status TEXT,
                created_date TEXT,
                last_edited_date TEXT,
                metadata TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                title TEXT,
                location TEXT,
                start_date TEXT,
                end_date TEXT,
                latitude REAL,
                longitude REAL,
                event_type TEXT,
                tags TEXT,
                is_public BOOLEAN,
                content TEXT,
                created_date TEXT,
                last_edited_date TEXT,
                metadata TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def insert_content(self, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO content 
            (id, title, type, public, created_date, last_edited_date, content, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['title'],
            data['type'],
            data['public'],
            data['created_date'],
            data['last_edited_date'],
            data['content'],
            json.dumps(data.get('metadata', {}))
        ))
        
        conn.commit()
        conn.close()
    
    def insert_habit(self, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO habits 
            (id, date, habit_name, completed, duration, notes, created_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['date'],
            data['habit_name'],
            data['completed'],
            data.get('duration'),
            data.get('notes', ''),
            data['created_date']
        ))
        
        conn.commit()
        conn.close()
    
    def insert_financial_data(self, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO financial_data 
            (id, month, category, subcategory, amount, type, created_date, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['month'],
            data['category'],
            data['subcategory'],
            data['amount'],
            data['type'],
            data['created_date'],
            json.dumps(data.get('metadata', {}))
        ))
        
        conn.commit()
        conn.close()
    
    def insert_metric(self, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO metrics 
            (id, date, metric_type, metric_name, value, unit, metadata, created_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['date'],
            data['metric_type'],
            data['metric_name'],
            data['value'],
            data['unit'],
            json.dumps(data.get('metadata', {})),
            data['created_date']
        ))
        
        conn.commit()
        conn.close()
    
    def get_content(self, content_type=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if content_type:
            cursor.execute('SELECT * FROM content WHERE type = ? AND public = 1', (content_type,))
        else:
            cursor.execute('SELECT * FROM content WHERE public = 1')
        
        results = cursor.fetchall()
        conn.close()
        
        return [dict(zip([col[0] for col in cursor.description], row)) for row in results]
    
    def get_habits(self, limit=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM habits ORDER BY date DESC'
        if limit:
            query += f' LIMIT {limit}'
        
        cursor.execute(query)
        results = cursor.fetchall()
        conn.close()
        
        return [dict(zip([col[0] for col in cursor.description], row)) for row in results]
    
    def get_financial_data(self, month=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if month:
            cursor.execute('SELECT * FROM financial_data WHERE month = ?', (month,))
        else:
            cursor.execute('SELECT * FROM financial_data ORDER BY month DESC')
        
        results = cursor.fetchall()
        conn.close()
        
        return [dict(zip([col[0] for col in cursor.description], row)) for row in results]
    
    def get_metrics(self, metric_type=None, limit=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM metrics'
        params = []
        
        if metric_type:
            query += ' WHERE metric_type = ?'
            params.append(metric_type)
        
        query += ' ORDER BY date DESC'
        
        if limit:
            query += f' LIMIT {limit}'
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        
        return [dict(zip([col[0] for col in cursor.description], row)) for row in results]
    
    def insert_community(self, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO communities 
            (id, community_name, description, personal_affiliation, what_ive_done, related_notes, blog_posts, 
             media_links, website_sections, projects, events_attended, contribution_level, 
             created_date, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['community_name'],
            data['description'],
            data.get('personal_affiliation'),
            data.get('what_ive_done', ''),
            json.dumps(data.get('related_notes', [])),
            json.dumps(data.get('blog_posts', [])),
            json.dumps(data.get('media_links', [])),
            json.dumps(data.get('website_sections', [])),
            json.dumps(data.get('projects', [])),
            json.dumps(data.get('events_attended', [])),
            data.get('contribution_level'),
            data['created_date'],
            json.dumps(data.get('metadata', {}))
        ))
        
        conn.commit()
        conn.close()
    
    def get_communities(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM communities ORDER BY personal_affiliation DESC, community_name ASC')
        results = cursor.fetchall()
        conn.close()
        
        return [dict(zip([col[0] for col in cursor.description], row)) for row in results]
    
    def insert_anki_review(self, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO anki_reviews 
            (id, card_id, deck_name, note_content, review_date, ease_button, 
             interval_days, previous_interval_days, ease_factor, time_spent_ms, 
             review_type, created_date, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['card_id'],
            data.get('deck_name', ''),
            data.get('note_content', ''),
            data['review_date'],
            data.get('ease_button'),
            data.get('interval_days'),
            data.get('previous_interval_days'),
            data.get('ease_factor'),
            data.get('time_spent_ms'),
            data.get('review_type'),
            data['created_date'],
            json.dumps(data.get('metadata', {}))
        ))
        
        conn.commit()
        conn.close()
    
    def get_anki_reviews(self, limit=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM anki_reviews ORDER BY review_date DESC'
        if limit:
            query += f' LIMIT {limit}'
        
        cursor.execute(query)
        results = cursor.fetchall()
        conn.close()
        
        return [dict(zip([col[0] for col in cursor.description], row)) for row in results]
    
    def insert_thought(self, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        location = data.get('location', {})
        
        cursor.execute('''
            INSERT OR REPLACE INTO thoughts 
            (id, capture_id, timestamp, content, modalities, context, sources, tags,
             location_latitude, location_longitude, location_city, location_country, 
             location_timezone, processing_status, created_date, last_edited_date, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data.get('capture_id'),
            data.get('timestamp'),
            data['content'],
            json.dumps(data.get('modalities', [])),
            json.dumps(data.get('context', [])),
            json.dumps(data.get('sources', [])),
            json.dumps(data.get('tags', [])),
            location.get('latitude'),
            location.get('longitude'),
            location.get('city'),
            location.get('country'),
            location.get('timezone'),
            data.get('processing_status'),
            data['created_date'],
            data['last_edited_date'],
            json.dumps(data.get('metadata', {}))
        ))
        
        conn.commit()
        conn.close()
    
    def get_thoughts(self, limit=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM thoughts ORDER BY timestamp DESC'
        if limit:
            query += f' LIMIT {limit}'
        
        cursor.execute(query)
        results = cursor.fetchall()
        conn.close()
        
        return [dict(zip([col[0] for col in cursor.description], row)) for row in results]
    
    def insert_event(self, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO events 
            (id, title, location, start_date, end_date, latitude, longitude, 
             event_type, tags, is_public, content, created_date, last_edited_date, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'],
            data['title'],
            data['location'],
            data['start_date'],
            data['end_date'],
            data.get('latitude'),
            data.get('longitude'),
            data.get('event_type'),
            json.dumps(data.get('tags', [])),
            data.get('is_public', False),
            data['content'],
            data['created_date'],
            data['last_edited_date'],
            json.dumps(data.get('metadata', {}))
        ))
        
        conn.commit()
        conn.close()
    
    def get_events(self, limit=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM events WHERE is_public = 1 ORDER BY start_date DESC'
        if limit:
            query += f' LIMIT {limit}'
        
        cursor.execute(query)
        results = cursor.fetchall()
        conn.close()
        
        return [dict(zip([col[0] for col in cursor.description], row)) for row in results]
