# R0 Critic: Evidence (Tufte)

- Anchor used: Tufte, The Visual Display of Quantitative Information: the Lie Factor (effect shown / effect in data, must be near 1) and "show the data" before any decoration.
- Observed: I recomputed the figures myself with a Python parse. 7 of 27 JSON files fail to parse. The 191 `members` fields come from only the 20 that parse: 101 are lists, 90 are prose. There are 237 distinct names. France 23, UK 23, US 21, Germany 20. All match evidence-R0.md. README.md names three files that do not exist.
- Findings:
  - F1 [defect] Counts come only from the 20 files that parse. Shading the map by them under-weights the regions those 7 files cover (Americas, Arabic, French, Hindi, Portuguese).
  - F2 [defect] 47% of the `members` fields (90 of 191) are prose and add no ties. A map shaded by tie count would show their member countries as weakly linked, a Lie Factor well above 1.
  - F3 [defect] Name variants split one country's count (Korea x3, Côte d'Ivoire x2), so its share on the map shrinks.
  - F4 [premise] There is no art or games data. Any layer for either would be chartjunk.
- Verdict: OBJECT
- Requested change:
  - F1: fix the JSON before encoding anything.
  - F2: show prose-only memberships as "unmapped" and print the count.
  - F3: map every name to its ISO 3166 code.
  - F4: drop those layers or show them as empty, with no invented links.
