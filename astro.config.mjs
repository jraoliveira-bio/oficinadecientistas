import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// 🔧 Alias robusto pro Windows
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://astro.build/config
export default defineConfig({
  site: 'https://jraoliveira-bio.github.io',
  base: '/oficinadecientistas',
  output: 'static',

  // MDX (citações: componentes <Cite/> + <ReferenceList/>, resolvidos no cliente por src/scripts/citations-hydrate.js)
  integrations: [
    mdx(),
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