#!/usr/bin/env python3

import sys
import argparse
import logging
from pathlib import Path
from datetime import datetime
from config import Config
from database.schema import DatabaseManager
from parsers.content_parser import ContentParser
from parsers.habits_parser import HabitsParser
from parsers.financial_parser import FinancialParser
from parsers.metrics_parser import MetricsParser
from parsers.communities_parser import CommunitiesParser
from parsers.anki_parser import AnkiParser
from parsers.thoughts_parser import ThoughtsParser
from parsers.books_parser import BooksParser
from parsers.events_parser import EventsParser
from parsers.principles_parser import PrinciplesParser
from parsers.projects_parser import ProjectsParser


def setup_logging(enable_logging):
    """Setup logging configuration"""
    if enable_logging:
        logging.basicConfig(
            level=logging.DEBUG,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[logging.StreamHandler(sys.stdout)],
        )
    else:
        logging.basicConfig(level=logging.WARNING)

    return logging.getLogger(__name__)


def parse_start_date(date_str):
    """Parse start date string and return datetime object"""
    if not date_str:
        return None

    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError(f"Invalid date format: {date_str}. Use YYYY-MM-DD format.")


def main():
    parser = argparse.ArgumentParser(
        description="Process markdown files from Obsidian vault"
    )
    parser.add_argument("--log", action="store_true", help="Enable detailed logging")
    parser.add_argument(
        "--start-date",
        type=str,
        help="Only process files created/modified on or after this date (YYYY-MM-DD format)",
    )
    args = parser.parse_args()

    logger = setup_logging(args.log)

    print("Starting markdown processing pipeline...")
    if args.log:
        logger.info("Detailed logging enabled")

    start_date = None
    if args.start_date:
        try:
            start_date = parse_start_date(args.start_date)
            print(
                f"Date filtering enabled: processing files from {start_date.strftime('%Y-%m-%d')} onwards"
            )
            if args.log:
                logger.info(f"Start date filter: {start_date}")
        except ValueError as e:
            logger.error(f"Date parsing error: {e}")
            print(f"Error: {e}")
            sys.exit(1)

    try:
        logger.debug("Loading configuration...")
        config = Config()
        print(f"Loaded config from {config.config_path}")
        print(f"Vault base path: {config.get_vault_base_path()}")
        logger.debug(f"Config data: {config.data}")

        for dir_key in config.data["vault"]["directories"]:
            dir_path = config.get_directory_path(dir_key)
            logger.debug(
                f"Directory '{dir_key}' -> {dir_path} (exists: {dir_path.exists()})"
            )

    except FileNotFoundError as e:
        logger.error(f"Configuration error: {e}")
        print(f"Error: {e}")
        sys.exit(1)

    logger.debug(f"Database path: {config.get_database_path()}")
    db_manager = DatabaseManager(str(config.get_database_path()))
    print("Database initialized")

    content_parser = ContentParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    habits_parser = HabitsParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    financial_parser = FinancialParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    metrics_parser = MetricsParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    communities_parser = CommunitiesParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    anki_parser = AnkiParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    thoughts_parser = ThoughtsParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    books_parser = BooksParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    events_parser = EventsParser(config)
    principles_parser = PrinciplesParser(
        db_manager, start_date=start_date, logger=logger if args.log else None
    )
    excluded_projects = config.data.get('projects', {}).get('excluded_folders', [])
    projects_parser = ProjectsParser(
        db_manager, 
        excluded_folders=excluded_projects,
        start_date=start_date, 
        logger=logger if args.log else None
    )

    print("\nProcessing content files...")
    content_dir = config.get_directory_path("content")
    logger.debug(f"Content directory: {content_dir}")
    if content_dir.exists():
        logger.info(f"Found content directory at {content_dir}")
        files_found = list(content_dir.glob("*.md"))
        logger.debug(f"Found {len(files_found)} markdown files in content directory")
        for file in files_found:
            logger.debug(f"  - {file.name}")
        content_parser.parse_content_files(content_dir)
    else:
        logger.warning(f"Content directory not found at {content_dir}")
        print(f"Warning: Content directory not found at {content_dir}")

    print("\nProcessing blog files...")
    blog_dir = config.get_directory_path("blog")
    logger.debug(f"Blog directory: {blog_dir}")
    if blog_dir.exists():
        logger.info(f"Found blog directory at {blog_dir}")
        files_found = list(blog_dir.glob("*.md"))
        logger.debug(f"Found {len(files_found)} markdown files in blog directory")
        for file in files_found:
            logger.debug(f"  - {file.name}")
        content_parser.parse_blog_files(blog_dir)
    else:
        logger.warning(f"Blog directory not found at {blog_dir}")
        print(f"Warning: Blog directory not found at {blog_dir}")
        print(
            "Create the directory and add your blog posts to enable blog functionality"
        )

    print("\nProcessing habits files...")
    dailies_dir = config.get_directory_path("dailies")
    logger.debug(f"Dailies directory: {dailies_dir}")
    if dailies_dir.exists():
        logger.info(f"Found dailies directory at {dailies_dir}")
        files_found = list(dailies_dir.glob("*.md"))
        logger.debug(f"Found {len(files_found)} markdown files in dailies directory")
        for file in files_found:
            logger.debug(f"  - {file.name}")
        habits_parser.parse_dailies_files(dailies_dir)
    else:
        logger.warning(f"Dailies directory not found at {dailies_dir}")
        print(f"Warning: Dailies directory not found at {dailies_dir}")
        print(
            "Create the directory and add your daily notes to enable habits functionality"
        )

    print("\nProcessing financial files...")
    financial_dir = config.get_directory_path("financial")
    logger.debug(f"Financial directory: {financial_dir}")
    if financial_dir.exists():
        logger.info(f"Found financial directory at {financial_dir}")
        files_found = list(financial_dir.glob("*.md"))
        logger.debug(f"Found {len(files_found)} markdown files in financial directory")
        for file in files_found:
            logger.debug(f"  - {file.name}")
        financial_parser.parse_financial_files(financial_dir)
    else:
        logger.warning(f"Financial directory not found at {financial_dir}")
        print(f"Warning: Financial directory not found at {financial_dir}")

    print("\nProcessing metrics files...")
    metrics_dir = config.get_directory_path("metrics")
    logger.debug(f"Metrics directory: {metrics_dir}")
    if metrics_dir.exists():
        logger.info(f"Found metrics directory at {metrics_dir}")
        files_found = list(metrics_dir.glob("*.md"))
        logger.debug(f"Found {len(files_found)} markdown files in metrics directory")
        for file in files_found:
            logger.debug(f"  - {file.name}")
        metrics_parser.parse_metrics_files(metrics_dir)
    else:
        logger.warning(f"Metrics directory not found at {metrics_dir}")
        print(f"Warning: Metrics directory not found at {metrics_dir}")

    print("\nProcessing communities files...")
    content_dir = config.get_directory_path("content")
    logger.debug(f"Communities using content directory: {content_dir}")
    if content_dir.exists():
        logger.info(f"Found content directory for communities at {content_dir}")
        community_files = list(content_dir.glob("communities-i-am-a-part-of.md"))
        logger.debug(f"Found {len(community_files)} community files")
        for file in community_files:
            logger.debug(f"  - {file.name}")
        communities_parser.parse_communities_files(content_dir)
    else:
        logger.warning(f"Content directory not found at {content_dir}")
        print(f"Warning: Content directory not found at {content_dir}")

    print("\nProcessing Anki files...")
    anki_dir = config.get_directory_path("anki")
    logger.debug(f"Anki directory: {anki_dir}")
    if anki_dir.exists():
        logger.info(f"Found anki directory at {anki_dir}")
        txt_files = list(anki_dir.glob("*.txt"))
        db_files = list(anki_dir.glob("*.anki2"))
        logger.debug(
            f"Found {len(txt_files)} .txt files and {len(db_files)} .anki2 files"
        )
        for file in txt_files + db_files:
            logger.debug(f"  - {file.name}")
        anki_parser.parse_anki_files(anki_dir)
    else:
        logger.warning(f"Anki directory not found at {anki_dir}")
        print(f"Warning: Anki directory not found at {anki_dir}")
        print(
            "Create the directory and add your Anki exports to enable Anki functionality"
        )

    print("\nProcessing thoughts files...")
    thoughts_dir = config.get_directory_path("thoughts")
    logger.debug(f"Thoughts directory: {thoughts_dir}")
    if thoughts_dir.exists():
        logger.info(f"Found thoughts directory at {thoughts_dir}")
        files_found = list(thoughts_dir.glob("*.md"))
        logger.debug(f"Found {len(files_found)} markdown files in thoughts directory")
        for file in files_found:
            logger.debug(f"  - {file.name}")
        thoughts_parser.parse_thoughts_files(thoughts_dir)
    else:
        logger.warning(f"Thoughts directory not found at {thoughts_dir}")
        print(f"Warning: Thoughts directory not found at {thoughts_dir}")
        print(
            "Create the directory and add your captured thoughts to enable thoughts functionality"
        )

    print("\nProcessing books files...")
    books_dir = config.get_directory_path("books")
    logger.debug(f"Books directory: {books_dir}")
    if books_dir.exists():
        logger.info(f"Found books directory at {books_dir}")
        book_dirs = [d for d in books_dir.iterdir() if d.is_dir()]
        logger.debug(f"Found {len(book_dirs)} book directories")
        for book_dir in book_dirs:
            logger.debug(f"  - {book_dir.name}")
        books_parser.parse_books_files(books_dir)
    else:
        logger.warning(f"Books directory not found at {books_dir}")
        print(f"Warning: Books directory not found at {books_dir}")

    print("\nProcessing principles files...")
    principles_dir = config.get_directory_path("principles")
    logger.debug(f"Principles directory: {principles_dir}")
    if principles_dir.exists():
        logger.info(f"Found principles directory at {principles_dir}")
        files_found = list(principles_dir.glob("*.md"))
        logger.debug(f"Found {len(files_found)} markdown files in principles directory")
        for file in files_found:
            logger.debug(f"  - {file.name}")
        principles_parser.parse_principles_files(principles_dir)
    else:
        logger.warning(f"Principles directory not found at {principles_dir}")
        print(f"Warning: Principles directory not found at {principles_dir}")
        print(
            "Create the directory and add your book notes to enable books functionality"
        )

    print("\nProcessing events files...")
    events_data = events_parser.parse_events()
    logger.debug(f"Found {len(events_data)} events")
    for event in events_data:
        logger.debug(f"  - {event['title']} ({event['location']})")
        db_manager.insert_event(event)

    print("\nProcessing projects...")
    projects_dir = config.get_directory_path("projects")
    logger.debug(f"Projects directory: {projects_dir}")
    if projects_dir.exists():
        logger.info(f"Found projects directory at {projects_dir}")
        subdirs = [d for d in projects_dir.iterdir() if d.is_dir()]
        logger.debug(f"Found {len(subdirs)} project folders")
        for subdir in subdirs:
            logger.debug(f"  - {subdir.name}")
        projects_parser.parse_projects(projects_dir)
    else:
        logger.warning(f"Projects directory not found at {projects_dir}")
        print(f"Warning: Projects directory not found at {projects_dir}")
        print(
            "Create the directory and add your project folders to enable projects functionality"
        )

    print("\nProcessing complete!")

    print("\nDatabase summary:")
    content_items = db_manager.get_content()
    blog_items = db_manager.get_content(content_type="blog")
    habits_items = db_manager.get_habits(limit=1000000)
    financial_items = db_manager.get_financial_data()
    metrics_items = db_manager.get_metrics(limit=1000000)
    communities_items = db_manager.get_communities()
    anki_items = db_manager.get_anki_reviews(limit=1000000)
    thoughts_items = db_manager.get_thoughts(limit=1000000)
    books_items = db_manager.get_content(content_type="book")
    events_items = db_manager.get_events(limit=1000000)
    projects_items = db_manager.get_projects()

    print(f"- Content items: {len(content_items)}")
    print(f"- Blog posts: {len(blog_items)}")
    print(f"- Habit entries: {len(habits_items)}")
    print(f"- Financial entries: {len(financial_items)}")
    print(f"- Metric entries: {len(metrics_items)}")
    print(f"- Community entries: {len(communities_items)}")
    print(f"- Anki review entries: {len(anki_items)}")
    print(f"- Thought entries: {len(thoughts_items)}")
    print(f"- Book entries: {len(books_items)}")
    print(f"- Event entries: {len(events_items)}")
    print(f"- Project entries: {len(projects_items)}")

    print("\n--- Principles in Database ---")
    principles = db_manager.get_principles()
    if principles:
        for p in principles:
            print(f"- ID: {p['id']}, Level: {p['level']}, Title: {p['title']}, Parent: {p['parent_id']}")
    else:
        print("No principles found in the database.")
    print("-----------------------------")


if __name__ == "__main__":
    main()
