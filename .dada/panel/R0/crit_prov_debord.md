# R0 - Critic: Provocateur (Debord)

- Anchor used: Debord, The Society of the Spectacle, thesis 1 ("everything that was directly lived has moved away into a representation") and thesis 4 (the spectacle is a social relation mediated by images). A map that "weaves the world together" risks being that representation: lines standing in for relations the data does not hold.
- Observed: README.md lines 7 and 11-13 name `defunct_organizations.json`, `ideological_groupings.json` and `arms_control_organizations.json`, and promise "comprehensive insights". None of those files exist. Line 36 still reads "[appropriate licensing terms here]". In TaxHavens.json, Marshall Islands says "no personal income tax" (line 25) next to a 12% top rate (line 10). Grep finds `source` keys only in Arabic.json and Hindi.json, and both fail to parse (evidence). Evidence: 90 of 191 `members` fields are prose, 7 files do not parse, and there is no art or games data.
- Findings:
  - F1 [claim] The README promises files and "comprehensive" coverage that the repo does not have.
  - F2 [premise] The brief's "art, culture, games" strands have no data, so they would be a spectacle.
  - F3 [defect] No parseable record cites a source or a date.
  - F4 [defect] The Marshall Islands record contradicts itself.
  - F5 [claim] Prose members ("27 European countries") cannot become map links without making them up.
- Verdict: OBJECT
- Requested change: F1 rewrite the README to match the files. F2 leave out strands with no data, or label them "no data". F3 add a source and an as-of date to each record. F4 fix it or flag it. F5 draw links only from enumerated members and list the prose ones as unmapped.
