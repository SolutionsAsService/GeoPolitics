# R1 Critic: Evidence (Tufte)

- Anchor used: Tufte, *The Visual Display of Quantitative Information*: the Lie Factor (size of effect on the page divided by size of effect in the data should be near 1), and data-ink: ink should vary with the data, not with the decoration.
- Observed: `_src/build.mjs` l.290 `knotR = 1.6 + 5.4*sqrt(n/40)`; l.438 heritage `r = 2 + 14*sqrt(n/64)`; knots in the landing HTML run from n=1 (33 knots) to n=40. `index-1280.png`: purple Games dash-dot dominates the northern band. Tile: Games 3 threads of 181. Page text (l.437, l.484) says area is "proportional".
- Findings:
  - F1 [defect] Knot area ratio for 40 vs 1 thread is (7/2.45)^2 = 8.1 against 40 in the data: Lie Factor 0.20. For 40 vs 10 it is 0.66.
  - F2 [defect] Heritage ring for Italy 64 vs 1 site: (16/3.75)^2 = 18.2 against 64, Lie Factor 0.28.
  - F3 [defect] The page text claims "area proportional" but the floor makes that false. The code comment admits it ("above a visible floor"). The page does not.
  - F4 [defect] Games is 3 of 181 threads (1.7%), but its hosting-order zigzag lays down a large share of the weave's ink. Ink follows route length, not count.
  - F5 [claim] Recomputed: 207/96/28/75/17, 196+56, 181 match facts.json and the evidence file. R0 F1-F4 are resolved.
- Verdict: OBJECT
- Requested change: F1/F2: drop the additive floor (r = rmax*sqrt(n/max), with a separate invisible hit target) or print a size key with three true sizes. F3: state the floor in the text, or remove it. F4: draw Games apart, or as one stroke per series at low weight, or off by default.
