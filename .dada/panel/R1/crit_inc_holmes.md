# Critic: Inclusion (Holmes), R1

- Anchor used: Kat Holmes, *Mismatch*: exclusion is a mismatch between a person and a design; "solve for one, extend to many" (Persona Spectrum: permanent, temporary, situational).
- Observed: `site/index.html` landing source, `site/style.css`, `index-375.png`; evidence file lines 22-28.

Findings:
- F1 [defect] 253 knot links (`<a class="knot">`) sit in tab order before the tiles, in unsorted order (UZB, ZAF, DZA...), with no skip past the map.
- F2 [defect] `<svg role="img">` wraps those 253 focusable links; role=img makes its children presentational, so some screen readers drop the links.
- F3 [defect] At 375px the knot hit circle is r=7 in a 1000-unit viewBox (about 5px across). Tapping a knot opens its page, so phone users never see the readout. "Point at a country" assumes a mouse.
- F4 [claim] Evidence says "small adjacent targets 0" on all pages, yet F3 targets exist. The measure seems to skip SVG targets.
- F5 [defect] At max-width 900px, `.tsub, .tog { display:none }` hides the units and the domain toggles. On a phone a tile reads "Politics 46" with no noun.
- F6 [defect] The toggle is named "Show Politics threads" but `aria-pressed=true` and shows "on". Name, state and visible label disagree.
- F7 [premise] Readers new to the premise meet "bodies", "bow" and "unthreaded" unglossed.

Verdict: OBJECT

Requested change:
- F1/F2: drop role=img; group the knots as a labelled list in alphabetical order, or add a skip link to the tiles.
- F3: add a findable country list or search beside the map for touch users; tap shows the readout first.
- F4: include SVG anchors in the measure.
- F5: keep the units and toggles on phone.
- F6: name it "Politics threads" with aria-pressed only.
- F7: gloss the terms or use plain ones ("organisations").
