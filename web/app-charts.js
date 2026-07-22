function benchmarkRangeLabel(key = state.benchmark, {includeBasis = true} = {}) {
  const item = resolvedBenchmark(key);
  if (item.lowerResolved == null) return "No reference";
  const range = `${formatRange(item.lowerResolved, item.upperResolved)} g/kg/day`;
  if (!includeBasis) return range;
  return item.converted ? `${range} bodyweight equivalent` : range;
}

function benchmarkDailyLabel(key = state.benchmark) {
  const item = resolvedBenchmark(key);
  if (item.lowerResolved == null) return "";
  const low = item.lowerResolved * state.personalWeight;
  const high = item.upperResolved * state.personalWeight;
  return `${formatRange(low, high, 0)} g/day at ${state.personalWeight} kg`;
}

function renderBenchmarkControl() {
  el("benchmark-select").innerHTML = benchmarkOrder.map((key) =>
    `<option value="${escapeHtml(key)}" ${state.benchmark === key ? "selected" : ""}>${escapeHtml(benchmarkDefinitions[key].label)}</option>`
  ).join("");
  el("personal-weight").value = String(state.personalWeight);
  el("body-fat").value = String(state.bodyFat);
  el("body-fat-output").value = `${state.bodyFat}%`;
  updateBenchmarkSummary();
  updateBenchmarkAvailability();
}

function updateBenchmarkAvailability() {
  const compatible = state.metric === "protein_supply_g_kg_day";
  el("benchmark-select").disabled = !compatible;
  el("benchmark-control").dataset.disabled = compatible ? "false" : "true";
  if (!compatible) {
    el("benchmark-summary").innerHTML = `<span class="benchmark-muted">References use g/kg/day and are available only for the normalized indicator.</span>`;
  } else {
    updateBenchmarkSummary();
  }
}

function updateBenchmarkSummary() {
  if (state.metric !== "protein_supply_g_kg_day") return;

  const item = resolvedBenchmark();
  const bodyFatWrap = el("body-fat-wrap");
  bodyFatWrap.hidden = item.key !== "deficit";

  if (item.lowerResolved == null) {
    el("benchmark-summary").innerHTML = `
      <span class="benchmark-muted">No reference is drawn. Country lines use an automatic data-focused scale.</span>
      <span class="no-ul-note">No universal protein upper intake level has been established.</span>`;
    return;
  }

  const point = item.isPoint
    ? `<span class="range-stat"><small>Reference</small><strong>${item.lowerResolved.toFixed(2)}</strong><span>g/kg/day</span></span>`
    : `<span class="range-stat"><small>Minimum</small><strong>${item.lowerResolved.toFixed(2)}</strong><span>g/kg/day</span></span>
       <span class="range-divider" aria-hidden="true"></span>
       <span class="range-stat"><small>Upper end</small><strong>${item.upperResolved.toFixed(2)}</strong><span>g/kg/day</span></span>`;

  const source = item.source
    ? `<a href="${item.source}" target="_blank" rel="noreferrer">Source ↗</a>`
    : "";

  el("benchmark-summary").innerHTML = `
    <span class="benchmark-color" style="background:${item.color}"></span>
    <span class="benchmark-copy">
      <strong>${escapeHtml(item.shortLabel)}</strong>
      <span>${escapeHtml(item.description)}</span>
    </span>
    ${point}
    <span class="daily-equivalent">${escapeHtml(benchmarkDailyLabel())}</span>
    ${source}
    <span class="no-ul-note">Upper end means the top of this selected recommendation—not a universal safety maximum.</span>`;
}

function benchmarkShapesAndAnnotations() {
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
      line: {color: item.color, width: 1.7, dash},
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

  if (item.isPoint) {
    addLine(item.lowerResolved, "reference", "dot");
  } else {
    addLine(item.lowerResolved, "minimum", "dash");
    addLine(item.upperResolved, "upper", "dot");
  }

  return {shapes, annotations};
}

