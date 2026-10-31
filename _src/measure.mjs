// Renders every page of site/ in headless Chrome (DevTools protocol, device-metric emulation, no crop) and writes
// measurements and screenshots for the panel. `node _src/measure.mjs [outDir]`. No dependencies.
// `node _src/measure.mjs --selftest` runs every probe on a page built to fail each one, and exits non-zero if any
// probe passes it: a probe that has never failed has not been tested (an inverted 2.5.8 filter once reported 0).
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const SELFTEST = process.argv.includes("--selftest");
const outDir = SELFTEST ? join(here, "..", ".dada", "selftest") : process.argv[2] ?? join(here, "..", ".dada", "measure");
mkdirSync(outDir, { recursive: true });
const site = SELFTEST ? outDir : join(here, "..", "site");
if (SELFTEST) {
  // One page that fails every probe: sideways overflow, low-contrast text, two 16 px targets 18 px apart, a [hidden]
  // element an author rule shows, a 9 px label, and a hero taller than the first screen.
  writeFileSync(join(site, "index.html"), `<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>
body{margin:0;background:#fff;color:#000}.wide{width:1600px;height:10px}.low{color:#ddd}.t{display:inline-block;width:16px;height:16px;background:#00f;margin-right:2px}
.shown{display:block}.tiny{font-size:9px}.hero .wrap{display:block}.hero h1{height:2000px;margin:0}
</style></head><body><section class="hero"><div class="wrap"><h1>Tall hero</h1><p class="what">x</p><ol class="relay"><li>x</li></ol><p class="legend">x</p></div></section>
<div class="wide"></div><p class="low">Low contrast text</p><a class="t" href="#a"></a><a class="t" href="#b"></a>
<div class="shown" hidden>should be hidden</div><p class="tiny">tiny label</p></body></html>`);
}
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
const PAGES = SELFTEST ? ["index.html"] : ["index.html", "politics.html", "economics.html", "defence.html", "culture.html", "games.html", "history.html", "heritage.html", "countries.html", "organisations.html", "data.html", "404.html", "country-fra.html", "country-mhl.html", "country-grl.html"].filter((f) => existsSync(join(site, f)));
const SIZES = SELFTEST ? [[375, 812]] : [[1280, 800], [375, 812]];
const TYPES = { ".html": "text/html", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };

