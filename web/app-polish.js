// v0.4 interaction polish: keep the GDP plot analytical and move nutrition
// references into a dedicated comparison lab.

Object.assign(benchmarkDefinitions, {
  efsa_pri: {
    label: "EFSA Population Reference Intake",
    shortLabel: "EFSA PRI",
    lower: 0.83,
    upper: 0.83,
    basis: "bodyweight",
    category: "general",
    color: "#64748b",
    description: "Population Reference Intake for healthy adults; intended to cover the requirements of nearly all adults.",
    source: "https://www.efsa.europa.eu/en/press/news/120209"
  },
  who_safe: {
    label: "WHO/FAO/UNU safe level for healthy adults",
    shortLabel: "WHO safe level",
    lower: 0.83,
    upper: 0.83,
    basis: "bodyweight",
    category: "general",
    color: "#475569",
    description: "Safe level expected to meet the protein requirements of about 97.5% of healthy adults.",
    source: "https://iris.who.int/bitstream/handle/10665/43411/WHO_TRS_935_eng.pdf"
  },
  acsm_athlete: {
    label: "Academy / Dietitians of Canada / ACSM athletes",
    shortLabel: "Academy / ACSM",
    lower: 1.2,
    upper: 2.0,
    basis: "bodyweight",
    category: "exercise",
    color: "#0891b2",
    description: "Sports-nutrition range used to support adaptation, repair, remodeling, and protein turnover across athletic training contexts.",
    source: "https://pubmed.ncbi.nlm.nih.gov/26920240/"
  },
  espen_healthy: {
    label: "ESPEN healthy older adults",
    shortLabel: "ESPEN healthy 65+",
    lower: 1.0,
    upper: 1.2,
    basis: "bodyweight",
    category: "older",
    color: "#8b5cf6",
    description: "ESPEN expert-group range for healthy older people.",
    source: "https://pubmed.ncbi.nlm.nih.gov/24814383/"
  },
  espen_ill: {
    label: "ESPEN older adults with illness / malnutrition risk",
    shortLabel: "ESPEN illness",
    lower: 1.2,
    upper: 1.5,
    basis: "bodyweight",
    category: "older",
    color: "#a855f7",
    description: "Clinical-context range for older adults who are malnourished or at risk because of acute or chronic illness.",
    source: "https://pubmed.ncbi.nlm.nih.gov/24814383/"
  },
  issn_high: {
    label: "ISSN very-high-protein evidence threshold",
    shortLabel: "ISSN >3 evidence",
    lower: 3.0,
    upper: 3.0,
    basis: "bodyweight",
    minimumOnly: true,
    evidenceOnly: true,
    category: "evidence",
    color: "#be123c",
    description: "Evidence note, not a general recommendation: >3.0 g/kg/day has been studied in resistance-trained people for body-composition outcomes.",
    source: "https://pubmed.ncbi.nlm.nih.gov/28642676/"
  }
});

benchmarkDefinitions.rda.category = "general";
benchmarkDefinitions.us_dga.category = "general";
benchmarkDefinitions.health_optimal.category = "general";
benchmarkDefinitions.weight_management.category = "weight";
benchmarkDefinitions.exercise.category = "exercise";
benchmarkDefinitions.morton.category = "evidence";
benchmarkDefinitions.older.category = "older";
benchmarkDefinitions.older_active.category = "older";
benchmarkDefinitions.older_active.minimumOnly = true;
benchmarkDefinitions.older_ill.category = "older";
benchmarkDefinitions.deficit.category = "deficit";
benchmarkDefinitions.personal.category = "custom";

benchmarkOrder.splice(
  0,
  benchmarkOrder.length,
  "none",
  "rda",
  "efsa_pri",
  "who_safe",
  "us_dga",
  "health_optimal",
  "weight_management",
  "acsm_athlete",
  "exercise",
  "morton",
  "older",
  "older_active",
  "older_ill",
  "espen_healthy",
  "espen_ill",
  "deficit",
  "issn_high",
  "personal"
);

