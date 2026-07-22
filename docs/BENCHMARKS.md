# Protein benchmark overlays

The explorer can place the national protein-supply proxy beside published protein references. These overlays are intended to help users understand the scale of the indicator. They do **not** turn country-level food-supply data into measurements of individual dietary adequacy.

## Why the comparison is only contextual

The country series is calculated as:

```text
national protein supply in g/person/day
÷ estimated national adult bodyweight in kg
```

FAOSTAT food-balance-sheet data describe food available at the end of the supply chain. They do not measure each person's intake, account fully for consumer waste, or describe how protein is distributed within the population. The bodyweight denominator is also a modelled adult proxy in the current preview.

Consequently, labels such as "below range", "within range", and "above range" describe only the numerical position of the ecological proxy. They must not be interpreted as diagnoses, prevalence estimates, or individual prescriptions.

## Included benchmarks

### U.S. Dietary Guidelines for Americans, 2025–2030

- **1.2–1.6 g/kg bodyweight/day**
- The current federal document calls this a protein serving goal.
- This is distinct from the older DRI Recommended Dietary Allowance.
- Source: *Dietary Guidelines for Americans, 2025–2030*, official PDF: <https://cdn.realfood.gov/DGA.pdf>

### U.S. DRI Recommended Dietary Allowance

- **0.8 g/kg bodyweight/day** for a generally healthy adult.
- The RDA is an adequacy reference intended to meet the needs of nearly all healthy people in the covered group. It is not necessarily an optimization target for exercise performance, hypertrophy, ageing, illness, or energy restriction.
- Source overview: NIH Office of Dietary Supplements, *Dietary Supplements for Exercise and Athletic Performance*: <https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/>

### Exercising individuals

- **1.4–2.0 g/kg bodyweight/day** for most exercising individuals.
- The ISSN position stand describes this range as sufficient for building and maintaining muscle mass in most exercising people.
- Source: Jäger et al., *International Society of Sports Nutrition Position Stand: protein and exercise*, DOI: <https://doi.org/10.1186/s12970-017-0177-8>

### Resistance-training meta-regression breakpoint

- **1.62 g/kg bodyweight/day** as the estimated breakpoint in the primary meta-regression.
- This value should not be treated as a sharp universal threshold. The reported 95% confidence interval was broad, and individual responses, training status, energy intake, age, protein quality, and study design vary.
- Source: Morton et al., *A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains*, DOI: <https://doi.org/10.1136/bjsports-2017-097608>

### Healthy adults aged 65 years and older

- **1.0–1.2 g/kg bodyweight/day** for healthy older adults in the PROT-AGE recommendations.
- Acute or chronic illness may justify higher values under clinical supervision, while severe kidney disease may require a different approach.
- Source: Bauer et al., *Evidence-based recommendations for optimal dietary protein intake in older people*, DOI: <https://doi.org/10.1016/j.jamda.2013.05.021>

### Lean resistance-trained people during caloric restriction

- **2.3–3.1 g/kg fat-free mass/day**.
- This is a specialized range from a systematic review focused on lean, resistance-trained athletes during energy restriction. It is not a general weight-loss recommendation and is not expressed per kilogram of total bodyweight.
- Source: Helms et al., *A systematic review of dietary protein during caloric restriction in resistance trained lean athletes*, DOI: <https://doi.org/10.1123/ijsnem.2013-0054>

## Fat-free-mass conversion

To display the hypocaloric range on a bodyweight-based graph, the interface uses an explicit body-fat assumption:

```text
bodyweight-equivalent g/kg
= FFM-based g/kg × (1 − body-fat fraction)
```

For example, at 20% body fat:

```text
2.3–3.1 g/kg FFM/day
= 1.84–2.48 g/kg bodyweight/day
```

This conversion is only a mathematical unit conversion. It does not estimate the user's body composition or determine an appropriate intake.

## Interpretation rules used in the interface

- **Below range** means the ecological country proxy is numerically below the selected reference.
- **Within range** means it lies between the selected lower and upper values.
- **Above range** means it is numerically higher; this is not automatically better.
- A point benchmark such as 0.8 or 1.62 is displayed as a line rather than a shaded band.
- Benchmark overlays are available only for the normalized `g/kg/day` indicator.

## Health and clinical caveats

Protein needs vary with age, body composition, physical activity, training goal, energy balance, pregnancy, illness, injury, food quality, and total diet. Higher-protein diets may be inappropriate for some people, particularly where kidney function or another medical condition requires individualized care. The explorer is an educational population-data visualization, not medical or nutritional advice.
