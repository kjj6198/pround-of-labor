import { defineConfig } from "vite-plus";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins:
    mode === "test"
      ? []
      : [
          tailwindcss(),
          cloudflare({ viteEnvironment: { name: "ssr" } }),
          tanstackStart({ prerender: { enabled: true, crawlLinks: false } }),
          react(),
        ],
  lint: {
    ignorePatterns: ["data/**", "src/routeTree.gen.ts", "dist/**", "public/**"],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: { ignorePatterns: ["data/**", "src/routeTree.gen.ts", "public/**", "package-lock.json"] },
  test: { include: ["tests/**/*.test.ts"] },
}));
