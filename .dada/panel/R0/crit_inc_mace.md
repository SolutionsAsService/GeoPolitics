# Critic: Inclusion (Mace), round R0

- Anchor used: Mace et al., The Principles of Universal Design: P4 Perceptible Information (redundant presentation: pictorial, verbal, tactile), P5 Tolerance for Error, P7 Size and Space for Approach and Use.
- Observed: evidence-R0.md line 5, "There is no website". The repo holds JSON plus README only, with no colour, style or interaction fields (CountryBlocks.json is name/type/members). Brief (line 7): "a dynamic world map". README License: "[appropriate licensing terms here]".
- Findings:
  - F1 [premise] My named checks (focus after real Tab, WCAG 2.5.8 24 px spacing, forced colours, reduced motion) cannot run. No UI exists, so none passes. They become build gates.
  - F2 [defect] A choropleth world map breaks P4 by default: membership shown only by fill. Microstates (Malta, Luxembourg, Brunei in CountryBlocks.json) fall far below a 24 px target (P7).
  - F3 [defect] 90 of 191 `members` are prose and names vary (Ivory Coast / Côte d'Ivoire). A list or table equivalent cannot be generated from them, so the map has no non-visual twin (P4).
  - F4 [defect] 7 files fail to parse. Silent drops give the user no tolerance for error (P5).
- Verdict: OBJECT
- Requested change: F1 log the four checks as ship gates. F2 every country is reachable via keyboard search/list, uses pattern or label plus colour, has a hit area of at least 24 px, a forced-colors stylesheet and a reduced-motion state. F3 normalise members to ISO codes and render a table twin per page. F4 fix the JSON, and the UI states "data unavailable" rather than staying blank.
