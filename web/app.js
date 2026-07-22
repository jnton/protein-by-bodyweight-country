"use strict";

const DATA_URL = "./data/explorer.json";

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

const state = {
  records: [],
  metadata: {},
  byYear: new Map(),
  byCountry: new Map(),
  yearsByMetric: new Map(),
  metric: "protein_supply_g_kg_day",
  year: 2016,
  selectedCodes: ["ITA", "USA", "JPN", "IND", "NGA"],
  renderGeneration: 0
};

const el = (id) => document.getElementById(id);
const isDark = () => document.documentElement.dataset.theme === "dark";
const chartBg = () => isDark() ? "#111e1b" : "#fffdf8";
const chartText = () => isDark() ? "#edf4ef" : "#10231f";
const chartGrid = () => isDark() ? "rgba(237,244,239,.12)" : "rgba(16,35,31,.12)";

function formatValue(value, definition = metricDefinitions[state.metric]) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(definition.decimals)} ${definition.unit}`;
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
    margin: {l: 56, r: 20, t: 18, b: 52},
    hoverlabel: {font: {family: "Inter, system-ui, sans-serif"}},
    transition: {duration: 180, easing: "cubic-in-out"}
  };
}

function decodePayload(payload) {
  if (!Array.isArray(payload.countries) || !Array.isArray(payload.rows)) {
    throw new Error("Unexpected explorer data schema");
  }

  const countries = payload.countries;
  return payload.rows.map((row) => {
    const country = countries[row[0]];
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

  for (const row of state.records) {
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

function recordsForYear(year, requireMetric = true) {
  const rows = state.byYear.get(Number(year)) || [];
  return requireMetric ? rows.filter((row) => row[state.metric] != null) : rows;
}

function setYearForMetric({preferLatest = false} = {}) {
  const years = state.yearsByMetric.get(state.metric) || [];
  if (!years.length) return;

  const slider = el("year-slider");
  slider.min = String(years[0]);
  slider.max = String(years[years.length - 1]);

  if (preferLatest || !years.includes(state.year)) {
    state.year = years[years.length - 1];
  }

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

function populateCountrySelect() {
  const countryMap = new Map();
  for (const row of state.records) countryMap.set(row.Code, row.Entity);
  const options = [...countryMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const select = el("country-select");
  select.innerHTML = options.map(([code, name]) =>
    `<option value="${code}" ${state.selectedCodes.includes(code) ? "selected" : ""}>${name}</option>`
  ).join("");
  updateSelectionCount();
}

function updateSelectionCount() {
  el("selection-count").textContent = `${state.selectedCodes.length}/8 selected`;
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

  const trace = {
    type: "choropleth",
    locationmode: "ISO-3",
    locations: rows.map((row) => row.Code),
    z: rows.map((row) => row[state.metric]),
    text: rows.map((row) => row.Entity),
    customdata: rows.map((row) => [
      formatValue(row.protein_supply_g_day, metricDefinitions.protein_supply_g_day),
      formatValue(row.estimated_adult_bodyweight_kg, metricDefinitions.estimated_adult_bodyweight_kg),
      formatValue(row.protein_supply_g_kg_day, metricDefinitions.protein_supply_g_kg_day)
    ]),
    colorscale: definition.colorScale,
    zmin,
    zmax,
    marker: {line: {color: isDark() ? "#233b36" : "#f5f1e8", width: 0.45}},
    colorbar: {title: {text: definition.unit}, thickness: 12, outlinewidth: 0},
    hovertemplate: `<b>%{text}</b><br>${definition.label}: %{z:.${definition.decimals}f} ${definition.unit}<br>Protein supply: %{customdata[0]}<br>Bodyweight proxy: %{customdata[1]}<br>Normalized: %{customdata[2]}<extra></extra>`
  };

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
  Plotly.react("map-chart", [trace], layout, plotConfig());
}

function renderRanking() {
  const definition = metricDefinitions[state.metric];
  const rows = [...recordsForYear(state.year)]
    .sort((a, b) => Number(b[state.metric]) - Number(a[state.metric]))
    .slice(0, 12);

  el("ranking-list").innerHTML = rows.length ? rows.map((row, index) => `
    <li>
      <span class="rank-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="rank-name" title="${row.Entity}">${row.Entity}</span>
      <span class="rank-value">${formatValue(row[state.metric], definition)}</span>
    </li>`).join("") : `<li class="empty-list">No values available.</li>`;
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
      line: {width: 2.4},
      hovertemplate: `<b>${countryRows[0].Entity}</b><br>%{x}: %{y:.${definition.decimals}f} ${definition.unit}<extra></extra>`
    }];
  });

  el("trend-title").textContent = `${definition.label} over time`;
  if (!traces.length) {
    renderEmptyPlot("trend-chart", "Choose at least one country with available data.");
    return;
  }

  const layout = {
    ...commonLayout(),
    xaxis: {title: "Year", gridcolor: chartGrid(), zeroline: false},
    yaxis: {title: definition.unit, gridcolor: chartGrid(), zeroline: false},
    legend: {orientation: "h", y: 1.16, x: 0}
  };
  Plotly.react("trend-chart", traces, layout, plotConfig());
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

  const trace = {
    type: "scatter",
    mode: "markers",
    x: rows.map((row) => row.estimated_adult_bodyweight_kg),
    y: rows.map((row) => row.protein_supply_g_day),
    text: rows.map((row) => row.Entity),
    customdata: rows.map((row) => row.protein_supply_g_kg_day),
    marker: {
      size: 9,
      opacity: 0.78,
      color: rows.map((row) => row.protein_supply_g_kg_day),
      colorscale: metricDefinitions.protein_supply_g_kg_day.colorScale,
      line: {width: 0.5, color: chartBg()},
      showscale: false
    },
    hovertemplate: "<b>%{text}</b><br>Bodyweight proxy: %{x:.1f} kg<br>Protein supply: %{y:.1f} g/day<br>Normalized: %{customdata:.2f} g/kg/day<extra></extra>"
  };
  const layout = {
    ...commonLayout(),
    xaxis: {title: "Estimated adult bodyweight (kg)", gridcolor: chartGrid(), zeroline: false},
    yaxis: {title: "Protein supply (g/person/day)", gridcolor: chartGrid(), zeroline: false}
  };
  Plotly.react("scatter-chart", [trace], layout, plotConfig());
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

function renderAll() {
  const generation = ++state.renderGeneration;
  el("year-output").value = String(state.year);
  el("data-warning").textContent = metricDefinitions[state.metric].warning;
  renderMap();
  renderRanking();

  window.requestAnimationFrame(() => {
    if (generation !== state.renderGeneration) return;
    renderTrend();
    renderScatter();
  });
}

function wireEvents() {
  el("metric-select").addEventListener("change", (event) => {
    state.metric = event.target.value;
    setYearForMetric({preferLatest: true});
    renderAll();
  });

  el("year-slider").addEventListener("input", (event) => {
    el("year-output").value = event.target.value;
  });

  el("year-slider").addEventListener("change", (event) => {
    state.year = Number(event.target.value);
    renderAll();
  });

  el("country-select").addEventListener("change", (event) => {
    state.selectedCodes = [...event.target.selectedOptions]
      .map((option) => option.value)
      .slice(0, 8);
    updateSelectionCount();
    renderTrend();
  });

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
  if (savedTheme === "dark" || savedTheme === "light") {
    document.documentElement.dataset.theme = savedTheme;
  }

  try {
    if (!window.Plotly) throw new Error("The chart library did not load.");
    const response = await fetch(DATA_URL, {cache: "no-cache"});
    if (!response.ok) throw new Error(`Dataset request failed with HTTP ${response.status}.`);
    const payload = await response.json();
    state.metadata = payload.metadata || {};
    state.records = decodePayload(payload);
    buildIndexes();
    renderSummary();
    populateCountrySelect();
    wireEvents();
    setYearForMetric({preferLatest: true});
    showLoaded();
    renderAll();
  } catch (error) {
    showError(error);
  }
}

window.addEventListener("DOMContentLoaded", init);
