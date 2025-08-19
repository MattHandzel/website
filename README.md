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
