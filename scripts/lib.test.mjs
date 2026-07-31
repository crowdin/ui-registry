import assert from "node:assert/strict";
import { test } from "node:test";
import { localPathFor, rewriteRegistryDependency, toRegistryEntry } from "./lib.mjs";

test("bare registry dependency is namespaced", () => {
  assert.equal(rewriteRegistryDependency("button"), "@crowdin/button");
});

test("namespaced, URL, and path dependencies pass through", () => {
  assert.equal(rewriteRegistryDependency("@crowdin/theme"), "@crowdin/theme");
  assert.equal(
    rewriteRegistryDependency("https://example.com/r/x.json"),
    "https://example.com/r/x.json",
  );
  assert.equal(rewriteRegistryDependency("acme/ui/button#v1"), "acme/ui/button#v1");
});

test("files map into src/ by type", () => {
  assert.equal(
    localPathFor({ path: "registry/new-york-v4/ui/button.tsx", type: "registry:ui" }),
    "src/ui/button.tsx",
  );
  assert.equal(
    localPathFor({ path: "registry/new-york-v4/hooks/use-mobile.ts", type: "registry:hook" }),
    "src/hooks/use-mobile.ts",
  );
  assert.equal(
    localPathFor({ path: "registry/new-york-v4/lib/utils.ts", type: "registry:lib" }),
    "src/lib/utils.ts",
  );
});

test("unsupported file type throws", () => {
  assert.throws(() => localPathFor({ path: "x/page.tsx", type: "registry:page" }));
});

test("registry entry gets theme dependency, local paths, no content", () => {
  const entry = toRegistryEntry({
    name: "sidebar",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: ["button", "@crowdin/theme"],
    files: [
      { path: "registry/new-york-v4/ui/sidebar.tsx", type: "registry:ui", content: "code" },
      { path: "registry/new-york-v4/hooks/use-mobile.ts", type: "registry:hook", content: "code" },
    ],
    cssVars: { light: { "sidebar-width": "16rem" } },
  });
  assert.equal(entry.name, "sidebar");
  assert.equal(entry.type, "registry:ui");
  assert.deepEqual(entry.dependencies, ["radix-ui"]);
  assert.deepEqual(entry.registryDependencies, ["@crowdin/button", "@crowdin/theme"]);
  assert.deepEqual(entry.files, [
    { path: "src/ui/sidebar.tsx", type: "registry:ui" },
    { path: "src/hooks/use-mobile.ts", type: "registry:hook" },
  ]);
  assert.equal("cssVars" in entry, false);
  assert.equal("content" in entry.files[0], false);
});

test("theme dependency is added even when the item has no registry dependencies", () => {
  const entry = toRegistryEntry({
    name: "utils",
    type: "registry:lib",
    dependencies: ["clsx", "tailwind-merge"],
    files: [{ path: "registry/new-york-v4/lib/utils.ts", type: "registry:lib", content: "code" }],
  });
  assert.deepEqual(entry.registryDependencies, ["@crowdin/theme"]);
});
