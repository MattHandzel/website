#!/usr/bin/env python3

import sys
from pathlib import Path
from database.schema import DatabaseManager
from parsers.content_parser import ContentParser
from parsers.habits_parser import HabitsParser
from parsers.financial_parser import FinancialParser
from parsers.metrics_parser import MetricsParser

def main():
    print("Starting markdown processing pipeline...")
    
    base_dir = Path(__file__).parent.parent
    obsidian_dir = base_dir / "mock-obsidian"
    
    if not obsidian_dir.exists():
        print(f"Error: Obsidian directory not found at {obsidian_dir}")
        sys.exit(1)
    
    db_manager = DatabaseManager(str(base_dir / "database" / "website.db"))
    print("Database initialized")
    
    content_parser = ContentParser(db_manager)
    habits_parser = HabitsParser(db_manager)
    financial_parser = FinancialParser(db_manager)
    metrics_parser = MetricsParser(db_manager)
    
    print("\nProcessing content files...")
    content_dir = obsidian_dir / "content"
    if content_dir.exists():
        content_parser.parse_content_files(content_dir)
    else:
        print(f"Warning: Content directory not found at {content_dir}")
    
    print("\nProcessing habits files...")
    habits_dir = obsidian_dir / "habits"
    if habits_dir.exists():
        habits_parser.parse_habits_files(habits_dir)
    else:
        print(f"Warning: Habits directory not found at {habits_dir}")
    
    print("\nProcessing financial files...")
    financial_dir = obsidian_dir / "financial"
    if financial_dir.exists():
        financial_parser.parse_financial_files(financial_dir)
    else:
        print(f"Warning: Financial directory not found at {financial_dir}")
    
    print("\nProcessing metrics files...")
    metrics_dir = obsidian_dir / "metrics"
    if metrics_dir.exists():
        metrics_parser.parse_metrics_files(metrics_dir)
    else:
        print(f"Warning: Metrics directory not found at {metrics_dir}")
    
    print("\nProcessing complete!")
    
    print("\nDatabase summary:")
    content_items = db_manager.get_content()
    habits_items = db_manager.get_habits(limit=10)
    financial_items = db_manager.get_financial_data()
    metrics_items = db_manager.get_metrics(limit=10)
    
    print(f"- Content items: {len(content_items)}")
    print(f"- Habit entries: {len(habits_items)}")
    print(f"- Financial entries: {len(financial_items)}")
    print(f"- Metric entries: {len(metrics_items)}")

if __name__ == "__main__":
    main()
