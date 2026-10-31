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

### Panel, WHOLE, round R1  (artifact examined: commit 21f498b; `.dada/evidence-R1.md`; `.dada/panel/R1/*.png`)
| Critic | Anchor used | Observed in the work | Verdict | Requested change |
|---|---|---|---|---|
| Critic: Provocateur (Shklovsky) | Art as Technique | the weave estranges the map (R0 F1 met); the tile row is a SaaS stat strip; the unthreaded are a footnote, not a visible blur; the country page drowns its threads; the odd pairings vanished | OBJECT | no number tiles; loose threads at the edge; only the country's threads; one incongruous pair on the landing |
| Critic: Evidence (Tufte) | The Visual Display of Quantitative Information: the Lie Factor | knot area for 1 against 40 threads drawn as 1 to 8.1 (Lie Factor 0.20); heritage 1 against 64 drawn as 1 to 18 (0.28); "area proportional" printed while a floor makes it false; games, 3 of 181 threads, lay down a large share of the ink | OBJECT | strict proportionality or a size key; say so; games drawn lighter |
| Critic: Inclusion (Holmes) | Mismatch | 253 knot links before the tiles, unsorted, unskippable; role img hides them; about 5 px phone targets; "point at" assumes a mouse; units and toggles hidden on phones; toggle name, state and label disagree; jargon | OBJECT | group, sort, skip; touch tracing; units and toggles on phones; plain words |
| Critic: Usability (Krug) | Don't Make Me Think | five-second and trunk tests pass; the phone nav scrolls with no cue; "ON" is ambiguous; a knot click leaves the page unannounced | OBJECT | wrap the nav; show or hide wording; say "click to open" |
| Critic: Inclusion (Mace) | The Principles of Universal Design | knot focus ring about 1 px; knot targets 12 px desktop, 5 px phone; the measure skipped SVG links; country bars by colour alone; toggles gone on phones | OBJECT | non-scaling 2 px ring; 24 px hits or an equivalent; measure SVG; bar patterns; toggles back |
| Critic: Provocateur (Debord) | Society of the Spectacle, theses 1 to 4 | "Filled" covers partial fills (CERN 4 of 23); NATO, the EU, CERN, Benelux and others drawn twice, inflating 181 and France's 40; games threads run through 1940 and 1944 Games that never happened and miss 1896, 1908, 1928, 1936; three figures for one claim | OBJECT | fill only at the stated count; merge duplicates; drop cancelled, name missing; one figure |
| Critic: Evidence (Cairo) | How Charts Lie | rebuild byte-identical; the floor makes "proportional" false; "28 filled" is 25 prose plus 3 short lists; the measure slept 700 ms and did not reproduce on phone runs; 590 not 596 | OBJECT | proportional or stated; split the count; wait for load and repeat until two runs agree |
| Critic: Ecology (McDonough) | Cradle to Cradle | the landing is lean; 258 country pages re-inline the same thread geometry (about 9 MB of 13.6 MB); og.png 275 KB | OBJECT | one shared threads file; og under 100 KB |

Statements of meaning: every seat accepted the weave as the device (Shklovsky: R0 F1 met) and objected to its truth,
its access or its weight. Andon pulled: no. Two instrument faults were found by seats, again: the measure skipped SVG
links (Holmes, Mace) and slept instead of waiting for load (Cairo).

