---
theme: dashboard
title: Dashboard
toc: false
---

# AutoDashboard

Upload a CSV, TSV or JSON file to explore it. Until you do, a sample dataset is shown.

```js
import {loadRows, profileColumns} from "./components/profile.js";
import {chart, chartTypes, reducers, columnChart} from "./components/charts.js";

const file = view(Inputs.file({label: "Data file", accept: ".csv,.tsv,.txt,.json"}));
```

```js
const rows = file ? await loadRows(file) : await FileAttachment("data/sample.csv").csv({typed: true});
const sourceName = file ? file.name : "sample.csv";
const profile = profileColumns(rows);
```

```js
const hideConstant = view(Inputs.toggle({label: "Hide constant columns", value: true}));
```

```js
// Columns offered in the pickers; constant columns rarely make useful axes.
const columns = new Map(profile.filter((c) => !(hideConstant && c.constant) && c.type !== "empty").map((c) => [c.name, c]));
const names = [...columns.keys()];
const numeric = names.filter((n) => columns.get(n).type === "number");
```

<div class="grid grid-cols-4">
  <div class="card"><h2>Source</h2><span class="big">${sourceName}</span></div>
  <div class="card"><h2>Rows</h2><span class="big">${rows.length.toLocaleString()}</span></div>
  <div class="card"><h2>Columns</h2><span class="big">${profile.length}</span></div>
  <div class="card"><h2>Missing cells</h2><span class="big">${d3.sum(profile, (c) => c.missing).toLocaleString()}</span></div>
</div>

## Chart builder

```js
const search = view(Inputs.search(rows, {placeholder: "Filter rows…"}));
```

```js
const settings = view(Inputs.form({
  type: Inputs.select(chartTypes, {label: "Chart"}),
  x: Inputs.select(names, {label: "X axis", value: names[0]}),
  y: Inputs.select([null, ...names], {label: "Y axis", value: numeric.find((n) => n !== names[0]) ?? null, format: (d) => d ?? "(none)"}),
  color: Inputs.select([null, ...names], {label: "Color", format: (d) => d ?? "(none)"}),
  reduce: Inputs.select(reducers, {label: "Bar aggregate", value: "mean"})
}));
```

<div class="card">
  ${resize((width) => {
    try {
      return chart(search, {...settings, columns, width});
    } catch (error) {
      return html`<p class="muted">Couldn’t draw this combination: ${error.message}</p>`;
    }
  })}
</div>

## Columns

<div class="grid grid-cols-3">
  ${[...columns.values()].map((c) => html`<div class="card">
    <h2>${c.name}</h2>
    <h3>${c.type} · ${c.distinct.toLocaleString()} distinct${c.missing ? ` · ${c.missing} missing` : ""}</h3>
    ${resize((width) => columnChart(search, c, width))}
  </div>`)}
</div>

<div class="card" style="padding: 0;">
  ${Inputs.table(profile, {
    columns: ["name", "type", "distinct", "missing", "min", "max", "mean"],
    format: {mean: (d) => d?.toLocaleString(undefined, {maximumFractionDigits: 2}) ?? ""}
  })}
</div>

## Data

<div class="card" style="padding: 0;">
  ${Inputs.table(search)}
</div>

<style>
.muted { color: var(--theme-foreground-muted); }
.card .big { font-size: 1.6rem; font-weight: 600; word-break: break-all; }
</style>
