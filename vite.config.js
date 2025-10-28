import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [viteSingleFile()],
  root: 'src',
  build: {
    outDir: '../build',
    emptyOutDir: true,
    minify: false, // Keep output readable
    assetsInlineLimit: 100000000, // 100MB - inline everything
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
