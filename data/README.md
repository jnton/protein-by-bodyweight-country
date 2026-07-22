# Data directory

Raw third-party datasets are never committed here. The build pipeline downloads public source files directly from their canonical or documented mirrors and writes derived files to `data/derived/` or `web/data/`.

Generated outputs:

- `protein_bodyweight_country_year.csv`
- `protein_bodyweight_country_year.json`

The current preview uses FAOSTAT protein supply, sex-specific adult BMI, and adult height by birth cohort. It is an ecological adult proxy. See [`docs/METHODOLOGY.md`](../docs/METHODOLOGY.md).

Restricted or manually supplied datasets should be placed under `data/private/`, which must remain ignored. Never commit Global Dietary Database files or other sources whose terms prohibit redistribution.
