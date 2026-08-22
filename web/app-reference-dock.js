// v0.5: one persistent protein-reference selector available across the page.

const originalInstallPersonalizationUiV05 = installPersonalizationUi;
const originalUpdateBenchmarkSummaryV05 = updateBenchmarkSummary;
const originalRenderAllV05 = renderAll;
const originalSyncPersonalInputsV05 = syncPersonalInputs;

// The v0.4 comparison lab is intentionally retired. Recommendation selection now
// lives in one fixed reference dock that remains available throughout the page.
installBenchmarkLabV04 = function() {};
renderBenchmarkLabV04 = function() {};

const referenceDockScaleMin = 0.5;
const referenceDockScaleMax = 3.3;

function referenceDockPosition(value) {
  const clamped = Math.max(referenceDockScaleMin, Math.min(referenceDockScaleMax, value));
  return ((clamped - referenceDockScaleMin) / (referenceDockScaleMax - referenceDockScaleMin)) * 100;
}

function referenceCategoryLabel(category) {
  return {
    general: "General adults",
    weight: "Weight management",
    exercise: "Exercise / athletes",
    older: "Older adults",
    deficit: "Energy deficit",
    evidence: "Evidence estimates",
    custom: "Custom"
  }[category] || "Other";
}

function referenceOptionGroups() {
  const groups = new Map();
  for (const key of benchmarkOrder) {
    if (key === "none" || key === "personal") continue;
    const definition = benchmarkDefinitions[key];
    if (!definition) continue;
    const category = definition.category || "general";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push({key, definition});
  }
  return groups;
}

function referenceSelectHtml() {
  const groups = referenceOptionGroups();
  const groupOrder = ["general", "weight", "exercise", "older", "deficit", "evidence"];
  const options = [`<option value="none">No reference</option>`];
  for (const category of groupOrder) {
    const items = groups.get(category) || [];
    if (!items.length) continue;
    options.push(`<optgroup label="${escapeHtml(referenceCategoryLabel(category))}">`);
    for (const {key, definition} of items) {
      const item = resolvedBenchmark(key);
      const value = item.minimumOnly
        ? `≥${item.lowerResolved.toFixed(2)}`
        : item.isPoint
          ? item.lowerResolved.toFixed(2)
          : formatRange(item.lowerResolved, item.upperResolved);
      const suffix = item.converted ? " BW eq." : "";
      options.push(`<option value="${escapeHtml(key)}">${escapeHtml(definition.shortLabel || definition.label)} · ${escapeHtml(value)}${suffix}</option>`);
    }
    options.push(`</optgroup>`);
  }
  options.push(`<optgroup label="Custom"><option value="personal">Personal / custom range</option></optgroup>`);
  return options.join("");
}

function referenceVisualHtml(item) {
  if (item.lowerResolved == null) {
    return `<div class="reference-mini-scale"></div>`;
  }
  const low = referenceDockPosition(item.lowerResolved);
  const high = referenceDockPosition(item.upperResolved);
  if (item.minimumOnly) {
    return `<div class="reference-mini-scale"><span class="reference-mini-minimum" style="left:${low}%"></span></div>`;
  }
  if (item.isPoint) {
    return `<div class="reference-mini-scale"><span class="reference-mini-point" style="left:${low}%"></span></div>`;
  }
  return `<div class="reference-mini-scale"><span class="reference-mini-range" style="left:${low}%;width:${Math.max(1.5, high - low)}%"></span></div>`;
}

function referenceDisplayRange(item) {
  if (item.lowerResolved == null) return "Off";
  if (item.minimumOnly) return `≥${item.lowerResolved.toFixed(2)} g/kg/day`;
  if (item.isPoint) return `${item.lowerResolved.toFixed(2)} g/kg/day`;
  return `${formatRange(item.lowerResolved, item.upperResolved)} g/kg/day`;
}

