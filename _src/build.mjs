// Builds the GeoPolitics site (the Weave) into ../site from ../data. No dependencies: `node _src/build.mjs`.
// One organisation is one thread drawn through its members' capitals, west to east; a country is a knot whose area is
// proportional to the threads through it. Every figure the site prints is computed here and written to
// site/facts.json with the procedure that reproduces it. Nothing is inferred: a member that does not resolve to a
// country stays unmapped and is listed on the Data page.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync, rmSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const DATA = join(root, "data");
const SRC = join(DATA, "sources");
const out = join(root, "site");
const SITE = "https://geopolitics.shadw.app/";
const REPO = "https://github.com/SolutionsAsService/GeoPolitics";
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (s) => String(s).normalize("NFKD").replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/[\s_]+/g, "-").slice(0, 60);
const json = (p) => JSON.parse(readFileSync(p, "utf8"));

// ---- countries (Wikidata snapshot) -----------------------------------------------------------------------------
const wd = (name) => json(join(SRC, "wikidata", `${name}.json`));
const WD_COUNTRIES = wd("countries");
const countries = new Map(); // iso3 -> {iso3, name, capital, lon, lat, sovereign, items:Set, aliases:Set}
const point = (s) => { const m = s?.match(/Point\(([-\d.]+) ([-\d.]+)\)/); return m ? [Number(m[1]), Number(m[2])] : null; };
const sov = (r) => r.sovereign === "true" || r.sovereign === "1";
// One record per ISO code. When two items carry a code (Denmark proper and the Kingdom of Denmark), the sovereign
// state wins; the other item's names become aliases.
const rowsByIso = new Map();
for (const r of WD_COUNTRIES.rows) rowsByIso.set(r.iso3, [...(rowsByIso.get(r.iso3) ?? []), r]);
for (const [iso3, rows] of rowsByIso) {
  rows.sort((a, b) => sov(b) - sov(a));
  const main = rows[0];
  const c = { iso3, name: main.name, capital: null, lon: null, lat: null, sovereign: sov(main), items: new Set(), aliases: new Set() };
  for (const r of rows) {
    c.items.add(r.item);
    if (r.name !== c.name) c.aliases.add(r.name);
    for (const a of (r.aliases ?? "").split("|")) if (a) c.aliases.add(a);
    if (c.lon === null && point(r.coord)) [[c.lon, c.lat], c.capital] = [point(r.coord), r.capitalName];
  }
  if (c.lon === null) for (const r of rows) if (point(r.ownCoord)) { [c.lon, c.lat] = point(r.ownCoord); c.placedBy = "its own coordinate (Wikidata has no capital coordinate)"; break; }
  countries.set(iso3, c);
}
const isoByItem = new Map([...countries.values()].flatMap((c) => [...c.items].map((i) => [i, c.iso3])));

// Names this repository uses that Wikidata's names and aliases do not carry, each with the reason.
const ALIASES = {
  "China": ["CHN", "Wikidata names the state \"People's Republic of China\""],
  "Brunei Darussalam": ["BRN", "the state's official short name"],
  "Cabo Verde": ["CPV", "the state's official name since 2013"],
  "Korea (Republic of)": ["KOR", "ISO's form of South Korea's name"],
  "Venezuela (suspended)": ["VEN", "Mercosur lists Venezuela as suspended; the thread keeps it and the organisation's record says so"],
};
const HISTORIC = { // states that no longer exist, placed at the capital of the state that holds that capital today
  "Soviet Union": { code: "SUN", at: "RUS", note: "dissolved 1991; placed at Moscow" },
};
const norm = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z ]/g, "").replace(/\bthe\b/g, "").replace(/\s+/g, " ").trim();
const nameIndex = new Map();
for (const c of countries.values()) for (const n of [c.name, ...c.aliases]) {
  const k = norm(n);
  nameIndex.set(k, nameIndex.has(k) && nameIndex.get(k) !== c.iso3 ? null : c.iso3); // null marks an ambiguous name
}
for (const [n, [iso]] of Object.entries(ALIASES)) nameIndex.set(norm(n), iso);
for (const [n, h] of Object.entries(HISTORIC)) {
  const at = countries.get(h.at);
  countries.set(h.code, { iso3: h.code, name: n, capital: at.capital, lon: at.lon, lat: at.lat, sovereign: false, historic: h.note, items: new Set(), aliases: new Set() });
  nameIndex.set(norm(n), h.code);
}
const resolve = (name) => (typeof name === "string" ? nameIndex.get(norm(name)) ?? null : null);

// ---- organisations ---------------------------------------------------------------------------------------------
const DOMAINS = {
  politics: { label: "Politics", color: "#1f4e9c", dash: "", blurb: "Regional unions, forums and ideological groupings." },
  economics: { label: "Economics", color: "#8a5a00", dash: "10 5", blurb: "Trade blocs, customs unions and economic forums." },
  defence: { label: "Defence", color: "#a3262a", dash: "4 3", blurb: "Alliances, defence treaties, arms control and nuclear bodies." },
  culture: { label: "Culture", color: "#2f7d4f", dash: "1.5 3", blurb: "Shared official languages, and cultural, linguistic, religious and educational bodies." },
  games: { label: "Games", color: "#6b3fa0", dash: "10 3 2 3", blurb: "The Olympic Games and the FIFA World Cup, thread from host to host." },
  history: { label: "History", color: "#6e6a63", dash: "6 2 1 2", blurb: "Organisations that no longer exist." },
};
const domainOf = (file, type = "") => {
  if (/Defunct/.test(file)) return "history";
  const t = type.toLowerCase();
  if (/arms|nuclear|disarm|military|defen|security|non-proliferation|treaty org/.test(t) || /ArmsControl|nuclear|Defense/.test(file)) return "defence";
  if (/trade|econom|customs|monetary|bank|financ|market|development/.test(t) || /Trade/.test(file)) return "economics";
  if (/cultur|language|linguistic|relig|educat|universit|academ|ethnic|sport/.test(t) || /Cultural|Educational/.test(file)) return "culture";
  return "politics";
};

const orgs = [];
const unmapped = new Map(); // name -> {count, orgs:[]}
const noteUnmapped = (name, org) => {
  const u = unmapped.get(name) ?? { name, orgs: [] };
  u.orgs.push(org);
  unmapped.set(name, u);
};
const files = [];
(function walkDir(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (f !== "sources") walkDir(p); }
    else if (f.endsWith(".json")) files.push(p);
  }
})(DATA);