function trendRange(traces) {
  const values = traces.flatMap((trace) => trace.y).filter(Number.isFinite);
  if (state.metric === "protein_supply_g_kg_day") {
    const item = resolvedBenchmark();
    if (item.lowerResolved != null) values.push(item.lowerResolved, item.upperResolved);
  }
  if (!values.length) return undefined;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = Math.max(high - low, Math.abs(high) * 0.08, 0.1);
  const padding = span * 0.15;
  return [Math.max(0, low - padding), high + padding];
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
      formatMoney(row.gdp_per_capita_ppp_2021),
      state.selectedCodes.includes(row.Code) ? "Click to remove" : "Click to compare"
    ]),
    colorscale: definition.colorScale,
    zmin,
    zmax,
    marker: {line: {color: isDark() ? "#233b36" : "#f5f1e8", width: 0.45}},
    colorbar: {title: {text: definition.unit}, thickness: 11, outlinewidth: 0},
    hovertemplate: `<b>%{text}</b><br>${definition.label}: %{z:.${definition.decimals}f} ${definition.unit}<br>Protein supply: %{customdata[0]}<br>Bodyweight proxy: %{customdata[1]}<br>Normalized: %{customdata[2]}<br>GDP per capita PPP: %{customdata[3]}<br><b>%{customdata[4]}</b><extra></extra>`
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
      hovertemplate: "<b>%{text}</b><br>Selected · click to remove<extra></extra>",
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
    if (code) toggleCountry(code);
  });
  state.mapInteractionWired = true;
}

function renderRanking() {
  const definition = metricDefinitions[state.metric];
  const rows = [...recordsForYear(state.year)]
    .sort((a, b) => Number(b[state.metric]) - Number(a[state.metric]))
    .slice(0, 9);

  el("ranking-list").innerHTML = rows.length ? rows.map((row, index) => {
    const selected = state.selectedCodes.includes(row.Code);
    return `<li>
      <button class="ranking-button ${selected ? "selected" : ""}" type="button" data-toggle-country="${escapeHtml(row.Code)}" aria-label="${selected ? "Remove" : "Select"} ${escapeHtml(row.Entity)}">
        <span class="rank-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="rank-name" title="${escapeHtml(row.Entity)}">${escapeHtml(row.Entity)}</span>
        <span class="rank-value">${escapeHtml(formatValue(row[state.metric], definition))}</span>
      </button>
    </li>`;
  }).join("") : `<li class="empty-list">No values available.</li>`;
}

function renderTrend() {
  const definition = metricDefinitions[state.metric];
  const traces = state.selectedCodes.flatMap((code) => {
    const countryRows = (state.byCountry.get(code) || [])
      .filter((row) => row[state.metric] != null);
    if (!countryRows.length) return [];
    return [{
      type: "scatter",
      mode: "lines",
      name: countryRows[0].Entity,
      x: countryRows.map((row) => row.Year),
      y: countryRows.map((row) => row[state.metric]),
      line: {width: 2.5},
      hovertemplate: `<b>${escapeHtml(countryRows[0].Entity)}</b><br>%{x}: %{y:.${definition.decimals}f} ${definition.unit}<extra></extra>`
    }];
  });

  el("trend-title").textContent = `${definition.label} over time`;
  const benchmark = resolvedBenchmark();
  el("trend-summary").textContent = `${traces.length} countr${traces.length === 1 ? "y" : "ies"}${benchmark.lowerResolved != null && state.metric === "protein_supply_g_kg_day" ? ` · ${benchmark.shortLabel}` : ""}`;

  if (!traces.length) {
    renderEmptyPlot("trend-chart", "Type a country, click the map, or load a preset.");
    return;
  }

  const reference = benchmarkShapesAndAnnotations();
  const layout = {
    ...commonLayout(),
    hovermode: "x unified",
    shapes: reference.shapes,
    annotations: reference.annotations,
    xaxis: {title: "Year", gridcolor: chartGrid(), zeroline: false},
    yaxis: {
      title: definition.unit,
      gridcolor: chartGrid(),
      zeroline: false,
      range: trendRange(traces)
    },
    legend: {orientation: "h", y: 1.13, x: 0, traceorder: "normal"}
  };

  Plotly.react("trend-chart", traces, layout, plotConfig());
}

