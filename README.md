# AutoDashboard

A general-purpose exploratory dashboard for tabular data, built with
[Observable Framework](https://observablehq.com/framework/).

## Features

- Upload **CSV, TSV or JSON** (an array of objects, or an object wrapping one). Falls back to `src/data/sample.csv`.
- Detects column types (number, date, boolean, string) and can hide constant columns.
- Chart builder: Auto, Scatter, Line, Bar (count/sum/mean/median/min/max), Histogram and Box, with an optional color column.
- Row filter that applies to every chart and table.
- A small chart for each column, a column summary table and the full data table.

Everything runs in the browser. Uploaded files are never sent to a server.

## Development

```bash
npm install
npm run dev     # preview at http://127.0.0.1:3000
npm run build   # static site in dist/
```

To change the default dataset, replace `src/data/sample.csv` and update the `FileAttachment` path in `src/index.md` if the name changes.

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`
(set **Settings → Pages → Source** to *GitHub Actions*).
