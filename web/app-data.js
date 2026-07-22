"use strict";

const DATA_URL = "./data/explorer.json";
const MAX_COUNTRIES = 10;
const DEFAULT_COUNTRIES = ["ITA", "USA", "JPN"];

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
  none: {
    label: "No reference",
    shortLabel: "None",
    lower: null,
    upper: null,
    basis: "bodyweight",
    color: "#6b7280",
    description: "Show country trends without a nutritional reference."
  },
  us_dga: {
    label: "U.S. Dietary Guidelines 2025–2030",
    shortLabel: "U.S. 2025–2030",
    lower: 1.2,
    upper: 1.6,
    basis: "bodyweight",
    color: "#0f766e",
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
    description: "Range described as sufficient for most exercising individuals.",
    source: "https://doi.org/10.1186/s12970-017-0177-8"
  },
  rda: {
    label: "U.S. DRI Recommended Dietary Allowance",
    shortLabel: "DRI RDA",
    lower: 0.8,
    upper: 0.8,
    basis: "bodyweight",
    color: "#8b949e",
    description: "Adequacy reference for healthy adults, not an optimization target.",
    source: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/"
  },
  older: {
    label: "Healthy adults aged 65+ (PROT-AGE)",
    shortLabel: "Healthy 65+",
    lower: 1.0,
    upper: 1.2,
    basis: "bodyweight",
    color: "#8b5cf6",
    description: "Expert-group range intended to support lean mass and function.",
    source: "https://doi.org/10.1016/j.jamda.2013.05.021"
  },
  morton: {
    label: "Resistance-training meta-regression breakpoint",
    shortLabel: "1.62 breakpoint",
    lower: 1.62,
    upper: 1.62,
    basis: "bodyweight",
    color: "#d97706",
    description: "Estimated breakpoint; not a sharp universal threshold.",
    source: "https://doi.org/10.1136/bjsports-2017-097608"
  },
  deficit: {
    label: "Lean resistance-trained people in a caloric deficit",
    shortLabel: "Hypocaloric / trained",
    lower: 2.3,
    upper: 3.1,
    basis: "ffm",
    color: "#3b82f6",
    description: "Specialized FFM-based range converted using body-fat percentage.",
    source: "https://doi.org/10.1123/ijsnem.2013-0054"
  }
};

const benchmarkOrder = ["none", "us_dga", "exercise", "rda", "older", "morton", "deficit"];
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
  benchmark: "exercise",
  personalWeight: 70,
  bodyFat: 20,
  renderGeneration: 0,
  mapInteractionWired: false,
  benchmarkFrame: null,
  urlYearProvided: false
};

const el = (id) => document.getElementById(id);
const isDark = () => document.documentElement.dataset.theme === "dark";
const chartBg = () => isDark() ? "#0f1c19" : "#fffdf8";
const chartText = () => isDark() ? "#edf4ef" : "#10231f";
const chartGrid = () => isDark() ? "rgba(237,244,239,.10)" : "rgba(16,35,31,.10)";
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
  if (lower == null || upper == null) return "—";
  if (Math.abs(lower - upper) < 1e-9) return lower.toFixed(digits);
  return `${lower.toFixed(digits)}–${upper.toFixed(digits)}`;
}

