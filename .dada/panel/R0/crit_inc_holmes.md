# Critic: Inclusion (Holmes), R0

- Anchor used: Kat Holmes, *Mismatch*: exclusion is a person-design mismatch; solve for one, extend to many.
- Observed: README.md, CountryBlocks.json, ArmsControlOrgs.json, evidence-R0.md.
- Findings:
  - F1 [defect] CountryBlocks.json names groups only by acronym ("NATO", "GCC", "AU"); newcomers lack the premise.
  - F2 [defect] 90 of 191 `members` are prose ("All 55 African countries"); no map, filter or screen reader can resolve them.
  - F3 [defect] One country, several names (Republic of Korea / South Korea; Ivory Coast / Côte d'Ivoire): search and spoken labels split.
  - F4 [defect] README sends newcomers to three nonexistent files; licence is a placeholder.
  - F5 [premise] A map-only site excludes screen-reader, keyboard and small-phone users.
  - F6 [claim] No art or games data exists for the brief's layers.
- Verdict: OBJECT
- Requested change: F1 add `full_name` and a plain-language glossary page. F2-F3 normalise members to ISO 3166 codes with display names. F4 rewrite README against real files; state MIT. F5 pair every map view with a list page of grouped, labelled countries working at 360 px. F6 mark art and games "no data yet", never invent.