Object.assign(personalProfiles, {
  adult_rda: {
    label: "U.S. adult RDA",
    lower: 0.8,
    upper: 0.8,
    basis: "bodyweight",
    source: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/",
    description: "Traditional adequacy reference for healthy adults."
  },
  efsa_adult: {
    label: "EFSA adult PRI",
    lower: 0.83,
    upper: 0.83,
    basis: "bodyweight",
    source: "https://www.efsa.europa.eu/en/press/news/120209",
    description: "European Population Reference Intake for healthy adults."
  },
  acsm_training: {
    label: "Athletic training (Academy / ACSM)",
    lower: 1.2,
    upper: 2.0,
    basis: "bodyweight",
    source: "https://pubmed.ncbi.nlm.nih.gov/26920240/",
    description: "Sports-nutrition range covering a wide variety of training contexts."
  },
  older_illness: {
    label: "Older adult with illness / malnutrition risk",
    lower: 1.2,
    upper: 1.5,
    basis: "bodyweight",
    source: "https://pubmed.ncbi.nlm.nih.gov/24814383/",
    description: "Clinical-context range from older-adult expert guidance."
  }
});

const specialReferenceRowsV04 = [
  {
    id: "who_energy",
    label: "WHO healthy-diet guidance",
    valueLabel: "10–15% of daily energy",
    category: "special",
    description: "Energy-share guidance; not directly convertible to g/kg/day without energy intake and bodyweight.",
    source: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
  },
  {
    id: "efsa_children",
    label: "EFSA infants, children and adolescents",
    valueLabel: "0.83–1.31 g/kg/day depending on age",
    category: "special",
    description: "Age-dependent reference values; not a single adult benchmark.",
    source: "https://www.efsa.europa.eu/en/press/news/120209"
  },
  {
    id: "efsa_pregnancy",
    label: "EFSA pregnancy additions",
    valueLabel: "+1 / +9 / +28 g/day by trimester",
    category: "special",
    description: "Absolute additions to the non-pregnant reference rather than a single g/kg/day range.",
    source: "https://www.efsa.europa.eu/en/press/news/120209"
  },
  {
    id: "efsa_lactation",
    label: "EFSA lactation additions",
    valueLabel: "+19 g/day first 6 months; +13 g/day thereafter",
    category: "special",
    description: "Absolute additions rather than a single g/kg/day range.",
    source: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2012.2557"
  }
];

const benchmarkScaleMinV04 = 0.5;
const benchmarkScaleMaxV04 = 3.3;
const originalResolvedBenchmarkV04 = resolvedBenchmark;
const originalInstallPersonalizationUiV04 = installPersonalizationUi;
const originalRenderAllV04 = renderAll;
const originalUpdateBenchmarkSummaryV04 = updateBenchmarkSummary;
const originalSyncPersonalInputsV04 = syncPersonalInputs;

state.benchmarkFilter = state.benchmarkFilter || "all";
state.gdpAxisScale = state.gdpAxisScale || "log";
state.gdpShowReference = false;

resolvedBenchmark = function(key = state.benchmark) {
  const item = originalResolvedBenchmarkV04(key);
  const definition = benchmarkDefinitions[key];
  return {
    ...item,
    minimumOnly: Boolean(definition?.minimumOnly),
    evidenceOnly: Boolean(definition?.evidenceOnly),
    category: definition?.category || item.category || "general"
  };
};

benchmarkRangeLabel = function(key = state.benchmark, {includeBasis = true} = {}) {
  const item = resolvedBenchmark(key);
  if (item.lowerResolved == null) return "No reference";
  const prefix = item.minimumOnly ? "≥" : "";
  const range = item.minimumOnly
    ? `${prefix}${item.lowerResolved.toFixed(2)} g/kg/day`
    : `${formatRange(item.lowerResolved, item.upperResolved)} g/kg/day`;
  if (!includeBasis) return range;
  return item.converted ? `${range} bodyweight equivalent` : range;
};

benchmarkDailyLabel = function(key = state.benchmark) {
  const item = resolvedBenchmark(key);
  if (item.lowerResolved == null) return "";
  const low = item.lowerResolved * state.personalWeight;
  const high = item.upperResolved * state.personalWeight;
  if (item.minimumOnly) return `≥${low.toFixed(0)} g/day at ${state.personalWeight} kg`;
  return `${formatRange(low, high, 0)} g/day at ${state.personalWeight} kg`;
};

