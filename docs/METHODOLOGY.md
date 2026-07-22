# Methodology

## Research question

How much protein is available in each country per day relative to the estimated body mass of its population, and how does that ecological indicator vary with national income?

The project deliberately distinguishes **protein supply**, **modelled dietary intake**, and **observed dietary intake**. These are not interchangeable.

## Current preview model

The public preview calculates:

\[
\text{protein supply per estimated adult kg}_{c,y}
=
\frac{\text{protein supply}_{c,y}\;(g/person/day)}
{\text{estimated adult bodyweight}_{c,y}\;(kg)}
\]

The denominator is a preliminary adult proxy:

1. Retrieve sex-specific, age-standardized adult BMI for each country and year.
2. Retrieve sex-specific adult height by birth cohort.
3. Represent the adult population in year `y` with the height of the cohort born in `y − 40`.
4. Calculate male and female weight proxies as `BMI × height²`.
5. Average the two sex-specific values equally.

This model is useful as an auditable preview but is not the final population-body-mass model.

## Why the current indicator is ecological

Dividing a national mean protein supply by a national bodyweight estimate gives a ratio of aggregates:

\[
\frac{E(P)}{E(W)}
\]

It does not recover the mean of individual ratios:

\[
E\left(\frac{P}{W}\right)
\]

The dashboard must therefore use wording such as **protein supply per estimated kilogram of bodyweight**, not “the average person consumes X g/kg.”

## GDP-per-capita context

The explorer matches each country-year to the World Bank indicator:

```text
NY.GDP.PCAP.PP.KD
GDP per capita, PPP (constant 2021 international $)
```

Purchasing-power parity is used because it is more appropriate than market exchange rates for comparing average material resources across countries. Constant 2021 international dollars make observations more comparable through time.

The GDP scatterplot uses a logarithmic horizontal axis because national income is strongly right-skewed. The displayed Pearson correlation is calculated between:

```text
log10(GDP per capita PPP)
and
the selected protein/bodyweight indicator
```

This is a descriptive cross-country association. It is not evidence that GDP causes protein supply, bodyweight, or dietary adequacy. Potential confounding includes food-system structure, trade, inequality, demographics, urbanization, public policy, and measurement differences.

World Bank GDP coverage in the source series begins in 1990. Earlier protein/bodyweight years remain available in the other plots but cannot appear in the GDP relationship panel.

## Final all-age model

The intended production denominator is:

\[
\overline W_{c,y}=
\frac{\sum_{a,s} N_{c,y,a,s}\,W_{c,y,a,s}}
{\sum_{a,s}N_{c,y,a,s}}
\]

where `a` is age, `s` is sex, `N` is population, and `W` is estimated mean bodyweight for the matching cell.

For ages 5 and older:

\[
W_{c,y,a,s}\approx BMI_{c,y,a,s}\times H_{c,y,a,s}^2
\]

The final model requires age-sex-specific NCD-RisC BMI and height estimates plus UN World Population Prospects population counts. Ages 0–4 require either country survey anthropometry or an explicitly flagged WHO growth-standard approximation.

## Protein layers

### FAOSTAT / Our World in Data

- Annual national series.
- Broad historical coverage.
- Measures food supply available at the end of the supply chain.
- Does not measure household allocation, consumer waste, or individual intake.

### Global Dietary Database

Planned companion layer, subject to access and redistribution terms:

- Modelled dietary intake.
- Benchmark years rather than a complete annual series.
- Age, sex, urban/rural, and education dimensions.
- Must remain visibly distinct from FAOSTAT supply.

### National and subnational surveys

Planned modular layer:

- Observed or survey-modelled intake.
- Potentially includes administrative region, income, education, and other covariates.
- Cannot be merged into a globally uniform panel without preserving survey design and comparability metadata.

## Regional aggregation

Regional ratios must be calculated from totals, not by averaging country ratios:

\[
\text{regional g/kg/day}=
\frac{\sum_c P_c N_c}{\sum_c W_c N_c}
\]

## Quality flags

Every derived row should eventually include:

- `protein_measure`: supply, modelled intake, or observed intake;
- `weight_method`;
- `estimate_status`: observed, modelled, interpolated, extrapolated, or proxy;
- source version and retrieval date;
- uncertainty interval where available;
- population coverage;
- demographic dimensions used in the denominator.

## Known limitations of the preview

- Adult BMI is age-standardized rather than population-weighted for the country's actual age structure.
- Representative-cohort height is an approximation.
- Sexes are weighted equally.
- Children are excluded from the bodyweight denominator.
- `mean(BMI) × mean(height)²` does not exactly equal mean weight without the joint distribution.
- Source estimates and their uncertainties are not yet propagated through Monte Carlo simulation.
- GDP correlations are ecological and do not adjust for confounding or measurement error.

These limitations are displayed in the interface and encoded in `estimate_status`.
