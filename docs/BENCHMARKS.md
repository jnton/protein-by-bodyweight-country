# Protein benchmark references

The explorer separates two jobs that should not be mixed visually:

1. **Country data** are plotted on the map, time series, GDP scatter, and selected-country table.
2. **Protein references** are compared in a dedicated recommendation lab on a common g/kg/day scale whenever that is scientifically meaningful.

One reference can be sent to the country time-series as the active overlay. The GDP scatter does **not** show recommendation lines by default; they can be enabled explicitly.

These comparisons are contextual. They do **not** turn country-level food-supply data into measurements of individual dietary adequacy.

## Why the country comparison is only contextual

The country series is:

```text
national protein supply in g/person/day
÷ estimated national adult bodyweight in kg
```

FAOSTAT food-balance-sheet data describe food available at the end of the supply chain. They do not measure each person's intake, fully account for consumer waste, or describe the distribution of protein within a country. The bodyweight denominator is also a modelled adult proxy in the current preview.

Labels such as `below range`, `within range`, and `above range` therefore describe only the numerical position of this ecological proxy.

## How the recommendation lab works

Comparable references are drawn on the same horizontal g/kg/day scale:

- a **range bar** for lower-to-upper recommendations;
- a **point** for single-number references or evidence estimates;
- a **minimum marker** for recommendations stated as `at least` or `>` a given value;
- an explicit **bodyweight-equivalent conversion** when the source is expressed per kilogram of fat-free mass.

The lab can be filtered by general adults, weight management, exercise/athletes, older adults, energy deficit, evidence estimates, or special populations.

A range's upper endpoint is **not** a universal safe maximum. EFSA concluded that available data were insufficient to establish a Tolerable Upper Intake Level for protein. The absence of a UL should not be interpreted as proof that arbitrarily high chronic intakes are risk-free.

## General-adult references

### U.S. DRI Recommended Dietary Allowance

- **0.80 g/kg bodyweight/day**.
- Adequacy reference for generally healthy adults.
- It is not necessarily an optimization target for exercise performance, hypertrophy, ageing, illness, or energy restriction.
- Source overview: NIH Office of Dietary Supplements: <https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/>

### EFSA Population Reference Intake

- **0.83 g/kg bodyweight/day** for healthy adults, including older adults in the formal 2012 DRV.
- EFSA estimated an average requirement of 0.66 g/kg/day and a PRI of 0.83 g/kg/day.
- Source: EFSA, *Scientific Opinion on Dietary Reference Values for protein*: <https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2012.2557>
- EFSA summary: <https://www.efsa.europa.eu/en/press/news/120209>

### WHO/FAO/UNU safe level

- **0.83 g/kg bodyweight/day** for healthy adults.
- Described as a safe level expected to meet the requirements of about 97.5% of the healthy adult population.
- Source: WHO/FAO/UNU, *Protein and Amino Acid Requirements in Human Nutrition*, WHO Technical Report Series 935: <https://iris.who.int/bitstream/handle/10665/43411/WHO_TRS_935_eng.pdf>

### U.S. Dietary Guidelines for Americans, 2025–2030

- **1.2–1.6 g/kg bodyweight/day**.
- Presented by the current federal guidance as a protein target.
- This is distinct from the older DRI RDA.
- Source: <https://www.realfood.gov/>

### Health-optimization review

- **1.2–1.6 g/kg bodyweight/day** as a range discussed for adults interested in optimizing health beyond minimum adequacy.
- This is a review-level interpretation, not a universal government reference value.
- Source: Phillips et al., 2016, PMID 26960445: <https://pubmed.ncbi.nlm.nih.gov/26960445/>

## Weight-management context

### Higher-protein weight-management review

- **1.2–1.6 g/kg bodyweight/day**.
- Discussed in the context of appetite, body-weight management, and cardiometabolic outcomes.
- It should not be interpreted as saying every person with excess body fat should automatically diet or use this intake.
- Source: Leidy et al., 2015, PMID 25926512: <https://pubmed.ncbi.nlm.nih.gov/25926512/>

## Exercise and athletic references

### Academy of Nutrition and Dietetics / Dietitians of Canada / ACSM

- **1.2–2.0 g/kg bodyweight/day** across athletic training contexts.
- The position statement emphasizes that needs fluctuate with training load, energy availability, training status, and goals rather than assigning a fixed number by sport type.
- Source: Thomas, Erdman & Burke, 2016, PMID 26920240: <https://pubmed.ncbi.nlm.nih.gov/26920240/>

### International Society of Sports Nutrition

- **1.4–2.0 g/kg bodyweight/day** for building and maintaining muscle mass in most exercising individuals.
- Source: Jäger et al., *International Society of Sports Nutrition Position Stand: protein and exercise*: <https://pubmed.ncbi.nlm.nih.gov/28642676/>

### Resistance-training meta-regression breakpoint

- **1.62 g/kg bodyweight/day** as the estimated breakpoint in the primary meta-regression.
- This is an evidence estimate, not a formal recommended range or sharp biological threshold.
- The confidence interval around the breakpoint was broad and individual responses vary.
- Source: Morton et al., *A systematic review, meta-analysis and meta-regression of protein supplementation and resistance training*: <https://doi.org/10.1136/bjsports-2017-097608>

