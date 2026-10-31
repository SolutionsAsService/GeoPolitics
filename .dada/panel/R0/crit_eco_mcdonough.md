# Critic: Ecology (McDonough), R0

- Anchor used: Cradle to Cradle (McDonough, Braungart): waste equals food; design waste out and keep materials cycling.
- Observed: 27 data files total 150,489 bytes; the tree without .git is 292 KB (measured). 7 files do not parse; 90 of 191 member lists are prose (evidence-R0.md). The 20 parseable files minify to about 87 KB.
- Findings:
  - F1 [premise] The material is light: about 150 KB costs the world almost nothing to store or serve.
  - F2 [defect] The 7 unparseable files are pure waste: stored bytes no program can use.
  - F3 [defect] Prose members and name variants cannot re-enter a cycle: a map cannot join them.
  - F4 [claim] The overhaul is the real cost: tiles, world geometry and JS libraries could outweigh the whole dataset many times.
  - F5 [defect] No end of life: no schema, licence reads "[appropriate licensing terms here]", README names missing files.
- Verdict: OBJECT
- Requested change: F1 none. F2 repair or retire the 7 files. F3 normalise members to ISO codes. F4 set a budget (one simplified TopoJSON, no tile server, under 500 KB first load) and measure it each round. F5 add a JSON schema and a real licence.
