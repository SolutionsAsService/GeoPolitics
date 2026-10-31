# Critic: Usability (Krug), R1

- Anchor used: Steve Krug, Don't Make Me Think: the five-second "what is this, what do I do here" test; the trunk test (site ID, page name, sections, you-are-here); "make it obvious what's clickable"; "omit needless words".
- Observed: index-1280.png, index-375.png, country-fra-1280.png; site/style.css nav rules; _src/build.mjs lines 329 (knots are `<a>` to country pages) and 380 (`.tog` buttons).
- Findings:
  - F1 [claim] Five-second test passes at 1280: h1 names the thing, the how-to line names the action, tiles show where to go, all above the fold (evidence: bottom 729/800).
  - F2 [claim] Trunk test passes on country-fra: logo, nav with "Countries" marked, "COUNTRIES · FRA" crumb, page name "France: 40 threads."
  - F3 [defect] At 375 the nav scrolls sideways with its scrollbar hidden (`scrollbar-width: none`); "Economic" is cut and 8 sections are invisible with no cue.
  - F4 [defect] Tile toggle reads "ON": state or action? The visitor must decode it; its label exists only for screen readers.
  - F5 [defect] Knots are links, but the how-to line says "Point at", so a click that leaves the page is a surprise; nothing says "click to open".
  - F6 [premise] Map is dense; Krug favours the familiar, so I do not object to the weave itself.
- Verdict: OBJECT
- Requested change: F3 wrap the nav, or show a "More" or fade cue at 375. F4 label the toggle "Hide"/"Show" visibly. F5 make the how-to line "Point at a country to trace it; click to open it." F1, F2, F6: none.
