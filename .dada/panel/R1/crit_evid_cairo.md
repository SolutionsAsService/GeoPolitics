# Critic: Evidence (Cairo), R1

- Anchor used: Cairo, How Charts Lie: charts lie through scale and omission. Every printed figure must be one a reader can reproduce.
- Observed: My rebuild is byte-identical (270 pages). The domain counts sum to 181, and 196+56+1=253. The selftest caught 6 of 6. I ran the full measure three times.
- Findings:
  - F1 [defect] build.mjs:290 sets r=1.6+5.4*sqrt(n/max). Because of the floor, 1 thread and 40 threads draw at 1:8.2 in area, not 1:40. build.mjs:484 says "area is proportional", which is false.
  - F2 [claim] build.mjs:415 and evidence:14 say "28 of those [prose] filled". organisations.html shows 25 prose rows plus 3 one-member lists (build.mjs:151,159).
  - F3 [defect] measure.mjs:115 sleeps 700 ms instead of waiting for load. My 375 runs: index overflow 225, low contrast 20, hero incomplete; then defence, mhl and grl overflow 225-287; then clean. "0 on all 15 pages" does not reproduce every time.
  - F4 [claim] evidence:24 says the 375 hero bottom is 596. r1-measure.txt says 590.
- Verdict: OBJECT
- Requested change: F1 make area strictly proportional, or state the floor in the how-to line and the legend. F2 write "25 prose, 3 short lists". F3 wait for load and fonts, then rerun until two runs agree. F4 change it to 590.
