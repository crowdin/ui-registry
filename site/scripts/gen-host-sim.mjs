import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Host palettes for the "Simulate host" control: exactly the variables each
// Crowdin host sends to app iframes (tests/hosts/*.json, captured by
// scripts/capture-host-vars.mjs), applied on <html> the way the app-theme
// bridge applies them - var() chains included, so they resolve like in the host.
export function generateHostSimCss(hosts) {
  const decls = (vars) =>
    Object.entries(vars)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n");
  return [
    "/* generated from tests/hosts/*.json by scripts/gen-host-sim.mjs - do not edit */",
    ...hosts.flatMap((host) => [
      `/* ${host.host}: ${host.source}, captured ${host.capturedAt} */`,
      `[data-crowdin-host="${host.host}"] {\n${decls(host.light)}\n}`,
      `[data-crowdin-host="${host.host}"].dark {\n${decls(host.dark)}\n}`,
    ]),
    "",
  ].join("\n\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = new URL("../../tests/hosts/", import.meta.url);
  const hosts = readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(new URL(file, dir), "utf8")));
  const outDir = new URL("../src/generated/", import.meta.url);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(new URL("host-sim.css", outDir), generateHostSimCss(hosts));
  console.log(`Wrote src/generated/host-sim.css (${hosts.map((h) => h.host).join(", ")})`);
}
