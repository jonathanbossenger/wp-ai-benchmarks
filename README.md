# WP AI Benchmarks

A dashboard for visualising WordPress AI benchmark results produced by [wp-bench](https://github.com/WordPress/wp-bench) — the official WordPress AI benchmark. It displays how AI models perform on WordPress-specific knowledge and code execution tasks.

## What it shows

wp-bench is execution-only (scoring v3.0): each model generates WordPress code for tasks across ~40 categories (REST API, block editor, Abilities API, security, caching, and more), and the code is graded by static checks and runtime assertions in a sandboxed WordPress environment.

Per model, the dashboard shows:

- **Overall** — the strict execution pass rate: the share of tests where the code ran, passed every runtime assertion, and hit no forbidden static pattern
- **Runtime** — the mean partial runtime assertion score
- **Static policy** — the share of tests with no hard static policy failure
- **Usage** — estimated cost, median latency, and total tokens

## Dashboard

Built with React, Vite, Recharts, and TanStack Table. Displays per-model score cards ranked by overall score, a grouped bar chart comparison, a pass-rate-by-category heatmap, and a filterable, sortable, paginated results table.

See [`client/README.md`](client/README.md) for local development instructions.

**Live:** https://jonathanbossenger.github.io/wp-ai-benchmarks/

Deployed to GitHub Pages via GitHub Actions on every push to `main`.

## Data

Benchmark results are stored in [`results/data.json`](results/data.json) and bundled into the dashboard at build time.

Raw wp-bench result files contain every completion and grader transcript, so they are too large to bundle directly. To update the data, slim a wp-bench results file into `results/data.json`:

```bash
cd client
npm run prepare-data -- /path/to/wp-bench/output/results_YYYYMMDD_HHMMSS.json
```

## Credits

- **[Louis Wolmarans](https://github.com/louiswol94)**
- **[Jonathan Bossenger](https://github.com/jonathanbossenger)**
