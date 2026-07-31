import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { getRegistryItems } from "shadcn/registry";
import { localPathFor, toRegistryEntry } from "./lib.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const registryDir = join(root, "registry");
const manifest = JSON.parse(
  await readFile(join(root, "scripts/upstream-items.json"), "utf8"),
);

const items = await getRegistryItems(manifest.items, { useCache: false });
const returned = new Set((items ?? []).filter(Boolean).map((item) => item.name));
const missing = manifest.items.filter((name) => !returned.has(name));
if (missing.length > 0) {
  console.error(`Upstream items not found: ${missing.join(", ")}`);
  process.exit(1);
}

for (const dir of ["src/ui", "src/hooks", "src/lib"]) {
  await rm(join(registryDir, dir), { recursive: true, force: true });
  await mkdir(join(registryDir, dir), { recursive: true });
}

const entries = [];
for (const item of items) {
  for (const file of item.files ?? []) {
    if (typeof file.content !== "string" || file.content.length === 0) {
      console.error(`Empty content for ${item.name}: ${file.path}`);
      process.exit(1);
    }
    await writeFile(join(registryDir, localPathFor(file)), file.content);
  }
  entries.push(toRegistryEntry(item));
}
entries.sort((a, b) => a.name.localeCompare(b.name));

const registry = { items: entries };
await writeFile(
  join(registryDir, "registry.json"),
  `${JSON.stringify(registry, null, 2)}\n`,
);
console.log(`Synced ${entries.length} upstream items.`);
