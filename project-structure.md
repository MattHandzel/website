# Project Structure Plan

## Directory Layout
```
website/
├── data-processing/          # Python scripts for markdown processing
│   ├── parsers/             # Individual parsers for each data type
│   ├── database/            # Database schema and operations
│   └── main.py              # Main processing script
├── mock-obsidian/           # Mock Obsidian vault for development
│   ├── habits/              # Habit tracking data
│   ├── financial/           # Financial data
│   ├── content/             # Website copy (about-this-site.md, etc.)
│   └── metrics/             # Other quantified self data
├── website/                 # Frontend application
│   ├── src/                 # React/Next.js source
│   ├── components/          # Atomic components
│   └── api/                 # API routes for database access
└── database/                # Local SQLite database
```

## Data Flow
1. Mock Obsidian markdown files → Python parsers → SQLite database
2. Website reads from database via API routes
3. Components display processed data
