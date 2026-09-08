import { defineConfig } from "vite-plus";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH || "/",
  plugins:
    mode === "test"
      ? []
      : [
          tailwindcss(),
          tanstackStart({ prerender: { enabled: true, crawlLinks: false } }),
          nitro({ preset: "node-server" }),
          react(),
        ],
  lint: {
    ignorePatterns: ["data/**", "src/routeTree.gen.ts", "dist/**", "public/**"],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: { ignorePatterns: ["data/**", "src/routeTree.gen.ts", "public/**", "package-lock.json"] },
  test: { include: ["tests/**/*.test.ts"] },
}));
