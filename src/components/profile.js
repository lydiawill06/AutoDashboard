// Helpers that inspect an arbitrary array of row objects so the dashboard
// can adapt to whatever data is loaded.

const isMissing = (v) => v == null || v === "" || (typeof v === "number" && Number.isNaN(v));

// Accept a CSV/TSV/JSON file (from Inputs.file or FileAttachment) and return rows.
export async function loadRows(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".json")) {
    const json = await file.json();
    if (Array.isArray(json)) return json;
    // Support {"data": [...]}-style wrappers: use the first array property.
    const array = Object.values(json ?? {}).find(Array.isArray);
    if (!array) throw new Error("JSON file must contain an array of objects.");
    return array;
  }
  if (name.endsWith(".tsv") || name.endsWith(".txt")) return file.tsv({typed: true});
  return file.csv({typed: true});
}

// Describe every column: inferred type, missing count, distinct count, numeric stats.
export function profileColumns(rows) {
  const names = [...new Set(rows.flatMap((d) => Object.keys(d)))];
  return names.map((name) => {
    const values = rows.map((d) => d[name]).filter((v) => !isMissing(v));
    const type =
      values.length === 0 ? "empty"
      : values.every((v) => typeof v === "number") ? "number"
      : values.every((v) => v instanceof Date) ? "date"
      : values.every((v) => typeof v === "boolean") ? "boolean"
      : "string";
    const distinct = new Set(values.map((v) => (v instanceof Date ? +v : v))).size;
    const nums = type === "number" ? values : [];
    return {
      name,
      type,
      missing: rows.length - values.length,
      distinct,
      constant: distinct <= 1,
      min: nums.length ? Math.min(...nums) : undefined,
      max: nums.length ? Math.max(...nums) : undefined,
      mean: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : undefined
    };
  });
}

// Treat numbers and dates as continuous; everything else (or low-cardinality
// numbers such as codes) as categorical.
export function isContinuous(column) {
  return column && (column.type === "date" || (column.type === "number" && column.distinct > 12));
}
