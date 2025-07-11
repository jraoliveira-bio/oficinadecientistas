// astro.config.mjs
import { defineConfig } from 'astro/config';
import path from 'path';
import { fileURLToPath } from 'url';

import mdx from '@astrojs/mdx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/oficinadecientistas/',

  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },

  integrations: [mdx()],
});