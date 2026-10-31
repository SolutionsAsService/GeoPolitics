# DESIGN-LOG: GeoPolitics, the Weave

Run: DADA (PrometheusIntelligence/dada at 9320e46, seat registry and ledger), **Adaptive** mode, **Full** run type
with a **Landing** move. Bounded by the owner's standing rule: R0 (premortem) plus at most two WHOLE rounds; what is
left after that is logged, and the strongest variant ships.

## 1. Traversal Plan

**Brief, in one sentence:** turn a repository of hand-written JSON about international organisations into a multi-page
site led by a dynamic world map that shows how the world is woven together across politics, economics, defence,
culture, heritage and games, with every thread drawn from data that holds it.

**Mode:** Adaptive (a public audience of students, researchers and the curious; MAYA governs).
**Run type:** Full, with the Landing move for the first screen.
**Lessons read first** (dada-lessons): 40–42 (one composed landing graphic that summarizes every page, complete on the
first screen), 43–47 (measure, recompute, Evidence from R0), 57 (the hero is the product's own data), 58 (fix what is
real, measured with the real thing).

### Step 0. Tooling
| Job | Tool used |
|---|---|
| Choose the panel | `scripts/pick_panel.py --mode adaptive --run-type full --data-graphic --project GeoPolitics` |
| Brief each seat | the prompt in `seats/<seat>.md`, filled with round, evidence, artifact, words and panel directory only (`.dada/prompts/`) |
| Panel | sub-agents, one per seat, at most three at a time, filing to `.dada/panel/R<n>/` |
| Data | Python repair of the 7 broken files (logged); Wikidata SPARQL (CC0) via `_src/fetch_wikidata.py`; Natural Earth shapes (world-atlas 2.0.2) |
| Build | `_src/build.mjs`, no dependencies: projection, threads, pages, figures |
| Measure | `_src/measure.mjs` (headless Chrome; `--selftest` first) |
| Record | `scripts/import_log.py --registry`, `scripts/rate_seats.py` |

### Panel (from the picker, with its reasons)
| Seat | Why | Score | Rounds |
|---|---|---|---|
| Critic: Provocateur (Debord) | required by the Adaptive panel minimum | 0.822 | 67 |
| Critic: Provocateur (Shklovsky) | required by the Adaptive panel minimum | 0.738 | 60 |
| Critic: Inclusion (Holmes) | required by the Adaptive panel minimum | 0.830 | 54 |
| Critic: Inclusion (Mace) | required by the Adaptive panel minimum | 0.874 | 63 |
| Critic: Evidence (Cairo) | required: inspectable artifact, measurement seat from R0 | 0.875 | 49 |
| Critic: Evidence (Tufte) | required: a data graphic gets the instrumentation seat | 0.819 | 7 |
| Critic: Usability (Krug) | rated: shrunk score 0.813 over 62 rounds | 0.823 | 62 |
| Critic: Ecology (McDonough) | rotation: 0 rounds on record, seated to earn a rating | — | 0 |
Dotted pairs: Debord -.- Krug, Shklovsky -.- Krug.

### Seed (labels verbatim from `references/anchor-graph.md`)
- Stance: `Make It Bigger (Paula Scher)`
- Rules: `The Visual Display of Quantitative Information (Edward Tufte)` -->|names| `Tufte Style`;
  `WCAG 2.2 Contrast and Perceivability (W3C)`
- Breaker: `Dear Data (Giorgia Lupi, Stefanie Posavec)` -.->|hand-drawn data art answers| `The Visual Display of
  Quantitative Information (Edward Tufte)` (the counterpoint edge)
- Criterion: `MAYA: Most Advanced Yet Acceptable (Raymond Loewy)`

Chain: Tufte's rule (show the data, one mark per datum) sets the thread: one organisation is one thread. Lupi and
Posavec answer it with hand-drawn data art: the threads are woven, curved and dashed, as a textile is. Scher makes the
weave the whole first screen. WCAG is the floor: colour is never the only channel.

### Pages (multi-page rule)
Landing (the Weave) · Politics · Economics · Defence · Culture · Heritage · Games · History (defunct organisations) ·
Countries (a list of every country, the map's non-visual twin, with a page per country) · Organisations (every
organisation, mapped or not) · Data (sources, repairs, what is unmapped and why) · 404.

## 3. Panel Reports

