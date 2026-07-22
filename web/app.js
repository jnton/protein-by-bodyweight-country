"use strict";

const DATA_URL = "./data/explorer.json";
const MAX_COUNTRIES = 12;
const DEFAULT_COUNTRIES = ["ITA", "USA", "JPN", "IND", "NGA"];

const metricDefinitions = {
  protein_supply_g_kg_day: {
    label: "Protein supply per kg",
    unit: "g/kg/day",
    decimals: 2,
    warning: "Preliminary adult bodyweight proxy",
    colorScale: [[0, "#fff4d6"], [0.45, "#ffb06f"], [1, "#c8382e"]]
  },
  protein_supply_g_day: {
    label: "Protein supply per person",
    unit: "g/person/day",
    decimals: 1,
    warning: "FAOSTAT food supply, not measured intake",
    colorScale: [[0, "#e5f5f2"], [0.5, "#5fb8aa"], [1, "#145d56"]]
  },
  estimated_adult_bodyweight_kg: {
    label: "Estimated adult bodyweight",
    unit: "kg",
    decimals: 1,
    warning: "Preliminary adult bodyweight proxy",
    colorScale: [[0, "#eef0ff"], [0.5, "#9099d8"], [1, "#343b79"]]
  }
};

const benchmarkDefinitions = {
  us_dga: {
    label: "U.S. Dietary Guidelines 2025–2030",
    shortLabel: "U.S. 2025–2030",
    lower: 1.2,
    upper: 1.6,
    basis: "bodyweight",
    color: "#0f766e",
    fill: "rgba(15,118,110,0.14)",
    description: "Current federal protein serving goal; distinct from the DRI RDA.",
    source: "https://cdn.realfood.gov/DGA.pdf"
  },
  exercise: {
    label: "Exercising individuals (ISSN)",
    shortLabel: "Exercise",
    lower: 1.4,
    upper: 2.0,
    basis: "bodyweight",
    color: "#e85b43",
    fill: "rgba(232,91,67,0.12)",
    description: "Range described as sufficient for most exercising individuals.",
    source: "https://doi.org/10.1186/s12970-017-0177-8"
  },
  rda: {
    label: "U.S. DRI Recommended Dietary Allowance",
    shortLabel: "DRI RDA",
    lower: 0.8,
    upper: 0.8,
    basis: "bodyweight",
    color: "#6b7280",
    fill: "rgba(107,114,128,0.12)",
    description: "Adequacy reference for healthy adults, not an optimization target.",
    source: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/"
  },
  older: {
    label: "Healthy adults aged 65+ (PROT-AGE)",
    shortLabel: "Healthy 65+",
    lower: 1.0,
    upper: 1.2,
    basis: "bodyweight",
    color: "#7c3aed",
    fill: "rgba(124,58,237,0.11)",
    description: "Expert-group range intended to support lean mass and function in healthy older adults.",
    source: "https://doi.org/10.1016/j.jamda.2013.05.021"
  },
  morton: {
    label: "Resistance-training meta-regression breakpoint",
    shortLabel: "1.62 breakpoint",
    lower: 1.62,
    upper: 1.62,
    basis: "bodyweight",
    color: "#b45309",
    fill: "rgba(180,83,9,0.12)",
    description: "Estimated breakpoint for additional FFM gains; the reported 95% CI was broad.",
    source: "https://doi.org/10.1136/bjsports-2017-097608"
  },
  deficit: {
    label: "Lean resistance-trained people in a caloric deficit",
    shortLabel: "Hypocaloric / trained",
    lower: 2.3,
    upper: 3.1,
    basis: "ffm",
    color: "#2563eb",
    fill: "rgba(37,99,235,0.11)",
    description: "Specialized range expressed per kg of fat-free mass, converted here using body-fat percentage.",
    source: "https://doi.org/10.1123/ijsnem.2013-0054"
  }
};

const benchmarkOrder = ["us_dga", "exercise", "rda", "older", "morton", "deficit"];
const presets = {
  global: ["ITA", "USA", "BRA", "NGA", "IND", "CHN", "JPN", "AUS"],
  g7: ["CAN", "FRA", "DEU", "ITA", "JPN", "GBR", "USA"],
  europe: ["ITA", "FRA", "DEU", "ESP", "GBR", "POL", "SWE", "GRC"]
};

