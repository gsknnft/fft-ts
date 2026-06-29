import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import ts from "./tsconfig.json" with { type: "json" };

const externalDeps = [
  "os", "http", "https", "zlib", "stream", "path", "util", "fs", "constants",
  "events", "buffer", "crypto", "child_process", "readline",
];

const tsPaths =
  ts.compilerOptions && "paths" in ts.compilerOptions && ts.compilerOptions.paths
    ? Object.keys(ts.compilerOptions.paths).map((key) => key.replace("/*", ""))
    : [];

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: () => "index.js",
    },
    outDir: "dist",
    rollupOptions: {
      external: [...externalDeps, ...tsPaths],
    },
  },
});