### Panel, WHOLE, round R0  (artifact examined: commit dad93b5, the inherited data repository; `.dada/evidence-R0.md`)
| Critic | Anchor used | Observed in the work | Verdict | Requested change |
|---|---|---|---|---|
| Critic: Evidence (Cairo) | How Charts Lie | 7 of 27 files fail; tallies biased by omission; 90 prose members and name variants unmappable; no art or games source; README contradicts the files and the MIT LICENSE; the evidence said "29 JSON" where there are 27 | OBJECT | repair, ISO table, show unmapped, source or "no data", rewrite README |
| Critic: Evidence (Tufte) | The Visual Display of Quantitative Information: the Lie Factor | recomputed every figure; prose members would draw well-connected countries as weakly linked; variants split counts; art or games without data would be chartjunk | OBJECT | repair first; unmapped shown and counted; ISO codes; no invented layers |
| Critic: Provocateur (Shklovsky) | Art as Technique | a clickable coloured map is the most automatized image of geopolitics; the odd pairings (a squad record, a faith, tax rates beside NATO) are the estranging material | OBJECT | the map one view among several; lead with a device that slows perception; unresolved members shown as unresolved |
| Critic: Inclusion (Holmes) | Mismatch | acronyms without names; prose members; split names; README sends newcomers nowhere; a map-only site excludes screen-reader, keyboard and small-phone users | OBJECT | full names and a glossary; ISO codes; a list twin of every map view at 360 px |
| Critic: Usability (Krug) | Don't Make Me Think | README fails the five-second test; prose members break map clicks; variant names; no art or games data | OBJECT | real README; country lists; canonical names; no dead-end tabs |
| Critic: Provocateur (Debord) | Society of the Spectacle, theses 1 and 4 | README promises files and "comprehensive" coverage; no record cites a source or date; TaxHavens' Marshall Islands contradicts itself (no income tax, 12% top rate); prose members cannot become links without inventing them | OBJECT | README from the files; a source and date per record; flag the contradiction; links only from listed members |
| Critic: Inclusion (Mace) | The Principles of Universal Design | no UI, so the access checks become ship gates; a choropleth carries meaning by fill alone and microstates fall below 24 px | OBJECT | keyboard list and search, pattern plus colour, 24 px hit areas, forced colours, reduced motion, "data unavailable" states |
| Critic: Ecology (McDonough) | Cradle to Cradle | the data is 150 KB; the 7 broken files are waste; the overhaul is the real cost | OBJECT | a budget: one simplified TopoJSON, no tile server, first load under 500 KB, measured each round |

Statements of meaning: every seat read the inherited repository as promising more than it holds. The panel converged
on four demands: repair, normalise to ISO codes, draw only what is listed (and show the rest as unmapped), and never
invent art or games. Andon pulled: no.

### Resolutions (R0)
| Finding | Resolution |
|---|---|
| Cairo + Tufte + McDonough: 7 files do not parse | ADAPT (M1): repaired, syntax only except two placeholder `references` lists that cited nothing (removed) and one truncated file (closed); every change logged on the Data page |
| Cairo + Tufte + Holmes + Krug + Debord + Mace: prose members and name variants | ADAPT (M2): every member name is resolved to an ISO 3166 alpha-3 code through Wikidata's names and aliases plus a logged alias table; prose memberships are filled from Wikidata's member-of (P463) where the organisation matches, marked with that source; whatever stays unresolved is listed on the Data page with its count |
| Tufte + Shklovsky + Debord + Krug + Cairo: art and games have no data | ADAPT (M2): sourced from Wikidata (CC0) with the owner's approval: World Heritage Sites per country (heritage), Olympic and FIFA World Cup hosts (games); each layer prints its source and fetch date |
| Cairo: "29 JSON files" | ADAPT: the evidence was wrong; 27 data files (plus README, CONTRIBUTING); corrected here |
| Cairo + Holmes + Krug + Debord: README | ADAPT (M7): rewritten from the real files; the licence is the LICENSE file's MIT |
| Debord: no source or date per record | ADAPT (M2): every organisation on the site shows where its members came from (this repository, or Wikidata with the fetch date) |
| Debord: Marshall Islands contradicts itself | ADAPT (M2): flagged on its record and on the Data page as a contradiction in the source; not resolved by guessing |
| Holmes + Mace: a map-only site | ADAPT (M5): the Countries list is the map's twin; every country has a page; the map is keyboard-reachable and every country is listed and searchable |
| Mace: colour alone; microstates; access gates | ADAPT (M3, M5): each domain has a colour and a dash pattern; knots have a 24 px hit area; forced colours and reduced motion are measured gates |
| McDonough: weight budget | ADAPT (M4): first load under 500 KB, measured each round; land drawn once from the 110 m shapes, no tiles |
| Shklovsky: the map is habitual; lead with what slows perception | ADAPT (M3): the map is not a choropleth: each organisation is one thread through its members, so the image is a weave, not a fill; and the strangest pairings (a squad, a faith, tax rates) stay visible on the Organisations page rather than being cleaned away |

## 2. Decision Records

