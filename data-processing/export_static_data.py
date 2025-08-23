#!/usr/bin/env python3

import json
import sys
from pathlib import Path
from database.schema import DatabaseManager
from collections import defaultdict
from datetime import datetime

def export_dailies_timeline(db_manager):
    """Export dailies timeline data showing count of dailies written per date"""
    habits_data = db_manager.get_habits()
    
    daily_counts = defaultdict(int)
    unique_dates = set()
    
    for habit in habits_data:
        date = habit['date']
        if date not in unique_dates:
            unique_dates.add(date)
            daily_counts[date] = 1
    
    timeline_data = []
    for date in sorted(daily_counts.keys()):
        timeline_data.append({
            'date': date,
            'count': daily_counts[date],
            'formatted_date': datetime.strptime(date, '%Y-%m-%d').strftime('%b %d, %Y')
        })
    
    return timeline_data

def export_static_data():
    """Export database data to static JSON files for Next.js static generation"""
    print("Exporting database data to static JSON files...")
    
    base_dir = Path(__file__).parent.parent
    db_path = base_dir / "database" / "website.db"
    output_dir = base_dir / "website" / "data"
    
    output_dir.mkdir(exist_ok=True)
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        print("Please run 'python main.py' first to populate the database")
        sys.exit(1)
    
    db_manager = DatabaseManager(str(db_path))
    
    print("Exporting content data...")
    content_data = db_manager.get_content()
    with open(output_dir / "content.json", "w") as f:
        json.dump(content_data, f, indent=2, default=str)
    print(f"Exported {len(content_data)} content items")
    
    print("Exporting habits data...")
    habits_data = db_manager.get_habits(limit=50)
    with open(output_dir / "habits.json", "w") as f:
        json.dump(habits_data, f, indent=2, default=str)
    print(f"Exported {len(habits_data)} habit entries")
    
    print("Exporting financial data...")
    financial_data = db_manager.get_financial_data()
    with open(output_dir / "financial.json", "w") as f:
        json.dump(financial_data, f, indent=2, default=str)
    print(f"Exported {len(financial_data)} financial entries")
    
    print("Exporting metrics data...")
    metrics_data = db_manager.get_metrics(limit=100)
    with open(output_dir / "metrics.json", "w") as f:
        json.dump(metrics_data, f, indent=2, default=str)
    print(f"Exported {len(metrics_data)} metric entries")
    
    print("Exporting communities data...")
    communities_data = db_manager.get_communities()
    with open(output_dir / "communities.json", "w") as f:
        json.dump(communities_data, f, indent=2, default=str)
    print(f"Exported {len(communities_data)} community entries")
    
    print("Exporting Anki data...")
    anki_data = db_manager.get_anki_reviews(limit=500)
    with open(output_dir / "anki.json", "w") as f:
        json.dump(anki_data, f, indent=2, default=str)
    print(f"Exported {len(anki_data)} Anki review entries")
    
    print("Exporting blog data...")
    blog_data = db_manager.get_content(content_type='blog')
    with open(output_dir / "blog.json", "w") as f:
        json.dump(blog_data, f, indent=2, default=str)
    print(f"Exported {len(blog_data)} blog posts")
    
    print("Exporting thoughts data...")
    thoughts_data = db_manager.get_thoughts(limit=1000)
    with open(output_dir / "thoughts.json", "w") as f:
        json.dump(thoughts_data, f, indent=2, default=str)
    print(f"Exported {len(thoughts_data)} thoughts")
    
    print("Exporting dailies timeline data...")
    dailies_timeline = export_dailies_timeline(db_manager)
    with open(output_dir / "dailies_timeline.json", "w") as f:
        json.dump(dailies_timeline, f, indent=2, default=str)
    print(f"Exported {len(dailies_timeline)} dailies timeline entries")
    
    print(f"\nStatic data export complete! Files saved to {output_dir}")
    print("Next.js can now use these files for static generation")

if __name__ == "__main__":
    export_static_data()
