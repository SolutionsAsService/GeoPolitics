# Critic: Evidence (Cairo), R0

- Anchor used: Cairo, How Charts Lie: charts lie by omission. Every encoded number must be traceable and reproducible.
- Observed: I re-ran the parse. It gives 27 files, 7 failing (the same seven), 191 `members` (101 lists, 90 prose), 237 names, France/UK 23, US 21, Germany 20. README:11-13 names missing files; its License line is a placeholder while LICENSE is MIT.
- Findings:
  - F1 [claim] evidence-R0.md:4 says "29 JSON files". There are 27 JSON plus 2 `.md`.
  - F2 [defect] The member tallies leave out the 7 unparsed files, so "most-shared" is biased by omission.
  - F3 [defect] 90 prose `members` and the name variants cannot be mapped, so country counts would be wrong.
  - F4 [premise] The brief's art and games layers have no source in the repository.
  - F5 [defect] README's contents and License contradict the artifact.
- Verdict: OBJECT
- Requested change: F1 correct to 27. F2 repair the 7 files, then re-measure. F3 add an ISO-3166 table and an alias map, and mark prose rows "unmapped" visibly. F4 source those datasets or show "no data". F5 rewrite README from the real files and state MIT.
