# Critic: Inclusion (Mace), R2

- Anchor used: Mace et al., Principles of Universal Design: P4 Perceptible Information, P5 Tolerance for Error, P7 Size and Space for Approach and Use.
- Observed: style.css L152-153, L164-169, L178, L183-185; build.mjs L453 (sizeHits), L533; R2 index-375.png, index-1280-forced.png, countries-1280-forced.png; evidence-R2 measure lines.
- Findings:
  - F1 [claim] R1 F1 answered: 2.5 px non-scaling ring plus halo (L152). No capture of a real Tab press exists, so this is read from code, not seen.
  - F2 [claim] R1 F2/F3 answered: hits scaled to 24 px on screen; measure counts SVG links. Dense European knots still overlap; the country finder is the 2.5.8 equivalent. Accepted.
  - F3 [defect] Bar stripes need 3-7 px periods, but one thread is 3 px wide (L533), so small counts render solid: colour alone again.
  - F4 [premise] The forced capture keeps tan land (`.land` rule misses land.svg via `<use>`). It is still emulated, as in R1 F6.
  - F5 [claim] R1 F5 answered: toggles visible at 375, 46x24 px.
- Verdict: PASS (F3 and F4 logged as open items)
- Requested change: F3: a minimum of 7 px per non-zero bar, or the per-domain counts as text. F4: style land inside land.svg for forced colours, and add one real Tab-focus capture. F1, F2, F5: none.