comparisonPosition = function(value, benchmark) {
  if (value == null) return {label: "No value", className: "unavailable"};
  if (benchmark.lowerResolved == null) return {label: "No reference", className: "unavailable"};
  if (benchmark.minimumOnly) {
    return value >= benchmark.lowerResolved
      ? {label: "At / above minimum", className: "within"}
      : {label: "Below minimum", className: "below"};
  }
  if (benchmark.isPoint) {
    return value >= benchmark.lowerResolved
      ? {label: "At or above", className: "above"}
      : {label: "Below", className: "below"};
  }
  if (value < benchmark.lowerResolved) return {label: "Below range", className: "below"};
  if (value > benchmark.upperResolved) return {label: "Above range", className: "above"};
  return {label: "Within range", className: "within"};
};

benchmarkShapesAndAnnotations = function() {
  const shapes = [{
    type: "line",
    xref: "x",
    yref: "paper",
    x0: state.year,
    x1: state.year,
    y0: 0,
    y1: 1,
    line: {
      color: isDark() ? "rgba(237,244,239,.24)" : "rgba(16,35,31,.22)",
      width: 1,
      dash: "dash"
    },
    layer: "below"
  }];
  const annotations = [];

  if (state.metric !== "protein_supply_g_kg_day") return {shapes, annotations};
  const item = resolvedBenchmark();
  if (item.lowerResolved == null) return {shapes, annotations};

  const addLine = (value, label, dash) => {
    shapes.push({
      type: "line",
      xref: "paper",
      yref: "y",
      x0: 0,
      x1: 1,
      y0: value,
      y1: value,
      line: {color: item.color, width: 1.4, dash},
      layer: "below"
    });
    annotations.push({
      x: 1,
      xref: "paper",
      xanchor: "right",
      y: value,
      yref: "y",
      yanchor: "bottom",
      text: `${label} ${value.toFixed(2)}`,
      showarrow: false,
      font: {size: 11, color: item.color},
      bgcolor: chartBg(),
      borderpad: 3
    });
  };

  if (item.minimumOnly) addLine(item.lowerResolved, "minimum ≥", "dash");
  else if (item.isPoint) addLine(item.lowerResolved, "reference", "dot");
  else {
    addLine(item.lowerResolved, "lower", "dash");
    addLine(item.upperResolved, "upper", "dot");
  }
  return {shapes, annotations};
};

function benchmarkPlotPositionV04(value) {
  const clamped = Math.max(benchmarkScaleMinV04, Math.min(benchmarkScaleMaxV04, value));
  return ((clamped - benchmarkScaleMinV04) / (benchmarkScaleMaxV04 - benchmarkScaleMinV04)) * 100;
}

function benchmarkRangeForLabV04(key) {
  const item = resolvedBenchmark(key);
  if (item.lowerResolved == null) return null;
  return item;
}

function benchmarkLabRowsV04() {
  return benchmarkOrder
    .filter((key) => !["none", "personal"].includes(key))
    .map((key) => ({key, ...benchmarkDefinitions[key], resolved: benchmarkRangeForLabV04(key)}));
}

