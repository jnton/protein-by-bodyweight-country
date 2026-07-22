# Research roadmap

## Phase 1 — Public preview

- [x] Reproducible FAOSTAT/OWID protein-supply importer.
- [x] Preliminary adult bodyweight proxy.
- [x] Interactive map, rankings, trends, scatterplot, and CSV download.
- [x] GitHub Actions validation and Pages deployment.
- [x] Citation and split-license policy.

## Phase 2 — All-age population body mass

- [ ] Import NCD-RisC age-specific BMI by country, year, age, and sex.
- [ ] Import NCD-RisC age-specific height by country, year, age, and sex.
- [ ] Import UN WPP 2024 single-age population by country, year, and sex.
- [ ] Implement ages 0–4 with country survey data where available and a clearly flagged WHO reference fallback.
- [ ] Propagate uncertainty through Monte Carlo draws.
- [ ] Validate against published national mean-weight estimates and microdata benchmarks.

## Phase 3 — Demographic dietary intake

- [ ] Obtain Global Dietary Database total-protein estimates and full terms.
- [ ] Add age and sex intake profiles.
- [ ] Add urban/rural comparisons for common years.
- [ ] Add education comparisons without implying education-specific bodyweight where no matching denominator exists.
- [ ] Preserve modelled-intake terminology and uncertainty.

## Phase 4 — Protein composition

- [ ] Animal versus plant protein where licensing and coverage permit.
- [ ] Food-group contribution profiles.
- [ ] Protein quality indicators only when supported by defensible amino-acid or digestibility data.

## Phase 5 — Subnational modules

Add country-specific modules rather than forcing inconsistent surveys into one panel. Candidate sources include FAO/WHO GIFT, DHS, national nutrition surveys, NHANES, and Italian national datasets.

Each module must document sampling, age range, geography, survey year, dietary assessment method, weighting, and comparability.

## Phase 6 — Publication

- [ ] Public GitHub repository and GitHub Pages explorer.
- [ ] Versioned Zenodo release with DOI.
- [ ] Wikimedia Commons SVG/PNG figures and animations.
- [ ] Commons Data namespace export only where source licensing permits the required free data licence.
- [ ] Reusable methodology graphic and multilingual captions.
