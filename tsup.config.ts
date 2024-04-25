import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/react/index.ts', 'src/withAuth.ts', 'src/withAuthEdge.ts', 'src/types.ts'], // Entry point for your library
  format: ['cjs', 'esm'], // Output formats (CommonJS and ES module)
  sourcemap: false, // Generate source maps
  clean: true, // Clean the output directory before building
  dts: true, // Generate TypeScript declaration files
  external: ['jose', 'bcrypt', 'zod', 'next', 'react'], // External dependency to exclude from bundling
  outDir: 'dist', // Output directory
  treeshake: false, // Remove unused code

  splitting: false,
  bundle: true,
})
