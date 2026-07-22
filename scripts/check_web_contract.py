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
]
CONFIG_PATH = ROOT / "config" / "sources.json"


def main() -> None:
    html = HTML_PATH.read_text(encoding="utf-8")
    javascript = "\n".join(path.read_text(encoding="utf-8") for path in JS_PATHS)
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
        "us_dga",
        "exercise",
        "rda",
        "older",
        "morton",
        "deficit",
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

    print(
        f"Validated {len(html_ids)} HTML ids, {len(js_ids)} JavaScript id references, "
        f"{len(required_scripts)} controller files, {len(required_benchmarks)} benchmark "
        "definitions, and GDP source wiring."
    )


if __name__ == "__main__":
    main()
