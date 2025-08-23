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

## Configuration

The system uses a `config.yaml` file to specify where to find your Obsidian vault and its subdirectories.

### Setup Your Vault Path

1. Copy the example config:
```bash
cp config-dev.yaml config.yaml
```

2. Edit `config.yaml` and update the `vault.base_path` to point to your actual Obsidian vault:
```yaml
vault:
  base_path: "~/Obsidian/Main"  # Change this to your vault location
```

The system will automatically look for the configured subdirectories within your vault.

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
## Analytics (PostHog)

This repo integrates PostHog for analytics in the Next.js site under website/.

Configuration:
- Create website/.env.local from website/.env.local.example
- Set NEXT_PUBLIC_ENABLE_POSTHOG=true to enable tracking
- Set NEXT_PUBLIC_POSTHOG_KEY to your PostHog project public key
- Optionally set NEXT_PUBLIC_POSTHOG_HOST to your region host

What is tracked:
- Automatic page views on route changes
- Example custom event on top navigation tab clicks: nav_tab_clicked with the clicked tab name

Behavior:
- Tracking is disabled by default in local/dev
- Tracking only initializes when NEXT_PUBLIC_ENABLE_POSTHOG=true and a key is provided

Downsides and considerations:
- Adds a small JavaScript payload to pages
- Collects user interaction data; ensure you disclose analytics usage if needed
- Consider adding consent banner and IP anonymization depending on your audience and region requirements

Verification:
- Run cd website && npm install && npm run dev
- Set env vars in website/.env.local and reload the page
- Use browser devtools Network tab to see requests to the PostHog host and verify events in your PostHog project


## Original Website Thoughts

Please look at the website-thoughts/ directory to see the original vision and requirements for this website.
