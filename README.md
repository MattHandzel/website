# Personal Website - Markdown to Database Pipeline

This project implements a complete markdown → database → website processing pipeline for a personal quantified self website.

## Architecture

The system follows a 3-stage data flow:
1. **Markdown Files** (mock-obsidian/) → **Python Processing** (data-processing/) → **SQLite Database** (database/)
2. **Database** → **API Routes** (website/pages/api/) → **React Components** (website/components/)

## Project Structure

```
website/
├── mock-obsidian/           # Mock Obsidian vault with markdown files
│   ├── content/            # Website copy (about-this-site.md, home-page.md)
│   ├── habits/             # Habit tracking data
│   ├── financial/          # Financial data and budgets
│   └── metrics/            # Health and physiological metrics
├── data-processing/         # Python scripts for markdown processing
│   ├── parsers/            # Individual parsers for each data type
│   ├── database/           # Database schema and operations
│   ├── requirements.txt    # Python dependencies
│   └── main.py             # Main processing script
├── website/                # Next.js frontend application
│   ├── pages/              # Next.js pages and API routes
│   ├── components/         # Atomic React components
│   └── package.json        # Node.js dependencies
└── database/               # SQLite database storage
```

## Setup and Usage

### 1. Install Python Dependencies

```bash
cd data-processing
pip install -r requirements.txt
```

### 2. Run Data Processing Pipeline

```bash
cd data-processing
python main.py
```

This will:
- Parse all markdown files in mock-obsidian/
- Extract structured data with frontmatter
- Populate SQLite database with processed content

### 3. Install Node.js Dependencies

```bash
cd website
npm install
```

### 4. Start Development Server

```bash
cd website
npm run dev
```

Visit http://localhost:3000 to see the website displaying processed data.

## Data Flow

1. **Markdown Files**: All content stored as markdown with YAML frontmatter
2. **Python Parsers**: Extract and normalize data from markdown files
3. **SQLite Database**: Stores processed data in structured tables
4. **API Routes**: Serve data from database to frontend
5. **React Components**: Display data with interactive visualizations

## Components

- **ContentRenderer**: Displays markdown-sourced website copy
- **HabitTracker**: Visualizes habit completion rates and streaks
- **FinancialDashboard**: Shows budget breakdown and savings rate
- **MetricsDashboard**: Displays health metrics and trends

## Database Schema

- `content`: Website copy and markdown content
- `habits`: Daily habit tracking data
- `financial_data`: Budget and spending information
- `metrics`: Health and physiological measurements

## Testing the Pipeline

1. Modify markdown files in mock-obsidian/
2. Run `python data-processing/main.py`
3. Refresh the website to see updated content

This ensures the complete markdown → database → website pipeline works end-to-end.

---

## Original Website Thoughts

Please look at the website-thoughts/ directory to see the original vision and requirements for this website.
