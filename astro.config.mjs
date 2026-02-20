import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    react()
  ],
  output: 'static',
  build: {
    assets: '_assets'
  },
  vite: {
    css: {
      postcss: './postcss.config.cjs'
    }
  }
});
