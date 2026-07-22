# Contributing

Contributions are welcome, especially source verification, entity crosswalks, uncertainty propagation, accessibility improvements, and reproducible demographic extensions.

## Principles

- Do not call FAOSTAT supply “consumption” without qualification.
- Do not merge supply, modelled intake, and observed intake into one unlabeled measure.
- Preserve source versions, licences, citations, and uncertainty.
- Never commit restricted raw datasets.
- Add tests for every transformation that changes a published metric.

## Local development

```bash
python -m venv .venv
source .venv/bin/activate
make install
make serve
```

Open `http://localhost:8000`.

## Pull requests

Describe the data source, exact transformation, limitations, licence compatibility, and validation performed. Visual changes should include before/after screenshots.
