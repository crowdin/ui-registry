import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    // registry/src files live outside site/, so their bare imports must
    // resolve from site/node_modules rather than walking up the repo.
    dedupe: [
      "react",
      "react-dom",
      "radix-ui",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react",
      "sonner",
      "next-themes",
    ],
    alias: {
      "@/registry/new-york-v4/ui": r("../registry/src/ui"),
      "@/registry/new-york-v4/hooks": r("../registry/src/hooks"),
      "@/registry/new-york-v4/lib": r("../registry/src/lib"),
      "@/components/ui": r("../registry/src/ui"),
      "@/lib": r("../registry/src/lib"),
      "@/hooks": r("../registry/src/hooks"),
    },
  },
  server: { fs: { allow: [r("..")] } },
});
