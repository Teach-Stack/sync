import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  deps: {
    // alwaysBundle: ['hono/client', 'hono/utils/http-status'],
  },
  sourcemap: true,
})