function comparisonPosition(value, benchmark) {
  if (value == null) return {label: "No value", className: "unavailable"};
  if (benchmark.lowerResolved == null) return {label: "No reference", className: "unavailable"};
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
  const benchmark = resolvedBenchmark();
  const normalized = state.metric === "protein_supply_g_kg_day";

  el("comparison-title").textContent = normalized && benchmark.lowerResolved != null
    ? `${state.year} relative to ${benchmark.shortLabel}`
    : `${state.year} selected-country values`;
  el("comparison-value-heading").textContent = definition.label;

  if (!state.selectedCodes.length) {
    el("comparison-body").innerHTML = `<tr><td colspan="5" class="empty-list">Select countries to populate this table.</td></tr>`;
    return;
  }

  const rows = state.selectedCodes.map((code) => {
    const record = recordForCountryYear(code, state.year);
    return {
      code,
      name: state.countries.get(code) || code,
      value: record?.[state.metric] ?? null
    };
  }).sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));

  el("comparison-body").innerHTML = rows.map((row) => {
    const position = normalized
      ? comparisonPosition(row.value, benchmark)
      : {label: "Different unit", className: "unavailable"};
    const reference = normalized && benchmark.lowerResolved != null
      ? benchmarkRangeLabel()
      : "—";
    return `<tr>
      <td><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.code)}</small></td>
      <td>${escapeHtml(formatValue(row.value, definition))}</td>
      <td>${escapeHtml(reference)}</td>
      <td><span class="position-badge ${position.className}">${escapeHtml(position.label)}</span></td>
      <td><button class="remove-row-button" type="button" data-remove-country="${escapeHtml(row.code)}" aria-label="Remove ${escapeHtml(row.name)}">×</button></td>
    </tr>`;
  }).join("");
}

function renderGdpScatter() {
  const definition = metricDefinitions[state.metric];
  const rows = recordsForYear(state.year, false).filter((row) =>
    row.gdp_per_capita_ppp_2021 != null
    && row.gdp_per_capita_ppp_2021 > 0
    && row[state.metric] != null
  );

  el("gdp-title").textContent = `${definition.label} vs GDP per capita, ${state.year}`;

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
    return;
  }

  const xs = rows.map((row) => Math.log10(Number(row.gdp_per_capita_ppp_2021)));
  const ys = rows.map((row) => Number(row[state.metric]));
  const correlation = pearsonCorrelation(xs, ys);
  el("gdp-summary").textContent = `${rows.length} countries${correlation == null ? "" : ` · descriptive r = ${correlation.toFixed(2)} with log GDP`}`;

  const selected = new Set(state.selectedCodes);
  const baseRows = rows.filter((row) => !selected.has(row.Code));
  const selectedRows = rows.filter((row) => selected.has(row.Code));

  const makeTrace = (items, highlighted) => ({
    type: "scatter",
    mode: highlighted ? "markers+text" : "markers",
    x: items.map((row) => row.gdp_per_capita_ppp_2021),
    y: items.map((row) => row[state.metric]),
    text: items.map((row) => row.Entity),
    textposition: "top center",
    customdata: items.map((row) => [
      formatMoney(row.gdp_per_capita_ppp_2021),
      formatValue(row[state.metric], definition)
    ]),
    marker: highlighted
      ? {
          size: 11,
          color: isDark() ? "#edf4ef" : "#10231f",
          line: {width: 2, color: chartBg()}
        }
      : {
          size: 8,
          opacity: 0.48,
          color: items.map((row) => row[state.metric]),
          colorscale: definition.colorScale,
          line: {width: 0.35, color: chartBg()},
          showscale: false
        },
    hovertemplate: `<b>%{text}</b><br>GDP per capita PPP: %{customdata[0]}<br>${definition.label}: %{customdata[1]}<extra></extra>`,
    showlegend: false
  });

  const traces = [makeTrace(baseRows, false)];
  if (selectedRows.length) traces.push(makeTrace(selectedRows, true));

  const layout = {
    ...commonLayout(),
    xaxis: {
      title: "GDP per capita, PPP (constant 2021 international $; log scale)",
      type: "log",
      gridcolor: chartGrid(),
      zeroline: false,
      tickprefix: "$",
      separatethousands: true
    },
    yaxis: {
      title: definition.unit,
      gridcolor: chartGrid(),
      zeroline: false
    }
  };

  Plotly.react("gdp-chart", traces, layout, plotConfig());
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

