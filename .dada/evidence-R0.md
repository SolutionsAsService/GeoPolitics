# Evidence, round R0: premortem on GeoPolitics as inherited

Artifact: `D:\New folder\PrometheusIntelligence\GeoPolitics\` at commit dad93b5 (saved on branch legacy-2026-10-31).
It is a data repository: 29 JSON files at the root and in `DefenseAgreements/`, `Languages/`, `Religon/`, `US/`, plus
README.md, LICENSE, CONTRIBUTING.md. There is no website.

The owner's brief for this run: a complete overhaul into a site built around a dynamic world map that shows how the
world is woven together across art, culture, games, economics, defence, politics and more.

Measured by the conductor (a Python parse of every `*.json`):
- 27 data files (excluding the two `.md`): 20 parse, **7 do not**: AmericanOrgs.json, DefenseAgreements/UKDefense.json,
  Languages/Arabic.json, Languages/French.json, Languages/Hindi.json, Languages/Portuguese.json, TransatlanticOrgs.json.
- 191 organisations carry a `members` field: **101** list countries, **90** give prose ("27 European countries",
  "Members from various African countries").
- 237 distinct member names, including variants of one country (Ivory Coast / Côte d'Ivoire; Republic of Korea / South
  Korea / Korea (Republic of); Democratic Republic of Congo / of the Congo; Czech Republic) and non-countries ("European
  Union", whole sentences).
- Most-shared members: France 23, United Kingdom 23, United States 21, Germany 20.
- README.md names files that do not exist (`defunct_organizations.json`, `ideological_groupings.json`,
  `arms_control_organizations.json`); its License section reads "[appropriate licensing terms here]".
- Folder `Religon/` is misspelt; `US/military/.../oda_example.json` is a single example record.
- No data on art or games exists in the repository.

Owner's deploy rules (from their instructions): multi-page sites; the repository root holds only the static format
(`index.html`, `vercel.json`, the site folder, optional `api/`); live address `https://geopolitics.shadw.app/`; a
favicon on every page.
