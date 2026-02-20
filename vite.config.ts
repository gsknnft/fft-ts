import { defineConfig } from "vite";
import path from "path";
import ts from "./tsconfig.json";

const externalDeps = [
  "os", "http", "https", "zlib", "stream", "path", "util", "fs", "constants",
  "events", "buffer", "crypto", "child_process", "readline",
];

const tsPaths =
  ts.compilerOptions && "paths" in ts.compilerOptions && ts.compilerOptions.paths
    ? Object.keys(ts.compilerOptions.paths).map(key => key.replace("/*", ""))
    : [];

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "fft_ts",
      formats: ["es", "cjs", "umd", "iife", "system"],
      fileName: (format, name) => {
        if (format === "es") return "index.js";
        if (format === "cjs") return "index.cjs";
        if (format === "umd") return "index.umd.js";
        if (format === "iife") return "index.iife.js";
        if (format === "system") return "index.system.js";
        return `index.${format}.js`;
      }
    },
    outDir: "dist",
    rollupOptions: {
      external: [...externalDeps, ...tsPaths],
    },
  },
});