function benchmarkRowHtmlV04(row) {
  const item = row.resolved;
  const active = state.benchmark === row.key;
  const category = row.category || "general";
  const hidden = state.benchmarkFilter !== "all" && state.benchmarkFilter !== category;
  if (hidden) return "";

  const source = row.source
    ? `<a class="benchmark-source-link" href="${row.source}" target="_blank" rel="noreferrer" aria-label="Open source for ${escapeHtml(row.label)}">source ↗</a>`
    : "";

  let visual = "";
  let valueLabel = "";
  if (item) {
    const low = benchmarkPlotPositionV04(item.lowerResolved);
    const high = benchmarkPlotPositionV04(item.upperResolved);
    if (item.minimumOnly) {
      visual = `<span class="benchmark-min-marker" style="left:${low}%"><i></i><b>≥</b></span>`;
      valueLabel = `≥${item.lowerResolved.toFixed(2)}`;
    } else if (item.isPoint) {
      visual = `<span class="benchmark-point" style="left:${low}%"></span>`;
      valueLabel = item.lowerResolved.toFixed(2);
    } else {
      visual = `<span class="benchmark-range-bar" style="left:${low}%;width:${Math.max(1.2, high - low)}%"></span>`;
      valueLabel = formatRange(item.lowerResolved, item.upperResolved);
    }

    if (item.converted) {
      valueLabel += ` BW eq. (${row.lower.toFixed(1)}–${row.upper.toFixed(1)} FFM)`;
    }
  }

  return `<div class="benchmark-lab-row ${active ? "active" : ""} ${row.evidenceOnly ? "evidence" : ""}" data-benchmark-row="${escapeHtml(row.key)}">
    <div class="benchmark-lab-name">
      <span class="benchmark-category-tag">${escapeHtml(category)}</span>
      <strong>${escapeHtml(row.label)}</strong>
      <small>${escapeHtml(row.description || "")}</small>
      ${source}
    </div>
    <div class="benchmark-track" aria-label="${escapeHtml(valueLabel)} grams per kilogram per day">
      <span class="benchmark-track-line"></span>
      ${visual}
    </div>
    <div class="benchmark-lab-value">
      <strong>${escapeHtml(valueLabel)}${valueLabel ? " g/kg/day" : ""}</strong>
      <small>${row.basis === "ffm" ? "converted from FFM" : row.evidenceOnly ? "evidence, not target" : "bodyweight"}</small>
    </div>
    <button type="button" class="benchmark-use-button ${active ? "active" : ""}" data-use-benchmark="${escapeHtml(row.key)}">${active ? "Active" : "Use"}</button>
  </div>`;
}

function renderBenchmarkLabV04() {
  const lab = document.getElementById("benchmark-lab");
  if (!lab) return;
  const rowsTarget = document.getElementById("benchmark-lab-rows");
  const filter = document.getElementById("benchmark-filter");
  if (filter) filter.value = state.benchmarkFilter;
  if (rowsTarget) {
    rowsTarget.innerHTML = benchmarkLabRowsV04().map(benchmarkRowHtmlV04).join("");
  }

  const specialTarget = document.getElementById("benchmark-special-rows");
  if (specialTarget) {
    specialTarget.innerHTML = specialReferenceRowsV04
      .filter((row) => state.benchmarkFilter === "all" || state.benchmarkFilter === "special")
      .map((row) => `<div class="benchmark-special-row">
        <div><strong>${escapeHtml(row.label)}</strong><small>${escapeHtml(row.description)}</small></div>
        <b>${escapeHtml(row.valueLabel)}</b>
        <a href="${row.source}" target="_blank" rel="noreferrer">source ↗</a>
      </div>`).join("");
  }

  const custom = resolvedBenchmark("personal");
  const customValue = document.getElementById("benchmark-custom-value");
  if (customValue) customValue.textContent = custom.minimumOnly
    ? `≥${custom.lowerResolved.toFixed(2)} g/kg/day`
    : `${formatRange(custom.lowerResolved, custom.upperResolved)} g/kg/day`;

  const customButton = document.querySelector("[data-use-benchmark='personal']");
  if (customButton) {
    customButton.textContent = state.benchmark === "personal" ? "Active" : "Use custom";
    customButton.classList.toggle("active", state.benchmark === "personal");
  }
}

