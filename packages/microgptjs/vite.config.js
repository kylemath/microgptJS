import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MicroGPT',
      formats: ['es', 'cjs'],
      fileName: (format) => `microgptjs.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // No external deps — this is a zero-dependency library
    },
    sourcemap: true,
    minify: false, // Keep readable for educational purposes
  },
})
