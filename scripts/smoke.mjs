import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const rDir = join(root, "r");
if (!existsSync(join(rDir, "registry.json"))) {
  console.error("r/ not found - run `pnpm build` first.");
  process.exit(1);
}

const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = normalize(join(rDir, pathname));
  if ((file !== rDir && !file.startsWith(rDir + sep)) || !existsSync(file)) {
    res.statusCode = 404;
    res.end("{}");
    return;
  }
  res.setHeader("content-type", "application/json");
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;

const dir = await mkdtemp(join(tmpdir(), "crowdin-registry-smoke-"));
await cp(join(root, "tests/fixture"), dir, { recursive: true });
const componentsJson = await readFile(join(dir, "components.json"), "utf8");
await writeFile(
  join(dir, "components.json"),
  componentsJson.replace("PORT", String(port)),
);

const shell = process.platform === "win32";
const run = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn("pnpm", args, { cwd: dir, stdio: "inherit", shell });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `pnpm ${args.join(" ")} exited with code ${code}${signal ? ` (signal ${signal})` : ""}`,
          ),
        );
      }
    });
  });

await run(["install"]);
const index = JSON.parse(readFileSync(join(rDir, "registry.json"), "utf8"));
const names = index.items.map((item) => `@crowdin/${item.name}`);
await run(["exec", "shadcn", "add", ...names, "--yes", "--overwrite"]);

// The app-theme bridge sources must actually land in the fixture - if the
// CLI skipped a registry:item's files, tsc below would still pass vacuously.
for (const file of ["src/lib/crowdin-host.ts", "src/hooks/use-crowdin-theme.ts"]) {
  if (!existsSync(join(dir, file))) {
    console.error(`app-theme bridge file missing after install: ${file}`);
    process.exit(1);
  }
}

await run(["exec", "tsc", "--noEmit"]);

// Re-adding a component re-applies @crowdin/theme into :root; the app-theme
// bridge lives under :root:root and must survive untouched. The expected
// declarations come from the source registry so value updates stay in sync.
await run(["exec", "shadcn", "add", "@crowdin/button", "--yes", "--overwrite"]);
const source = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));
const bridgeCss = source.items.find((item) => item.name === "app-theme").css;
const indexCss = await readFile(join(dir, "src/index.css"), "utf8");
for (const snippet of [
  ":root:root",
  ":root:root.dark",
  `--background: ${bridgeCss[":root:root"]["--background"]}`,
  `--background: ${bridgeCss[":root:root.dark"]["--background"]}`,
  "@apply border-border outline-ring/50",
  "@apply bg-background text-foreground",
]) {
  if (!indexCss.includes(snippet)) {
    console.error(`Bridge CSS missing after component re-add: ${snippet}`);
    process.exit(1);
  }
}

// The fixture css already imports tw-animate-css and shadcn/tailwind.css;
// installing @crowdin/style (which also carries those imports) must not
// duplicate them - a second @import after other rules is invalid CSS.
for (const imp of ['@import "tw-animate-css"', '@import "shadcn/tailwind.css"']) {
  const count = indexCss.split(imp).length - 1;
  if (count !== 1) {
    console.error(`Expected exactly one ${imp} in index.css, found ${count}.`);
    process.exit(1);
  }
}

// The theme's plain values must make the CLI emit --color-* mappings, so
// token utilities actually generate CSS.
await writeFile(
  join(dir, "src/probe.tsx"),
  'export const probe = "bg-background bg-primary bg-sidebar text-foreground border-border";\n',
);
await run(["exec", "tailwindcss", "-i", "src/index.css", "-o", "dist.css"]);
const compiled = await readFile(join(dir, "dist.css"), "utf8");
for (const cls of [
  "bg-background",
  "bg-primary",
  "bg-sidebar",
  "text-foreground",
  "border-border",
]) {
  if (!compiled.includes(`.${cls}`)) {
    console.error(`Utility .${cls} missing from compiled CSS - theme mappings broken.`);
    process.exit(1);
  }
}

// The base layer must neutralize Tailwind v4's currentColor border default,
// or every bare `border` class renders near-black.
if (!/\*[^{]*\{[^}]*border-color:\s*var\(--border\)/.test(compiled)) {
  console.error("Universal border-color: var(--border) rule missing from compiled CSS.");
  process.exit(1);
}

server.close();
console.log(
  `Smoke OK: installed ${names.length} items, typechecked, and verified compiled CSS.`,
);
