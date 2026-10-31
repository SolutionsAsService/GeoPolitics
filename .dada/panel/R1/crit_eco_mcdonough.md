# Critic: Ecology (McDonough), round R1

- Anchor used: Cradle to Cradle (McDonough, Braungart): "waste equals food"; eco-effectiveness, design out waste at the source rather than making it "less bad".
- Observed: `site/` holds 278 files, 13.6 MB (matches evidence "14 MB"). Landing: index.html 179.7 KB + land.svg 123.3 KB, about 303 KiB (evidence's 314 KB); index.html gzips to 41 KB; no fonts, scripts or img. land.svg is shared via `<use href="land.svg#base">` (build.mjs:333, 498). But 258 country pages total 12.1 MB: country-can.html carries 46 KB of path data, of which 38 KB (29 of 36 paths) is byte-identical to country-fra.html. og.png is 275 KB, the largest file.
- Findings:
  - F1 [defect] The same thread geometry is re-inlined in each of 258 country pages, roughly 9 MB of the 13.6 MB build: waste made by design.
  - F2 [claim] The landing is lean (41 KB gzipped, no fonts or JS, shared cached base map). The land.svg pattern already shows what nutrient reuse looks like here.
  - F3 [defect] og.png (275 KB) outweighs every page and is served only to crawlers.
  - F4 [premise] The cost of keeping it running is low: static files, no runtime, CC0 sources with logged queries, so it can be rebuilt.
- Verdict: OBJECT
- Requested change: F1: emit the shared weave once (e.g. `threads.svg#weave`, referenced by `<use>` like land.svg) and inline only each country's own highlighted threads; then re-measure the site total. F3: recompress og.png (palette PNG or WebP/JPEG, target under 100 KB). F2, F4: none.
