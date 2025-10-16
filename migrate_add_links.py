#!/usr/bin/env python3
"""Migration script to add links column to projects table"""
import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "database" / "website.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(projects)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'links' not in columns:
        print("Adding 'links' column to projects table...")
        cursor.execute("ALTER TABLE projects ADD COLUMN links TEXT")
        conn.commit()
        print("✓ Column added successfully!")
    else:
        print("'links' column already exists in projects table")
        
except Exception as e:
    print(f"Error during migration: {e}")
    conn.rollback()
finally:
    conn.close()

print("Migration complete!")
