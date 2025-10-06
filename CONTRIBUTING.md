# Contributing to Matt's Personal Website

Welcome! This guide provides everything you need to know to contribute to this quantified self personal website project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Development Setup](#development-setup)
5. [Project Structure](#project-structure)
6. [Development Workflow](#development-workflow)
7. [Adding New Features](#adding-new-features)
8. [Code Style and Conventions](#code-style-and-conventions)
9. [Testing and Debugging](#testing-and-debugging)
10. [Building for Production](#building-for-production)
11. [Common Issues](#common-issues)

---

## Project Overview

This is a personal quantified self website that transforms markdown files from an Obsidian vault into a beautiful, interactive web experience. The project follows a three-stage data pipeline:

1. **Markdown Files** (Obsidian vault) → **Python Processing** → **SQLite Database**
2. **Database** → **Static JSON Export** → **Next.js Static Site**
3. **Static Site** → **Deployment** → **Production Website**

### Key Features

- **Quantified Self Tracking**: Habits, metrics, financial data, and more
- **Content Management**: Blog posts, thoughts, principles, and community involvement
- **Interactive Visualizations**: Heatmaps, timelines, charts, and dashboards
- **Analytics**: PostHog integration for user behavior tracking
- **Static Site Generation**: Fully static export for fast, serverless hosting

---

## Architecture

### Tech Stack

**Backend/Data Processing:**
- Python 3.12
- SQLite database
- python-frontmatter for markdown parsing
- PyYAML for configuration
- requests for GitHub API integration

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- PostHog for analytics

**Development Tools:**
- Nix shell for reproducible environment
- npm for JavaScript package management
- pip for Python dependencies

### Data Flow

```
Obsidian Vault (~/notes/)
    ↓
[Python Parsers] → Parse markdown with frontmatter
    ↓
[SQLite Database] → Store structured data
    ↓
[Export Script] → Generate static JSON files
    ↓
[Next.js Build] → Static site generation
    ↓
[Static Files] → Ready for deployment
```

---

## Prerequisites

### Required Software

1. **Python 3.12+**
2. **Node.js 20+** and npm
3. **Git**
4. **SQLite** (usually pre-installed)

### Optional but Recommended

- **Nix** - For reproducible development environment
- **PostHog Account** - For analytics (optional)
- **GitHub Token** - For enhanced GitHub API limits (optional)

---

## Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd website
```

### 2. Configure Your Vault Path

The project uses `config.yaml` to specify where your Obsidian vault is located.

```bash
# The config.yaml should already exist
# Edit config.yaml and update the vault path if needed
```

Example `config.yaml`:
```yaml
vault:
  base_path: "~/notes/"  # Update this to your vault path
  
  directories:
    content: "areas/personal-brand/website/"
    dailies: "dailies"
    financial: "areas/finance/"
    metrics: "metrics"
    anki: "anki"
    blog: "areas/personal-brand/posts/blog"
    thoughts: "capture/raw_capture"
    books: "resources/books"
    events: "events"
    principles: "areas/principles"

database:
  path: "database/website.db"
```

### 3. Set Up Python Environment

**IMPORTANT**: Always use the virtual environment for Python commands.

```bash
# Virtual environment should already exist at .venv/
# If not, create it:
# python -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install Python dependencies
cd data-processing
pip install -r requirements.txt
cd ..
```

**Note**: The virtual environment must be activated before running any Python scripts. This is a project rule specified in `project_rules.md`.

### 4. Set Up Node.js Environment

```bash
cd website
npm install
cd ..
```

### 5. Configure Analytics (Optional)

```bash
cd website
cp .env.local.example .env.local

# Edit .env.local and configure PostHog
# NEXT_PUBLIC_ENABLE_POSTHOG=true
# NEXT_PUBLIC_POSTHOG_KEY=your_key_here
# NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 6. Run the Complete Pipeline

```bash
# Activate virtual environment first!
source .venv/bin/activate

# Process markdown files and populate database
cd data-processing
python main.py

# Export database to static JSON files
python export_static_data.py

# Start Next.js development server
cd ../website
npm run dev
```

Visit http://localhost:3000 to see your website!

### Alternative: Using Nix Shell

If you have Nix installed:

```bash
nix-shell

# The shell automatically loads all dependencies
# Follow the displayed commands
```

---

## Project Structure

```
website/
├── .venv/                      # Python virtual environment (gitignored)
├── config.yaml                 # Configuration file
├── build.py                    # Complete build script
├── reset.sh                    # Reset and rebuild everything
│
├── data-processing/            # Python data processing pipeline
│   ├── parsers/               # Individual parsers for each data type
│   │   ├── content_parser.py # Website content and blog posts
│   │   ├── habits_parser.py  # Daily habits from dailies
│   │   ├── financial_parser.py
│   │   ├── metrics_parser.py
│   │   ├── communities_parser.py
│   │   ├── anki_parser.py
│   │   ├── thoughts_parser.py
│   │   ├── books_parser.py
│   │   ├── events_parser.py
│   │   └── principles_parser.py
│   ├── database/
│   │   └── schema.py          # Database schema and operations
│   ├── config.py              # Configuration loader
│   ├── main.py                # Main processing script
│   ├── export_static_data.py # Export database to JSON
│   └── requirements.txt       # Python dependencies
│
├── website/                    # Next.js frontend application
│   ├── pages/                 # Next.js pages
│   │   ├── _app.tsx          # App wrapper (analytics initialization)
│   │   ├── index.tsx         # Home page
│   │   ├── blog/
│   │   │   ├── index.tsx     # Blog listing
│   │   │   └── [id].tsx      # Dynamic blog post page
│   │   ├── dailies.tsx
│   │   ├── communities.tsx
│   │   ├── principles.tsx
│   │   ├── thoughts.tsx
│   │   └── ...
│   ├── components/            # React components
│   │   ├── Navigation.tsx    # Top navigation bar
│   │   ├── ContentRenderer.tsx
│   │   ├── DailiesTimeline.tsx
│   │   ├── HabitTracker.tsx
│   │   ├── BlogRenderer.tsx
│   │   └── ...
│   ├── data/                  # Static JSON files (gitignored)
│   │   ├── content.json
│   │   ├── habits.json
│   │   ├── blog.json
│   │   └── ...
│   ├── lib/
│   │   └── posthog.ts        # PostHog analytics initialization
│   ├── styles/
│   │   ├── globals.css       # Global styles
│   │   └── heatmap.css       # Heatmap-specific styles
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── package.json           # Node.js dependencies
│
├── database/                   # SQLite database (gitignored)
│   └── website.db
│
├── mock-obsidian/             # Mock Obsidian vault for testing
│   ├── content/
│   ├── dailies/
│   ├── habits/
│   └── ...
│
├── website-thoughts/          # Original vision and requirements
│   ├── purpose.md
│   ├── technical-approach.md
│   ├── components.md
│   └── ...
│
├── README.md                   # Project overview and quick start
├── CONTRIBUTING.md            # This file
├── project-structure.md       # Architecture documentation
├── project_rules.md           # Development rules
├── shell.nix                  # Nix shell configuration
└── .gitignore                 # Git ignore rules
```

---

## Development Workflow

### Standard Development Cycle

1. **Edit Obsidian vault** - Make changes to your markdown files
2. **Process data** - Run Python pipeline to update database
3. **Export data** - Generate static JSON files
4. **View changes** - Next.js hot-reloads automatically

```bash
# Activate virtual environment
source .venv/bin/activate

# Process and export
cd data-processing
python main.py
python export_static_data.py

# Development server should auto-reload
# If not running, start it:
cd ../website
npm run dev
```

### Quick Reset and Rebuild

If you want to completely reset and rebuild everything:

```bash
./reset.sh
```

This script:
1. Deletes the database
2. Deletes all JSON data files
3. Clears Next.js cache
4. Re-processes all markdown files (from 2025-07-14 onwards by default)
5. Re-exports all static data

### Processing Specific Date Ranges

You can filter which files to process by date:

```bash
source .venv/bin/activate
cd data-processing

# Process only files from a specific date onwards
python main.py --start-date 2025-01-01

# Enable detailed logging
python main.py --log

# Combine both
python main.py --start-date 2025-01-01 --log
```

---

## Adding New Features

See the detailed guide below for step-by-step instructions on adding new data types, pages, and components.

### Adding a New Data Type

The general pattern for adding a new data type (e.g., "workouts") is:

1. **Add database table** in `data-processing/database/schema.py`
2. **Create parser** in `data-processing/parsers/workouts_parser.py`
3. **Integrate parser** in `data-processing/main.py`
4. **Update config** in `config.yaml`
5. **Add export** in `data-processing/export_static_data.py`
6. **Create page** in `website/pages/workouts.tsx`
7. **Update navigation** in `website/components/Navigation.tsx`

### Parser Pattern

All parsers follow this pattern:

```python
import frontmatter
from pathlib import Path
from datetime import datetime

class MyParser:
    def __init__(self, db_manager, start_date=None, logger=None):
        self.db_manager = db_manager
        self.start_date = start_date
        self.logger = logger
    
    def parse_files(self, directory):
        """Parse markdown files from directory"""
        dir_path = Path(directory)
        
        for md_file in dir_path.glob("*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    post = frontmatter.load(f)
                
                # Skip based on date filter
                if self._should_skip_file(post.metadata, md_file.name):
                    continue
                
                # Extract data from frontmatter and content
                data = {
                    'id': post.metadata.get('id', md_file.stem),
                    'content': post.content,
                    # ... other fields
                }
                
                # Insert to database
                self.db_manager.insert_my_data(data)
                print(f"Processed: {data['id']}")
                
            except Exception as e:
                print(f"Error processing {md_file}: {e}")
    
    def _should_skip_file(self, metadata, filename):
        """Check if file should be skipped based on date filter"""
        if not self.start_date:
            return False
        
        try:
            file_date = datetime.strptime(
                metadata.get('date', filename), 
                '%Y-%m-%d'
            )
            return file_date < self.start_date
        except:
            return False
```

### Page Pattern

All pages follow this Next.js static generation pattern:

```typescript
import { GetStaticProps } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'

interface MyPageProps {
  data: MyDataType[]
}

export default function MyPage({ data }: MyPageProps) {
  return (
    <div className="min-h-screen bg-base">
      <Navigation currentPage="mypage" />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page content */}
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const jsonData = await fs.readFile(
      path.join(dataDir, 'mydata.json'), 
      'utf8'
    )
    const data = JSON.parse(jsonData)

    return {
      props: { data }
    }
  } catch (error) {
    console.error('Error reading data:', error)
    return {
      props: { data: [] }
    }
  }
}
```

---

## Code Style and Conventions

### Python

- **PEP 8** style guide
- Use type hints where appropriate
- Class names: `PascalCase` (e.g., `ContentParser`)
- Function names: `snake_case` (e.g., `parse_content_files`)
- Private methods: prefix with `_` (e.g., `_should_skip_file`)
- Docstrings for classes and complex functions

### TypeScript/React

- **ESLint** configuration included
- Component names: `PascalCase` (e.g., `NavigationBar`)
- Function names: `camelCase` (e.g., `handleClick`)
- Props interface: `ComponentNameProps`
- Use functional components with hooks
- Use TypeScript strict mode

### CSS/Tailwind

- Use Tailwind utility classes preferentially
- Custom classes in `globals.css` using `@layer` directives
- Color scheme defined in `tailwind.config.js`:
  - Primary: `#14B8A6` (Teal)
  - Secondary: `#3B82F6` (Blue)
  - Background: `#F5F5F5` (Light gray)
  - Text: `#1F2937` (Dark gray)
  - Border: `#E5E7EB` (Light gray)

### Git Commits

Use conventional commit messages:

```
feat: add workouts tracking page
fix: correct date parsing in habits parser
docs: update contributing guide
style: format code with prettier
refactor: simplify database queries
test: add tests for content parser
chore: update dependencies
```

---

## Testing and Debugging

### Testing the Data Pipeline

1. **Test with logging enabled**:
   ```bash
   source .venv/bin/activate
   cd data-processing
   python main.py --log
   ```

2. **Verify database contents**:
   ```bash
   sqlite3 database/website.db
   
   # List tables
   .tables
   
   # Query content
   SELECT * FROM content;
   SELECT * FROM habits LIMIT 10;
   
   # Exit
   .quit
   ```

3. **Check exported JSON**:
   ```bash
   cd website/data
   cat content.json | head -20
   ```

### Common Python Issues

**Import errors:**
```bash
# Make sure virtual environment is activated
source .venv/bin/activate

# Verify dependencies are installed
cd data-processing
pip list
```

**File not found errors:**
- Check `config.yaml` paths
- Verify vault path exists: `ls ~/notes/`
- Ensure directories in config exist

**Parsing errors:**
- Verify markdown has proper YAML frontmatter
- Check date formats are `YYYY-MM-DD`
- Look for malformed YAML (indentation, colons)

### Common Next.js Issues

**Page not found:**
- Ensure JSON file exists in `website/data/`
- Run export script: `python export_static_data.py`
- Clear Next.js cache: `rm -rf website/.next`

**Build errors:**
```bash
cd website
rm -rf .next node_modules
npm install
npm run dev
```

**TypeScript errors:**
- Check type definitions match data structure
- Verify imports use correct paths (`@/` alias)

### PostHog Analytics Debugging

Check if PostHog is enabled:
```javascript
// In browser console
posthog.isFeatureEnabled('enabled')
```

Verify configuration:
- Check `.env.local` exists and has correct values
- `NEXT_PUBLIC_ENABLE_POSTHOG=true`
- Valid PostHog key provided

---

## Building for Production

### Full Build Process

The `build.py` script runs the complete pipeline:

```bash
# Activate virtual environment
source .venv/bin/activate

# Run complete build
python build.py
```

This script:
1. Processes markdown files to database (`main.py`)
2. Exports database to static JSON files (`export_static_data.py`)
3. Builds Next.js static site (`npm run build`)

Output will be in `website/out/`.

### Manual Build Steps

If you need to run steps individually:

```bash
# Step 1: Process markdown
source .venv/bin/activate
cd data-processing
python main.py

# Step 2: Export static data
python export_static_data.py

# Step 3: Build Next.js site
cd ../website
npm run build
```

### Environment Variables for Production

Create `website/.env.local` for production:

```bash
# Enable analytics
NEXT_PUBLIC_ENABLE_POSTHOG=true
NEXT_PUBLIC_POSTHOG_KEY=your_production_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# GitHub token for higher API limits (optional)
GITHUB_TOKEN=your_github_token
```

### Verifying the Build

```bash
cd website

# Serve the static site locally
npx serve out

# Visit http://localhost:3000 to verify
```

---

## Common Issues

### "Virtual environment not activated"

**Solution:**
```bash
source .venv/bin/activate
```

This is required before running any Python commands. Add this to your shell profile for convenience:
```bash
alias activate-website='cd ~/Projects/website && source .venv/bin/activate'
```

### "Config file not found"

**Solution:**
Ensure `config.yaml` exists in project root. If not:
```bash
# Copy example config
cp config-dev.yaml config.yaml

# Edit to match your setup
nano config.yaml
```

### "Database is locked"

**Solution:**
Close any SQLite database browsers or connections:
```bash
# Kill any sqlite3 processes
pkill sqlite3

# Remove lock file if it exists
rm database/website.db-journal
```

### "JSON file not found in Next.js"

**Solution:**
```bash
source .venv/bin/activate
cd data-processing
python export_static_data.py
```

Make sure the export script runs successfully before building Next.js.

### "Module not found" in Next.js

**Solution:**
```bash
cd website
rm -rf node_modules package-lock.json
npm install
```

### GitHub API rate limit

**Solution:**
Add GitHub token to environment:
```bash
export GITHUB_TOKEN=your_token_here

# Or add to .env file for export script
echo "GITHUB_TOKEN=your_token_here" >> .env
```

### Styles not applying

**Solution:**
```bash
cd website
# Clear Tailwind cache
rm -rf .next
npm run dev
```

Ensure `tailwind.config.js` content paths include all files:
```javascript
content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
]
```

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **PostHog**: https://posthog.com/docs
- **Python Frontmatter**: https://python-frontmatter.readthedocs.io/
- **SQLite**: https://www.sqlite.org/docs.html

## Questions?

Check existing documentation:
- `README.md` - Quick start and overview
- `project-structure.md` - Architecture details
- `website-thoughts/` - Original vision and requirements

---

**Happy contributing! 🚀**