function referenceOtherGuidanceHtml() {
  if (typeof specialReferenceRowsV04 === "undefined") return "";
  return specialReferenceRowsV04.map((row) => `
    <div class="reference-other-item">
      <strong>${escapeHtml(row.label)}</strong>
      <b>${escapeHtml(row.valueLabel)}</b>
      <small>${escapeHtml(row.description)}</small>
    </div>`).join("");
}

function installReferenceDock() {
  if (document.getElementById("reference-dock")) return;

  document.getElementById("benchmark-lab")?.remove();
  document.getElementById("personal-target-builder")?.remove();

  const dock = document.createElement("aside");
  dock.id = "reference-dock";
  dock.className = "reference-dock";
  dock.dataset.open = "false";
  dock.innerHTML = `
    <div id="reference-dock-panel" class="reference-dock-panel" hidden>
      <div class="reference-dock-head">
        <div>
          <span class="panel-kicker">Protein reference</span>
          <strong>Choose one comparison range.</strong>
          <p>It stays active across the explorer. The trend uses it automatically; the GDP plot shows it only if you enable that option.</p>
        </div>
        <button id="reference-dock-close" class="reference-dock-close" type="button" aria-label="Close protein reference selector">×</button>
      </div>

      <label class="reference-field" for="reference-dock-select">
        <span>Published reference</span>
        <select id="reference-dock-select"></select>
      </label>

      <div id="reference-range-card" class="reference-range-card">
        <div class="reference-range-top">
          <strong id="reference-card-name">—</strong>
          <b id="reference-card-range">—</b>
        </div>
        <div id="reference-card-visual"></div>
        <div class="reference-scale-labels"><span>0.5</span><span>1.0</span><span>1.5</span><span>2.0</span><span>2.5</span><span>3.0+</span></div>
        <p id="reference-card-description" class="reference-description"></p>
        <div class="reference-meta-row">
          <span id="reference-card-daily"></span>
          <span id="reference-card-basis"></span>
          <a id="reference-card-source" href="#" target="_blank" rel="noreferrer">source ↗</a>
        </div>
      </div>

      <button id="reference-custom-toggle" class="reference-custom-toggle" type="button" aria-expanded="false">Customize this range</button>
      <div id="reference-custom-grid" class="reference-custom-grid" hidden>
        <label>
          <span>Lower</span>
          <input id="reference-custom-lower" type="number" min="0" max="6" step="0.05">
        </label>
        <label>
          <span>Upper</span>
          <input id="reference-custom-upper" type="number" min="0" max="6" step="0.05">
        </label>
        <label>
          <span>Basis</span>
          <select id="reference-custom-basis"><option value="bodyweight">Total bodyweight</option><option value="ffm">Fat-free mass</option></select>
        </label>
        <label>
          <span>Bodyweight</span>
          <input id="reference-personal-weight" type="number" min="35" max="250" step="1">
        </label>
        <label id="reference-bodyfat-label" class="reference-wide">
          <span>Body fat % for FFM conversion</span>
          <input id="reference-bodyfat" type="range" min="5" max="50" step="1">
        </label>
      </div>

      <details class="reference-other-guidance">
        <summary>Other guidance that does not map cleanly to one adult g/kg/day range</summary>
        <div class="reference-other-list">${referenceOtherGuidanceHtml()}</div>
      </details>
    </div>

    <button id="reference-dock-trigger" class="reference-dock-trigger" type="button" aria-expanded="false" aria-controls="reference-dock-panel">
      <span class="reference-dock-dot" aria-hidden="true"></span>
      <span class="reference-dock-trigger-copy">
        <small>Protein reference</small>
        <span id="reference-dock-name" class="reference-dock-name">—</span>
        <span id="reference-dock-range" class="reference-dock-range">—</span>
      </span>
      <span class="reference-dock-chevron" aria-hidden="true">▲</span>
    </button>`;

  document.body.appendChild(dock);

  const toggleDock = (open) => {
    dock.dataset.open = open ? "true" : "false";
    const panel = document.getElementById("reference-dock-panel");
    const trigger = document.getElementById("reference-dock-trigger");
    if (panel) panel.hidden = !open;
    if (trigger) trigger.setAttribute("aria-expanded", String(open));
  };

  document.getElementById("reference-dock-trigger")?.addEventListener("click", () => {
    toggleDock(dock.dataset.open !== "true");
  });
  document.getElementById("reference-dock-close")?.addEventListener("click", () => toggleDock(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dock.dataset.open === "true") toggleDock(false);
  });
  document.addEventListener("pointerdown", (event) => {
    if (dock.dataset.open === "true" && !dock.contains(event.target)) toggleDock(false);
  });

  document.getElementById("reference-dock-select")?.addEventListener("change", (event) => {
    activateReferenceDockBenchmark(event.target.value);
  });

  document.getElementById("reference-custom-toggle")?.addEventListener("click", () => {
    const grid = document.getElementById("reference-custom-grid");
    const button = document.getElementById("reference-custom-toggle");
    const opening = grid?.hidden !== false;
    if (opening) copyActiveReferenceToCustom();
    if (grid) grid.hidden = !opening;
    if (button) {
      button.setAttribute("aria-expanded", String(opening));
      button.textContent = opening ? "Hide customization" : "Customize this range";
    }
    renderReferenceDock();
  });

  const customHandler = () => applyReferenceDockCustomValues();
  document.getElementById("reference-custom-lower")?.addEventListener("change", customHandler);
  document.getElementById("reference-custom-upper")?.addEventListener("change", customHandler);
  document.getElementById("reference-custom-basis")?.addEventListener("change", customHandler);
  document.getElementById("reference-personal-weight")?.addEventListener("change", customHandler);
  document.getElementById("reference-bodyfat")?.addEventListener("input", customHandler);

  renderReferenceDock();
}

