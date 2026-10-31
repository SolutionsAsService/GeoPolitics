# Critic: Evidence (Cairo), R2

- Anchor used: Cairo, How Charts Lie: a chart lies through scale and through omission. Every number must trace to a procedure the reader can rerun.
- Observed: My rebuild matches HEAD d1acbbc byte for byte. The domain counts sum to 152, and 196+56+1=253. The selftest caught 6 of 6. Two full measure runs agreed with each other and with r2-measure.txt line for line. organisations.html shows 13 "repository gives" fills and 1 short-list fill. R1 F1-F4 are answered (build.mjs:331 has no floor; measure.mjs:73-80 waits).
- Findings:
  - F1 [defect] heritage.html has proportional rings (build.mjs:523) but no size key (sizekey count 0). Only the table decodes them.
  - F2 [defect] organisations.html prints the 76 loose records twice (build.mjs:552-553). That makes 304 rows for 228 bodies, with 76 duplicate ids.
  - F3 [claim] evidence-R2.md:12 says "Knot area = 7 sqrt(n/35)". That formula is the radius; the area is proportional to n.
- Verdict: PASS (F1-F3 are logged as open items; none misleads by scale or by omission)
- Requested change: F1: add a 1 / 10 / max ring key on heritage. F2: drop the loose rows from the domain tables, or suffix their ids. F3: write "radius =".
