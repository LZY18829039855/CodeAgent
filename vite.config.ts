import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/client',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/client', import.meta.url)),
    },
  },
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
});
