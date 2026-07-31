const DIR_BY_TYPE = {
  "registry:ui": "src/ui",
  "registry:component": "src/ui",
  "registry:hook": "src/hooks",
  "registry:lib": "src/lib",
};

export function rewriteRegistryDependency(dep) {
  if (dep.startsWith("@") || dep.includes("/")) return dep;
  return `@crowdin/${dep}`;
}

export function localPathFor(file) {
  const dir = DIR_BY_TYPE[file.type];
  if (!dir) throw new Error(`Unsupported file type "${file.type}" for ${file.path}`);
  return `${dir}/${file.path.split("/").pop()}`;
}

export function toRegistryEntry(item) {
  const rewritten = (item.registryDependencies ?? []).map(rewriteRegistryDependency);
  const entry = { name: item.name, type: item.type };
  if (item.title) entry.title = item.title;
  if (item.description) entry.description = item.description;
  if (item.dependencies?.length) entry.dependencies = item.dependencies;
  if (item.devDependencies?.length) entry.devDependencies = item.devDependencies;
  entry.registryDependencies = [...new Set([...rewritten, "@crowdin/theme"])];
  entry.files = (item.files ?? []).map((file) => ({
    path: localPathFor(file),
    type: file.type,
  }));
  if (item.css && Object.keys(item.css).length) entry.css = item.css;
  return entry;
}