function installBenchmarkLabV04() {
  if (document.getElementById("benchmark-lab")) return;
  const trend = document.querySelector(".trend-panel");
  if (!trend) return;

  const lab = document.createElement("article");
  lab.id = "benchmark-lab";
  lab.className = "panel benchmark-lab-panel";
  lab.innerHTML = `
    <div class="benchmark-lab-heading">
      <div>
        <span class="panel-kicker">Protein recommendation lab</span>
        <h3>Compare the recommendations without covering the data.</h3>
        <p>All comparable references share one g/kg/day scale. Click <b>Use</b> to send exactly one range to the country time-series. FFM recommendations are converted using the visible body-fat setting.</p>
      </div>
      <label class="benchmark-filter-label">
        <span>Show</span>
        <select id="benchmark-filter">
          <option value="all">All references</option>
          <option value="general">General adults</option>
          <option value="weight">Weight management</option>
          <option value="exercise">Exercise / athletes</option>
          <option value="older">Older adults</option>
          <option value="deficit">Energy deficit</option>
          <option value="evidence">Evidence estimates</option>
          <option value="special">Special populations / other units</option>
        </select>
      </label>
    </div>
    <div class="benchmark-scale" aria-hidden="true">
      <span style="left:0%">0.5</span>
      <span style="left:17.86%">1.0</span>
      <span style="left:35.71%">1.5</span>
      <span style="left:53.57%">2.0</span>
      <span style="left:71.43%">2.5</span>
      <span style="left:89.29%">3.0</span>
      <b>g/kg/day</b>
    </div>
    <div id="benchmark-lab-rows" class="benchmark-lab-rows"></div>
    <div class="benchmark-custom-row">
      <div>
        <span class="benchmark-category-tag">custom</span>
        <strong>Your editable target</strong>
        <small>Use the Personalize controls above to set lower/upper values, bodyweight or FFM basis, bodyweight, and body-fat assumption.</small>
      </div>
      <b id="benchmark-custom-value">—</b>
      <button type="button" class="benchmark-use-button" data-use-benchmark="personal">Use custom</button>
    </div>
    <details class="benchmark-special-details">
      <summary>References that cannot be reduced to one adult g/kg/day line</summary>
      <div id="benchmark-special-rows" class="benchmark-special-rows"></div>
    </details>
    <p class="benchmark-lab-footnote">An upper endpoint is the top of that source's proposed range, not a universal safe maximum. Sources can disagree because they address different populations and goals.</p>`;
  trend.insertAdjacentElement("afterend", lab);

  document.getElementById("benchmark-filter")?.addEventListener("change", (event) => {
    state.benchmarkFilter = event.target.value;
    renderBenchmarkLabV04();
  });

  lab.addEventListener("click", (event) => {
    const button = event.target.closest("[data-use-benchmark]");
    if (!button) return;
    state.benchmark = button.dataset.useBenchmark;
    const select = document.getElementById("benchmark-select");
    if (select) select.value = state.benchmark;
    if (state.benchmark === "personal") {
      const panel = document.getElementById("personalize-panel");
      const toggle = document.getElementById("personalize-toggle");
      if (panel) panel.hidden = false;
      if (toggle) {
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "Close";
      }
    }
    updateBenchmarkSummary();
    renderTrend();
    renderComparisonTable();
    renderBenchmarkLabV04();
    syncUrl();
  });
}

function installGdpControlsV04() {
  const panel = document.querySelector(".gdp-panel");
  if (!panel || document.getElementById("gdp-axis-scale")) return;
  const heading = panel.querySelector(".panel-heading");
  if (!heading) return;
  const controls = document.createElement("div");
  controls.className = "gdp-chart-controls";
  controls.innerHTML = `
    <label><span>X-axis</span><select id="gdp-axis-scale"><option value="log">Log income</option><option value="linear">Linear income</option></select></label>
    <label class="gdp-reference-switch"><input id="gdp-reference-toggle" type="checkbox"><span>Show active protein reference</span></label>`;
  heading.insertAdjacentElement("afterend", controls);

  document.getElementById("gdp-axis-scale")?.addEventListener("change", (event) => {
    state.gdpAxisScale = event.target.value === "linear" ? "linear" : "log";
    renderGdpScatter();
  });
  document.getElementById("gdp-reference-toggle")?.addEventListener("change", (event) => {
    state.gdpShowReference = event.target.checked;
    renderGdpScatter();
  });
}

installPersonalizationUi = function() {
  originalInstallPersonalizationUiV04();
  document.getElementById("reference-library")?.remove();
  const heading = document.querySelector("#personal-target-builder .personal-target-heading strong");
  if (heading) heading.textContent = "Build or edit a custom comparison range.";
  const benchmarkLabel = document.querySelector("label[for='benchmark-select'] > span");
  if (benchmarkLabel) benchmarkLabel.textContent = "Active protein overlay";
  installBenchmarkLabV04();
  installGdpControlsV04();
};

syncPersonalInputs = function() {
  originalSyncPersonalInputsV04();
  renderBenchmarkLabV04();
};

updateBenchmarkSummary = function() {
  originalUpdateBenchmarkSummaryV04();
  renderBenchmarkLabV04();
};

renderAll = function() {
  originalRenderAllV04();
  renderBenchmarkLabV04();
};

