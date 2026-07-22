# Protein by Bodyweight by Country

[![Validate data pipeline](https://github.com/jnton/protein-by-bodyweight-country/actions/workflows/ci.yml/badge.svg)](https://github.com/jnton/protein-by-bodyweight-country/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/code-AGPL--3.0-blue)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-c95b42)](LICENSE_POLICY.md)

An interactive, reproducible explorer of national protein supply relative to estimated bodyweight.

**Live explorer:** https://jnton.github.io/protein-by-bodyweight-country/

## Why this exists

Protein availability is usually compared in grams per person per day. That hides a relevant ecological difference: populations vary in body size and demographic composition. This project builds a transparent country-year indicator in grams of protein supply per estimated kilogram of bodyweight, while keeping its assumptions visible.

The project never treats national food supply as synonymous with individual consumption.

## Current preview

The preview combines:

- FAOSTAT daily per-capita protein supply via Our World in Data;
- sex-specific, age-standardized adult BMI;
- sex-specific adult height by birth cohort;
- World Bank GDP per capita at PPP in constant 2021 international dollars.

It estimates an adult bodyweight proxy and calculates:

```text
protein supply (g/person/day) ÷ estimated adult bodyweight (kg)
```

This is an ecological adult proxy, not an individual dietary recommendation and not yet the final all-age population denominator.

## Explorer features

- compact full-width graph controls rather than a permanent sidebar;
- country selection by typing a name/ISO code, pressing Enter, clicking the map, or clicking the ranking;
- removable country chips and presets;
- comparison of up to 10 countries;
- one protein reference at a time, displayed as separate minimum and upper-end lines;
- explicit note that no universal protein upper intake level has been established;
- body-fat conversion for the FFM-based hypocaloric athlete range;
- selected-year comparison table;
- GDP-per-capita PPP scatterplot with log income axis and selected-country highlighting;
- descriptive correlation between log GDP per capita and the selected indicator;
- shareable URLs preserving the full view;
- responsive choropleth, trend, ranking, and relationship charts;
- dark mode and downloadable CSV;
- visible methodological warnings and source provenance.

Benchmark overlays are contextual only. The plotted country series is food supply divided by a modelled bodyweight proxy, not observed individual intake. See [benchmark definitions and caveats](docs/BENCHMARKS.md).

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
make install
make serve
```

Then open `http://localhost:8000`.

## Build only the dataset

```bash
python scripts/build_dataset.py
```

Outputs are written to `data/derived/` and are intentionally not committed.

## Research programme

The production model will add:

- age-sex-specific NCD-RisC BMI and height;
- UN WPP single-age population weights;
- ages 0–4 with survey data or an explicit WHO-reference fallback;
- Monte Carlo uncertainty propagation;
- Global Dietary Database age, sex, residence, and education layers;
- national and subnational dietary-survey modules;
- regional aggregates calculated from population-weighted totals.

See [methodology](docs/METHODOLOGY.md), [benchmark documentation](docs/BENCHMARKS.md), [research roadmap](docs/RESEARCH_ROADMAP.md), and [tracked data requests](docs/DATA_REQUESTS.md).

## Publication strategy

The interactive project belongs on GitHub Pages. Versioned releases should be archived on Zenodo for a DOI. Wikimedia Commons is used for independently educational SVG/PNG maps, diagrams, and animations—not as a source-code host or a portfolio landing page.

See [publishing strategy](docs/PUBLISHING.md).

## Licences

- Code: AGPL-3.0-or-later.
- Original documentation, visual design, and exported figures: CC BY-SA 4.0.
- World Bank GDP data: CC BY 4.0.
- Other third-party and derived data: source-specific terms remain in force.

See [licence policy](LICENSE_POLICY.md).

## Citation

Citation metadata are provided in [`CITATION.cff`](CITATION.cff). A version DOI will be added after the first Zenodo archive.
