// Captures the CSS variables a Crowdin host sends to app iframes through
// AP.getCssVariables, trimmed to the host variables the app-theme bridge reads
// plus every variable those values reference (the hosts send var() chains).
// Input is the host's generated css-variables.js, which defines
// window.cssVariables = { light: {...}, dark: {...} }:
//
//   frontend (crowdin.com):   www/js/css-variables.js   (built by scripts/scss.js)
//   enterprise-frontend:      public/css-variables.js   (npm run collect-css-variables)
//
//   node scripts/capture-host-vars.mjs crowdin-com ../frontend/www/js/css-variables.js
//   node scripts/capture-host-vars.mjs enterprise  ../enterprise-frontend/public/css-variables.js
//
// Writes tests/hosts/<name>.json. The fixtures pin what the hosts send, so the
// registry tests catch a bridge that reads a variable no host provides, and the
// showcase simulates hosts with their real palettes.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import vm from "node:vm";

const [name, file] = process.argv.slice(2);
if (!name || !file) {
  console.error("usage: node scripts/capture-host-vars.mjs <host-name> <path/to/css-variables.js>");
  process.exit(1);
}

const registry = JSON.parse(
  readFileSync(new URL("../registry.json", import.meta.url), "utf8"),
);
const bridge = registry.items.find((item) => item.name === "app-theme").css;
const bridged = new Set();
for (const block of Object.values(bridge)) {
  for (const value of Object.values(block)) {
    const match = value.match(/^var\((--crowdin-[a-z0-9-]+)/);
    if (match) bridged.add(match[1]);
  }
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(readFileSync(file, "utf8"), context);
const maps = context.window.cssVariables;
if (!maps?.light || !maps?.dark) {
  console.error(`${file} does not define window.cssVariables.light/dark`);
  process.exit(1);
}

// Mirrors the passthrough in registry/crowdin/crowdin-host.ts: only these
// prefixes reach the app's <html>, anything else a chain references is lost.
const PASSTHROUGH = /^--(crowdin|color)-/;

function closure(map) {
  const out = {};
  const queue = [...bridged];
  while (queue.length) {
    const key = queue.shift();
    if (key in out || !(key in map) || !PASSTHROUGH.test(key)) continue;
    out[key] = map[key];
    for (const ref of map[key].matchAll(/var\((--[a-zA-Z0-9_-]+)/g)) queue.push(ref[1]);
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

const fixture = {
  host: name,
  source: relative(process.cwd(), file),
  capturedAt: new Date().toISOString().slice(0, 10),
  light: closure(maps.light),
  dark: closure(maps.dark),
};

const outDir = new URL("../tests/hosts/", import.meta.url);
mkdirSync(outDir, { recursive: true });
const outFile = new URL(`${name}.json`, outDir);
writeFileSync(outFile, `${JSON.stringify(fixture, null, 2)}\n`);
const missing = [...bridged].filter((key) => !(key in fixture.light) || !(key in fixture.dark));
console.log(`Wrote tests/hosts/${name}.json (${Object.keys(fixture.light).length} light, ${Object.keys(fixture.dark).length} dark variables)`);
if (missing.length) console.log(`  not sent by this host: ${missing.join(", ")}`);
