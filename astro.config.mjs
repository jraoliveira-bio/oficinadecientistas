import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeCitations from './src/plugins/rehype-citations.mjs';

// 🔧 Alias robusto pro Windows
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Opcional: se já tiver um resolver de bibliografia, declare aqui:
// import bib from './src/data/bib.json' assert { type: 'json' };
// const resolveBib = (key) => ({ text: bib[key] ?? key });

// https://astro.build/config
export default defineConfig({
  site: 'https://jraoliveira-bio.github.io',
  base: '/oficinadecientistas',
  output: 'static',

  // .md
  markdown: {
    rehypePlugins: [
      // [rehypeCitations, { resolve: resolveBib }],
      rehypeCitations,
    ],
  },

  // .mdx
  integrations: [
    mdx({
      rehypePlugins: [
        // [rehypeCitations, { resolve: resolveBib }],
        rehypeCitations,
      ],
    }),
  ],

  // ✅ Alias @ -> src (evita erros de import no Windows)
  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },

  // (Opcional em Astro ≥4: também dá pra usar `alias: { '@': './src' }` no topo da config,
  // mas manter no Vite é o mais compatível em setups mistos).
});