const DATA_SET_SOURCE = (file) => `this repository, data/${relative(DATA, file).replace(/\\/g, "/")}`;
for (const file of files) {
  const rel = relative(DATA, file).replace(/\\/g, "/");
  const d = json(file);
  (function walk(x, parentKey) {
    if (Array.isArray(x)) return x.forEach((v) => walk(v, parentKey));
    if (!x || typeof x !== "object") return;
    if ("members" in x) {
      const name = x.name ?? x.FullName ?? x.full_name ?? x.CommonName ?? x.formalName ?? x.abbreviation;
      const abbr = x.abbreviation ?? x.CommonName ?? null;
      const type = x.type ?? "";
      const o = {
        id: slug(abbr && abbr !== name ? `${abbr}-${name}` : name), name, abbr, type, file: rel, domain: domainOf(rel, type),
        purpose: x.purpose ?? x.objective ?? "", founded: x.founded ?? null, duration: x.duration ?? null,
        members: [], unresolved: [], prose: null, source: DATA_SET_SOURCE(file),
      };
      if (Array.isArray(x.members)) {
        for (const m of x.members) {
          const iso = resolve(m);
          if (iso) { if (!o.members.includes(iso)) o.members.push(iso); }
          else { o.unresolved.push(m); noteUnmapped(m, o.name); }
        }
      } else o.prose = String(x.members);
      if (/suspended/i.test(JSON.stringify(x.members))) o.note = "Venezuela is suspended from Mercosur; its thread is kept and marked.";
      orgs.push(o);
    }
    for (const [k, v] of Object.entries(x)) if (k !== "members") walk(v, k);
  })(d);
}

// One body, one thread: the repository lists some bodies in two files (NATO in CountryBlocks and TranscontinentOrgs;
// the EU as "EU" and "European Union"). Records sharing a name or abbreviation are merged; the longer member list is
// drawn, and the record says it was listed twice and where.
const keyNorm = (k) => k.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\bthe\b/g, "").replace(/\s+/g, " ").trim();
const ABBR_OF = { "group of seven": "g7", "group of eight": "g8", "group of twenty": "g20", "group of 77": "g77", "group of fifteen": "g15" }; // a name and its number-abbreviation are one body
const keysOf = (o) => [...new Set([o.name, o.abbr].filter(Boolean).map(keyNorm).flatMap((k) => [k, ABBR_OF[k]]).filter((k) => k && k.length >= 2))];
const groups = [];
for (const o of orgs) {
  const g = groups.find((g) => g.keys.some((k) => keysOf(o).includes(k)));
  if (g) { g.list.push(o); for (const k of keysOf(o)) if (!g.keys.includes(k)) g.keys.push(k); }
  else groups.push({ keys: keysOf(o), list: [o] });
}
let mergedDuplicates = 0;
for (const g of groups) {
  if (g.list.length < 2) continue;
  g.list.sort((a, b) => b.members.length - a.members.length || (a.prose ? 1 : 0) - (b.prose ? 1 : 0));
  const [keep, ...drop] = g.list;
  keep.listedAlso = drop.map((d) => `${d.file} as "${d.name}"${d.members.length ? ` (${d.members.length} members)` : d.prose ? ` ("${d.prose}")` : ""}`);
  keep.abbr = keep.abbr ?? drop.find((d) => d.abbr)?.abbr ?? null;
  for (const d of drop) orgs.splice(orgs.indexOf(d), 1);
  mergedDuplicates += drop.length;
}

// Prose member lists: filled from Wikidata's member-of (P463) only when the organisation matches by short name or name,
// and only when Wikidata's count agrees with a count the repository states (within 10 per cent or one member).
const WD_MEM = existsSync(join(SRC, "wikidata", "memberships.json")) ? wd("memberships") : null;
const wdOrgs = new Map();
if (WD_MEM) for (const r of WD_MEM.rows) {
  const o = wdOrgs.get(r.org) ?? { label: r.orgLabel, short: new Set(), members: new Set() };
  if (r.orgShort) o.short.add(r.orgShort);
  o.members.add(r.iso3);
  wdOrgs.set(r.org, o);
}
const wdByKey = new Map();
for (const [qid, o] of wdOrgs) for (const k of [o.label, ...o.short]) {
  const n = norm(k);
  wdByKey.set(n, wdByKey.has(n) && wdByKey.get(n) !== qid ? null : qid);
}
let filledFromWikidata = 0, filledProse = 0, filledShort = 0, fillRejected = 0;
for (const o of orgs) {
  if (o.members.length >= 2 || !WD_MEM) continue;
  const qid = [o.abbr, o.name].filter(Boolean).map((k) => wdByKey.get(norm(k))).find(Boolean);
  if (!qid) continue;
  const w = wdOrgs.get(qid);
  const members = [...w.members].filter((iso) => countries.has(iso));
  if (members.length < 2) continue;
  const stated = Number((o.prose ?? "").match(/\b(\d{1,3})\b/)?.[1] ?? NaN);
  if (Number.isFinite(stated) && Math.abs(members.length - stated) > Math.max(1, Math.round(stated * 0.1))) {
    o.fillRejected = `Wikidata lists ${members.length} members and the repository says ${stated}, so it is left unthreaded rather than drawn short`;
    fillRejected++;
    continue;
  }
  if (o.prose) filledProse++; else filledShort++;
  o.members = members;
  o.source = `Wikidata member-of (P463) for ${w.label} (https://www.wikidata.org/wiki/${qid.split("/").pop()}), fetched ${WD_MEM.fetched.slice(0, 10)}`;
  o.filled = o.prose ? `the repository gives "${o.prose}"` : "the repository listed fewer than two resolvable members";
  filledFromWikidata++;
}

// Bilateral UK defence agreements from data/DefenseAgreements/UKDefense.json.
const ukd = json(join(DATA, "DefenseAgreements", "UKDefense.json"));
for (const a of ukd.UKDefense?.EU ?? []) {
  const iso = resolve(a.country);
  const event = a.highlights?.[0]?.event ?? "Defence cooperation";
  if (iso) orgs.push({ id: slug(`uk-${a.country}`), name: `United Kingdom–${a.country}: ${event}`, abbr: null, type: "Bilateral defence agreement", file: "DefenseAgreements/UKDefense.json", domain: "defence", purpose: "", founded: a.startYear ? String(a.startYear) : null, members: ["GBR", iso], unresolved: [], source: DATA_SET_SOURCE(join(DATA, "DefenseAgreements", "UKDefense.json")) });
}
for (const a of ukd.NonEUDefenceCooperation ?? []) {
  const [, other] = String(a.countries).split("-");
  const iso = resolve({ US: "United States" }[other] ?? other);
  if (iso) orgs.push({ id: slug(`uk-${other}`), name: `United Kingdom–${countries.get(iso).name} defence cooperation`, abbr: null, type: "Bilateral defence cooperation", file: "DefenseAgreements/UKDefense.json", domain: "defence", purpose: a.description ?? "", founded: null, members: ["GBR", iso], unresolved: [], source: DATA_SET_SOURCE(join(DATA, "DefenseAgreements", "UKDefense.json")) });
}