### Resolutions (R1)
| Finding | Resolution |
|---|---|
| Debord: the same body drawn twice | ADAPT (M6): records sharing a name or abbreviation merge into one thread (28 merged); the kept record says where else it was listed |
| Debord + Cairo: partial fills, and the count of fills | ADAPT (M6): a Wikidata fill is accepted only within 10 per cent (or one) of a count the repository states; 6 refused and left unthreaded with the reason; printed as 14 (13 prose, 1 short list) |
| Debord: cancelled and missing Games | ADAPT (M6): 7 cancelled editions (1916, 1940, 1944 Olympics; 1942, 1946 World Cups) dropped from the threads; held editions Wikidata records without a host are named on the games page; planned editions marked |
| Debord: three figures for one claim | ADAPT (M6): hero, description and map label read the same figures (196 states, 56 territories, 1 historic state) |
| Tufte + Cairo: knot and ring areas | ADAPT (M6): areas strictly proportional (knots r = 7 sqrt(n/max), rings 16 sqrt(n/max)), no floor; a size key with three true sizes on the landing |
| Tufte: games ink | ADAPT (M6): games threads drawn at 0.38 opacity and 1 px, full strength only when traced |
| Shklovsky: the unthreaded are a footnote | ADAPT (M6): the 76 records that could not be drawn hang under the map as a fringe of loose threads, linked to their reasons |
| Shklovsky: odd pairings vanished | ADAPT (M6): the landing names them beside NATO (two religions, seven languages, the US presidents, one special-forces record) |
| Shklovsky: the country page drowns its threads | OVERRULE (premise refuted: country-fra.html draws only the 33 threads through France, by reference to threads.svg; their reach across the world is the data) |
| Shklovsky: the tiles are a stat strip | OVERRULE (MAYA, and dada-lessons 42: the landing graded A was a poster of one tile per page with a computed figure; the tiles are the site's summary and its navigation) |
| Holmes + Mace: role, order, skip, focus, targets | ADAPT (M6): the map is a labelled group; knots sorted by name; a skip link before them; hit areas sized by script to 24 px on screen (scaled from the letterboxed map); a 2.5 px non-scaling focus ring with a halo; a country finder on the page as the equivalent control |
| Holmes + Krug: touch and wording | ADAPT (M6): first tap traces, second opens; the how-to line says so; plain words replace the jargon |
| Holmes + Krug + Mace: toggles and the phone | ADAPT (M6): toggles read shown or hidden with aria-pressed and the name "Domain threads"; kept on phones; the phone nav wraps; a caption carries the unit on phones |
| Mace: country bars by colour alone | ADAPT (M6): each domain's bar carries its dash pattern as stripes, an image role with its label, and a forced-colours rule |
| McDonough: repeated geometry; og weight | ADAPT (M6): country pages reference one shared threads.svg (site 13.6 MB to 5.2 MB; France's page 222 KB to 20 KB); og.jpg 92 KB |
| Cairo + Holmes + Mace: the instrument | ADAPT (M6): the measure waits for load, fonts and two frames, counts SVG links as targets, and two consecutive runs agreed |

## Move M6: Answer R1: one body one thread, true areas, a reachable map, one shared weave  (BREAK as escalation: the loose fringe)
Recorded after the edits, in the same sitting (deviation, stated: the fixes were made as one batch against eight filed verdicts).
Depends on: M2, M3, M4, M5
Anchors: Rule `The Visual Display of Quantitative Information (Edward Tufte)` | Breaker `Dear Data (Giorgia Lupi, Stefanie Posavec)` (the fringe: what cannot be drawn is drawn as loose thread) | Rule `WCAG 2.2 Contrast and Perceivability (W3C)` | Criterion `MAYA: Most Advanced Yet Acceptable (Raymond Loewy)`
Intent: make every thread and every size true, the map operable by keyboard, touch and screen reader, and the site light.
Alternatives rejected: (a) drop the knots' links and keep only the Countries page: loses the map's main affordance; (b) keep partial fills marked "partial": a short thread draws a false shape.
Consequence: the weave thins from 181 to 152 threads and France from 40 to 33; the truth costs ink.
Mode field: Advanced pole: the fringe of loose threads (`Dear Data (Giorgia Lupi, Stefanie Posavec)`). Acceptable pole: WCAG and Tufte.

### Panel, WHOLE, round R2  (artifact examined: commit d1acbbc; `.dada/evidence-R2.md`; `.dada/panel/R2/*.png`)
| Critic | Anchor used | Observed in the work | Verdict | Requested change |
|---|---|---|---|---|
| Critic: Provocateur (Shklovsky) | Art as Technique | the weave still estranges borders; France's page draws only its threads (R1 premise withdrawn); the fringe is a regular comb of ticks; the tiles unchanged; the odd pairings named, not shown | PASS | vary the fringe so it reads as loose thread (open item) |
| Critic: Evidence (Tufte) | The Visual Display of Quantitative Information: the Lie Factor | key areas recompute 1:10.0:35.2 (LF 1.0); games faint; the own-country knot floored at r=4 (Marshall Islands LF 2.85); a 0.6 paper stroke eats 0.3 of each radius (LF 0.61 at the small end) | OBJECT | no floor on the own knot; no stroke on knots |
| Critic: Inclusion (Holmes) | Mismatch | R1 F1 to F7 answered; on phones "threads" leaves the tile link's name; the toggle's visible word "shown" is not in its name | PASS | clip the unit visually only; put "shown" in the name |
| Critic: Usability (Krug) | Don't Make Me Think | five-second and trunk tests pass at both sizes; the nav wraps; "click to open" said; a state word on a button still asks which way it goes | PASS | a checkbox, not a state button (open item) |
| Critic: Inclusion (Mace) | The Principles of Universal Design | ring and hits answered (read from code); a one-thread bar is 3 px, too narrow for its stripes; the forced capture keeps tan land through `<use>` | PASS | minimum bar width; forced-colours rule inside land.svg |
| Critic: Provocateur (Debord) | Society of the Spectacle, theses 1 to 4 | "G7" and "Group of Seven" both drawn, both counted in France's 33; the visible hero omits the historic state the map label names | OBJECT | merge G7 into Group of Seven and recompute; name the historic state in the hero |
| Critic: Evidence (Cairo) | How Charts Lie | heritage rings have no size key; the loose table printed twice with 76 duplicate ids; evidence names a radius formula as the area | PASS | key on heritage; unique ids; correct the evidence wording |
| Critic: Ecology (McDonough) | Cradle to Cradle | the weave cached once; og 275 KB to 94 KB; about 160 KB of geometry still repeated on theme pages; running cost near zero | PASS | none required |

Statements of meaning: every seat read the weave as the site's argument and the R1 truths as met; the two objections are
one duplicate body and two Lie Factors, all measured. Andon pulled: no. Six PASS, two OBJECT.

### Resolutions (R2)
| Finding | Resolution |
|---|---|
| Debord: G7 and Group of Seven drawn twice | ADAPT (M7): merge keys keep digits and a name maps to its number-abbreviation (`ABBR_OF`); 152 threads become 151, France 33 becomes 32, maxThrough 35 becomes 34 |
| Debord: the hero omits the historic state | ADAPT (M7): the h1 reads "151 threads through 196 states, 56 territories and 1 historic state" |
| Tufte: the own-country knot floored | ADAPT (M7): the own country keeps its true area and is marked by colour and an outer ring (`.me-ring`) |
| Tufte: knot stroke shrinks the drawn area | ADAPT (M7): `.k { stroke: none }`; the area is the fill, as in the key |
| Holmes: the unit leaves the name on phones | ADAPT (M7): the unit is clipped visually, not removed |
| Holmes + Krug: toggle name and state word | ADAPT (M7): a real checkbox labelled "shown", its name "Politics threads shown" |
| Mace: stripes on narrow bars | ADAPT (M7): a non-zero bar is at least 7 px; the count stays in its label |
| Mace: forced colours inside land.svg | ADAPT (M7): land.svg carries its own forced-colours rule |
| Shklovsky: the fringe is a comb | ADAPT (M7): each loose strand varies length, sway and curl by index |
| Cairo: duplicate ids in the loose table | ADAPT (M7): the second listing's ids take a `-loose` suffix |
| Cairo: heritage rings have no size key | DEFERRED (round cap): logged as an open item; the table decodes every ring |
| Cairo: evidence calls the radius formula the area | DEFERRED (round cap): evidence-R2 stays as filed; this log states r = 7 sqrt(n/max), area proportional to n |
| Shklovsky: the tile row is a stat strip; pairings named, not shown | OVERRULE (MAYA, as in R1: the tiles are the summary and the navigation) |
| McDonough: 160 KB of repeated geometry on theme pages | DEFERRED (round cap): theme pages could reference threads.svg as country pages do |

## Move M7: Answer R2: one G7, true own-country knot, a checkbox, a frayed fringe  (KEEP-THE-RULE)
Recorded after the edits, in the same sitting (deviation, stated: the fixes were applied and measured but not re-judged, because the owner's round cap is three WHOLE rounds, R0 to R2).
Depends on: M3, M6
Anchors: Rule `The Visual Display of Quantitative Information (Edward Tufte)` | Rule `WCAG 2.2 Contrast and Perceivability (W3C)` | Criterion `MAYA: Most Advanced Yet Acceptable (Raymond Loewy)`
Intent: close both objections and the PASS seats' open items without new devices.
Alternatives rejected: (a) a fourth WHOLE round: over the cap; (b) leave the duplicate G7 and footnote it: a known false count on the landing.
Consequence: 151 threads; the desktop headline steps down to clamp(24px, 2.4vw, 31px) so the longer h1 keeps the hero complete (756 of 800).
Mode field: Advanced pole: the frayed fringe. Acceptable pole: WCAG and a Lie Factor of 1.0.

## Frontier (final)
| Candidate | Reached via (edge label, direction) | From anchor | Status |
|---|---|---|---|
| Size key on heritage.html | grounds, out | The Visual Display of Quantitative Information (Edward Tufte) | DEFERRED (round cap) |
| Theme pages reference threads.svg | extends, out | Cradle to Cradle | DEFERRED (round cap) |
| Show one incongruous pair, not name it | counterpoint, dotted | Art as Technique | DEFERRED (round cap) |
| Real Tab-press capture of the focus ring | grounds, in | The Principles of Universal Design | DEFERRED (round cap) |
| Merge G7 duplicates | R2 objection | Society of the Spectacle | TAKEN (M7) |

## 4. Anchor Ledger
| Anchor | Role | Moves | Critics |
|---|---|---|---|
| The Visual Display of Quantitative Information (Edward Tufte) | Rule | M3, M6, M7 | Tufte R0 to R2 |
| WCAG 2.2 Contrast and Perceivability (W3C) | Rule | M5, M6, M7 | Holmes, Mace |
| Dear Data (Giorgia Lupi, Stefanie Posavec) | Breaker | M3, M6 | Shklovsky |
| MAYA: Most Advanced Yet Acceptable (Raymond Loewy) | Criterion | M6, M7 | all seats |
| Art as Technique | Counterpoint (dotted) | M3 | Shklovsky |
| Society of the Spectacle | Counterpoint (dotted, with Krug) | M2, M6, M7 | Debord |

## 2f-2g. Final figures (from `site/facts.json`, measured twice)
- Threads 151 (politics 37, economics 30, defence 22, culture 50, games 3, history 9); 196 states, 56 territories and 1 historic state threaded; maxThrough 34; 77 records loose; 28 duplicates merged; 14 Wikidata fills, 6 refused; World Heritage Sites 1,286.
- Measure (`.dada/final-a.txt`, `.dada/final-b.txt`): self-test 6 of 6 probes catch their fixture; two runs agree; 30 of 30 page-by-size rows clean (no overflow, no small text, no low contrast, no hidden content shown, no undersized targets).
- First screen: index@1280 hero 67 to 756 of 800, complete; index@375 hero 150 to 749 of 812, complete.
- Weight: landing first load 312 KB; site 5.2 MB (13.6 MB before M6); og.jpg 87 KB.

## Stop test
- S1 (no open Andon): met.
- S2 (every dotted counterpoint applied or declined): met (Art as Technique in M3; Society of the Spectacle in M6 and M7).
- S3 (two consecutive quiet WHOLE rounds): not met under the bound. R2 had two OBJECTs; both were answered in M7 and measured, not re-judged.
- S4 (ambition push): met. Threads 1.15 to 1.45 px, opacity .62 to .72; first screen still complete.
- S5 (round cap): reached at R2. Open items are in the Frontier above.

## Double loop
The instrument was wrong three times and each time a seat, not the builder, found it: SVG links not counted as targets,
a fixed sleep instead of waiting for load, and hit sizes scaled by width on a letterboxed map. A digit-stripping
normaliser hid a duplicate (G7). Carry-forward: prove the instrument with a fixture before trusting it, and test
dedupe keys on names that are mostly digits.

## Carry-forward
See `.dada/carry-forward.md`.

## 5. Compliance Check
- Mode stated (Adaptive): yes. Run type stated (Full): yes.
- Tooling inventory recorded: yes (headless Chrome over CDP, sub-agents, panel directory).
- Traversal Plan with seed labels verbatim: yes.
- Premortem R0 on the inherited artifact: yes.
- Decision Records M1 to M7: yes; M6 and M7 recorded after the edits (deviation, stated).
- Panel one agent per reference, at most three at a time, verdicts filed: yes, 8 seats, R0 to R2.
- Required critics (Provocateur, Inclusion) and a dotted pair (Krug, Debord): yes.
- First screen rule at 1280 x 800 and 375 x 812, bottom edge measured: yes, complete at both.
- Landing summarises every topic: yes, one tile and one domain of threads per page.
- Multi-page: yes.
- Stop conditions: S1, S2, S4 met; S3 not met; run ended at the round cap.
- Skipped: re-judging of M7 (round cap).
