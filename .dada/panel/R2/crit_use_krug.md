# Critic: Usability (Krug), R2

- Anchor used: Steve Krug, Don't Make Me Think: the five-second test ("what is this, what do I do here"), the trunk test, "make it obvious what's clickable", "omit needless words".
- Observed: R2 index-1280.png, index-375.png, country-fra-1280.png; site/style.css lines 121-174 (nav); _src/build.mjs lines 432-442 (tile toggle), 490 (how-to line).
- Findings:
  - F1 [claim] Five-second test passes at both sizes: h1 names it, the how-to line names the action, tiles show where to go; hero bottom 760/800 and 749/812 (evidence).
  - F2 [claim] R1 F3 answered: at 375 the nav wraps to three visible rows (style.css 173; index-375.png); no hidden sections.
  - F3 [claim] R1 F5 answered: "Point at a country to trace it (on a phone, tap once); click to open it." (build.mjs 490).
  - F4 [defect] R1 F4 half answered: the toggle now reads "shown"/"hidden", a state word on a button, so the visitor still asks whether clicking shows or hides (build.mjs 441). Minor; it is not the first action.
  - F5 [claim] Trunk test passes on country-fra: logo, "Countries" marked, "COUNTRIES · FRA" crumb, "France: 33 threads."
  - F6 [premise] The weave stays dense; my bias for the familiar does not judge that.
- Verdict: PASS
- Requested change: F4 label the button by its action ("Hide"/"Show") or as a checkbox "Shown"; log as open item, does not block. Others: none.
