import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const registry = JSON.parse(
  readFileSync(new URL("../registry.json", import.meta.url), "utf8"),
);
const theme = registry.items.find((item) => item.name === "theme");

test("theme values are plain (no var() indirection, no !important)", () => {
  for (const section of ["theme", "light", "dark"]) {
    for (const [token, value] of Object.entries(theme.cssVars[section])) {
      assert.ok(!value.includes("var("), `${section}.${token} uses var()`);
      assert.ok(
        !value.includes("!important"),
        `${section}.${token} uses !important`,
      );
    }
  }
});

const style = registry.items.find((item) => item.name === "style");

// Tailwind v4 preflight defaults border-color to currentColor; upstream's
// style item neutralizes that with these base styles. Without them every
// bare `border` class (outline buttons, cards, toggles) renders near-black.
test("style ships the upstream base styles and their imports", () => {
  assert.deepEqual(style.css["@layer base"], {
    "*": { "@apply border-border outline-ring/50": {} },
    body: { "@apply bg-background text-foreground": {} },
  });
  assert.deepEqual(style.css['@import "tw-animate-css"'], {});
  assert.deepEqual(style.css['@import "shadcn/tailwind.css"'], {});
  for (const pkg of ["tw-animate-css", "shadcn"]) {
    assert.ok(
      style.devDependencies.includes(pkg),
      `style must declare ${pkg} so its @import resolves in consumer builds`,
    );
  }
});

const bridge = registry.items.find((item) => item.name === "app-theme");

const MAPPED_TOKENS = [
  "background", "foreground", "card", "card-foreground", "popover",
  "popover-foreground", "primary", "primary-foreground", "secondary",
  "secondary-foreground", "muted", "muted-foreground", "accent",
  "accent-foreground", "destructive", "border", "input", "ring",
  "sidebar", "sidebar-foreground", "sidebar-primary",
  "sidebar-primary-foreground", "sidebar-accent",
  "sidebar-accent-foreground", "sidebar-border", "sidebar-ring",
];
const BRIDGE_VALUE = /^var\((--crowdin-[a-z0-9-]+), (.+)\)$/;
const MODES = [
  { selector: ":root:root", cssVars: "light" },
  { selector: ":root:root.dark", cssVars: "dark" },
];

test("bridge maps exactly the expected tokens in both modes", () => {
  assert.ok(bridge, "app-theme item is missing");
  for (const { selector } of MODES) {
    const block = bridge.css?.[selector];
    assert.ok(block, `missing css block ${selector}`);
    assert.deepEqual(
      Object.keys(block).sort(),
      MAPPED_TOKENS.map((token) => `--${token}`).sort(),
    );
  }
});

test("bridge values read a host variable with the canonical fallback", () => {
  for (const { selector, cssVars } of MODES) {
    for (const [prop, value] of Object.entries(bridge.css[selector])) {
      const match = value.match(BRIDGE_VALUE);
      assert.ok(
        match,
        `${selector} ${prop}: "${value}" is not var(--crowdin-*, fallback)`,
      );
      const token = prop.replace(/^--/, "");
      assert.equal(
        match[2],
        theme.cssVars[cssVars][token],
        `${selector} ${prop} fallback drifted from theme ${cssVars} value`,
      );
    }
  }
});

// Note: tokens sharing a host variable do NOT always share a fallback - the
// apps SDK theme (the ground truth) gives --crowdin-level-2-bg different
// fallbacks for background vs popover in dark mode, and --crowdin-gray-005
// different fallbacks for muted vs accent in light mode. Inside the host all
// aliases of a variable resolve identically; only local-dev fallbacks differ.
// The per-token "fallback equals the theme value" test above is the invariant.

test("app-theme ships the host bridge sources", () => {
  assert.deepEqual(bridge.files, [
    { path: "registry/crowdin/crowdin-host.ts", type: "registry:lib" },
    { path: "registry/crowdin/use-crowdin-theme.ts", type: "registry:hook" },
  ]);
});

test("each token reads the same host variable in both modes", () => {
  for (const prop of Object.keys(bridge.css[":root:root"])) {
    const light = bridge.css[":root:root"][prop].match(BRIDGE_VALUE)[1];
    const dark = bridge.css[":root:root.dark"][prop].match(BRIDGE_VALUE)[1];
    assert.equal(light, dark, `${prop} reads different host variables per mode`);
  }
});

const HOST_VAR_BY_TOKEN = {
  "background": "--crowdin-level-2-bg",
  "foreground": "--crowdin-body-color",
  "card": "--crowdin-level-3-bg",
  "card-foreground": "--crowdin-body-color",
  "popover": "--crowdin-level-2-bg",
  "popover-foreground": "--crowdin-body-color",
  "primary": "--crowdin-primary",
  "primary-foreground": "--crowdin-primary-btn-color",
  "secondary": "--crowdin-gray-01",
  "secondary-foreground": "--crowdin-body-color",
  "muted": "--crowdin-gray-005",
  "muted-foreground": "--crowdin-text-muted",
  "accent": "--crowdin-gray-005",
  "accent-foreground": "--crowdin-body-color",
  "destructive": "--crowdin-danger",
  "border": "--crowdin-border-color",
  "input": "--crowdin-border-color",
  "ring": "--crowdin-primary",
  "sidebar": "--crowdin-level-0-bg",
  "sidebar-foreground": "--crowdin-body-color",
  "sidebar-primary": "--crowdin-primary",
  "sidebar-primary-foreground": "--crowdin-primary-btn-color",
  "sidebar-accent": "--crowdin-gray-005",
  "sidebar-accent-foreground": "--crowdin-body-color",
  "sidebar-border": "--crowdin-border-color",
  "sidebar-ring": "--crowdin-primary",
};

test("each token reads its canonical host variable", () => {
  for (const { selector } of MODES) {
    for (const [prop, value] of Object.entries(bridge.css[selector])) {
      const [, hostVar] = value.match(BRIDGE_VALUE);
      assert.equal(
        hostVar,
        HOST_VAR_BY_TOKEN[prop.replace(/^--/, "")],
        `${selector} ${prop} reads the wrong host variable`,
      );
    }
  }
});
