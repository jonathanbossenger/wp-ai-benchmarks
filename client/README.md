# WP AI Benchmarks Dashboard

React + Vite dashboard for displaying WordPress AI benchmark results.

## Prerequisites

- Node.js 20+

## Local development

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173/wp-ai-benchmarks/](http://localhost:5173/wp-ai-benchmarks/).

## Build

```bash
npm run build
```

Output is written to `dist/`. Preview the production build with:

```bash
npm run preview
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow which builds the app and deploys `dist/` to the `gh-pages` branch.

Ensure GitHub Pages is configured to serve from the `gh-pages` branch under **Settings → Pages**.
