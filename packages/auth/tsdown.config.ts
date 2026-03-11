import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: true,
  dts: true,
  deps: {
    alwaysBundle: ['@standard-schema/spec'],
  },
})
