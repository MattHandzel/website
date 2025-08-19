# Matt Handzel — Personal Website (v1)

This repo contains early thoughts plus a v1 React site under `site/` that demonstrates one possible direction for the final personal website. The UI includes dummy components inspired by the notes in `website-thoughts/` and will later ingest a selective subset of Obsidian content.

## Structure
- `website-thoughts/` — design/feature ideas and inspirations
- `site/` — Vite + React + TypeScript app with representative components:
  - Victory Jar
  - Organizational Affiliations Timeline
  - Projects (with progress)
  - Skills (with evidence)
  - Simple Metrics panel

## Run locally
Prereqs: Node 18+ recommended.

```bash
cd site
npm install
npm run dev
```

Open http://localhost:5173.

## Build
```bash
cd site
npm run build
# artifacts in site/dist
```

## Deploying on Oracle Free Tier (static)
The `site/` app builds to static assets in `site/dist`, so you can self-host it via:
- An Nginx instance on an Oracle Compute VM, or
- An Oracle Object Storage bucket with static website hosting enabled, fronted by OCI CDN/Load Balancer.

Example (Nginx on a VM):
1) Build locally and copy the `site/dist` folder to the VM (e.g., `/var/www/matthandzel`).
2) Configure an Nginx server block:
```
server {
  listen 80;
  server_name matthandzel.com www.matthandzel.com;

  root /var/www/matthandzel;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
```
3) Enable the site and reload Nginx.
4) Point your DNS A record at the VM IP (and configure HTTPS with Certbot).

## Notes on data
- This v1 uses minimal dummy data that is representative but not comprehensive.
- Future versions can selectively parse Obsidian notes or use outputs from ObsidianAutolinkingTools to populate components.

## Roadmap (sketch)
- Import selected vault content (public-only) for victories/projects/timelines.
- Add communities page and map.
- Add auth/commenting hooks and analytics (e.g., PostHog) with opt-in.
## Communities data pipeline

You can parse COMMUNITIES.md into a SQLite database and JSON, and optionally publish JSON for the frontend.

1) Edit/confirm the markdown at COMMUNITIES.md
2) Run the parser to create DB and JSON, and copy JSON to the frontend public folder:
- python3 scripts/parse_communities.py --md COMMUNITIES.md --db data/communities.db --json data/communities.json --public-json
3) Start the site and visit the Communities section:
- cd site && npm run dev
- The frontend will fetch /communities.json; if it’s missing, it falls back to built-in sample data and shows a notice.

Schema
- SQLite table: communities
  - community TEXT
  - description TEXT
  - estimated_size_in_san_francisco REAL
  - online_community_irl_community TEXT
  - personal_affiliation REAL

Notes
- The JSON export contains objects with: name, description, estSizeSF, online, irl, personalAffiliation
- online/irl are split from the combined “Online Community ; IRL Community” column by the parser.
## Local data processing pipeline

Scripts under local/ process the vault and produce structured outputs.

- local/process_second_brain.py: Orchestrates routing of notes to processors based on folder, tags, or metadata.
  - Example: notes under a dailies/ folder or tagged with daily are handled by the dailies processor.
  - Usage:
    - python3 local/process_second_brain.py --vault /path/to/Obsidian --max-notes 100 --dry-run
    - python3 local/process_second_brain.py --vault /path/to/Obsidian --out-json local/output/summary.json
- local/process_dailies.py: Extracts habits, completion counts, daily reflection answers, and CBT table rows from a daily note.
  - Standalone usage for a single note:
    - python3 local/process_dailies.py --file /path/to/notes/dailies/2025-08-18.md
  - When invoked via process_second_brain, outputs JSON files to local/output/dailies/ for each processed note and adds a small bottom-matter summary (habits_completed/habits_total).
- local/parse_communities.py: Same functionality as scripts/parse_communities.py, colocated under local/ for convenience.

Notes
- These scripts prefer the python-frontmatter package if available to read/write YAML frontmatter; if not present, they will still parse the body content but will not preserve metadata on writes.
- The orchestrator is designed to be extensible: register additional predicates and processors to support new note types in the future.
