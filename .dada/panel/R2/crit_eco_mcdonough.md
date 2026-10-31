# Critic: Ecology (McDonough), round R2

- Anchor used: Cradle to Cradle (McDonough, Braungart): "waste equals food"; design waste out at the source.
- Observed: `site/` is 279 files, 4,890,941 B (5,295 KiB on disk, the evidence's "5.2 MB"); it was 13.6 MB. Country pages `<use>` the shared `threads.svg` (build.mjs:393, 582): fra is 20.6 KB, and all 270 country pages come to 3.5 MB (was 12.1). og.jpg is 95,750 B (evidence: 92 KB). Landing: 178 KB HTML + 126 KB land.svg, about 86 KB gzipped, no JS or webfonts. index.html still inlines 83 KB of thread paths that threads.svg also holds; four theme pages inline another 76 KB.
- Findings:
  - F1 [claim] R1 F1 answered: the weave is cached once and reused by reference.
  - F2 [claim] R1 F3 answered: the share image went from 275 KB to 94 KB.
  - F3 [defect] About 160 KB of thread geometry is still duplicated across the landing and the theme pages. Minor.
  - F4 [premise] Running cost is near zero: static files, no runtime, can be rebuilt from logged CC0 queries.
- Verdict: PASS
- Requested change: F3, an open item that does not block: theme pages should `<use>` threads.svg; keep the landing inline only if measurement shows a first-load gain. F1, F2, F4: none.
