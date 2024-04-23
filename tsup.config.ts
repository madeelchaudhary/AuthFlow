import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/react/index.ts",
    "src/withAuth.ts",
    "src/withAuthEdge.ts",
    "src/types.ts",
  ], // Entry point for your library
  format: ["cjs", "esm"], // Output formats (CommonJS and ES module)
  sourcemap: true, // Generate source maps
  clean: true, // Clean the output directory before building
  dts: true, // Generate TypeScript declaration files
  external: [
    "jose",
    "bcrypt",
    "zod",
    "next",
    "react",
    "react-dom",
    "react/jsx-runtime",
  ], // External dependency to exclude from bundling
  outDir: "dist", // Output directory
  treeshake: true, // Remove unused code
  splitting: true, // Enable code splitting
  skipNodeModulesBundle: true, // Skip bundling node_modules
});
