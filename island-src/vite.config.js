import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  base: "/selina-portfolio/",
  server: { watch: { ignored: ["**/analysis/**"] } },
  build: {
    rollupOptions: {
      input: { en: resolve(import.meta.dirname, "index.html"), zh: resolve(import.meta.dirname, "zh/index.html") },
      output: { manualChunks: { three: ["three"] } },
    },
  },
});
