import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/client/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  noExternal: ['hono'],
  clean: true,
})