function formatMoney(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
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

function pearsonCorrelation(xs, ys) {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;
  for (let index = 0; index < xs.length; index += 1) {
    const dx = xs[index] - meanX;
    const dy = ys[index] - meanY;
    numerator += dx * dy;
    denominatorX += dx * dx;
    denominatorY += dy * dy;
  }
  const denominator = Math.sqrt(denominatorX * denominatorY);
  return denominator ? numerator / denominator : null;
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
    margin: {l: 62, r: 28, t: 18, b: 56},
    hoverlabel: {font: {family: "Inter, system-ui, sans-serif"}},
    transition: {duration: 150, easing: "cubic-in-out"}
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
      estimate_status: row[5] === 1 ? "preliminary_adult_proxy" : "protein_supply_only",
      gdp_per_capita_ppp_2021: row[6]
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

  for (const records of state.byCountry.values()) {
    records.sort((a, b) => a.Year - b.Year);
  }

  for (const metric of Object.keys(metricDefinitions)) {
    const years = [...new Set(
      state.records.filter((row) => row[metric] != null).map((row) => row.Year)
    )].sort((a, b) => a - b);
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
  if (params.has("countries")) {
    state.selectedCodes = [...new Set(countries)].slice(0, MAX_COUNTRIES);
  }

  const benchmark = params.get("benchmark")
    || params.get("reference")
    || (params.get("benchmarks") || "").split(",").find((key) => benchmarkDefinitions[key]);
  if (benchmarkDefinitions[benchmark]) state.benchmark = benchmark;

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
  params.set("benchmark", state.benchmark);
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

  el("country-count").textContent = Number(
    coverage.normalized_countries || countries.size
  ).toLocaleString();
  el("record-count").textContent = Number(
    coverage.records || state.records.length
  ).toLocaleString();
  el("year-range").textContent = coverage.normalized_year_min
    ? `${coverage.normalized_year_min}–${coverage.normalized_year_max}`
    : years.length ? `${years[0]}–${years[years.length - 1]}` : "—";
}

function populateCountryDatalist() {
  const options = [...state.countries.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  el("country-options").innerHTML = options
    .map(([code, name]) => `<option value="${escapeHtml(name)} — ${escapeHtml(code)}"></option>`)
    .join("");
}

function resolveCountryQuery(query, {allowPrefix = true} = {}) {
  const cleaned = query.trim();
  if (!cleaned) return null;

  const explicitCode = cleaned.match(/(?:^|\s|—|\()([A-Za-z]{3})\)?$/)?.[1]?.toUpperCase();
  if (explicitCode && state.countries.has(explicitCode)) return explicitCode;

  const upper = cleaned.toUpperCase();
  if (state.countries.has(upper)) return upper;

  const normalized = cleaned.toLocaleLowerCase();
  const exact = [...state.countries.entries()].find(([, name]) =>
    name.toLocaleLowerCase() === normalized
  );
  if (exact) return exact[0];

  if (!allowPrefix) return null;
  const matches = [...state.countries.entries()].filter(([, name]) =>
    name.toLocaleLowerCase().startsWith(normalized)
  );
  return matches.length === 1 ? matches[0][0] : null;
}

function renderSelectedCountries() {
  const container = el("selected-country-chips");
  el("selection-count").textContent = `${state.selectedCodes.length}/${MAX_COUNTRIES}`;

  if (!state.selectedCodes.length) {
    container.innerHTML = `<span class="empty-selection">Click a country or type one above.</span>`;
    return;
  }

  container.innerHTML = state.selectedCodes.map((code) => {
    const name = state.countries.get(code) || code;
    return `<span class="country-chip">
      <span title="${escapeHtml(name)}">${escapeHtml(name)}</span>
      <button type="button" data-remove-country="${escapeHtml(code)}" aria-label="Remove ${escapeHtml(name)}">×</button>
    </span>`;
  }).join("");
}

function setCountryFeedback(message, isError = false) {
  const target = el("country-feedback");
  target.textContent = message;
  target.dataset.error = isError ? "true" : "false";
}

function addCountry(code, {announce = true} = {}) {
  if (!state.countries.has(code)) return false;
  if (state.selectedCodes.includes(code)) {
    if (announce) setCountryFeedback(`${state.countries.get(code)} is already selected.`);
    return false;
  }
  if (state.selectedCodes.length >= MAX_COUNTRIES) {
    if (announce) setCountryFeedback(`Remove a country before selecting more than ${MAX_COUNTRIES}.`, true);
    return false;
  }

  state.selectedCodes.push(code);
  if (announce) setCountryFeedback(`${state.countries.get(code)} selected.`);
  renderSelectionDependentViews();
  syncUrl();
  return true;
}

function removeCountry(code) {
  state.selectedCodes = state.selectedCodes.filter((item) => item !== code);
  renderSelectionDependentViews();
  syncUrl();
}

function toggleCountry(code) {
  if (state.selectedCodes.includes(code)) removeCountry(code);
  else addCountry(code);
}

function applyPreset(key) {
  const codes = (presets[key] || []).filter((code) => state.countries.has(code));
  state.selectedCodes = [...new Set(codes)].slice(0, MAX_COUNTRIES);
  setCountryFeedback(`${state.selectedCodes.length} countries selected.`);
  renderSelectionDependentViews();
  syncUrl();
}

function resolvedBenchmark(key = state.benchmark) {
  const definition = benchmarkDefinitions[key] || benchmarkDefinitions.none;
  if (definition.lower == null) {
    return {...definition, key, lowerResolved: null, upperResolved: null, isPoint: false, converted: false};
  }
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

