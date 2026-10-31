# Critic: Usability (Krug), R0

- Anchor used: Krug, *Don't Make Me Think*: five-second test, trunk test, "get rid of half the words".
- Observed: No website (evidence-R0); first screen is README.md: title "GeoPolitics Repo", Contents lists three nonexistent files, License "[appropriate licensing terms here]". EuropeanOrgs.json: EU `members` = "27 European countries". Folder `Religon/`.
- Findings:
  - F1 [defect] Five-second test fails: README's first pointers lead to nonexistent files.
  - F2 [defect] Map clicks cannot work: 90 of 191 `members` are prose; clicking France finds no EU.
  - F3 [defect] Name variants (Ivory Coast / Cote d'Ivoire) make visitors decode one country's labels.
  - F4 [premise] Brief's "art, games" has no data (evidence); such a nav item is a dead end.
  - F5 [claim] Trunk test untestable: no inner page exists.
  - F6 [defect] Needless words: "comprehensive insights" filler; placeholder licence.
- Verdict: OBJECT
- Requested change: F1 README names real files; F2 convert prose members to country lists before the map; F3 one canonical name per country (ISO code); F4 no art/games tab until data exists; F5 every inner page shows site ID, section, "you are here"; F6 cut filler, state the LICENSE file's licence.