function activateReferenceDockBenchmark(key) {
  if (!benchmarkDefinitions[key]) return;
  state.benchmark = key;
  const hiddenSelect = document.getElementById("benchmark-select");
  if (hiddenSelect) hiddenSelect.value = key;
  originalUpdateBenchmarkSummaryV05();
  renderTrend();
  renderComparisonTable();
  renderGdpScatter();
  syncUrl();
  renderReferenceDock();
}

function copyActiveReferenceToCustom() {
  const key = state.benchmark;
  if (key === "personal") return;
  const definition = benchmarkDefinitions[key];
  if (!definition || definition.lower == null) {
    state.customLower = 1.2;
    state.customUpper = 1.6;
    state.customBasis = "bodyweight";
    state.customLabel = "Custom target";
    state.customDescription = "User-defined contextual range.";
    state.customSource = "";
    return;
  }
  state.customLower = Number(definition.lower);
  state.customUpper = Number(definition.upper);
  state.customBasis = definition.basis === "ffm" ? "ffm" : "bodyweight";
  state.customLabel = `${definition.shortLabel || definition.label} — custom`;
  state.customDescription = `Editable range based on ${definition.label}.`;
  state.customSource = definition.source || "";
}

function applyReferenceDockCustomValues() {
  const lower = Number(document.getElementById("reference-custom-lower")?.value);
  const upper = Number(document.getElementById("reference-custom-upper")?.value);
  const weight = Number(document.getElementById("reference-personal-weight")?.value);
  const bodyFat = Number(document.getElementById("reference-bodyfat")?.value);
  const basis = document.getElementById("reference-custom-basis")?.value;

  if (Number.isFinite(lower)) state.customLower = Math.max(0, Math.min(6, lower));
  if (Number.isFinite(upper)) state.customUpper = Math.max(state.customLower, Math.min(6, upper));
  if (weight >= 35 && weight <= 250) state.personalWeight = weight;
  if (bodyFat >= 5 && bodyFat <= 50) state.bodyFat = bodyFat;
  state.customBasis = basis === "ffm" ? "ffm" : "bodyweight";
  state.personalProfile = "custom";
  state.customLabel = "Custom target";
  state.customDescription = "User-defined contextual range.";
  state.benchmark = "personal";

  const hiddenSelect = document.getElementById("benchmark-select");
  if (hiddenSelect) hiddenSelect.value = "personal";
  const hiddenWeight = document.getElementById("personal-weight");
  const hiddenBodyFat = document.getElementById("body-fat");
  if (hiddenWeight) hiddenWeight.value = String(state.personalWeight);
  if (hiddenBodyFat) hiddenBodyFat.value = String(state.bodyFat);

  originalUpdateBenchmarkSummaryV05();
  renderTrend();
  renderComparisonTable();
  renderGdpScatter();
  syncUrl();
  renderReferenceDock();
}

