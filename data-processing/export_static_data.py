#!/usr/bin/env python3

import json
import sys
from pathlib import Path
from database.schema import DatabaseManager
from collections import defaultdict
from datetime import datetime
import requests
import os


def export_dailies_timeline(db_manager):
    """Export dailies timeline data showing count of dailies written per date"""
    habits_data = db_manager.get_habits()

    daily_counts = defaultdict(int)
    unique_dates = set()

    for habit in habits_data:
        date = habit["date"]
        if date not in unique_dates:
            unique_dates.add(date)
            daily_counts[date] = 1

    timeline_data = []
    for date in sorted(daily_counts.keys()):
        timeline_data.append(
            {
                "date": date,
                "count": daily_counts[date],
                "formatted_date": datetime.strptime(date, "%Y-%m-%d").strftime(
                    "%b %d, %Y"
                ),
            }
        )

    return timeline_data


def export_github_data():
    """Export GitHub commit data for static generation"""
    username = "MattHandzel"
    repositories = [
        "website",
        "KnowledgeManagementSystem",
        "lifelog",
        "ObsidianAutolinkingTool",
        "HealthDataAnalytics",
        "SemanticNoteSearch",
        "dotfiles",
        "Konstel",
    ]

    try:
        all_commits = []
        one_year_ago = datetime.now()
        one_year_ago = one_year_ago.replace(year=one_year_ago.year - 1)

        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "MattHandzel-Website",
        }

        github_token = os.getenv("GITHUB_TOKEN")
        if github_token:
            headers["Authorization"] = f"Bearer {github_token}"

        for repo in repositories:
            url = f"https://api.github.com/repos/{username}/{repo}/commits"
            params = {"since": one_year_ago.isoformat(), "per_page": 100}

            response = requests.get(url, headers=headers, params=params)

            if response.status_code == 404:
                print(
                    f"Warning: Repository {username}/{repo} not found or not accessible"
                )
                continue
            elif response.status_code != 200:
                print(
                    f"Warning: Failed to fetch commits for {repo}: {response.status_code}"
                )
                continue

            repo_commits = response.json()
            all_commits.extend(repo_commits)

        commits_by_date = {}
        for commit in all_commits:
            date = commit["commit"]["author"]["date"].split("T")[0]
            commits_by_date[date] = commits_by_date.get(date, 0) + 1

        heatmap_data = [
            {"date": date, "count": count}
            for date, count in sorted(commits_by_date.items())
        ]

        return {
            "heatmap_data": heatmap_data,
            "total_commits": len(all_commits),
            "repositories": repositories,
            "last_updated": datetime.now().isoformat(),
        }

    except Exception as e:
        print(f"Error fetching GitHub data: {e}")
        return {
            "heatmap_data": [],
            "total_commits": 0,
            "repositories": repositories,
            "last_updated": datetime.now().isoformat(),
            "error": str(e),
        }


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
    habits_data = db_manager.get_habits(limit=10000)
    with open(output_dir / "habits.json", "w") as f:
        json.dump(habits_data, f, indent=2, default=str)
    print(f"Exported {len(habits_data)} habit entries")

    print("Exporting financial data...")
    financial_data = db_manager.get_financial_data()
    with open(output_dir / "financial.json", "w") as f:
        json.dump(financial_data, f, indent=2, default=str)
    print(f"Exported {len(financial_data)} financial entries")

    print("Exporting metrics data...")
    metrics_data = db_manager.get_metrics(limit=10000)
    with open(output_dir / "metrics.json", "w") as f:
        json.dump(metrics_data, f, indent=2, default=str)
    print(f"Exported {len(metrics_data)} metric entries")

    print("Exporting communities data...")
    communities_data = db_manager.get_communities()
    with open(output_dir / "communities.json", "w") as f:
        json.dump(communities_data, f, indent=2, default=str)
    print(f"Exported {len(communities_data)} community entries")

    print("Exporting Anki data...")
    anki_data = db_manager.get_anki_reviews(limit=10000)
    with open(output_dir / "anki.json", "w") as f:
        json.dump(anki_data, f, indent=2, default=str)
    print(f"Exported {len(anki_data)} Anki review entries")

    print("Exporting blog data...")
    blog_data = db_manager.get_content(content_type="blog")
    with open(output_dir / "blog.json", "w") as f:
        json.dump(blog_data, f, indent=2, default=str)
    print(f"Exported {len(blog_data)} blog posts")

    print("Exporting thoughts data...")
    thoughts_data = db_manager.get_thoughts(limit=10000)
    with open(output_dir / "thoughts.json", "w") as f:
        json.dump(thoughts_data, f, indent=2, default=str)
    print(f"Exported {len(thoughts_data)} thoughts")

    print("Exporting dailies timeline data...")
    dailies_timeline = export_dailies_timeline(db_manager)
    with open(output_dir / "dailies_timeline.json", "w") as f:
        json.dump(dailies_timeline, f, indent=2, default=str)
    print(f"Exported {len(dailies_timeline)} dailies timeline entries")

    print("Exporting GitHub data...")
    github_data = export_github_data()
    with open(output_dir / "github.json", "w") as f:
        json.dump(github_data, f, indent=2, default=str)
    print(f"Exported GitHub data with {github_data['total_commits']} commits")

    print("Exporting books data...")
    books_data = db_manager.get_content(content_type="book")
    with open(output_dir / "books.json", "w") as f:
        json.dump(books_data, f, indent=2, default=str)
    print(f"Exported {len(books_data)} book entries")

    print("Exporting events data...")
    events_data = db_manager.get_events(limit=10000)
    with open(output_dir / "events.json", "w") as f:
        json.dump(events_data, f, indent=2, default=str)
    print(f"Exported {len(events_data)} event entries")

    print("Exporting principles data...")
    principles_data = db_manager.get_principles()
    with open(output_dir / "principles.json", "w") as f:
        json.dump(principles_data, f, indent=2, default=str)
    print(f"Exported {len(principles_data)} principles")

    export_metadata = {
        "last_updated": datetime.now().isoformat(),
        "export_counts": {
            "content": len(content_data),
            "habits": len(habits_data),
            "financial": len(financial_data),
            "metrics": len(metrics_data),
            "communities": len(communities_data),
            "anki": len(anki_data),
            "blog": len(blog_data),
            "thoughts": len(thoughts_data),
            "dailies_timeline": len(dailies_timeline),
            "books": len(books_data),
            "events": len(events_data),
            "github_commits": github_data["total_commits"],
        },
    }

    with open(output_dir / "export_metadata.json", "w") as f:
        json.dump(export_metadata, f, indent=2, default=str)
    print(f"Exported metadata with last updated timestamp")

    print(f"\nStatic data export complete! Files saved to {output_dir}")
    print("Next.js can now use these files for static generation")


if __name__ == "__main__":
    export_static_data()
