import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { generateThemeCss } from "./gen-theme.mjs";

const registry = JSON.parse(
  readFileSync(new URL("../../registry.json", import.meta.url), "utf8"),
);

test("generated css contains mappings, token blocks, style and bridge css", () => {
  const css = generateThemeCss(registry);
  for (const needle of [
    "@theme inline {",
    "--radius-sm: 4px;",
    "--color-background: var(--background);",
    "--color-sidebar-ring: var(--sidebar-ring);",
    ":root {",
    ".dark {",
    "scrollbar-width: thin;",
    "scrollbar-color: color-mix(in oklch, var(--muted-foreground) 30%, transparent) transparent;",
    ":root:root {",
    ":root:root.dark {",
    "--background: var(--crowdin-level-2-bg, oklch(1 0 0));",
    "@layer base {",
    "@apply border-border outline-ring/50;",
    "@apply bg-background text-foreground;",
  ]) {
    assert.ok(css.includes(needle), `missing: ${needle}`);
  }
});

test("style @import entries are not emitted into the generated file", () => {
  const css = generateThemeCss(registry);
  assert.ok(!css.includes("@import"), "generated css must not contain @import");
});

test("generator throws when a required item is missing", () => {
  assert.throws(() => generateThemeCss({ items: [] }), /not found/);
});