// Languages: the repository's language profiles (native_to), and official languages shared by two or more states (Wikidata).
for (const f of readdirSync(join(DATA, "Languages"))) {
  const d = json(join(DATA, "Languages", f));
  const lang = d.language ?? d.Language ?? f.replace(".json", "");
  const where = d.native_to ?? d.NativeTo ?? d.official_status ?? null;
  if (!Array.isArray(where)) continue;
  const members = [...new Set(where.map((w) => resolve(String(w).replace(/\s*\(.*\)$/, ""))).filter(Boolean))];
  if (members.length >= 2) orgs.push({ id: slug(`lang-${lang}`), name: `${lang} (native)`, abbr: null, type: "Language", file: `Languages/${f}`, domain: "culture", purpose: `Countries the repository lists as native to ${lang}.`, members, unresolved: [], source: DATA_SET_SOURCE(join(DATA, "Languages", f)) });
}
const WD_LANG = existsSync(join(SRC, "wikidata", "languages.json")) ? wd("languages") : null;
if (WD_LANG) {
  const byLang = new Map();
  for (const r of WD_LANG.rows) if (countries.has(r.iso3)) byLang.set(r.langLabel, new Set([...(byLang.get(r.langLabel) ?? []), r.iso3]));
  for (const [lang, set] of byLang) if (set.size >= 2 && !/^Q\d+$/.test(lang)) orgs.push({ id: slug(`official-${lang}`), name: `${lang} (official)`, abbr: null, type: "Official language", file: null, domain: "culture", purpose: `States where ${lang} is an official language.`, members: [...set], unresolved: [], source: `Wikidata official language (P37), fetched ${WD_LANG.fetched.slice(0, 10)}` });
}

// Games: one thread per series, from host to host in year order (Wikidata).
const GAME_FILES = { "Summer Olympic Games": "games_summer", "Winter Olympic Games": "games_winter", "FIFA World Cup": "games_worldcup" };
// Editions awarded but never held (the World Wars); Wikidata keeps their hosts, the threads do not.
const CANCELLED = { "Summer Olympic Games": [1916, 1940, 1944], "Winter Olympic Games": [1940, 1944], "FIFA World Cup": [1942, 1946] };
// The years each series was held up to 2026, from its schedule, to name the editions Wikidata does not record.
const SCHEDULE = {
  "Summer Olympic Games": [...Array.from({ length: 31 }, (_, i) => 1896 + 4 * i).filter((y) => y <= 2024 && y !== 2020), 2021],
  "Winter Olympic Games": [...Array.from({ length: 18 }, (_, i) => 1924 + 4 * i).filter((y) => y <= 1992), ...Array.from({ length: 9 }, (_, i) => 1994 + 4 * i)],
  "FIFA World Cup": Array.from({ length: 25 }, (_, i) => 1930 + 4 * i).filter((y) => y <= 2026),
};
const THIS_YEAR = 2026;
const games = [];
let gamesFetched = null;
for (const [label, file] of Object.entries(GAME_FILES)) {
  if (!existsSync(join(SRC, "wikidata", `${file}.json`))) continue;
  const W = wd(file);
  gamesFetched = W.fetched.slice(0, 10);
  const s = new Map();
  for (const r of W.rows) {
    if (!r.year || !countries.has(r.iso3)) continue;
    if (CANCELLED[label].includes(Number(r.year))) continue;
    const key = `${r.year}|${r.iso3}`;
    if (!s.has(key)) s.set(key, { year: Number(r.year), iso3: r.iso3, event: r.eventLabel, planned: Number(r.year) > THIS_YEAR });
  }
  const hosts = [...s.values()].sort((x, y) => x.year - y.year || x.iso3.localeCompare(y.iso3));
  if (hosts.length < 2) continue;
  const held = new Set(hosts.map((h) => h.year));
  const missing = SCHEDULE[label].filter((y) => !held.has(y) && !CANCELLED[label].includes(y));
  games.push({ label, hosts, missing, cancelled: CANCELLED[label] });
  orgs.push({ id: slug(`games-${label}`), name: label, abbr: null, type: "Games series", file: null, domain: "games",
    purpose: `Host countries in order of hosting, ${hosts[0].year} to ${hosts.at(-1).year}${hosts.some((h) => h.planned) ? " (later editions are planned)" : ""}.`,
    members: [...new Set(hosts.map((h) => h.iso3))], order: hosts.map((h) => h.iso3), hosts, unresolved: [],
    source: `Wikidata (${label} editions with a host country, P17), fetched ${gamesFetched}; editions Wikidata records without a host country or date are not drawn` });
}

// Heritage: World Heritage Sites per country (Wikidata); a knot size layer, no threads.
const WD_HER = existsSync(join(SRC, "wikidata", "heritage.json")) ? wd("heritage") : null;
const heritage = new Map();
if (WD_HER) for (const r of WD_HER.rows) { const iso = isoByItem.get(r.country); if (iso) heritage.set(iso, (heritage.get(iso) ?? 0) + Number(r.sites)); }
const HER_TOTAL = existsSync(join(SRC, "wikidata", "heritage_total.json")) ? Number(wd("heritage_total").rows[0].sites) : null;

// Tax havens: a classification in this repository, not an organisation; listed, not threaded.
const taxHavens = json(join(DATA, "TaxHavens.json")).map((t) => ({ ...t, iso3: resolve(t.country) }));

// Unique ids.
const seen = new Map();
for (const o of orgs) { const n = (seen.get(o.id) ?? 0) + 1; seen.set(o.id, n); if (n > 1) o.id = `${o.id}-${n}`; }
const threaded = orgs.filter((o) => o.members.length >= 2 && o.members.every((m) => countries.get(m)?.lon != null));
const notThreaded = orgs.filter((o) => !threaded.includes(o));

