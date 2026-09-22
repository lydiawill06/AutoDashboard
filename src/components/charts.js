import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";
import {isContinuous} from "./profile.js";

export const chartTypes = ["Auto", "Scatter", "Line", "Bar", "Histogram", "Box"];
export const reducers = ["count", "sum", "mean", "median", "min", "max"];

// Build a chart for any combination of columns. `columns` maps name -> profile.
export function chart(rows, {type, x, y, color, reduce, columns, width}) {
  if (!x) return message("Pick a column for the X axis.");
  const xCol = columns.get(x);
  const yCol = y ? columns.get(y) : null;
  const numericY = yCol?.type === "number";
  const categoricalX = !isContinuous(xCol);
  const fill = color ?? undefined;

  const options = {
    width,
    height: 420,
    marginBottom: categoricalX ? 70 : 40,
    marginLeft: 60,
    grid: true,
    color: {legend: !!color},
    x: {label: x, tickRotate: categoricalX ? -30 : 0},
    y: {label: y ?? reduce}
  };

  let marks;
  switch (type) {
    case "Scatter":
      if (!y) return message("Scatter needs a Y column.");
      marks = [Plot.dot(rows, {x, y, stroke: fill, tip: true})];
      break;
    case "Line":
      if (!y) return message("Line needs a Y column.");
      marks = [Plot.lineY(rows, {x, y, stroke: fill, sort: x, tip: true}), Plot.ruleY([0])];
      break;
    case "Bar": {
      // Count rows when there is no numeric Y; otherwise aggregate Y with the chosen reducer.
      const r = numericY ? reduce : "count";
      marks = [
        Plot.barY(rows, Plot.groupX({y: r}, {x, y: numericY ? y : undefined, fill, tip: true})),
        Plot.ruleY([0])
      ];
      options.y.label = numericY ? `${r} of ${y}` : "count";
      break;
    }
    case "Histogram":
      marks = [
        categoricalX
          ? Plot.barY(rows, Plot.groupX({y: "count"}, {x, fill, tip: true}))
          : Plot.rectY(rows, Plot.binX({y: "count"}, {x, fill, tip: true})),
        Plot.ruleY([0])
      ];
      options.y.label = "count";
      break;
    case "Box":
      if (numericY) marks = [Plot.boxY(rows, {x, y, fill})];
      else if (xCol.type === "number") marks = [Plot.boxX(rows, {x})];
      else return message("Box plot needs a numeric column.");
      break;
    default:
      // Let Plot pick a sensible mark from the column types.
      return Plot.auto(rows, {x, y: y ?? undefined, color: fill}).plot({width, height: 420, grid: true, color: {legend: !!color}});
  }
  return Plot.plot({...options, marks});
}

// A small overview chart for one column: histogram for continuous, top-N bars otherwise.
export function columnChart(rows, column, width) {
  const {name} = column;
  if (isContinuous(column)) {
    return Plot.plot({
      width,
      height: 160,
      x: {label: name},
      y: {label: null, grid: true},
      marks: [Plot.rectY(rows, Plot.binX({y: "count"}, {x: name, tip: true})), Plot.ruleY([0])]
    });
  }
  return Plot.plot({
    width,
    height: 160,
    marginLeft: 90,
    x: {label: null, grid: true},
    y: {label: null},
    marks: [
      Plot.barX(rows, Plot.groupY({x: "count"}, {y: name, sort: {y: "-x", limit: 8}, tip: true})),
      Plot.ruleX([0])
    ]
  });
}

function message(text) {
  return html`<p class="muted">${text}</p>`;
}
