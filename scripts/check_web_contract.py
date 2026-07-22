#!/usr/bin/env python3
"""Static contract checks for the browser explorer.

This catches broken element IDs, missing benchmark sources, and accidental loss of
critical graph-studio controls before deployment. It is intentionally dependency-free.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "web" / "index.html"
JS_PATH = ROOT / "web" / "app.js"


def main() -> None:
    html = HTML_PATH.read_text(encoding="utf-8")
    javascript = JS_PATH.read_text(encoding="utf-8")

    html_ids = set(re.findall(r'\bid="([^"]+)"', html))
    js_id_references = set(re.findall(r'\bel\("([^"]+)"\)', javascript))
    missing_ids = sorted(js_id_references - html_ids)
    if missing_ids:
        raise SystemExit(f"JavaScript references missing HTML IDs: {missing_ids}")

    required_ids = {
        "country-search",
        "country-options",
        "selected-country-chips",
        "benchmark-toggles",
        "primary-benchmark",
        "personal-weight",
        "body-fat",
        "trend-chart",
        "comparison-body",
        "share-view",
    }
    absent_required = sorted(required_ids - html_ids)
    if absent_required:
        raise SystemExit(f"Graph-studio controls are missing: {absent_required}")

    required_benchmarks = {"us_dga", "exercise", "rda", "older", "morton", "deficit"}
    absent_benchmarks = sorted(key for key in required_benchmarks if f"{key}:" not in javascript)
    if absent_benchmarks:
        raise SystemExit(f"Benchmark definitions are missing: {absent_benchmarks}")

    required_sources = {
        "cdn.realfood.gov/DGA.pdf",
        "10.1186/s12970-017-0177-8",
        "10.1136/bjsports-2017-097608",
        "10.1123/ijsnem.2013-0054",
        "10.1016/j.jamda.2013.05.021",
    }
    missing_sources = sorted(source for source in required_sources if source not in html and source not in javascript)
    if missing_sources:
        raise SystemExit(f"Benchmark source links are missing: {missing_sources}")

    if "params.set(\"countries\", state.selectedCodes.join(\",\"))" not in javascript:
        raise SystemExit("Shareable URL state no longer preserves an empty country selection")

    print(
        f"Validated {len(js_id_references)} JavaScript element references, "
        f"{len(required_benchmarks)} benchmarks, and {len(required_sources)} source links"
    )


if __name__ == "__main__":
    main()
