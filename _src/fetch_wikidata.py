"""Fetch the GeoPolitics reference data from Wikidata (CC0) with read-only SPARQL queries.

    python _src/fetch_wikidata.py data/sources/wikidata [name ...]

Each result is saved as <dir>/<name>.json with the query text and the fetch time, so it can be re-fetched and
checked. A query that fails after three attempts is reported and skipped; the others still run. Standard library
plus curl (this machine's Python certificate store rejects the endpoint's chain; curl uses the operating system's).
"""
import datetime
import json
import pathlib
import subprocess
import sys
import time

ENDPOINT = "https://query.wikidata.org/sparql"
UA = "GeoPolitics-site-builder/1.0 (https://github.com/SolutionsAsService/GeoPolitics)"

QUERIES = {
    # Every current item with an ISO 3166-1 alpha-3 code (states and territories), with a point to place it: the
    # capital's coordinate, else the item's own; whether it is a sovereign state; continent; English aliases.
    "countries": """
SELECT ?item ?name ?iso3 ?isonum ?capitalName ?coord ?ownCoord ?continentName ?sovereign
       (GROUP_CONCAT(DISTINCT ?alt; separator="|") AS ?aliases) WHERE {
  ?item wdt:P298 ?iso3.
  FILTER NOT EXISTS { ?item wdt:P576 ?dissolved }
  BIND(EXISTS { ?item wdt:P31 wd:Q3624078 } AS ?sovereign)
  OPTIONAL { ?item wdt:P299 ?isonum }
  OPTIONAL { ?item wdt:P36 ?capital. ?capital wdt:P625 ?coord. ?capital rdfs:label ?capitalName. FILTER(LANG(?capitalName) = "en") }
  OPTIONAL { ?item wdt:P625 ?ownCoord }
  OPTIONAL { ?item wdt:P30 ?continent. ?continent rdfs:label ?continentName. FILTER(LANG(?continentName) = "en") }
  OPTIONAL { ?item skos:altLabel ?alt. FILTER(LANG(?alt) = "en") }
  ?item rdfs:label ?name. FILTER(LANG(?name) = "en")
} GROUP BY ?item ?name ?iso3 ?isonum ?capitalName ?coord ?ownCoord ?continentName ?sovereign
""",
    # Culture: official languages (P37) of every item with an ISO alpha-3 code.
    "languages": """
SELECT ?iso3 ?langLabel WHERE {
  ?country wdt:P298 ?iso3; wdt:P37 ?lang.
  FILTER NOT EXISTS { ?country wdt:P576 ?d }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
""",
    # Games: one query per series (a single UNION times out). Olympic editions are typed by edition classes
    # (Q135976384 Summer, Q137592217 Winter); World Cups are sports seasons of the FIFA World Cup (P3450 Q19317).
    "games_summer": """
SELECT ?event ?eventLabel ?year ?iso3 WHERE {
  ?event wdt:P31 wd:Q135976384; wdt:P17 ?country. ?country wdt:P298 ?iso3.
  OPTIONAL { ?event wdt:P580 ?start. }
  OPTIONAL { ?event wdt:P585 ?date. }
  BIND(YEAR(COALESCE(?start, ?date)) AS ?year)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
""",
    "games_winter": """
SELECT ?event ?eventLabel ?year ?iso3 WHERE {
  ?event wdt:P31 wd:Q137592217; wdt:P17 ?country. ?country wdt:P298 ?iso3.
  OPTIONAL { ?event wdt:P580 ?start. }
  OPTIONAL { ?event wdt:P585 ?date. }
  BIND(YEAR(COALESCE(?start, ?date)) AS ?year)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
""",
    "games_worldcup": """
SELECT ?event ?eventLabel ?year ?iso3 WHERE {
  ?event wdt:P3450 wd:Q19317; wdt:P17 ?country. ?country wdt:P298 ?iso3.
  OPTIONAL { ?event wdt:P580 ?start. }
  OPTIONAL { ?event wdt:P585 ?date. }
  BIND(YEAR(COALESCE(?start, ?date)) AS ?year)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
""",
    # Memberships: current member-of (P463) statements of items with an ISO alpha-3 code, to fill prose member lists.
    "memberships": """
SELECT ?org ?orgLabel ?orgShort ?iso3 WHERE {
  ?country wdt:P298 ?iso3; p:P463 ?st.
  ?st ps:P463 ?org.
  FILTER NOT EXISTS { ?st pq:P582 ?ended }
  OPTIONAL { ?org wdt:P1813 ?orgShort. FILTER(LANG(?orgShort) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
""",
    # Heritage total: distinct World Heritage Sites worldwide (a site in several countries counts once).
    "heritage_total": """
SELECT (COUNT(DISTINCT ?base) AS ?sites) WHERE {
  ?site wdt:P757 ?whs.
  BIND(REPLACE(STR(?whs), "^([0-9]+).*$", "$1") AS ?base)
}
""",
    # Heritage: UNESCO World Heritage Sites by country item, counted by base id (P757 \"1133-001\" is a component of site 1133).
    "heritage": """
SELECT ?country (COUNT(DISTINCT ?base) AS ?sites) WHERE {
  ?site wdt:P757 ?whs; wdt:P17 ?country.
  BIND(REPLACE(STR(?whs), "^([0-9]+).*$", "$1") AS ?base)
} GROUP BY ?country
""",
}


def run(name, query):
    for attempt in range(3):
        r = subprocess.run(["curl", "-sSf", "-G", ENDPOINT, "--data-urlencode", f"query={query}", "--data-urlencode", "format=json",
                            "-H", f"User-Agent: {UA}", "-H", "Accept: application/sparql-results+json", "--max-time", "180"],
                           capture_output=True)
        if r.returncode == 0:
            data = json.loads(r.stdout.decode("utf-8"))
            rows = [{k: v["value"] for k, v in b.items()} for b in data["results"]["bindings"]]
            return {"source": "Wikidata (CC0), https://query.wikidata.org/",
                    "fetched": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
                    "query": query.strip(), "rows": rows}
        print(f"{name}: attempt {attempt + 1} failed: {r.stderr.decode()[:160].strip()}", file=sys.stderr)
        time.sleep(60 * (attempt + 1))
    return None


def main(out, only=()):
    out = pathlib.Path(out)
    out.mkdir(parents=True, exist_ok=True)
    failed = []
    for name, q in QUERIES.items():
        if only and name not in only:
            continue
        res = run(name, q)
        if res is None:
            failed.append(name)
            print(f"{name}: FAILED after three attempts")
        else:
            (out / f"{name}.json").write_bytes(json.dumps(res, ensure_ascii=False, indent=1).encode("utf-8"))
            print(f"{name}: {len(res['rows'])} rows")
        time.sleep(15)
    if failed:
        raise SystemExit(f"failed: {failed}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