function renderReferenceDock() {
  const dock = document.getElementById("reference-dock");
  if (!dock) return;

  const item = resolvedBenchmark();
  const definition = benchmarkDefinitions[state.benchmark] || benchmarkDefinitions.none;
  const label = state.benchmark === "personal"
    ? (state.customLabel || "Custom target")
    : (definition.shortLabel || definition.label || "No reference");
  const range = referenceDisplayRange(item);

  dock.style.setProperty("--dock-accent", item.color || definition.color || "#6b7280");
  dock.dataset.disabled = state.metric === "protein_supply_g_kg_day" ? "false" : "true";

  const dockName = document.getElementById("reference-dock-name");
  const dockRange = document.getElementById("reference-dock-range");
  if (dockName) dockName.textContent = label;
  if (dockRange) dockRange.textContent = range;

  const select = document.getElementById("reference-dock-select");
  if (select) {
    select.innerHTML = referenceSelectHtml();
    select.value = state.benchmark;
  }

  const cardName = document.getElementById("reference-card-name");
  const cardRange = document.getElementById("reference-card-range");
  const cardVisual = document.getElementById("reference-card-visual");
  const description = document.getElementById("reference-card-description");
  const daily = document.getElementById("reference-card-daily");
  const basis = document.getElementById("reference-card-basis");
  const source = document.getElementById("reference-card-source");

  if (cardName) cardName.textContent = label;
  if (cardRange) cardRange.textContent = range;
  if (cardVisual) cardVisual.innerHTML = referenceVisualHtml(item);
  if (description) description.textContent = item.description || "No recommendation overlay is active.";
  if (daily) daily.textContent = item.lowerResolved == null ? "" : benchmarkDailyLabel();
  if (basis) basis.textContent = item.lowerResolved == null
    ? ""
    : item.converted
      ? `${state.bodyFat}% body fat · FFM converted to bodyweight equivalent`
      : item.basis === "ffm" ? "fat-free-mass basis" : "bodyweight basis";
  if (source) {
    source.hidden = !item.source;
    if (item.source) source.href = item.source;
  }

  const lowerInput = document.getElementById("reference-custom-lower");
  const upperInput = document.getElementById("reference-custom-upper");
  const basisInput = document.getElementById("reference-custom-basis");
  const weightInput = document.getElementById("reference-personal-weight");
  const bodyFatInput = document.getElementById("reference-bodyfat");
  const bodyFatLabel = document.getElementById("reference-bodyfat-label");
  if (lowerInput) lowerInput.value = String(state.customLower);
  if (upperInput) upperInput.value = String(state.customUpper);
  if (basisInput) basisInput.value = state.customBasis;
  if (weightInput) weightInput.value = String(state.personalWeight);
  if (bodyFatInput) bodyFatInput.value = String(state.bodyFat);
  if (bodyFatLabel) bodyFatLabel.hidden = state.customBasis !== "ffm";
}

installPersonalizationUi = function() {
  originalInstallPersonalizationUiV05();
  document.getElementById("benchmark-lab")?.remove();
  document.getElementById("personal-target-builder")?.remove();
  installReferenceDock();
};

updateBenchmarkSummary = function() {
  originalUpdateBenchmarkSummaryV05();
  renderReferenceDock();
};

syncPersonalInputs = function() {
  originalSyncPersonalInputsV05();
  renderReferenceDock();
};

renderAll = function() {
  originalRenderAllV05();
  renderReferenceDock();
};
