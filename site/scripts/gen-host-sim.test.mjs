import assert from "node:assert/strict";
import { test } from "node:test";
import { generateHostSimCss } from "./gen-host-sim.mjs";

const hosts = [
  {
    host: "crowdin-com",
    source: "window.cssVariables on crowdin.com",
    capturedAt: "2026-10-14",
    light: { "--crowdin-primary": "#262626", "--crowdin-level-2-bg": "#ffffff" },
    dark: { "--crowdin-primary": "#f4f4f4", "--crowdin-level-2-bg": "#1c1c1c" },
  },
  {
    host: "enterprise",
    source: "window.cssVariables on Crowdin Enterprise",
    capturedAt: "2026-10-14",
    light: { "--color-gray-800": "#262626", "--crowdin-primary": "var(--color-gray-800)" },
    dark: { "--color-gray-100": "#f4f4f4", "--crowdin-primary": "var(--color-gray-100)" },
  },
];

// The light block must not also apply under .dark, or dark mode would get the
// union of both maps instead of exactly what the host sends in dark mode.
test("emits a light block that excludes .dark and a dark block per host", () => {
  const css = generateHostSimCss(hosts);
  for (const host of ["crowdin-com", "enterprise"]) {
    assert.ok(css.includes(`[data-crowdin-host="${host}"]:not(.dark) {`), `${host} light block`);
    assert.ok(css.includes(`[data-crowdin-host="${host}"].dark {`), `${host} dark block`);
    assert.ok(!css.includes(`[data-crowdin-host="${host}"] {`), `${host} light block leaks into dark`);
  }
});

test("declares each captured variable verbatim, var() chains included", () => {
  const css = generateHostSimCss(hosts);
  assert.ok(css.includes("  --crowdin-primary: #262626;"));
  assert.ok(css.includes("  --crowdin-primary: #f4f4f4;"));
  assert.ok(css.includes("  --crowdin-primary: var(--color-gray-800);"));
  assert.ok(css.includes("  --color-gray-100: #f4f4f4;"));
});

test("records where each palette came from and warns against editing", () => {
  const css = generateHostSimCss(hosts);
  assert.ok(css.startsWith("/* generated from tests/hosts/*.json"));
  assert.ok(css.includes("/* crowdin-com: window.cssVariables on crowdin.com, captured 2026-10-14 */"));
});
