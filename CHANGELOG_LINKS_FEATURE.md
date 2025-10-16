# Links Feature Implementation

## Summary
Added support for project links in frontmatter that display as clickable icons next to project titles.

## Changes Made

### 1. Database Schema (`data-processing/database/schema.py`)
- Added `links TEXT` column to `projects` table
- Updated `insert_project()` to store links as JSON array
- Updated `get_projects()` to parse links from JSON

### 2. Parser (`data-processing/parsers/projects_parser.py`)
- Extracts `links` array from project frontmatter
- Defaults to empty array if not present

### 3. Frontend Interface (`website/components/ProjectsRenderer.tsx`)
- Added `links?: string[]` to `Project` interface
- Reorganized header layout: **[Status] [Title] [Links]**
- Links display as external link icons
- Links open in new tabs with `target="_blank"`
- Click events on links prevent card expansion

### 4. Database Migration
- Created `migrate_add_links.py` to add column to existing database
- Successfully migrated existing projects table

## Usage

Add links to project frontmatter in YAML format:

```yaml
---
id: knowledge-management-system
title: Knowledge Management System
description: A system for managing knowledge
status: active
links:
  - https://github.com/MattHandzel/KnowledgeManagementSystem/
  - https://example.com/demo
public: true
---
```

## Visual Layout

```
[🟢 Active]  Project Title  [🔗] [🔗]
             Description here
             Tags...
```

The status badge is now on the **left**, followed by the title, then any link icons on the **right** side of the title.

## Files Modified

1. `data-processing/database/schema.py`
2. `data-processing/parsers/projects_parser.py`
3. `website/components/ProjectsRenderer.tsx`
4. `migrate_add_links.py` (new migration script)

## Testing

- Tested with Knowledge Management System project
- Links export correctly to JSON
- Frontend renders links as clickable icons
- Links open in new tabs
- Card expansion still works correctly
