import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function generateThemeCss(registry) {
  const get = (name) => {
    const found = registry.items?.find((item) => item.name === name);
    if (!found) throw new Error(`registry item "${name}" not found`);
    return found;
  };
  const theme = get("theme");
  const style = get("style");
  const bridge = get("app-theme");

  const varDecls = (obj) =>
    Object.entries(obj)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join("\n");
  // Serializes the shadcn registry css-object convention: string values are
  // declarations, `{}` values are bare statements (e.g. "@apply ..."), nested
  // objects are nested rules. `@import` entries are skipped - the site's
  // index.css already imports those packages at the top of the file.
  const body = (obj, indent) =>
    Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === "string") return `${indent}${key}: ${value};`;
        if (Object.keys(value).length === 0) return `${indent}${key};`;
        return `${indent}${key} {\n${body(value, `${indent}  `)}\n${indent}}`;
      })
      .join("\n");
  const rules = (cssObj) =>
    Object.entries(cssObj)
      .filter(([selector]) => !selector.startsWith("@import"))
      .map(([selector, props]) => `${selector} {\n${body(props, "  ")}\n}`);

  const colorMappings = Object.keys(theme.cssVars.light)
    .filter((key) => key !== "radius")
    .map((key) => `  --color-${key}: var(--${key});`)
    .join("\n");

  return [
    "/* generated from registry.json by scripts/gen-theme.mjs - do not edit */",
    `@theme inline {\n${varDecls(theme.cssVars.theme)}\n${colorMappings}\n}`,
    `:root {\n${varDecls(theme.cssVars.light)}\n}`,
    `.dark {\n${varDecls(theme.cssVars.dark)}\n}`,
    ...rules(style.css),
    ...rules(bridge.css),
    "",
  ].join("\n\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const registry = JSON.parse(
    readFileSync(new URL("../../registry.json", import.meta.url), "utf8"),
  );
  const outDir = new URL("../src/generated/", import.meta.url);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(new URL("theme.css", outDir), generateThemeCss(registry));
  console.log("Wrote src/generated/theme.css");
}