### Very-high-protein evidence threshold

- **>3.0 g/kg bodyweight/day** appears in the ISSN position stand as an evidence note about possible body-composition effects in resistance-trained individuals.
- The interface labels this **evidence, not target** rather than presenting it as a general recommendation.
- Source: Jäger et al., 2017: <https://pubmed.ncbi.nlm.nih.gov/28642676/>

## Older-adult references

### PROT-AGE: healthy adults aged 65+

- **1.0–1.2 g/kg bodyweight/day**.
- Source: Bauer et al., *Evidence-based recommendations for optimal dietary protein intake in older people*: <https://pubmed.ncbi.nlm.nih.gov/23867520/>

### PROT-AGE: exercising or otherwise active adults aged 65+

- **at least 1.2 g/kg bodyweight/day**.
- The recommendation is minimum-like, so the interface uses a `≥` marker rather than inventing an upper endpoint.
- Source: <https://pubmed.ncbi.nlm.nih.gov/23867520/>

### PROT-AGE: acute or chronic disease

- **1.2–1.5 g/kg bodyweight/day** for most older adults with acute or chronic disease.
- This is clinical context, not self-treatment guidance; the paper specifically notes exceptions such as severe kidney disease not treated with dialysis.
- Source: <https://pubmed.ncbi.nlm.nih.gov/23867520/>

### ESPEN: healthy older adults

- **1.0–1.2 g/kg bodyweight/day**.
- Source: Deutz et al., *Protein intake and exercise for optimal muscle function with aging*: <https://pubmed.ncbi.nlm.nih.gov/24814383/>

### ESPEN: illness or malnutrition risk in older adults

- **1.2–1.5 g/kg bodyweight/day**, with potentially higher needs in severe illness or injury under professional management.
- Source: <https://pubmed.ncbi.nlm.nih.gov/24814383/>

## Energy deficit / lean resistance-trained athletes

### Helms systematic review

- **2.3–3.1 g/kg fat-free mass/day**.
- This is a specialized range for lean, resistance-trained athletes during caloric restriction.
- It is **not** a general recommendation for everyone who might benefit from losing body fat.
- Source: Helms et al., *A systematic review of dietary protein during caloric restriction in resistance trained lean athletes*: <https://doi.org/10.1123/ijsnem.2013-0054>

### Fat-free-mass conversion

To place an FFM-based range on the common bodyweight axis, the interface uses:

```text
bodyweight-equivalent g/kg/day
= FFM-based g/kg/day × (1 − body-fat fraction)
```

At 20% body fat:

```text
2.3–3.1 g/kg FFM/day
= 1.84–2.48 g/kg bodyweight/day
```

This is only a mathematical unit conversion. It does not estimate body composition or decide which intake is appropriate.

## References deliberately kept off the common adult g/kg/day axis

Not every reputable recommendation can honestly be reduced to one adult g/kg/day bar. The interface retains these separately rather than forcing a misleading conversion.

### WHO healthy-diet guidance

- Protein at **10–15% of total daily energy intake** is described as generally sufficient for adults.
- Without both energy intake and bodyweight, this is not directly equivalent to a fixed g/kg/day value.
- Source: WHO, *Healthy diet*: <https://www.who.int/news-room/fact-sheets/detail/healthy-diet>

### EFSA infants, children, and adolescents

- Age-dependent PRIs of approximately **0.83–1.31 g/kg/day**, depending on age.
- This should not be displayed as though every child or adolescent shares one target.
- Source: <https://www.efsa.europa.eu/en/press/news/120209>

### EFSA pregnancy additions

- Additional protein of **1 g/day, 9 g/day, and 28 g/day** in the first, second, and third trimesters respectively.
- These are absolute additions to the reference for non-pregnant women, not a single g/kg/day target.
- Source: <https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2012.2557>

### EFSA lactation additions

- Additional **19 g/day during the first six months** and **13 g/day thereafter**.
- Again, these are absolute additions rather than one g/kg/day target.
- Source: <https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2012.2557>

## Custom target

The personal target builder lets users edit:

- lower and upper endpoints;
- total-bodyweight or fat-free-mass basis;
- personal bodyweight for the g/day conversion;
- body-fat assumption when converting an FFM reference.

The custom range is a calculator and visualization control, not an automated medical prescription.

## Interface interpretation rules

- **Below range** means the ecological proxy is numerically below the selected reference.
- **Within range** means it lies between the selected lower and upper endpoints.
- **Above range** means it is numerically higher; this is not automatically better.
- **At / above minimum** is used for minimum-like references such as `≥1.2`.
- Only one reference is displayed on the country trend at a time.
- Recommendation lines are off by default in the GDP plot.
- Reference overlays are available only for the normalized `g/kg/day` indicator.

## Health caveat

Protein needs vary with age, body composition, physical activity, training goal, energy balance, pregnancy, illness, injury, food quality, and total diet. Higher-protein diets may be inappropriate for some people, especially where kidney function or another medical condition requires individualized care. The explorer is an educational population-data visualization, not medical or nutritional advice.
