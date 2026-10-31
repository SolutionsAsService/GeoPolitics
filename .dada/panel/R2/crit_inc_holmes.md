# Critic: Inclusion (Holmes), R2

- Anchor used: Kat Holmes, *Mismatch*: exclusion is a mismatch between person and design; solve for one, extend to many (persona spectrum: permanent, temporary, situational).
- Observed: `site/index.html` (map `role="group"`, `.skip-map` link, `<label for="find">`, `.how` line, tile markup), `site/style.css` lines 191-201, `index-375.png`, DESIGN-LOG "Resolutions (R1)", evidence lines 14-18.

Findings:
- F1 [claim] R1 F1-F7 answered: map is a labelled group, knots sorted by name, skip link plus finder, first tap traces, toggles kept on phones, measure counts SVG links (evidence: 0 undersized targets), jargon replaced ("organisation"; knot glossed by the size key).
- F2 [defect] At <=900px `.tile .tsub {display:none}` drops "threads" from the tile link's name and `.tiles-cap` is `aria-hidden`; a phone screen-reader user hears "Politics 37".
- F3 [defect] Toggle's visible text "shown" is not in its name "Politics threads"; voice-control users saying "click shown" miss it.

Verdict: PASS (F2, F3 logged as open items; neither blocks)

Requested change:
- F2: hide `.tsub` visually only (clip class) on phones, or drop `aria-hidden` from the caption.
- F3: name it "Politics threads shown/hidden" so the visible word is in the name.
