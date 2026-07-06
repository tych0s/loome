import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the same build works at /current/ and /v/<version>/.
  base: "./",
  build: {
    outDir: "dist",
  },
});
