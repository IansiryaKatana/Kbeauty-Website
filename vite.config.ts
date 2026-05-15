import path from "node:path";
import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  optimizeDeps: {
    // Never pre-bundle react-start for the browser — it includes node:async_hooks.
    exclude: ["@tanstack/react-start"],
    // Pre-bundle deps that TanStack Start pulls in late (avoids 504 Outdated Optimize Dep).
    holdUntilCrawlEnd: true,
    include: [
      "@tanstack/react-router",
      "@tanstack/react-query",
      "@tanstack/router-core",
      "@tanstack/router-core/ssr/client",
      "seroval",
    ],
  },
  plugins: [
    tanstackStart({
      sitemap: { enabled: false },
    }),
    react(),
    tailwindcss(),
    netlify(),
  ],
});