const server = createServer((req, res) => {
  const p = join(site, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/$/, "/index.html"));
  if (!existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(p)] ?? "application/octet-stream" }).end(readFileSync(p));
}).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}/`;

const profile = join(outDir, ".chrome-profile");
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--hide-scrollbars", "--window-size=1280,900", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((resolve, reject) => {
  let buf = "";
  chrome.stderr.on("data", (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  });
  setTimeout(() => reject(new Error("chrome did not start")), 20000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method) events.push(m);
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const s = (m, p) => send(m, p, sessionId);
await s("Page.enable");
await s("Runtime.enable");

// Runs in the page: overflow, the hero's full box, small targets, text contrast, hidden-attribute state.
const probe = `(() => {
  const vw = innerWidth, vh = innerHeight;
  const lum = (c) => { const v = c.match(/[\\d.]+/g).slice(0,3).map(Number).map(x => { x/=255; return x <= .03928 ? x/12.92 : ((x+.055)/1.055)**2.4; }); return .2126*v[0]+.7152*v[1]+.0722*v[2]; };
  const alpha = (c) => { const m = c.match(/[\\d.]+/g); return m.length > 3 ? Number(m[3]) : 1; };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const b = getComputedStyle(e).backgroundColor; if (alpha(b) > .5) return b; } return "rgb(0,0,0)"; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  const out = { vw, vh, scrollWidth: document.documentElement.scrollWidth, overflowX: document.documentElement.scrollWidth - vw };
  const hero = document.querySelector(".hero .wrap");
  if (hero) {
    const parts = ["h1", ".how", ".map", ".tiles", ".relay", ".legend"].map((q) => hero.querySelector(q)).filter(Boolean);
    const boxes = parts.map((p) => p.getBoundingClientRect());
    out.hero = { top: Math.round(Math.min(...boxes.map(b => b.top))), bottom: Math.round(Math.max(...boxes.map(b => b.bottom))), right: Math.round(Math.max(...boxes.map(b => b.right))), parts: Object.fromEntries(parts.map((p, i) => [p.tagName === "H1" ? "h1" : p.className, [Math.round(boxes[i].top), Math.round(boxes[i].bottom)]])) };
    out.hero.complete = out.hero.bottom <= vh && out.hero.right <= vw;
    out.relayOverflow = [...document.querySelectorAll(".stage a")].map(a => a.scrollWidth - a.clientWidth).filter(x => x > 0).length;
  }
  const targets = [...document.querySelectorAll("a, button")].filter(a => a.offsetParent).map(a => { const r = a.getBoundingClientRect(); return { t: (a.textContent.trim() || a.getAttribute("title") || a.className).slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), cx: r.left + r.width/2, cy: r.top + r.height/2, inline: getComputedStyle(a).display === "inline" && a.closest("p, li, dd, td") !== null }; });
  out.smallTargets = targets.filter(t => !t.inline && (t.w < 24 || t.h < 24)).filter(t => targets.some(o => o !== t && Math.hypot(o.cx - t.cx, o.cy - t.cy) < 24)).map(t => t.t + " " + t.w + "x" + t.h);
  const lows = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    const el = n.parentElement; if (!n.textContent.trim() || !el.offsetParent || el.closest(".sr")) continue;
    const cs = getComputedStyle(el); if (cs.color.includes("0, 0, 0, 0") || cs.webkitTextFillColor === "rgba(0, 0, 0, 0)") continue;
    const r = ratio(cs.color, bgOf(el)); const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700);
    if (r < (big ? 3 : 4.5)) lows.push(n.textContent.trim().slice(0, 30) + " " + r.toFixed(2));
  }
  out.lowContrast = [...new Set(lows)].slice(0, 20);
  out.hiddenShown = [...document.querySelectorAll("[hidden]")].filter(e => getComputedStyle(e).display !== "none").length;
  out.belowFold = (document.elementFromPoint(vw / 2, Math.min(vh - 30, document.documentElement.scrollHeight - 1))?.closest("section,header,footer")?.className) || "?";
  out.weight = performance.getEntriesByType("resource").reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) + (performance.getEntriesByType("navigation")[0]?.encodedBodySize || 0);
  out.smallestText = Math.min(...[...document.querySelectorAll("body *")].filter(e => e.offsetParent && [...e.childNodes].some(c => c.nodeType === 3 && c.textContent.trim())).map(e => parseFloat(getComputedStyle(e).fontSize)));
  return out;
})()`;

const results = {};
for (const [w, h] of SIZES) {
  await s("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  for (const p of PAGES) {
    await s("Page.navigate", { url: base + p });
    await new Promise((r) => setTimeout(r, 700));
    const { result } = await s("Runtime.evaluate", { expression: probe.replace("vw = innerWidth, vh = innerHeight", `vw = ${w}, vh = ${h}`) /* the emulated device, not a zoomed-out layout viewport */, returnByValue: true });
    results[`${p}@${w}`] = result.value;
    if (p === "index.html" || w === 1280) {
      const shot = await s("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
      writeFileSync(join(outDir, `${p.replace(".html", "")}-${w}.png`), Buffer.from(shot.data, "base64"));
    }
  }
}
if (!SELFTEST) {
  // Forced colours (Windows High Contrast): the cues colour and shadows carry must survive (Mace, run 2 R0).
  await s("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await s("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }, { name: "prefers-reduced-motion", value: "reduce" }] });
  for (const p of ["index.html", "countries.html"]) {
    await s("Page.navigate", { url: base + p });
    await new Promise((r) => setTimeout(r, 700));
    const shot = await s("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1280, height: 800, scale: 1 } });
    writeFileSync(join(outDir, `${p.replace(".html", "")}-1280-forced.png`), Buffer.from(shot.data, "base64"));
  }
  await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  // The social card: the landing's own first screen at 1200 x 630 (Landing run: the card must match the first screen).
  await s("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await s("Page.navigate", { url: base + "index.html" });
  await new Promise((r) => setTimeout(r, 700));
  const og = await s("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
  writeFileSync(join(site, "og.png"), Buffer.from(og.data, "base64"));
}
writeFileSync(join(outDir, "measure.json"), JSON.stringify(results, null, 2));
const summary = Object.entries(results).map(([k, v]) => `${k.padEnd(18)} overflowX=${v.overflowX} hero=${v.hero ? `${v.hero.top}-${v.hero.bottom}/${v.vh} complete=${v.hero.complete}` : "-"} small=${v.smallTargets.length} lowContrast=${v.lowContrast.length} hiddenShown=${v.hiddenShown} minText=${v.smallestText} kb=${Math.round(v.weight / 1024)} atFold=${v.belowFold}`);
console.log(summary.join("\n"));
ws.close();
chrome.kill();
server.close();
if (SELFTEST) {
  const v = results["index.html@375"];
  const caught = {
    overflow: v.overflowX > 0,
    contrast: v.lowContrast.length > 0,
    targets: v.smallTargets.length > 0,
    hidden: v.hiddenShown > 0,
    smallestText: v.smallestText < 12,
    firstScreen: v.hero && !v.hero.complete,
  };
  console.log("selftest:", JSON.stringify(caught));
  if (Object.values(caught).includes(false)) process.exit(1);
}
