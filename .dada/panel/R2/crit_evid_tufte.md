# R2 Critic: Evidence (Tufte)

- Anchor used: Tufte, *The Visual Display of Quantitative Information*: Lie Factor near 1; data-ink varies with the data.
- Observed: `build.mjs` l.331 `knotR = 7*sqrt(n/35)`; landing key r 1.18/3.74/7 for 1/10/35; l.391 own-country knot `Math.max(knotR, 4)`; `style.css` l.66 `.k` stroke .6 paper, l.158 `.key .k {stroke:none}`; l.154 games .38/1 px; `index-1280.png`.
- Findings:
  - F1 [claim] R1 F1-F3 answered: key areas 1:10:35 recompute to 1:10.0:35.2 (LF 1.0); heritage `16*sqrt(n/max)`, no floor, text says proportional.
  - F2 [claim] R1 F4 answered: games (3 of 152) now faint in the screenshot. Tiles sum 37+31+22+50+3+9=152; fringe has 76 paths; 1390 vs 1286 is explained on heritage.html.
  - F3 [defect] Floor returns on country pages: Marshall Islands (4 threads) drawn r=4 against true 2.37, area 2.85x its neighbours on the same map. Lie Factor 2.85.
  - F4 [defect] Map knots carry a 0.6 paper stroke that eats 0.3 of radius, but the key has none: a 1-thread knot shows 0.88 vs key 1.18 (LF 0.61 at the small end).
- Verdict: OBJECT (minor; ship-blocking only by doctrine)
- Requested change: F3: mark own country by colour or a ring outside r, not by size. F4: draw `.k` stroke outside (paint-order) or remove it, so map matches key.
