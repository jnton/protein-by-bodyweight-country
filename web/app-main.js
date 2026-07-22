function renderSelectionDependentViews() {
  renderSelectedCountries();
  renderMap();
  renderRanking();
  renderTrend();
  renderComparisonTable();
  renderGdpScatter();
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
    renderGdpScatter();
  });
}

function scheduleBenchmarkRefresh() {
  if (state.benchmarkFrame) window.cancelAnimationFrame(state.benchmarkFrame);
  state.benchmarkFrame = window.requestAnimationFrame(() => {
    updateBenchmarkSummary();
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

  const selectFromSearch = ({allowPrefix = false} = {}) => {
    const input = el("country-search");
    const code = resolveCountryQuery(input.value, {allowPrefix});
    if (!code) {
      if (allowPrefix) {
        setCountryFeedback("Choose a country from the suggestions or enter a unique name or ISO-3 code.", true);
      }
      return false;
    }
    if (addCountry(code)) input.value = "";
    return true;
  };

  el("country-search").addEventListener("input", () => {
    const input = el("country-search");
    if (resolveCountryQuery(input.value, {allowPrefix: false})) {
      selectFromSearch({allowPrefix: false});
    }
  });
  el("country-search").addEventListener("change", () => {
    selectFromSearch({allowPrefix: false});
  });
  el("country-search").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      selectFromSearch({allowPrefix: true});
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
    const button = event.target.closest("[data-toggle-country]");
    if (button) toggleCountry(button.dataset.toggleCountry);
  });

  el("benchmark-select").addEventListener("change", (event) => {
    state.benchmark = event.target.value;
    updateBenchmarkSummary();
    renderTrend();
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
      updateBenchmarkSummary();
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
    readUrlState();
    renderSummary();
    populateCountryDatalist();
    renderBenchmarkControl();
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
