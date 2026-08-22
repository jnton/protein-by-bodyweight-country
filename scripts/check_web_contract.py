#!/usr/bin/env python3
"""Static contract checks for the browser explorer."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "web" / "index.html"
JS_PATHS = [
    ROOT / "web" / "app-data.js",
    ROOT / "web" / "app-charts.js",
    ROOT / "web" / "app-main.js",
    ROOT / "web" / "app-polish.js",
]
CSS_PATHS = [
    ROOT / "web" / "styles.css",
    ROOT / "web" / "personalize.css",
    ROOT / "web" / "polish.css",
]
CONFIG_PATH = ROOT / "config" / "sources.json"


def main() -> None:
    html = HTML_PATH.read_text(encoding="utf-8")
    javascript = "\n".join(path.read_text(encoding="utf-8") for path in JS_PATHS)
    css = "\n".join(path.read_text(encoding="utf-8") for path in CSS_PATHS)
    config = CONFIG_PATH.read_text(encoding="utf-8")

    html_ids = set(re.findall(r'\bid="([^"]+)"', html))
    js_ids = set(re.findall(r'el\("([^"]+)"\)', javascript))
    missing = sorted(js_ids - html_ids)
    if missing:
        raise SystemExit(f"JavaScript references missing HTML ids: {missing}")

    required_scripts = {path.name for path in JS_PATHS}
    absent_scripts = sorted(name for name in required_scripts if name not in html)
    if absent_scripts:
        raise SystemExit(f"HTML does not load controller files: {absent_scripts}")

    required_styles = {"styles.css", "polish.css"}
    absent_styles = sorted(name for name in required_styles if name not in html)
    if absent_styles:
        raise SystemExit(f"HTML does not load required stylesheets: {absent_styles}")

    required_ids = {
        "metric-select",
        "year-slider",
        "country-search",
        "benchmark-select",
        "benchmark-summary",
        "selected-country-chips",
        "map-chart",
        "trend-chart",
        "gdp-chart",
        "comparison-body",
    }
    absent = sorted(required_ids - html_ids)
    if absent:
        raise SystemExit(f"Critical explorer controls are missing: {absent}")

    required_benchmarks = {
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
        "personal",
    }
    absent_benchmarks = sorted(
        key
        for key in required_benchmarks
        if not re.search(rf"\b{re.escape(key)}\s*:", javascript)
    )
    if absent_benchmarks:
        raise SystemExit(f"Benchmark definitions are missing: {absent_benchmarks}")

    required_source_fragments = {
        "NY.GDP.PCAP.PP.KD",
        "daily-per-capita-protein-supply",
        "mean-body-mass-index-bmi-in-adult-males",
    }
    missing_sources = sorted(
        fragment for fragment in required_source_fragments if fragment not in config
    )
    if missing_sources:
        raise SystemExit(f"Source registry is missing: {missing_sources}")

    for required_text in (
        "No universal protein upper intake level",
        "GDP per capita",
        "One reference at a time",
    ):
        if required_text not in html:
            raise SystemExit(f"Required explanatory text is missing: {required_text}")

    for required_javascript in (
        "Protein recommendation lab",
        "gdpAxisScale",
        "benchmark-lab-rows",
        "Show active protein reference",
        "EFSA Population Reference Intake",
        "Academy / Dietitians of Canada / ACSM athletes",
    ):
        if required_javascript not in javascript:
            raise SystemExit(f"Required interaction is missing: {required_javascript}")

    for required_css in (
        ".benchmark-lab-panel",
        ".benchmark-lab-row",
        ".gdp-chart-controls",
    ):
        if required_css not in css:
            raise SystemExit(f"Required visual style is missing: {required_css}")

    print(
        f"Validated {len(html_ids)} HTML ids, {len(js_ids)} JavaScript id references, "
        f"{len(required_scripts)} controller files, {len(required_benchmarks)} benchmark "
        "definitions, and clean GDP/benchmark-lab wiring."
    )


if __name__ == "__main__":
    main()