function regressionV04(xs, ys) {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let numerator = 0;
  let denominator = 0;
  for (let index = 0; index < xs.length; index += 1) {
    const dx = xs[index] - meanX;
    numerator += dx * (ys[index] - meanY);
    denominator += dx * dx;
  }
  if (!denominator) return null;
  const slope = numerator / denominator;
  return {slope, intercept: meanY - slope * meanX};
}

function gdpReferenceShapesV04() {
  if (!state.gdpShowReference || state.metric !== "protein_supply_g_kg_day") return [];
  const item = resolvedBenchmark();
  if (item.lowerResolved == null) return [];
  const values = item.minimumOnly || item.isPoint
    ? [item.lowerResolved]
    : [item.lowerResolved, item.upperResolved];
  return values.map((value, index) => ({
    type: "line",
    xref: "paper",
    yref: "y",
    x0: 0,
    x1: 1,
    y0: value,
    y1: value,
    line: {color: item.color, width: 1.2, dash: index === 0 ? "dash" : "dot"},
    layer: "below"
  }));
}

renderGdpScatter = function() {
  const definition = metricDefinitions[state.metric];
  const rows = recordsForYear(state.year, false).filter((row) =>
    row.gdp_per_capita_ppp_2021 != null
    && row.gdp_per_capita_ppp_2021 > 0
    && row[state.metric] != null
  );
  const normalized = state.metric === "protein_supply_g_kg_day";

  el("gdp-title").textContent = normalized
    ? `Protein supply per kg vs GDP per capita · ${state.year}`
    : `${definition.label} vs GDP per capita · ${state.year}`;

  const formulaNote = document.getElementById("gdp-formula-note");
  if (formulaNote) {
    formulaNote.innerHTML = normalized
      ? `<b>Y = protein supply ÷ estimated adult bodyweight.</b> Hover any point to inspect the numerator, denominator, and calculated g/kg/day value.`
      : `Y-axis: <b>${escapeHtml(definition.label)}</b> (${escapeHtml(definition.unit)}).`;
  }

  if (!rows.length) {
    const coverage = state.metadata.coverage || {};
    const start = coverage.gdp_year_min || 1990;
    renderEmptyPlot(
      "gdp-chart",
      state.year < start
        ? `World Bank GDP-per-capita coverage begins in ${start}. Choose a later year.`
        : "No matched GDP and indicator values are available for this year."
    );
    el("gdp-summary").textContent = "No matched observations";
    const exact = document.getElementById("gdp-selected-values");
    if (exact) exact.innerHTML = "";
    return;
  }

  const rawX = rows.map((row) => Number(row.gdp_per_capita_ppp_2021));
  const modelX = state.gdpAxisScale === "log" ? rawX.map(Math.log10) : rawX;
  const ys = rows.map((row) => Number(row[state.metric]));
  const correlation = pearsonCorrelation(modelX, ys);
  const regression = regressionV04(modelX, ys);
  const relationLabel = state.gdpAxisScale === "log" ? "log GDP" : "GDP";
  el("gdp-summary").textContent = `${rows.length} countries${correlation == null ? "" : ` · r = ${correlation.toFixed(2)} with ${relationLabel}`}`;

  const selected = new Set(state.selectedCodes);
  const baseRows = rows.filter((row) => !selected.has(row.Code));
  const selectedRows = rows.filter((row) => selected.has(row.Code));
  const explicitLabel = normalized ? "Protein supply per kg" : definition.label;

  const makeTrace = (items, highlighted) => ({
    type: "scatter",
    mode: "markers",
    x: items.map((row) => row.gdp_per_capita_ppp_2021),
    y: items.map((row) => row[state.metric]),
    text: items.map((row) => row.Entity),
    customdata: items.map((row) => [
      formatMoney(row.gdp_per_capita_ppp_2021),
      formatValue(row[state.metric], definition),
      formatValue(row.protein_supply_g_day, metricDefinitions.protein_supply_g_day),
      formatValue(row.estimated_adult_bodyweight_kg, metricDefinitions.estimated_adult_bodyweight_kg)
    ]),
    marker: highlighted
      ? {
          size: 12,
          color: isDark() ? "#f3f7f4" : "#10231f",
          line: {width: 2.5, color: isDark() ? "#ff735f" : "#e85b43"}
        }
      : {
          size: 8,
          opacity: 0.52,
          color: isDark() ? "#b87852" : "#a65f3e",
          line: {width: 0}
        },
    hovertemplate: `<b>%{text}</b><br>GDP per capita PPP: %{customdata[0]}<br>${explicitLabel}: %{customdata[1]}<br>Protein supply numerator: %{customdata[2]}<br>Bodyweight denominator: %{customdata[3]}<extra></extra>`,
    showlegend: false
  });

  const traces = [makeTrace(baseRows, false)];
  if (regression) {
    const modelMin = Math.min(...modelX);
    const modelMax = Math.max(...modelX);
    const regressionModelX = Array.from({length: 80}, (_, index) =>
      modelMin + (modelMax - modelMin) * index / 79
    );
    traces.push({
      type: "scatter",
      mode: "lines",
      x: regressionModelX.map((value) => state.gdpAxisScale === "log" ? 10 ** value : value),
      y: regressionModelX.map((value) => regression.intercept + regression.slope * value),
      line: {
        color: isDark() ? "rgba(221,231,226,.58)" : "rgba(16,35,31,.48)",
        width: 1.6,
        dash: "dash"
      },
      hoverinfo: "skip",
      showlegend: false
    });
  }
  if (selectedRows.length) traces.push(makeTrace(selectedRows, true));

  const yValues = [...ys];
  if (state.gdpShowReference && normalized) {
    const reference = resolvedBenchmark();
    if (reference.lowerResolved != null) {
      yValues.push(reference.lowerResolved);
      if (!reference.minimumOnly) yValues.push(reference.upperResolved);
    }
  }
  const yLow = Math.min(...yValues);
  const yHigh = Math.max(...yValues);
  const ySpan = Math.max(yHigh - yLow, normalized ? 0.5 : Math.abs(yHigh) * 0.2 || 1);

  const xaxis = state.gdpAxisScale === "log"
    ? {
        title: "GDP per capita · PPP, constant 2021 international dollars",
        type: "log",
        tickmode: "array",
        tickvals: [1000, 2000, 5000, 10000, 20000, 50000, 100000],
        ticktext: ["$1k", "$2k", "$5k", "$10k", "$20k", "$50k", "$100k"],
        gridcolor: chartGrid(),
        zeroline: false,
        automargin: true
      }
    : {
        title: "GDP per capita · PPP, constant 2021 international dollars",
        type: "linear",
        tickprefix: "$",
        tickformat: "~s",
        gridcolor: chartGrid(),
        zeroline: false,
        automargin: true
      };

  const layout = {
    ...commonLayout(),
    margin: {l: 76, r: 28, t: 12, b: 68},
    shapes: gdpReferenceShapesV04(),
    xaxis,
    yaxis: {
      title: normalized ? "Protein supply (g/kg/day)" : `${definition.label} (${definition.unit})`,
      gridcolor: chartGrid(),
      zeroline: false,
      range: [Math.max(0, yLow - ySpan * 0.08), yHigh + ySpan * 0.08],
      tickformat: normalized ? ".1f" : undefined,
      dtick: normalized ? 0.2 : undefined,
      automargin: true
    },
    hovermode: "closest"
  };

  Plotly.react("gdp-chart", traces, layout, plotConfig());

  const exact = document.getElementById("gdp-selected-values");
  if (exact) {
    exact.innerHTML = selectedRows.length
      ? selectedRows.map((row) => `
          <span>
            <strong>${escapeHtml(row.Entity)}</strong>
            <b>${escapeHtml(formatValue(row[state.metric], definition))}</b>
            <small>${escapeHtml(formatMoney(row.gdp_per_capita_ppp_2021))} GDP PPP</small>
          </span>`).join("")
      : `<span class="empty-selection">Select countries to pin their exact values here.</span>`;
  }
};

// Keep the benchmark lab synchronized after personal inputs or active reference changes.
document.addEventListener("change", (event) => {
  if (event.target?.id === "benchmark-select" || event.target?.id === "custom-basis") {
    window.requestAnimationFrame(renderBenchmarkLabV04);
  }
});
