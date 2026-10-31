# Critic: Inclusion (Mace), R1

- Anchor used: Mace et al., Principles of Universal Design: P4 Perceptible Information, P6 Low Physical Effort, P7 Size and Space.
- Observed: style.css L69-71; build.mjs L327-329, L448; `.tog` hidden at <=900px; index-1280-forced.png.
- Findings:
  - F1 [defect] Knot focus ring is a 1.4-unit stroke in a 1000-wide viewBox: about 1.2 px at 1280, about 0.5 px at 375. Nobody can see it.
  - F2 [defect] Knot hit areas are 14 units across (about 12 px desktop, 5 px phone), and the European knots overlap. This fails WCAG 2.5.8.
  - F3 [claim] "Small adjacent targets 0" contradicts F2. measure.mjs seems to skip SVG links.
  - F4 [defect] Countries `.bars` show the domain by colour alone, and their aria-label sits on a role-less span. No forced-colours rule covers them.
  - F5 [defect] On phones the domain toggles are `display:none`, so the function is lost at 375.
  - F6 [premise] In the forced capture, land and swatches keep their authored colours, so it may be emulated. Thread dashes survive: pass.
- Verdict: OBJECT
- Requested change: F1: a non-scaling ring of at least 2 px plus a halo. F2: 24 px non-scaling hit areas, or route dense clusters to countries.html. F3: add SVG links to measure.mjs. F4: a dash or pattern per bar, CanvasText in forced colours, `role="img"`. F5: keep the toggles on phones, 24 px or larger. F6: recapture under real forced colours.
