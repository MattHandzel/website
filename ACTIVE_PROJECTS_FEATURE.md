# Active Projects Feature - Implementation Summary

## Overview
I've successfully implemented an Active Projects feature for your website that displays projects from your Obsidian vault's `projects` folder.

## What Was Implemented

### 1. Backend (Python)

#### Configuration (`config.yaml`)
- Added `projects: "projects"` to the vault directories
- Added configurable `excluded_folders` list with default exclusions:
  - `inactive-projects`
  - `future-projects`

#### Database (`data-processing/database/schema.py`)
- Created `projects` table with fields:
  - id, title, description, tags, content, public, created_date, last_edited_date, metadata

#### Parser (`data-processing/parsers/projects_parser.py`)
- Scans project folders in `~/notes/projects/`
- Looks for project markdown files in priority order:
  1. `{folder-name}.md`
  2. `readme.md` (case-insensitive)
  3. `about.md` (case-insensitive)
- **Only processes projects with `public: true` in frontmatter**
- Skips folders in the excluded list
- Extracts: title, description, tags, and content from frontmatter

#### Integration (`data-processing/main.py`)
- Added ProjectsParser to the main processing pipeline
- Reads excluded folders from config
- Displays project count in database summary

#### Export (`data-processing/export_static_data.py`)
- Exports projects to `website/data/projects.json`
- Includes project count in export metadata

### 2. Frontend (Next.js/React)

#### Projects Page (`website/pages/projects.tsx`)
- New page accessible at `/projects`
- Uses PageLayout component for consistent styling
- Loads projects data from JSON

#### Projects Renderer (`website/components/ProjectsRenderer.tsx`)
- Displays projects as expandable cards
- Shows overview stats (total projects, tagged projects)
- For each project shows:
  - Title
  - Description (if available)
  - Tags (color-coded chips)
  - Created and last edited dates
  - Full markdown content when expanded
- Supports full markdown rendering with syntax highlighting
- Sorted alphabetically by title

#### Navigation (`website/components/Navigation.tsx`)
- Added "Active Projects" tab between "Project Ideas" and "Blog"

## How to Use

### Making a Project Public

To display a project on your website, edit the project's markdown file and add to the frontmatter:

```yaml
---
id: my-project-id
title: My Project Title
description: A short description that appears in the project card
tags: 
  - tag1
  - tag2
public: true
created_date: "2025-10-08"
last_edited_date: "2025-10-08"
---

# My Project Title

Your project content goes here...
```

### Required Frontmatter Fields

- **`public: true`** - REQUIRED. Projects without this will not be displayed
- `id` - Project identifier (defaults to folder name)
- `title` - Display title (defaults to formatted folder name)
- `description` - Short description shown in card
- `tags` - Array of tags
- `created_date` - Creation date
- `last_edited_date` - Last modified date

### File Naming Priority

The parser looks for files in this order:
1. `{folder-name}.md` (e.g., `knowledge-management-system/knowledge-management-system.md`)
2. `readme.md` or `README.md`
3. `about.md` or `ABOUT.md`

If none of these exist, the project folder is skipped.

### Excluding Project Folders

To exclude folders from being processed, add them to `config.yaml`:

```yaml
projects:
  excluded_folders:
    - "inactive-projects"
    - "future-projects"
    - "templates"
    - "archive"
```

## Example Project File

Here's an example for `~/notes/projects/knowledge-management-system/knowledge-management-system.md`:

```markdown
---
id: knowledge-management-system
title: Knowledge Management System
description: Building a personal second brain inspired by Tiago Forte's methodology
tags:
  - productivity
  - note-taking
  - second-brain
public: true
created_date: "2025-10-08"
last_edited_date: "2025-10-08"
---

# Knowledge Management System

For this project, I want to create my own personal knowledge management system that works well with my workflows, and it'll be heavily inspired by Tiago Forte's _Building a Second Brain_ book.

## Progress

I have completed the capture step, it is [here](https://github.com/MattHandzel/KnowledgeManagementSystem/)

## Next Steps

- Organize captured notes
- Create linking system
- Build review workflow
```

## Running the Pipeline

To process your projects and update the website:

```bash
# Activate virtual environment
source .venv/bin/activate

# Process markdown files (including projects)
python data-processing/main.py

# Export to JSON for Next.js
python data-processing/export_static_data.py

# Or use the complete build script
python build.py
```

## Current State

From the last run:
- **0 public projects** currently (all projects are marked private)
- Parser successfully found and processed 27 project folders
- All projects without `public: true` were correctly skipped

To see projects on your website, simply add `public: true` to the frontmatter of any project markdown files you want to display.

## Architecture Benefits

This implementation follows the established patterns in your codebase:
- ✅ Consistent with other parsers (habits, blog, principles)
- ✅ Uses existing database and export infrastructure
- ✅ Follows Next.js static generation pattern
- ✅ Matches UI/UX of other pages
- ✅ Respects privacy with `public` flag
- ✅ Configurable exclusions via config.yaml
