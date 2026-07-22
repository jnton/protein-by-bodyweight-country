# Personal target builder

The explorer includes a transparent target builder for educational comparison. It does not infer a clinical prescription from demographic data. Instead, each preset copies a published reference into editable lower and upper endpoints, shows whether the source is expressed per kilogram of total bodyweight or fat-free mass, and converts the selected range into grams per day using the user-entered bodyweight.

## Included presets

| Preset | Reference | Basis | Source |
|---|---:|---|---|
| General health / current U.S. goal | 1.2–1.6 g/kg/day | Bodyweight | *Dietary Guidelines for Americans, 2025–2030* |
| Health optimization review | 1.2–1.6 g/kg/day | Bodyweight | Phillips et al., 2016, PMID 26960445 |
| Weight management | 1.2–1.6 g/kg/day | Bodyweight | Leidy et al., 2015, PMID 25926512 |
| Regular exercise | 1.4–2.0 g/kg/day | Bodyweight | Jäger et al., ISSN position stand, 2017 |
| Healthy adults aged 65+ | 1.0–1.2 g/kg/day | Bodyweight | PROT-AGE, 2013 |
| Exercising or otherwise active adults aged 65+ | at least 1.2 g/kg/day | Bodyweight | PROT-AGE, 2013 |
| Older adults with acute or chronic illness | 1.2–1.5 g/kg/day | Bodyweight | PROT-AGE, 2013; clinical context only |
| Resistance-training meta-regression breakpoint | 1.62 g/kg/day | Bodyweight | Morton et al., 2018 |
| Lean resistance-trained people in an energy deficit | 2.3–3.1 g/kg fat-free mass/day | Fat-free mass | Helms et al., 2014 |

## Custom range

Users can edit the lower endpoint, upper endpoint, basis, bodyweight, and body-fat assumption. For a fat-free-mass reference, the bodyweight-equivalent range is calculated as:

```text
bodyweight-equivalent g/kg/day
= FFM-based g/kg/day × (1 − body-fat fraction)
```

The calculator does not estimate body composition or choose an appropriate target. It only performs the visible unit conversion.

## Interpretation limits

- The country indicator is national protein **supply** divided by an estimated adult bodyweight proxy. It is not observed individual intake.
- A recommendation’s upper endpoint is not a universal safe maximum. A general protein Tolerable Upper Intake Level has not been established.
- Requirements can differ with pregnancy, adolescence, illness, kidney function, injury, disability, medication, and other clinical factors.
- The older-illness range is included to document the literature, not to provide self-treatment advice.
- Personal ranges are contextual overlays and do not diagnose adequacy for a country or individual.
