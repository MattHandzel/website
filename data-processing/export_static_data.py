#!/usr/bin/env python3

import json
import sys
from pathlib import Path
from database.schema import DatabaseManager
from collections import defaultdict
from datetime import datetime
import requests
import os
import subprocess
from config import Config
from parsers.ideas_parser import IdeasParser


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

    try:
        # Fetch all public, non-fork repositories using gh CLI
        print("Fetching repositories using gh CLI...")
        gh_command = [
            "gh", "repo", "list", username,
            "--limit", "1000",
            "--json", "name,isPrivate,isFork",
            "--jq", '.[] | select(.isPrivate == false and .isFork == false) | .name'
        ]
        
        result = subprocess.run(
            gh_command,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Parse the repository names from the output
        repositories = [repo.strip() for repo in result.stdout.strip().split('\n') if repo.strip()]
        print(f"Found {len(repositories)} public repositories")
        
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
            print(f"  Fetched {len(repo_commits)} commits from {repo}")

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
            "repository_count": len(repositories),
            "last_updated": datetime.now().isoformat(),
        }

    except subprocess.CalledProcessError as e:
        print(f"Error running gh CLI command: {e}")
        print(f"Make sure gh CLI is installed and authenticated")
        # Fallback to empty data
        return {
            "heatmap_data": [],
            "total_commits": 0,
            "repositories": [],
            "repository_count": 0,
            "last_updated": datetime.now().isoformat(),
            "error": f"gh CLI error: {str(e)}",
        }
    except Exception as e:
        print(f"Error fetching GitHub data: {e}")
        return {
            "heatmap_data": [],
            "total_commits": 0,
            "repositories": [],
            "repository_count": 0,
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

    print("Exporting projects data...")
    projects_data = db_manager.get_projects()
    with open(output_dir / "projects.json", "w") as f:
        json.dump(projects_data, f, indent=2, default=str)
    print(f"Exported {len(projects_data)} projects")

    print("Exporting project ideas data...")
    # Parse ideas file directly
    try:
        config = Config()
        ideas_parser = IdeasParser(db_manager)
        ideas_file_path = config.data.get('ideas', {}).get('file_path', 'projects/ideas.md')
        ideas_full_path = config.get_vault_base_path() / ideas_file_path
        if ideas_full_path.exists():
            ideas_data = ideas_parser.parse_ideas_file(ideas_full_path)
        else:
            print(f"Ideas file not found at {ideas_full_path}")
            ideas_data = []
    except Exception as e:
        print(f"Error parsing ideas: {e}")
        ideas_data = []
    
    with open(output_dir / "ideas.json", "w") as f:
        json.dump(ideas_data, f, indent=2, default=str)
    print(f"Exported {len(ideas_data)} project ideas")

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
            "projects": len(projects_data),
            "ideas": len(ideas_data),
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
