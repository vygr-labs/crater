import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 7171,
    strictPort: true,
    host: '127.0.0.1', // Explicitly bind to localhost
  },
  build: {
    target: 'esnext',
    outDir: path.resolve(__dirname, '../../../../dist/remote-web'),
    emptyOutDir: true,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'solid': ['solid-js'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