const state = {
  records: [],
  metadata: {},
  byYear: new Map(),
  byCountry: new Map(),
  yearsByMetric: new Map(),
  countries: new Map(),
  metric: "protein_supply_g_kg_day",
  year: 2016,
  selectedCodes: [...DEFAULT_COUNTRIES],
  activeBenchmarks: new Set(["us_dga", "exercise"]),
  primaryBenchmark: "us_dga",
  personalWeight: 70,
  bodyFat: 20,
  renderGeneration: 0,
  mapInteractionWired: false,
  benchmarkFrame: null,
  urlYearProvided: false
};

const el = (id) => document.getElementById(id);
const isDark = () => document.documentElement.dataset.theme === "dark";
const chartBg = () => isDark() ? "#111e1b" : "#fffdf8";
const chartText = () => isDark() ? "#edf4ef" : "#10231f";
const chartGrid = () => isDark() ? "rgba(237,244,239,.12)" : "rgba(16,35,31,.12)";
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function formatValue(value, definition = metricDefinitions[state.metric]) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(definition.decimals)} ${definition.unit}`;
}

function formatRange(lower, upper, digits = 2) {
  if (Math.abs(lower - upper) < 1e-9) return `${lower.toFixed(digits)}`;
  return `${lower.toFixed(digits)}–${upper.toFixed(digits)}`;
}

function percentile(values, p) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function plotConfig() {
  return {
    responsive: true,
    displaylogo: false,
    scrollZoom: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"]
  };
}

function commonLayout() {
  return {
    paper_bgcolor: chartBg(),
    plot_bgcolor: chartBg(),
    font: {family: "Inter, system-ui, sans-serif", color: chartText()},
    margin: {l: 58, r: 22, t: 18, b: 52},
    hoverlabel: {font: {family: "Inter, system-ui, sans-serif"}},
    transition: {duration: 160, easing: "cubic-in-out"}
  };
}

function decodePayload(payload) {
  if (!Array.isArray(payload.countries) || !Array.isArray(payload.rows)) {
    throw new Error("Unexpected explorer data schema");
  }
  return payload.rows.map((row) => {
    const country = payload.countries[row[0]];
    if (!country) throw new Error(`Unknown country index ${row[0]}`);
    return {
      Code: country[0],
      Entity: country[1],
      Year: Number(row[1]),
      protein_supply_g_day: row[2],
      estimated_adult_bodyweight_kg: row[3],
      protein_supply_g_kg_day: row[4],
      estimate_status: row[5] === 1 ? "preliminary_adult_proxy" : "protein_supply_only"
    };
  });
}

function buildIndexes() {
  state.byYear = new Map();
  state.byCountry = new Map();
  state.countries = new Map();
  for (const row of state.records) {
    state.countries.set(row.Code, row.Entity);
    if (!state.byYear.has(row.Year)) state.byYear.set(row.Year, []);
    state.byYear.get(row.Year).push(row);
    if (!state.byCountry.has(row.Code)) state.byCountry.set(row.Code, []);
    state.byCountry.get(row.Code).push(row);
  }
  for (const records of state.byCountry.values()) records.sort((a, b) => a.Year - b.Year);
  for (const metric of Object.keys(metricDefinitions)) {
    const years = [...new Set(state.records.filter((row) => row[metric] != null).map((row) => row.Year))]
      .sort((a, b) => a - b);
    state.yearsByMetric.set(metric, years);
  }
}

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const metric = params.get("metric");
  if (metricDefinitions[metric]) state.metric = metric;

  const year = Number(params.get("year"));
  if (Number.isInteger(year)) {
    state.year = year;
    state.urlYearProvided = true;
  }

  const countries = (params.get("countries") || "")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter((code) => state.countries.has(code));
  if (params.has("countries")) state.selectedCodes = [...new Set(countries)].slice(0, MAX_COUNTRIES);

  const benchmarks = (params.get("benchmarks") || "")
    .split(",")
    .map((key) => key.trim())
    .filter((key) => benchmarkDefinitions[key]);
  if (params.has("benchmarks")) state.activeBenchmarks = new Set(benchmarks);

  const primary = params.get("reference");
  if (benchmarkDefinitions[primary]) state.primaryBenchmark = primary;

  const weight = Number(params.get("weight"));
  if (weight >= 35 && weight <= 250) state.personalWeight = weight;
  const bodyFat = Number(params.get("bodyfat"));
  if (bodyFat >= 5 && bodyFat <= 50) state.bodyFat = bodyFat;
}

function syncUrl() {
  const params = new URLSearchParams();
  params.set("metric", state.metric);
  params.set("year", String(state.year));
  params.set("countries", state.selectedCodes.join(","));
  params.set("benchmarks", [...state.activeBenchmarks].join(","));
  params.set("reference", state.primaryBenchmark);
  params.set("weight", String(state.personalWeight));
  params.set("bodyfat", String(state.bodyFat));
  const next = `${window.location.pathname}?${params.toString()}${window.location.hash || "#explorer"}`;
  window.history.replaceState(null, "", next);
}

function recordsForYear(year, requireMetric = true) {
  const rows = state.byYear.get(Number(year)) || [];
  return requireMetric ? rows.filter((row) => row[state.metric] != null) : rows;
}

function recordForCountryYear(code, year) {
  return (state.byCountry.get(code) || []).find((row) => row.Year === Number(year)) || null;
}

function setYearForMetric({preferLatest = false} = {}) {
  const years = state.yearsByMetric.get(state.metric) || [];
  if (!years.length) return;
  const slider = el("year-slider");
  slider.min = String(years[0]);
  slider.max = String(years[years.length - 1]);
  if (preferLatest || !years.includes(state.year)) state.year = years[years.length - 1];
  slider.value = String(state.year);
  el("year-output").value = String(state.year);
  el("year-range-hint").textContent = `${years[0]}–${years[years.length - 1]}`;
}

function renderSummary() {
  const coverage = state.metadata.coverage || {};
  const normalized = state.records.filter((row) => row.protein_supply_g_kg_day != null);
  const countries = new Set(normalized.map((row) => row.Code));
  const years = [...new Set(normalized.map((row) => row.Year))].sort((a, b) => a - b);
  el("country-count").textContent = Number(coverage.normalized_countries || countries.size).toLocaleString();
  el("record-count").textContent = Number(coverage.records || state.records.length).toLocaleString();
  el("year-range").textContent = coverage.normalized_year_min
    ? `${coverage.normalized_year_min}–${coverage.normalized_year_max}`
    : years.length ? `${years[0]}–${years[years.length - 1]}` : "—";
}

function populateCountryDatalist() {
  const options = [...state.countries.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  el("country-options").innerHTML = options
    .map(([code, name]) => `<option value="${escapeHtml(name)}">${escapeHtml(code)}</option>`)
    .join("");
}

function resolveCountryQuery(query) {
  const cleaned = query.trim();
  if (!cleaned) return null;
  const upper = cleaned.toUpperCase();
  if (state.countries.has(upper)) return upper;
  const normalized = cleaned.toLocaleLowerCase();
  const exact = [...state.countries.entries()].find(([, name]) => name.toLocaleLowerCase() === normalized);
  if (exact) return exact[0];
  const prefix = [...state.countries.entries()].find(([, name]) => name.toLocaleLowerCase().startsWith(normalized));
  if (prefix) return prefix[0];
  return null;
}

function renderSelectedCountries() {
  const container = el("selected-country-chips");
  el("selection-count").textContent = `${state.selectedCodes.length}/${MAX_COUNTRIES}`;
  if (!state.selectedCodes.length) {
    container.innerHTML = `<span class="empty-selection">No countries selected yet.</span>`;
    return;
  }
  container.innerHTML = state.selectedCodes.map((code) => {
    const name = state.countries.get(code) || code;
    return `<span class="country-chip"><span title="${escapeHtml(name)}">${escapeHtml(name)}</span><button type="button" data-remove-country="${escapeHtml(code)}" aria-label="Remove ${escapeHtml(name)}">×</button></span>`;
  }).join("");
}

function setCountryFeedback(message, isError = false) {
  const target = el("country-feedback");
  target.textContent = message;
  target.style.color = isError ? "var(--danger)" : "var(--secondary)";
}

function addCountry(code, {announce = true} = {}) {
  if (!state.countries.has(code)) return false;
  if (state.selectedCodes.includes(code)) {
    if (announce) setCountryFeedback(`${state.countries.get(code)} is already selected.`);
    return false;
  }
  if (state.selectedCodes.length >= MAX_COUNTRIES) {
    if (announce) setCountryFeedback(`Remove a country before adding more than ${MAX_COUNTRIES}.`, true);
    return false;
  }
  state.selectedCodes.push(code);
  if (announce) setCountryFeedback(`${state.countries.get(code)} added.`);
  renderSelectionDependentViews();
  syncUrl();
  return true;
}

function removeCountry(code) {
  state.selectedCodes = state.selectedCodes.filter((item) => item !== code);
  renderSelectionDependentViews();
  syncUrl();
}

function applyPreset(key) {
  const codes = (presets[key] || []).filter((code) => state.countries.has(code));
  state.selectedCodes = [...new Set(codes)].slice(0, MAX_COUNTRIES);
  setCountryFeedback(`${state.selectedCodes.length} countries loaded.`);
  renderSelectionDependentViews();
  syncUrl();
}

function resolvedBenchmark(key) {
  const definition = benchmarkDefinitions[key];
  const factor = definition.basis === "ffm" ? 1 - state.bodyFat / 100 : 1;
  return {
    ...definition,
    key,
    lowerResolved: definition.lower * factor,
    upperResolved: definition.upper * factor,
    isPoint: Math.abs(definition.lower - definition.upper) < 1e-9,
    converted: definition.basis === "ffm"
  };
}

function benchmarkRangeLabel(key, {includeBasis = true} = {}) {
  const item = resolvedBenchmark(key);
  const range = `${formatRange(item.lowerResolved, item.upperResolved)} g/kg/day`;
  if (!includeBasis) return range;
  return item.converted ? `${range} BW equivalent` : range;
}

function benchmarkDailyLabel(key) {
  const item = resolvedBenchmark(key);
  const low = item.lowerResolved * state.personalWeight;
  const high = item.upperResolved * state.personalWeight;
  return `${formatRange(low, high, 0)} g/day at ${state.personalWeight} kg`;
}

function renderBenchmarkControls() {
  el("benchmark-toggles").innerHTML = benchmarkOrder.map((key) => {
    const definition = benchmarkDefinitions[key];
    const checked = state.activeBenchmarks.has(key) ? "checked" : "";
    return `<label class="benchmark-toggle">
      <input type="checkbox" value="${escapeHtml(key)}" ${checked}>
      <span><strong><span class="benchmark-swatch" style="background:${definition.color}"></span>${escapeHtml(definition.shortLabel)}</strong><small>${escapeHtml(definition.description)}</small></span>
      <span class="benchmark-range" data-benchmark-range="${escapeHtml(key)}">${escapeHtml(benchmarkRangeLabel(key, {includeBasis: false}))}</span>
    </label>`;
  }).join("");

  el("primary-benchmark").innerHTML = benchmarkOrder.map((key) =>
    `<option value="${escapeHtml(key)}" ${state.primaryBenchmark === key ? "selected" : ""}>${escapeHtml(benchmarkDefinitions[key].shortLabel)}</option>`
  ).join("");

  el("personal-weight").value = String(state.personalWeight);
  el("body-fat").value = String(state.bodyFat);
  el("body-fat-output").value = `${state.bodyFat}%`;
  updateBenchmarkDerivedText();
  updateBenchmarkAvailability();
}

function updateBenchmarkDerivedText() {
  for (const key of benchmarkOrder) {
    const target = document.querySelector(`[data-benchmark-range="${key}"]`);
    if (target) target.textContent = benchmarkRangeLabel(key, {includeBasis: false});
  }
  const deficit = resolvedBenchmark("deficit");
  el("ffm-conversion").textContent = `At ${state.bodyFat}% body fat, 2.3–3.1 g/kg FFM equals ${formatRange(deficit.lowerResolved, deficit.upperResolved)} g/kg body weight (${benchmarkDailyLabel("deficit")}).`;
}

function updateBenchmarkAvailability() {
  const compatible = state.metric === "protein_supply_g_kg_day";
  const area = el("benchmark-controls");
  area.setAttribute("aria-disabled", compatible ? "false" : "true");
  area.style.opacity = compatible ? "1" : "0.64";
  area.querySelectorAll("input[type='checkbox'], #primary-benchmark").forEach((control) => {
    control.disabled = !compatible;
  });
}

function benchmarkShapes() {
  if (state.metric !== "protein_supply_g_kg_day") return [];
  const years = state.yearsByMetric.get(state.metric) || [];
  if (!years.length) return [];
  const shapes = [];
  for (const key of benchmarkOrder) {
    if (!state.activeBenchmarks.has(key)) continue;
    const item = resolvedBenchmark(key);
    if (item.isPoint) {
      shapes.push({
        type: "line", xref: "x", yref: "y",
        x0: years[0], x1: years[years.length - 1],
        y0: item.lowerResolved, y1: item.lowerResolved,
        line: {color: item.color, width: 2, dash: "dot"},
        layer: "below"
      });
    } else {
      shapes.push({
        type: "rect", xref: "x", yref: "y",
        x0: years[0], x1: years[years.length - 1],
        y0: item.lowerResolved, y1: item.upperResolved,
        fillcolor: item.fill,
        line: {color: item.color, width: 1},
        layer: "below"
      });
    }
  }
  shapes.push({
    type: "line", xref: "x", yref: "paper",
    x0: state.year, x1: state.year, y0: 0, y1: 1,
    line: {color: isDark() ? "rgba(237,244,239,.34)" : "rgba(16,35,31,.30)", width: 1, dash: "dash"},
    layer: "below"
  });
  return shapes;
}

function renderBenchmarkLegend() {
  const container = el("benchmark-legend");
  if (state.metric !== "protein_supply_g_kg_day" || !state.activeBenchmarks.size) {
    container.innerHTML = state.metric === "protein_supply_g_kg_day"
      ? `<span class="empty-selection">Enable a reference band in the editor to compare it with the country trends.</span>`
      : `<span class="empty-selection">Reference bands use g/kg/day and are available only for the normalized indicator.</span>`;
    return;
  }
  container.innerHTML = benchmarkOrder.filter((key) => state.activeBenchmarks.has(key)).map((key) => {
    const item = resolvedBenchmark(key);
    return `<div class="benchmark-legend-card">
      <span class="legend-swatch" style="background:${item.color}"></span>
      <div><strong>${escapeHtml(item.shortLabel)} · ${escapeHtml(benchmarkRangeLabel(key))}</strong><span>${escapeHtml(benchmarkDailyLabel(key))}</span><a href="${item.source}">Source ↗</a></div>
    </div>`;
  }).join("");
}

function renderMap() {
  const rows = recordsForYear(state.year);
  const definition = metricDefinitions[state.metric];
  const values = rows.map((row) => Number(row[state.metric])).filter(Number.isFinite);
  const zmin = percentile(values, 0.03);
  const zmax = percentile(values, 0.97);
  el("map-title").textContent = `${definition.label}, ${state.year}`;
  el("map-coverage").textContent = `${rows.length} countries`;
  if (!rows.length) {
    renderEmptyPlot("map-chart", "No values are available for this indicator and year.");
    return;
  }

  const traces = [{
    type: "choropleth",
    locationmode: "ISO-3",
    locations: rows.map((row) => row.Code),
    z: rows.map((row) => row[state.metric]),
    text: rows.map((row) => row.Entity),
    customdata: rows.map((row) => [
      formatValue(row.protein_supply_g_day, metricDefinitions.protein_supply_g_day),
      formatValue(row.estimated_adult_bodyweight_kg, metricDefinitions.estimated_adult_bodyweight_kg),
      formatValue(row.protein_supply_g_kg_day, metricDefinitions.protein_supply_g_kg_day),
      state.selectedCodes.includes(row.Code) ? "Selected" : "Click to add"
    ]),
    colorscale: definition.colorScale,
    zmin,
    zmax,
    marker: {line: {color: isDark() ? "#233b36" : "#f5f1e8", width: 0.45}},
    colorbar: {title: {text: definition.unit}, thickness: 12, outlinewidth: 0},
    hovertemplate: `<b>%{text}</b><br>${definition.label}: %{z:.${definition.decimals}f} ${definition.unit}<br>Protein supply: %{customdata[0]}<br>Bodyweight proxy: %{customdata[1]}<br>Normalized: %{customdata[2]}<br><b>%{customdata[3]}</b><extra></extra>`
  }];

  const selectedRows = rows.filter((row) => state.selectedCodes.includes(row.Code));
  if (selectedRows.length) {
    traces.push({
      type: "scattergeo",
      mode: "markers",
      locations: selectedRows.map((row) => row.Code),
      text: selectedRows.map((row) => row.Entity),
      marker: {
        size: 8,
        color: isDark() ? "#edf4ef" : "#10231f",
        line: {color: isDark() ? "#10231f" : "#fffdf8", width: 2}
      },
      hovertemplate: "<b>%{text}</b><br>Selected for trend comparison<extra></extra>",
      showlegend: false
    });
  }

  const layout = {
    ...commonLayout(),
    margin: {l: 0, r: 0, t: 0, b: 0},
    uirevision: "world-map",
    geo: {
      projection: {type: "natural earth"},
      showframe: false,
      showcoastlines: false,
      showcountries: true,
      countrycolor: isDark() ? "#233b36" : "#f5f1e8",
      showland: true,
      landcolor: isDark() ? "#1b2d29" : "#ebe6db",
      bgcolor: chartBg()
    }
  };
  Plotly.react("map-chart", traces, layout, plotConfig()).then(wireMapInteraction);
}

function wireMapInteraction() {
  if (state.mapInteractionWired) return;
  const map = el("map-chart");
  if (typeof map.on !== "function") return;
  map.on("plotly_click", (event) => {
    const code = event?.points?.[0]?.location;
    if (code) addCountry(code);
  });
  state.mapInteractionWired = true;
}

function renderRanking() {
  const definition = metricDefinitions[state.metric];
  const rows = [...recordsForYear(state.year)]
    .sort((a, b) => Number(b[state.metric]) - Number(a[state.metric]))
    .slice(0, 12);
  el("ranking-list").innerHTML = rows.length ? rows.map((row, index) => `
    <li><button class="ranking-button" type="button" data-add-country="${escapeHtml(row.Code)}" aria-label="Add ${escapeHtml(row.Entity)} to comparison">
      <span class="rank-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="rank-name" title="${escapeHtml(row.Entity)}">${escapeHtml(row.Entity)}</span>
      <span class="rank-value">${escapeHtml(formatValue(row[state.metric], definition))}</span>
    </button></li>`).join("") : `<li class="empty-list">No values available.</li>`;
}

function renderTrend() {
  const definition = metricDefinitions[state.metric];
  const traces = state.selectedCodes.flatMap((code) => {
    const countryRows = (state.byCountry.get(code) || []).filter((row) => row[state.metric] != null);
    if (!countryRows.length) return [];
    return [{
      type: "scatter",
      mode: "lines",
      name: countryRows[0].Entity,
      x: countryRows.map((row) => row.Year),
      y: countryRows.map((row) => row[state.metric]),
      line: {width: 2.6},
      hovertemplate: `<b>${escapeHtml(countryRows[0].Entity)}</b><br>%{x}: %{y:.${definition.decimals}f} ${definition.unit}<extra></extra>`
    }];
  });

  el("trend-title").textContent = `${definition.label} over time`;
  el("trend-summary").textContent = `${traces.length} countr${traces.length === 1 ? "y" : "ies"}${state.metric === "protein_supply_g_kg_day" ? ` · ${state.activeBenchmarks.size} reference${state.activeBenchmarks.size === 1 ? "" : "s"}` : ""}`;
  if (!traces.length) {
    renderEmptyPlot("trend-chart", "Search for a country, click the map, or load a preset.");
    renderBenchmarkLegend();
    return;
  }

  const layout = {
    ...commonLayout(),
    hovermode: "x unified",
    shapes: benchmarkShapes(),
    xaxis: {title: "Year", gridcolor: chartGrid(), zeroline: false},
    yaxis: {title: definition.unit, gridcolor: chartGrid(), zeroline: false, rangemode: state.metric === "protein_supply_g_kg_day" ? "tozero" : "normal"},
    legend: {orientation: "h", y: 1.15, x: 0, traceorder: "normal"}
  };
  Plotly.react("trend-chart", traces, layout, plotConfig());
  renderBenchmarkLegend();
}

function comparisonPosition(value, benchmark) {
  if (value == null) return {label: "No value", className: "unavailable"};
  if (benchmark.isPoint) {
    return value >= benchmark.lowerResolved
      ? {label: "At or above", className: "above"}
      : {label: "Below", className: "below"};
  }
  if (value < benchmark.lowerResolved) return {label: "Below range", className: "below"};
  if (value > benchmark.upperResolved) return {label: "Above range", className: "above"};
  return {label: "Within range", className: "within"};
}

function renderComparisonTable() {
  const definition = metricDefinitions[state.metric];
  const benchmark = resolvedBenchmark(state.primaryBenchmark);
  const normalized = state.metric === "protein_supply_g_kg_day";
  el("comparison-title").textContent = normalized
    ? `${state.year} relative to ${benchmark.shortLabel}`
    : `${state.year} selected-country values`;
  el("comparison-value-heading").textContent = definition.label;

  if (!state.selectedCodes.length) {
    el("comparison-body").innerHTML = `<tr><td colspan="5" class="empty-list">Add countries to populate this comparison.</td></tr>`;
    return;
  }

  const rows = state.selectedCodes.map((code) => {
    const record = recordForCountryYear(code, state.year);
    const value = record?.[state.metric] ?? null;
    return {code, name: state.countries.get(code) || code, value};
  }).sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));

  el("comparison-body").innerHTML = rows.map((row) => {
    const position = normalized ? comparisonPosition(row.value, benchmark) : {label: "Different unit", className: "unavailable"};
    const reference = normalized ? benchmarkRangeLabel(state.primaryBenchmark) : "Benchmark comparison requires g/kg/day";
    return `<tr>
      <td><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.code)}</small></td>
      <td>${escapeHtml(formatValue(row.value, definition))}</td>
      <td>${escapeHtml(reference)}</td>
      <td><span class="position-badge ${position.className}">${escapeHtml(position.label)}</span></td>
      <td><button class="remove-row-button" type="button" data-remove-country="${escapeHtml(row.code)}" aria-label="Remove ${escapeHtml(row.name)}">×</button></td>
    </tr>`;
  }).join("");
}

function renderScatter() {
  const rows = recordsForYear(state.year, false).filter((row) =>
    row.protein_supply_g_day != null && row.estimated_adult_bodyweight_kg != null
  );
  if (!rows.length) {
    const normalizedYears = state.yearsByMetric.get("protein_supply_g_kg_day") || [];
    const endYear = normalizedYears[normalizedYears.length - 1];
    renderEmptyPlot(
      "scatter-chart",
      endYear && state.year > endYear
        ? `Bodyweight estimates currently end in ${endYear}. Choose an earlier year.`
        : "No matched protein and bodyweight observations are available for this year."
    );
    return;
  }

  const selected = new Set(state.selectedCodes);
  const baseRows = rows.filter((row) => !selected.has(row.Code));
  const selectedRows = rows.filter((row) => selected.has(row.Code));
  const traces = [{
    type: "scatter",
    mode: "markers",
    x: baseRows.map((row) => row.estimated_adult_bodyweight_kg),
    y: baseRows.map((row) => row.protein_supply_g_day),
    text: baseRows.map((row) => row.Entity),
    customdata: baseRows.map((row) => row.protein_supply_g_kg_day),
    marker: {
      size: 8,
      opacity: 0.52,
      color: baseRows.map((row) => row.protein_supply_g_kg_day),
      colorscale: metricDefinitions.protein_supply_g_kg_day.colorScale,
      line: {width: 0.4, color: chartBg()},
      showscale: false
    },
    hovertemplate: "<b>%{text}</b><br>Bodyweight proxy: %{x:.1f} kg<br>Protein supply: %{y:.1f} g/day<br>Normalized: %{customdata:.2f} g/kg/day<extra></extra>",
    showlegend: false
  }];
  if (selectedRows.length) {
    traces.push({
      type: "scatter",
      mode: "markers+text",
      x: selectedRows.map((row) => row.estimated_adult_bodyweight_kg),
      y: selectedRows.map((row) => row.protein_supply_g_day),
      text: selectedRows.map((row) => row.Entity),
      textposition: "top center",
      customdata: selectedRows.map((row) => row.protein_supply_g_kg_day),
      marker: {size: 11, color: isDark() ? "#edf4ef" : "#10231f", line: {width: 2, color: chartBg()}},
      hovertemplate: "<b>%{text}</b><br>Bodyweight proxy: %{x:.1f} kg<br>Protein supply: %{y:.1f} g/day<br>Normalized: %{customdata:.2f} g/kg/day<extra></extra>",
      showlegend: false
    });
  }
  const layout = {
    ...commonLayout(),
    xaxis: {title: "Estimated adult bodyweight (kg)", gridcolor: chartGrid(), zeroline: false},
    yaxis: {title: "Protein supply (g/person/day)", gridcolor: chartGrid(), zeroline: false}
  };
  Plotly.react("scatter-chart", traces, layout, plotConfig());
}

function renderEmptyPlot(target, message) {
  const layout = {
    ...commonLayout(),
    xaxis: {visible: false},
    yaxis: {visible: false},
    annotations: [{
      text: message,
      x: 0.5,
      y: 0.5,
      xref: "paper",
      yref: "paper",
      showarrow: false,
      align: "center",
      font: {size: 14, color: chartText()}
    }]
  };
  Plotly.react(target, [], layout, plotConfig());
}

function renderSelectionDependentViews() {
  renderSelectedCountries();
  renderMap();
  renderTrend();
  renderComparisonTable();
  renderScatter();
}

function renderAll() {
  const generation = ++state.renderGeneration;
  el("year-output").value = String(state.year);
  el("data-warning").textContent = metricDefinitions[state.metric].warning;
  updateBenchmarkAvailability();
  renderSelectedCountries();
  renderMap();
  renderRanking();
  renderComparisonTable();
  window.requestAnimationFrame(() => {
    if (generation !== state.renderGeneration) return;
    renderTrend();
    renderScatter();
  });
}

function scheduleBenchmarkRefresh() {
  if (state.benchmarkFrame) window.cancelAnimationFrame(state.benchmarkFrame);
  state.benchmarkFrame = window.requestAnimationFrame(() => {
    updateBenchmarkDerivedText();
    renderTrend();
    renderComparisonTable();
    syncUrl();
    state.benchmarkFrame = null;
  });
}

async function copyShareView() {
  syncUrl();
  const feedback = el("share-feedback");
  try {
    await navigator.clipboard.writeText(window.location.href);
    feedback.textContent = "Link copied.";
  } catch (_error) {
    const text = document.createElement("textarea");
    text.value = window.location.href;
    text.style.position = "fixed";
    text.style.opacity = "0";
    document.body.appendChild(text);
    text.select();
    document.execCommand("copy");
    text.remove();
    feedback.textContent = "Link copied.";
  }
  window.setTimeout(() => { feedback.textContent = ""; }, 2200);
}

function wireEvents() {
  el("metric-select").addEventListener("change", (event) => {
    state.metric = event.target.value;
    setYearForMetric({preferLatest: true});
    renderAll();
    syncUrl();
  });

  el("year-slider").addEventListener("input", (event) => {
    el("year-output").value = event.target.value;
  });
  el("year-slider").addEventListener("change", (event) => {
    state.year = Number(event.target.value);
    renderAll();
    syncUrl();
  });

  const addFromSearch = () => {
    const input = el("country-search");
    const code = resolveCountryQuery(input.value);
    if (!code) {
      setCountryFeedback("No matching country found. Try a full name or ISO-3 code.", true);
      return;
    }
    if (addCountry(code)) input.value = "";
  };
  el("add-country").addEventListener("click", addFromSearch);
  el("country-search").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addFromSearch();
    }
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });
  el("clear-countries").addEventListener("click", () => {
    state.selectedCodes = [];
    setCountryFeedback("Selection cleared.");
    renderSelectionDependentViews();
    syncUrl();
  });

  el("selected-country-chips").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-country]");
    if (button) removeCountry(button.dataset.removeCountry);
  });
  el("comparison-body").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-country]");
    if (button) removeCountry(button.dataset.removeCountry);
  });
  el("ranking-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-country]");
    if (button) addCountry(button.dataset.addCountry);
  });

  el("benchmark-toggles").addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) return;
    if (checkbox.checked) state.activeBenchmarks.add(checkbox.value);
    else state.activeBenchmarks.delete(checkbox.value);
    renderTrend();
    syncUrl();
  });
  el("primary-benchmark").addEventListener("change", (event) => {
    state.primaryBenchmark = event.target.value;
    renderComparisonTable();
    syncUrl();
  });
  el("body-fat").addEventListener("input", (event) => {
    state.bodyFat = Number(event.target.value);
    el("body-fat-output").value = `${state.bodyFat}%`;
    scheduleBenchmarkRefresh();
  });
  el("personal-weight").addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (value >= 35 && value <= 250) {
      state.personalWeight = value;
      updateBenchmarkDerivedText();
      renderBenchmarkLegend();
      syncUrl();
    }
  });

  el("share-view").addEventListener("click", copyShareView);
  el("theme-toggle").addEventListener("click", () => {
    document.documentElement.dataset.theme = isDark() ? "light" : "dark";
    localStorage.setItem("protein-theme", document.documentElement.dataset.theme);
    renderAll();
  });
  el("retry-button").addEventListener("click", () => window.location.reload());
}

function showLoaded() {
  el("loading-state").hidden = true;
  el("dashboard-shell").hidden = false;
  document.body.classList.add("data-ready");
}

function showError(error) {
  console.error(error);
  el("loading-state").hidden = true;
  el("dashboard-shell").hidden = true;
  el("error-state").hidden = false;
  el("error-detail").textContent = error instanceof Error ? error.message : String(error);
}

async function init() {
  const savedTheme = localStorage.getItem("protein-theme");
  if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
  try {
    if (!window.Plotly) throw new Error("The chart library did not load.");
    const response = await fetch(DATA_URL, {cache: "no-cache"});
    if (!response.ok) throw new Error(`Dataset request failed with HTTP ${response.status}.`);
    const payload = await response.json();
    state.metadata = payload.metadata || {};
    state.records = decodePayload(payload);
    buildIndexes();
    readUrlState();
    renderSummary();
    populateCountryDatalist();
    renderBenchmarkControls();
    el("metric-select").value = state.metric;
    setYearForMetric({preferLatest: !state.urlYearProvided});
    wireEvents();
    showLoaded();
    renderAll();
    syncUrl();
  } catch (error) {
    showError(error);
  }
}

window.addEventListener("DOMContentLoaded", init);