## Move M1: Repair the data, logged  (KEEP-THE-RULE)
Depends on: none
Anchors: Rule `The Visual Display of Quantitative Information (Edward Tufte)` (no figure from data that cannot be read)
Intent: all 27 files parse; nothing is inferred; every repair is written down.
Alternatives rejected: (a) drop the 7 files: loses the Americas, Arabic, French, Hindi, Portuguese and UK defence data;
(b) rewrite the files from memory: invents data.
Consequence: Mercosur's two founding treaties become a list; the Arabic and Hindi placeholder sources are removed.
Fence: not applicable.
Frontier effect: opens M2.
Mode field: Advanced pole: none. Acceptable pole: Tufte.

## Move M2: One country, one code; every thread sourced  (KEEP-THE-RULE)
Depends on: M1
Anchors: Critic `Critic: Evidence (Cairo)` | Rule `The Visual Display of Quantitative Information (Edward Tufte)`
Intent: every member resolves to an ISO 3166 alpha-3 code; prose member lists are filled only from Wikidata's member-of
statements for that organisation, and marked so; heritage and games come from Wikidata, dated.
Alternatives rejected: (a) parse the prose ("27 European countries"): a guess at which 27; (b) hand-written ISO table
only: misses aliases a reader would type.
Consequence: a build that fetches nothing at build time: the Wikidata results are committed snapshots with their
queries, re-fetchable by `_src/fetch_wikidata.py`.
Fence: not applicable.
Frontier effect: the Data page.
Mode field: Advanced pole: none. Acceptable pole: Cairo.

## Move M3: The Weave: one organisation, one thread  (BREAK)
Depends on: M2
Anchors: Breaker `Dear Data (Giorgia Lupi, Stefanie Posavec)` | Counterpoint `The Visual Display of Quantitative
Information (Edward Tufte)` (dotted: hand-drawn data art answers) | Stance `Make It Bigger (Paula Scher)` | Criterion
`MAYA: Most Advanced Yet Acceptable (Raymond Loewy)`
Intent: the world drawn as a loom. Each organisation is a single curved thread passing through its members' capitals
from west to east; each domain has a colour and a dash (politics solid, economics long dash, defence short dash,
culture dot, games dash-dot; history in grey); each country is a knot whose area is proportional to the threads
through it. The first screen is the whole weave plus one tile per domain with its computed counts, each linking to its
page. Games threads follow the order of hosting (one thread per series, host to host by year), so the games layer is
a relay, not a guess.
Formal argument: claim: what joins the world is membership, and a membership list is a path, not a region. Grounds:
101 organisations list members; a choropleth can show one of them at a time, a weave shows all. Warrant: Lupi and
Posavec make the mark itself the data (one line, one record); Tufte keeps it honest (the thread's only encoding is
which countries it passes through; its length is geography and the legend says so).
Alternatives rejected: (a) choropleth by membership count: one number per country, every relation lost, and the
habit Shklovsky named; (b) all pairwise links: NATO alone would be 496 lines and the Commonwealth over 1,500, a hairball
with a lie factor far above 1; (c) a force graph without geography: loses the map the brief asks for.
Consequence: thread order (west to east) is a convention, stated in the legend; a reader may read a curve's shape as
meaning; the legend says it does not.
Fence: the grid of a map (projection, graticule) exists for comparison; the threads cross it but never distort it.
Frontier effect: hover and focus states; domain filters; knot sizing; phone version of the weave.
Mode field: Advanced pole: `Dear Data (Giorgia Lupi, Stefanie Posavec)`. Acceptable pole: `MAYA: Most Advanced Yet
Acceptable (Raymond Loewy)`: every thread is also a row in a list.

## Move M4: Weight budget  (KEEP-THE-RULE)
Depends on: M3
Anchors: Critic `Critic: Ecology (McDonough)`
Intent: the land is projected once at build time into one SVG path from the 110 m shapes; no tiles, no map library,
no framework; first load under 500 KB including the threads.
Alternatives rejected: (a) a tile map (Leaflet, MapLibre): megabytes and a tile server; (b) runtime projection with d3:
a dependency for what a build can do once.
Mode field: Advanced pole: none. Acceptable pole: McDonough.

## Move M5: Every map view has a list twin  (KEEP-THE-RULE)
Depends on: M3
Anchors: Rule `WCAG 2.2 Contrast and Perceivability (W3C)` | Critics `Critic: Inclusion (Holmes)`, `Critic: Inclusion (Mace)`
Intent: the Countries page lists every country with its threads; every country has a page; on the map each knot is a
link with a name, reachable by keyboard; every domain page carries the table of its organisations.
Mode field: Advanced pole: none. Acceptable pole: Holmes and Mace.
