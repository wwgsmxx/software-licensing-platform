import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "node",
  },
});