// ---- projection: Natural Earth I, land from world-atlas (Natural Earth 110 m) -------------------------------------
const W = 1000, H = 520;
function naturalEarth(lon, lat) {
  const l = (lon * Math.PI) / 180, p = (lat * Math.PI) / 180, p2 = p * p, p4 = p2 * p2;
  const x = l * (0.870700 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  const y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  return [x, y];
}
const [xMax] = naturalEarth(180, 0), [, yMax] = naturalEarth(0, 90);
const S = Math.min((W / 2 - 4) / xMax, (H / 2 - 4) / yMax);
const proj = (lon, lat) => { const [x, y] = naturalEarth(lon, lat); return [+(W / 2 + x * S).toFixed(1), +(H / 2 - y * S).toFixed(1)]; };

const topo = json(join(SRC, "countries-110m.json"));
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map((arc) => { let x = 0, y = 0; return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
const arcPts = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
const ringPath = (ring) => {
  const pts = ring.flatMap((i, k) => arcPts(i).slice(k ? 1 : 0)).map(([lo, la]) => proj(lo, la));
  let d = "", prev = null;
  for (const [x, y] of pts) {
    if (prev && Math.abs(x - prev[0]) > W / 2) d += `M${x} ${y}`; else d += (d ? "L" : "M") + `${x} ${y}`;
    prev = [x, y];
  }
  return d + "Z";
};
const landPaths = topo.objects.countries.geometries.map((g) => {
  const polys = g.type === "Polygon" ? [g.arcs] : g.type === "MultiPolygon" ? g.arcs : [];
  return { id: g.id, name: g.properties?.name, d: polys.flatMap((p) => p.map(ringPath)).join("") };
});
const LAND = landPaths.map((p) => p.d).join("");
const graticule = [];
for (let lon = -180; lon <= 180; lon += 30) graticule.push("M" + Array.from({ length: 19 }, (_, i) => proj(lon, -90 + i * 10).join(" ")).join("L"));
for (let lat = -60; lat <= 60; lat += 30) graticule.push("M" + Array.from({ length: 37 }, (_, i) => proj(-180 + i * 10, lat).join(" ")).join("L"));
const outline = "M" + [...Array.from({ length: 19 }, (_, i) => proj(-180, -90 + i * 10)), ...Array.from({ length: 19 }, (_, i) => proj(180, 90 - i * 10))].map((p) => p.join(" ")).join("L") + "Z";

// ---- threads: one per organisation, west to east (games: in hosting order), smoothed --------------------------------
const pt = (iso) => { const c = countries.get(iso); return proj(c.lon, c.lat); };
function threadPath(o) {
  let pts = (o.order ?? [...o.members].sort((a, b) => pt(a)[0] - pt(b)[0])).map(pt);
  pts = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
  if (pts.length === 1) return null;
  if (pts.length === 2) { // a two-member thread bows upward, so it reads as a thread and not as a border
    const [[x1, y1], [x2, y2]] = pts, mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.18;
    return `M${x1} ${y1}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2} ${y2}`;
  }
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) { // Catmull-Rom to cubic Bézier
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
for (const o of threaded) o.d = threadPath(o);

// Knots: area proportional to threads through the country.
const through = new Map();
for (const o of threaded) for (const m of o.members) through.set(m, (through.get(m) ?? 0) + 1);
const maxThrough = Math.max(...through.values());
const KNOT_MAX = 7;
const knotR = (n) => +(KNOT_MAX * Math.sqrt(n / maxThrough)).toFixed(2); // area strictly proportional to n (no floor)
const placed = [...countries.values()].filter((c) => c.lon != null);

// ---- figures ------------------------------------------------------------------------------------------------------
const byDomain = Object.fromEntries(Object.keys(DOMAINS).map((k) => [k, threaded.filter((o) => o.domain === k)]));
const domainCountries = (k) => new Set(byDomain[k].flatMap((o) => o.members)).size;
const repoOrgs = orgs.filter((o) => o.file && !/^Languages\//.test(o.file) && o.type !== "Bilateral defence agreement" && o.type !== "Bilateral defence cooperation");
const FIG = {
  threads: { value: threaded.length, procedure: "organisations, languages and games series with two or more placed members (one thread each)" },
  countries: { value: through.size, procedure: "distinct places (states, territories, one historic state) that at least one thread passes through" },
  statesThreaded: { value: [...through.keys()].filter((i) => countries.get(i).sovereign).length, procedure: "of those, sovereign states" },
  territoriesThreaded: { value: [...through.keys()].filter((i) => !countries.get(i).sovereign && !countries.get(i).historic).length, procedure: "of those, territories" },
  states: { value: [...countries.values()].filter((c) => c.sovereign).length, procedure: "sovereign states (P31 Q3624078) among current Wikidata items with an ISO 3166 alpha-3 code (P298)" },
  territories: { value: [...countries.values()].filter((c) => !c.sovereign && !c.historic).length, procedure: "current Wikidata items with an ISO alpha-3 code that are not sovereign states" },
  repoOrgs: { value: repoOrgs.length, procedure: "objects with a `members` field in data/*.json, after merging duplicates" },
  proseMembers: { value: repoOrgs.filter((o) => o.prose).length, procedure: "of those, `members` given as prose rather than a list" },
  filledFromWikidata: { value: filledProse + filledShort, procedure: "member lists filled from Wikidata member-of (P463): a matching name or short name, and a count within 10% (or one) of any count the repository states" },
  filledProse: { value: filledProse, procedure: "of those, records whose members the repository gave as prose" },
  filledShort: { value: filledShort, procedure: "of those, records whose list had fewer than two members that resolve" },
  fillRejected: { value: fillRejected, procedure: "records where Wikidata matched but its count disagreed with the repository's; left unthreaded" },
  mergedDuplicates: { value: mergedDuplicates, procedure: "records merged because the repository lists the same body twice (same name or abbreviation)" },
  historicThreaded: { value: [...through.keys()].filter((i) => countries.get(i).historic).length, procedure: "historic states a thread passes through" },
  gamesCancelled: { value: Object.values(CANCELLED).flat().length, procedure: "editions awarded but never held, left off the games threads" },
  stillUnthreaded: { value: notThreaded.length, procedure: "organisations with fewer than two placed members after filling" },
  unmappedNames: { value: unmapped.size, procedure: "distinct member names that resolve to no country (territories, regions, prose)" },
  maxThrough: { value: maxThrough, procedure: "the most threads through one country" },
  heritageSites: { value: HER_TOTAL, procedure: "distinct World Heritage Sites in Wikidata, by the leading number of the UNESCO id (P757); a site in several countries counts once" },
  heritageByCountrySum: { value: [...heritage.values()].reduce((a, b) => a + b, 0), procedure: "per-country counts summed: higher than the total because a site that crosses a border counts in each country" },
  gamesHosts: { value: games.reduce((a, g) => a + g.hosts.length, 0), procedure: "host entries across the games series" },
  repairedFiles: { value: 7, procedure: "files that did not parse at dad93b5 and were repaired (the Data page lists each change)" },
};
for (const k of Object.keys(DOMAINS)) FIG[`threads_${k}`] = { value: byDomain[k].length, procedure: `threads in the ${DOMAINS[k].label} domain` };
for (const k of Object.keys(DOMAINS)) FIG[`countries_${k}`] = { value: domainCountries(k), procedure: `countries ${DOMAINS[k].label} threads pass through` };
const fig = (k) => FIG[k].value;

// ---- svg ------------------------------------------------------------------------------------------------------------
function mapSvg({ only = null, focus = null, id = "weave", label, interactive = true, knotsFor = null }) {
  const list = threaded.filter((o) => (!only || only.includes(o.domain)) && (!focus || o.members.includes(focus)));
  const threads = list.map((o) => `<path class="th d-${o.domain}" d="${o.d}" data-o="${o.id}" data-c="${o.members.join(" ")}"><title>${esc(o.name)}: ${o.members.length} members</title></path>`).join("");
  const showKnots = knotsFor ?? new Set(list.flatMap((o) => o.members));
  const knots = placed.filter((c) => showKnots.has(c.iso3)).sort((a, b) => a.name.localeCompare(b.name)).map((c) => {
    const [x, y] = proj(c.lon, c.lat), n = through.get(c.iso3) ?? 0;
    const r = knotR(n);
    const inner = `<circle class="hit" cx="${x}" cy="${y}" r="10"/><circle class="k${focus === c.iso3 ? " me" : ""}" cx="${x}" cy="${y}" r="${r}"/>`;
    return interactive
      ? `<a href="country-${c.iso3.toLowerCase()}.html" class="knot" data-c="${c.iso3}" aria-label="${esc(c.name)}: ${n} threads">${inner}</a>`
      : `<g class="knot">${inner}</g>`;
  }).join("");
  const skip = interactive ? `<a class="skip-map" href="#after-${id}">Skip the map's ${showKnots.size} country links</a>` : "";
  return `${skip}<svg class="map" id="${id}" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(label)}"><title>${esc(label)}</title>
<use href="land.svg#base"/>
<g class="threads" aria-hidden="true">${threads}</g><g class="knots">${knots}</g></svg><span id="after-${id}"></span>`;
}

// A country's own map: its threads by reference to the shared threads.svg (cached once for the site), its knots inline.
function countryMap(c) {
  const mine = threaded.filter((o) => o.members.includes(c.iso3));
  const members = new Set(mine.flatMap((o) => o.members));
  const knots = placed.filter((p) => members.has(p.iso3)).map((p) => {
    const [x, y] = proj(p.lon, p.lat);
    const r = knotR(through.get(p.iso3) ?? 0);
    return p.iso3 === c.iso3 ? `<circle class="me-ring" cx="${x}" cy="${y}" r="${(r + 3).toFixed(2)}"/><circle class="k me" cx="${x}" cy="${y}" r="${r}"/>` : `<circle class="k" cx="${x}" cy="${y}" r="${r}"/>`;
  }).join("");
  return `<svg class="map" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`The ${mine.length} threads through ${c.name}`)}"><use href="land.svg#base"/>${mine.map((o) => `<use href="threads.svg#t-${o.id}"/>`).join("")}<g aria-hidden="true">${knots}</g></svg>`;
}

// ---- pages ----------------------------------------------------------------------------------------------------------
const NAV = [["index.html", "The Weave"], ...Object.entries(DOMAINS).map(([k, v]) => [`${k}.html`, v.label]), ["heritage.html", "Heritage"], ["countries.html", "Countries"], ["organisations.html", "Organisations"], ["data.html", "Data"]];
function page({ file, title, description, body, current, script = "" }) {
  const canonical = SITE + (file === "index.html" ? "" : file.replace(/\.html$/, ""));
  const nav = NAV.map(([h, l]) => `<a href="${h}"${h === current ? ' aria-current="page"' : ""}>${l}</a>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE}og.jpg"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f3ede2">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="bar"><div class="wrap bar-in"><a class="brand" href="index.html"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="favicon.svg#mark"/></svg>GeoPolitics</a>
<nav aria-label="Pages">${nav}</nav></div></header>
<main id="main">
${body}
</main>
<footer class="foot"><div class="wrap">
<p>Built from <a href="${REPO}">the GeoPolitics data repository</a> and Wikidata (CC0); map shapes from Natural Earth via world-atlas 2.0.2. Every count on this site is computed from the data at build time: <a href="facts.json">facts.json</a>. What could not be placed is listed on the <a href="data.html">Data</a> page.</p>
</div></footer>
${script}
</body>
</html>
`;
}

const legendSwatch = (k) => `<svg class="sw" viewBox="0 0 40 10" aria-hidden="true"><path d="M1 5H39" stroke="${DOMAINS[k].color}" stroke-width="2.4" stroke-dasharray="${DOMAINS[k].dash}" fill="none"/></svg>`;
const domainTile = (k) => `<li class="tile t-${k}"><a href="${k}.html"><span class="tname">${legendSwatch(k)}${DOMAINS[k].label}</span><span class="tnum">${fig(`threads_${k}`)}</span><span class="tsub">threads</span></a><label class="tog"><input type="checkbox" checked data-d="${k}"><span class="sr">${DOMAINS[k].label} threads </span>shown</label></li>`;
const heritageTile = `<li class="tile t-heritage"><a href="heritage.html"><span class="tname"><svg class="sw" viewBox="0 0 40 10" aria-hidden="true"><circle cx="20" cy="5" r="4" fill="none" stroke="#0f6b74" stroke-width="2"/></svg>Heritage</span><span class="tnum">${fig("heritageSites")}</span><span class="tsub">World Heritage Sites</span></a></li>`;

const SCRIPT = `<script>
(() => {
  const svg = document.getElementById("weave"); if (!svg) return;
  const ths = [...svg.querySelectorAll(".th")];
  for (const b of document.querySelectorAll(".tog input")) b.addEventListener("change", () => svg.classList.toggle("hide-" + b.dataset.d, !b.checked));
  const out = document.getElementById("readout");
  const show = (iso, name, n) => {
    svg.classList.add("focusing");
    for (const t of ths) t.classList.toggle("lit", t.dataset.c.split(" ").includes(iso));
    if (out) out.textContent = name + ": " + n + " threads. Open its page for the list.";
  };
  const clear = () => { svg.classList.remove("focusing"); for (const t of ths) t.classList.remove("lit"); };
  // Hit areas 24 px across on screen whatever the map's scale (WCAG 2.5.8); the country finder below is the
  // equivalent control where knots crowd.
  const sizeHits = () => { const bb = svg.getBoundingClientRect(); const sc = Math.min(bb.width / 1000, bb.height / 520) || 1; /* the map is letterboxed when its height is capped */ for (const h of svg.querySelectorAll(".hit")) h.setAttribute("r", (12.5 / sc).toFixed(1)); };
  sizeHits(); addEventListener("resize", sizeHits);
  let armed = null;
  for (const k of svg.querySelectorAll(".knot")) {
    const [name, rest] = k.getAttribute("aria-label").split(": ");
    const n = parseInt(rest, 10);
    k.addEventListener("mouseenter", () => show(k.dataset.c, name, n));
    k.addEventListener("focus", () => show(k.dataset.c, name, n));
    k.addEventListener("mouseleave", clear); k.addEventListener("blur", clear);
    // On a touch screen the first tap traces the country and the second opens it.
    k.addEventListener("pointerdown", (e) => { k.dataset.touch = e.pointerType === "touch" ? "1" : ""; });
    k.addEventListener("click", (e) => {
      if (k.dataset.touch && armed !== k) { e.preventDefault(); armed = k; show(k.dataset.c, name, n); }
    });
  }
})();
</script>`;

// The landing's extras: the size key, the fringe of loose threads, the odd records' counts.
const keyDot = (n) => `<svg class="key" viewBox="-8 -8 16 16" aria-hidden="true"><circle r="${knotR(n)}" class="k"/></svg>`;
const sizeKey = `<span class="sizekey">A knot's area is proportional to the threads through it: ${keyDot(1)} 1 ${keyDot(10)} 10 ${keyDot(maxThrough)} ${maxThrough}.</span>`;
const fringe = (() => {
  const n = notThreaded.length, w = 1000, step = w / (n + 1);
  const strands = Array.from({ length: n }, (_, i) => { const x = step * (i + 1), len = 7 + ((i * 53) % 11), sway = ((i * 29) % 9) - 4, curl = ((i * 17) % 5) - 2; return `<path d="M${x.toFixed(1)} 1c${sway} ${(len / 3).toFixed(1)} ${-sway + curl} ${((2 * len) / 3).toFixed(1)} ${(curl * 1.5).toFixed(1)} ${len}"/>`; }).join("");
  return `<a class="fringe" href="organisations.html#loose" aria-label="${n} records too loose to draw: see why"><svg viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">${strands}</svg><span>${n} loose threads: records that could not be drawn</span></a>`;
})();
const religionCount = readdirSync(join(DATA, "Religion")).length;
const languageCount = readdirSync(join(DATA, "Languages")).length;
const presidentCount = json(join(DATA, "US", "USPresidents.json")).USpresidents.length;

const pages = {};
pages["index.html"] = page({
  file: "index.html", current: "index.html", title: "GeoPolitics: the Weave",
  description: `${fig("threads")} threads through ${fig("statesThreaded")} states and ${fig("territoriesThreaded")} territories: every alliance, union, shared language and games host as one thread across the map.`,
  script: SCRIPT,
  body: `<section class="hero"><div class="wrap">
<h1>The world, woven: <span>${fig("threads")} threads</span> through ${fig("statesThreaded")} states, ${fig("territoriesThreaded")} territories and ${fig("historicThreaded")} historic state.</h1>
<p class="how">One thread is one organisation, shared language or games series, drawn through its members from west to east. ${sizeKey} <span id="readout" aria-live="polite">Point at a country to trace it (on a phone, tap once); click to open it.</span></p>
${mapSvg({ id: "weave", label: `World map with ${fig("threads")} threads through ${fig("statesThreaded")} states, ${fig("territoriesThreaded")} territories and ${fig("historicThreaded")} historic state` })}
${fringe}
<p class="tiles-cap" aria-hidden="true">Threads by domain, and World Heritage Sites</p>
<ul class="tiles" aria-label="The domains, with their counts">${Object.keys(DOMAINS).map(domainTile).join("")}${heritageTile}</ul>
</div></section>
<section class="band"><div class="wrap cols">
<div><h2>Read it as cloth</h2><p>A large knot is a country many organisations include: ${esc(countries.get([...through.entries()].sort((a, b) => b[1] - a[1])[0][0]).name)} is in the most, ${fig("maxThrough")}. A long thread is an organisation that spans the world; a short curve joins two neighbours.</p>
<p><label for="find">Find a country</label> <input id="find" type="search" list="places" autocomplete="off"> <span class="note">and open its page</span><datalist id="places">${placed.filter((c) => through.has(c.iso3)).map((c) => `<option value="${esc(c.name)}">`).join("")}</datalist></p></div>
<div><h2>What is not drawn, and why</h2><p>The ${fig("stillUnthreaded")} loose threads under the map are records that could not be drawn: ${fig("proseMembers")} of the repository's ${fig("repoOrgs")} records name their members only in words ("27 European countries"); Wikidata filled ${fig("filledFromWikidata")} where its count agreed and refused ${fig("fillRejected")} where it did not. ${fig("mergedDuplicates")} records were the same organisation listed twice and are drawn once. ${fig("unmappedNames")} member names are territories, regions or sentences. <a href="data.html">The Data page lists every one.</a></p>
<p>Kept beside NATO in the same data: profiles of ${religionCount} religions and ${languageCount} languages, ${presidentCount} US presidents, and one example record of a US Army special-forces team. <a href="organisations.html">See them all.</a></p></div>
</div></section>`,
});

const orgRow = (o, suffix = "") => `<tr id="${o.id}${suffix}"><th scope="row">${esc(o.name)}${o.abbr && o.abbr !== o.name ? ` <span class="abbr">${esc(o.abbr)}</span>` : ""}${o.note ? `<br><span class="note">${esc(o.note)}</span>` : ""}</th><td>${esc(o.type)}</td><td>${o.members.length >= 2 ? o.members.map((m) => `<a href="country-${m.toLowerCase()}.html">${esc(countries.get(m).name)}</a>`).join(", ") : `<span class="note">Not threaded: ${esc(o.prose ? `members given as "${o.prose}"` : "fewer than two members resolve to countries")}</span>`}${o.unresolved?.length ? `<br><span class="note">Not placed: ${o.unresolved.map(esc).join("; ")}</span>` : ""}</td><td class="src">${esc(o.source)}${o.filled ? `<br><span class="note">Filled because ${esc(o.filled)}</span>` : ""}${o.fillRejected ? `<br><span class="note">${esc(o.fillRejected)}</span>` : ""}${o.listedAlso ? `<br><span class="note">Also listed in ${esc(o.listedAlso.join("; "))}; drawn once</span>` : ""}</td></tr>`;
const orgTable = (list, caption, suffix = "") => `<div class="tbl"><table><caption>${esc(caption)}</caption><thead><tr><th scope="col">Organisation</th><th scope="col">Type</th><th scope="col">Members</th><th scope="col">Source</th></tr></thead><tbody>${list.map((o) => orgRow(o, suffix)).join("")}</tbody></table></div>`;

for (const [k, D] of Object.entries(DOMAINS)) {
  const list = orgs.filter((o) => o.domain === k);
  const extra = k === "economics" ? `<h2>Tax havens</h2><p>The repository keeps a list of ${taxHavens.length} places it calls tax havens. It is a classification, not an organisation, so it is listed here and not threaded. ${taxHavens.filter((t) => t.iso3).length} are sovereign states; the rest are territories.</p><div class="tbl"><table><caption>Tax havens in data/TaxHavens.json</caption><thead><tr><th scope="col">Place</th><th scope="col">Corporate tax</th><th scope="col">Personal income tax</th><th scope="col">Notes</th></tr></thead><tbody>${taxHavens.map((t) => `<tr><th scope="row">${t.iso3 ? `<a href="country-${t.iso3.toLowerCase()}.html">${esc(t.country)}</a>` : esc(t.country)}</th><td>${esc(t.corporate_tax)}</td><td>${esc(t.individual_income_tax)}${t.country === "Marshall Islands" ? '<br><span class="note">The source contradicts itself here: its note says there is no personal income tax.</span>' : ""}</td><td>${esc(t.notes)}</td></tr>`).join("")}</tbody></table></div>` : "";
  const gamesExtra = k === "games" ? games.map((g) => `<h2>${esc(g.label)}</h2><p class="note">Not drawn: ${g.cancelled.join(", ")} (awarded, never held)${g.missing.length ? `; ${g.missing.join(", ")} (held, but Wikidata records no host country for them)` : ""}.</p><ol class="hosts">${g.hosts.map((h) => `<li><span class="yr">${h.year}</span> <a href="country-${h.iso3.toLowerCase()}.html">${esc(countries.get(h.iso3).name)}</a>${h.planned ? ' <span class="note">planned</span>' : ""}</li>`).join("")}</ol>`).join("") : "";
  pages[`${k}.html`] = page({
    file: `${k}.html`, current: `${k}.html`, title: `${D.label} · GeoPolitics`, description: `${D.blurb} ${fig(`threads_${k}`)} threads through ${fig(`countries_${k}`)} countries.`, script: SCRIPT,
    body: `<section class="head"><div class="wrap"><p class="kicker">${legendSwatch(k)} ${D.label}</p><h1>${k === "games" ? `${games.length} series, from host to host, through ${fig(`countries_${k}`)} countries.` : `${fig(`threads_${k}`)} threads through ${fig(`countries_${k}`)} places.`}</h1><p class="how">${esc(D.blurb)} <span id="readout" aria-live="polite"></span></p>
${mapSvg({ only: [k], id: "weave", label: `${D.label} threads on the world map` })}</div></section>
<section class="body"><div class="wrap">${gamesExtra}${orgTable(list, `${D.label}: every organisation, threaded or not`)}${extra}</div></section>`,
  });
}

pages["heritage.html"] = page({
  file: "heritage.html", current: "heritage.html", title: "Heritage · GeoPolitics", description: `${fig("heritageSites")} World Heritage Sites across ${heritage.size} places, from Wikidata.`,
  body: `<section class="head"><div class="wrap"><p class="kicker">Heritage</p><h1>${fig("heritageSites")} World Heritage Sites in ${heritage.size} places.</h1>
<p class="how">Art and heritage are not threads: a site belongs to a place. Each ring's area is proportional to the place's sites: ${[1, 10, Math.max(...heritage.values())].map((n) => `<svg class="key" viewBox="-17 -17 34 34" aria-hidden="true" style="width:${Math.max(10, 2 * 16 * Math.sqrt(n / Math.max(...heritage.values())) + 4).toFixed(0)}px;height:auto"><circle class="her" r="${(16 * Math.sqrt(n / Math.max(...heritage.values()))).toFixed(2)}"/></svg> ${n}`).join(" ")}. A site that crosses a border counts in each country it lies in, so the table sums to ${fig("heritageByCountrySum")}, more than the ${fig("heritageSites")} sites. Source: Wikidata, UNESCO World Heritage Site id (P757) by country (P17)${WD_HER ? `, fetched ${WD_HER.fetched.slice(0, 10)}` : ""}.</p>
<svg class="map" viewBox="0 0 ${W} ${H}" role="img" aria-label="World Heritage Sites by country: the table below lists every country"><use href="land.svg#base"/>${[...heritage.entries()].filter(([iso]) => countries.get(iso)?.lon != null).sort((a, b) => b[1] - a[1]).map(([iso, n]) => { const [x, y] = proj(countries.get(iso).lon, countries.get(iso).lat); const mx = Math.max(...heritage.values()); return `<circle class="her" cx="${x}" cy="${y}" r="${(16 * Math.sqrt(n / mx)).toFixed(2)}"><title>${esc(countries.get(iso).name)}: ${n} sites</title></circle>`; }).join("")}</svg></div></section>
<section class="body"><div class="wrap"><div class="tbl"><table><caption>World Heritage Sites by country</caption><thead><tr><th scope="col">Country</th><th scope="col">Sites</th></tr></thead><tbody>${[...heritage.entries()].sort((a, b) => b[1] - a[1] || countries.get(a[0]).name.localeCompare(countries.get(b[0]).name)).map(([iso, n]) => `<tr><th scope="row"><a href="country-${iso.toLowerCase()}.html">${esc(countries.get(iso).name)}</a></th><td class="num">${n}</td></tr>`).join("")}</tbody></table></div></div></section>`,
});

const allPlaced = placed.filter((c) => !c.historic).sort((a, b) => a.name.localeCompare(b.name));
pages["countries.html"] = page({
  file: "countries.html", current: "countries.html", title: "Countries · GeoPolitics", description: `Every country and the threads through it: the Weave as a list.`,
  script: `<script>(() => { const q = document.getElementById("q"), rows = [...document.querySelectorAll("#clist li")]; const n = document.getElementById("n"); q.addEventListener("input", () => { const v = q.value.trim().toLowerCase(); let k = 0; for (const r of rows) { const hit = !v || r.dataset.k.includes(v); r.hidden = !hit; k += hit; } n.textContent = k; }); })();</script>`,
  body: `<section class="head"><div class="wrap"><p class="kicker">Countries</p><h1>${allPlaced.length} countries, and the threads through each.</h1><p class="how">The map as a list: every country, its thread count by domain, and a page of its own.</p>
<p><label for="q">Find a country</label> <input id="q" type="search" autocomplete="off"> <span class="note"><span id="n">${allPlaced.length}</span> shown</span></p></div></section>
<section class="body"><div class="wrap"><ul id="clist" class="clist">${allPlaced.map((c) => { const per = Object.keys(DOMAINS).map((k) => byDomain[k].filter((o) => o.members.includes(c.iso3)).length); return `<li data-k="${esc([c.name, ...c.aliases, c.iso3].join(" ").toLowerCase())}"><a href="country-${c.iso3.toLowerCase()}.html">${esc(c.name)}</a> <span class="cn">${through.get(c.iso3) ?? 0}</span><span class="bars" role="img" aria-label="${Object.keys(DOMAINS).map((k, i) => `${DOMAINS[k].label} ${per[i]}`).join(", ")}">${Object.keys(DOMAINS).map((k, i) => `<i class="b-${k}" style="width:${per[i] ? Math.max(7, per[i] * 3) : 0}px"></i>`).join("")}</span></li>`; }).join("")}</ul></div></section>`,
});

for (const c of placed) {
  const mine = threaded.filter((o) => o.members.includes(c.iso3));
  const lists = Object.entries(DOMAINS).map(([k, D]) => { const l = mine.filter((o) => o.domain === k); return l.length ? `<h2>${legendSwatch(k)} ${D.label} <span class="cn">${l.length}</span></h2><ul class="olist">${l.map((o) => `<li><a href="${o.domain}.html#${o.id}">${esc(o.name)}</a> <span class="note">${o.members.length} members</span></li>`).join("")}</ul>` : ""; }).join("");
  const hosted = games.flatMap((g) => g.hosts.filter((h) => h.iso3 === c.iso3).map((h) => `${g.label} ${h.year}${h.planned ? " (planned)" : ""}`));
  pages[`country-${c.iso3.toLowerCase()}.html`] = page({
    file: `country-${c.iso3.toLowerCase()}.html`, current: "countries.html", title: `${c.name} · GeoPolitics`, description: `${c.name}: ${through.get(c.iso3) ?? 0} threads across the Weave.`,
    body: `<section class="head"><div class="wrap"><p class="kicker"><a href="countries.html">Countries</a> · ${esc(c.iso3)}</p><h1>${esc(c.name)}: ${through.get(c.iso3) ?? 0} threads.</h1>
<p class="how">${c.historic ? `A historic state (${esc(c.historic)}). ` : c.sovereign ? "" : "A territory, not a sovereign state. "}Placed at ${esc(c.capital ?? "its coordinate")}${c.placedBy ? ` (${esc(c.placedBy)})` : ""}. ${heritage.has(c.iso3) ? `${heritage.get(c.iso3)} World Heritage Sites. ` : ""}${hosted.length ? `Hosted ${esc(hosted.join(", "))}.` : ""}</p>
${countryMap(c)}</div></section>
<section class="body"><div class="wrap">${lists || '<p class="note">No thread passes through this country in this data.</p>'}</div></section>`,
  });
}

pages["organisations.html"] = page({
  file: "organisations.html", current: "organisations.html", title: "Organisations · GeoPolitics", description: `All ${orgs.length} organisations, languages and series, threaded or not.`,
  body: `<section class="head"><div class="wrap"><p class="kicker">Organisations</p><h1>${orgs.length} bodies; ${fig("threads")} drawn as threads.</h1><p class="how">Everything the data holds, including what could not be drawn and why, and the stranger records kept beside NATO: a tax-haven list, a religion, a single example of a special-forces team.</p></div></section>
<section class="body"><div class="wrap">${Object.entries(DOMAINS).map(([k, D]) => orgTable(orgs.filter((o) => o.domain === k), D.label)).join("")}
<h2 id="loose">The ${notThreaded.length} loose threads</h2><p>Records with fewer than two members that could be placed, each with its reason.</p>${orgTable(notThreaded, "Not drawn (each also appears in its domain's table above)", "-loose")}</div></section>`,
});

pages["data.html"] = page({
  file: "data.html", current: "data.html", title: "Data · GeoPolitics", description: "Sources, repairs and what could not be placed.",
  body: `<section class="head"><div class="wrap"><p class="kicker">Data</p><h1>Where every thread comes from.</h1></div></section>
<section class="body"><div class="wrap">
<h2>Sources</h2><ul>
<li>This repository's <code>data/</code> folder: ${fig("repoOrgs")} organisations with a members field, plus language, religion, defence and tax files. MIT licence.</li>
<li>Wikidata (CC0), queried by <code>_src/fetch_wikidata.py</code>; each result is kept in <code>data/sources/wikidata/</code> with its query and fetch time: countries and capitals (${WD_COUNTRIES.fetched.slice(0, 10)})${WD_MEM ? `, memberships (${WD_MEM.fetched.slice(0, 10)})` : ""}${WD_LANG ? `, official languages (${WD_LANG.fetched.slice(0, 10)})` : ""}${gamesFetched ? `, games hosts (${gamesFetched})` : ""}${WD_HER ? `, World Heritage Sites (${WD_HER.fetched.slice(0, 10)})` : ""}.</li>
<li>Country shapes: Natural Earth 1:110m (public domain) via world-atlas 2.0.2, in <code>data/sources/countries-110m.json</code>. Projection: Natural Earth I, computed at build time.</li></ul>
<h2>Repairs</h2><p>${fig("repairedFiles")} files did not parse when this site was built. Each was repaired, changing syntax only except where noted:</p>
${readFileSync(join(SRC, "repairs.md"), "utf8").trim().split("\n").map((l) => `<p>${esc(l.replace(/^- /, "")).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`).join("")}
<h2>Names resolved by hand</h2><ul>${Object.entries(ALIASES).map(([n, [iso, why]]) => `<li>"${esc(n)}" is ${esc(countries.get(iso).name)} (${iso}): ${esc(why)}.</li>`).join("")}${Object.entries(HISTORIC).map(([n, h]) => `<li>"${esc(n)}": ${esc(h.note)}.</li>`).join("")}</ul>
<h2>Not placed: ${fig("unmappedNames")} member names</h2><p>These are territories, regions, prose or states with no ISO code in the source. They stay in their organisations' records and are not drawn.</p>
<ul class="cols2">${[...unmapped.values()].sort((a, b) => a.name.localeCompare(b.name)).map((u) => `<li>${esc(u.name)} <span class="note">in ${u.orgs.length} record${u.orgs.length > 1 ? "s" : ""}</span></li>`).join("")}</ul>
<h2>Not threaded: ${fig("stillUnthreaded")} records</h2><p>Records with fewer than two placed members after filling; they are listed with their reason on the Organisations page.</p>
<h2>How to read a thread</h2><p>A thread visits its members' capitals from west to east (games: in hosting order). Its route and length are geography, not weight; only which countries it passes through is data. A knot's area is proportional to the threads through it.</p>
</div></section>`,
});

pages["404.html"] = page({ file: "404.html", title: "Not found · GeoPolitics", description: "Page not found.", body: `<section class="head"><div class="wrap"><p class="kicker">404</p><h1>This thread leads nowhere.</h1><p><a href="index.html">Back to the Weave</a></p></div></section>` });

// ---- write ----------------------------------------------------------------------------------------------------------
if (existsSync(out)) for (const f of readdirSync(out)) if (f.endsWith(".html")) rmSync(join(out, f));
mkdirSync(out, { recursive: true });
for (const [f, html] of Object.entries(pages)) writeFileSync(join(out, f), html);
for (const f of ["style.css", "favicon.svg"]) copyFileSync(join(here, f), join(out, f));
// Every thread once, with its own stroke (a <use> of an external file does not take the page's stylesheet).
writeFileSync(join(out, "threads.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs>${threaded.map((o) => `<path id="t-${o.id}" fill="none" stroke="${DOMAINS[o.domain].color}" stroke-width="${o.domain === "games" ? 1 : 1.3}"${o.domain === "games" ? ' stroke-opacity=".45"' : ""} stroke-linecap="round"${DOMAINS[o.domain].dash ? ` stroke-dasharray="${DOMAINS[o.domain].dash}"` : ""} d="${o.d}"/>`).join("")}</defs></svg>\n`);
// The map's base (sea, graticule, land) once, styled by the page's own stylesheet through <use>.
// A <use> of an external file does not take the page's stylesheet, so the base carries its own colours (measured: it
// rendered black with classes alone).
writeFileSync(join(out, "land.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><style>@media (forced-colors: active) { .sea { fill: Canvas } .lnd { fill: Canvas; stroke: CanvasText } }</style><g id="base"><path class="sea" fill="#e9e1d2" d="${outline}"/><path fill="none" stroke="#fbf8f2" stroke-width=".6" d="${graticule.join("")}"/><path class="lnd" fill="#ddd2bd" stroke="#c9bca3" stroke-width=".35" fill-rule="evenodd" d="${LAND}"/></g></svg>
`);
writeFileSync(join(out, "vercel.json"), JSON.stringify({ outputDirectory: "." }, null, 2) + "\n");
writeFileSync(join(out, "facts.json"), JSON.stringify({ built_from: `${REPO} data/ and data/sources/`, figures: FIG }, null, 2) + "\n");
const urls = Object.keys(pages).filter((f) => f !== "404.html").map((f) => `  <url><loc>${SITE}${f === "index.html" ? "" : f.replace(/\.html$/, "")}</loc></url>`);
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log(`built ${Object.keys(pages).length} pages · ${fig("threads")} threads · ${fig("countries")} countries · unmapped names ${fig("unmappedNames")} · filled ${fig("filledFromWikidata")} · unthreaded ${fig("stillUnthreaded")}`);
