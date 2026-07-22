# Protein benchmark references

The explorer can place the national protein-supply proxy beside **one selected protein reference at a time**. This keeps the trend legible and prevents overlapping recommendation bands from implying false consensus.

The overlays are contextual. They do **not** turn country-level food-supply data into measurements of individual dietary adequacy.

## Why the comparison is only contextual

The country series is:

```text
national protein supply in g/person/day
÷ estimated national adult bodyweight in kg
```

FAOSTAT food-balance-sheet data describe food available at the end of the supply chain. They do not measure each person's intake, fully account for consumer waste, or describe the distribution of protein within a country. The bodyweight denominator is also a modelled adult proxy in the current preview.

Labels such as "below range", "within range", and "above range" therefore describe only the numerical position of this ecological proxy.

## How ranges are drawn

A selected range is represented by two thin horizontal lines:

- **Minimum**: the lower endpoint of that specific recommendation.
- **Upper end**: the upper endpoint of that specific recommendation.

The upper endpoint is **not** labelled as a universal maximum or safety limit. A general Tolerable Upper Intake Level for total protein has not been established. The absence of a UL should not be interpreted as proof that arbitrarily high chronic intakes are risk-free.

Point references, such as the 0.8 g/kg/day RDA or the 1.62 g/kg/day meta-regression breakpoint, are shown as one line.

## Included references

### U.S. Dietary Guidelines for Americans, 2025–2030

- **1.2–1.6 g/kg bodyweight/day**
- The federal document presents this as a protein serving goal.
- It is distinct from the older DRI Recommended Dietary Allowance.
- Source: *Dietary Guidelines for Americans, 2025–2030*: <https://cdn.realfood.gov/DGA.pdf>

### U.S. DRI Recommended Dietary Allowance

- **0.8 g/kg bodyweight/day** for a generally healthy adult.
- The RDA is an adequacy reference intended to meet the needs of nearly all healthy people in the covered group.
- It is not necessarily an optimization target for exercise performance, hypertrophy, ageing, illness, or energy restriction.
- Source overview: NIH Office of Dietary Supplements, *Dietary Supplements for Exercise and Athletic Performance*: <https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/>

### Exercising individuals

- **1.4–2.0 g/kg bodyweight/day** for most exercising individuals.
- The ISSN position stand describes this range as sufficient for building and maintaining muscle mass in most exercising people.
- Source: Jäger et al., *International Society of Sports Nutrition Position Stand: protein and exercise*: <https://doi.org/10.1186/s12970-017-0177-8>

### Resistance-training meta-regression breakpoint

- **1.62 g/kg bodyweight/day** as the estimated breakpoint in the primary meta-regression.
- This should not be treated as a sharp universal threshold. The confidence interval was broad, and individual response varies.
- Source: Morton et al., *A systematic review, meta-analysis and meta-regression of protein supplementation and resistance training*: <https://doi.org/10.1136/bjsports-2017-097608>

### Healthy adults aged 65 years and older

- **1.0–1.2 g/kg bodyweight/day** for healthy older adults in the PROT-AGE recommendations.
- Illness and kidney disease require individualized clinical interpretation.
- Source: Bauer et al., *Evidence-based recommendations for optimal dietary protein intake in older people*: <https://doi.org/10.1016/j.jamda.2013.05.021>

### Lean resistance-trained people during caloric restriction

- **2.3–3.1 g/kg fat-free mass/day**.
- This is a specialized range from a systematic review focused on lean, resistance-trained athletes during energy restriction.
- It is not a general recommendation for everyone who might benefit from fat loss.
- Source: Helms et al., *A systematic review of dietary protein during caloric restriction in resistance trained lean athletes*: <https://doi.org/10.1123/ijsnem.2013-0054>

## Fat-free-mass conversion

To display the hypocaloric range on a bodyweight graph, the interface uses:

```text
bodyweight-equivalent g/kg
= FFM-based g/kg × (1 − body-fat fraction)
```

At 20% body fat:

```text
2.3–3.1 g/kg FFM/day
= 1.84–2.48 g/kg bodyweight/day
```

This is only a mathematical unit conversion. It does not estimate body composition or determine an appropriate intake.

## Interface interpretation rules

- **Below range** means the ecological proxy is numerically below the selected reference.
- **Within range** means it lies between the selected lower and upper endpoints.
- **Above range** means it is numerically higher; this is not automatically better.
- Only one reference is displayed on the trend by default.
- Reference overlays are available only for the normalized `g/kg/day` indicator.

## Health caveat

Protein needs vary with age, body composition, physical activity, training goal, energy balance, pregnancy, illness, injury, food quality, and total diet. Higher-protein diets may be inappropriate for some people, especially where kidney function or another medical condition requires individualized care. The explorer is an educational population-data visualization, not medical or nutritional advice.
