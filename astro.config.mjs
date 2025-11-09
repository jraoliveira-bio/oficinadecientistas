import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeCitations from './src/plugins/rehype-citations.mjs';

// https://astro.build/config
export default defineConfig({
  // Configurações do seu site, mantidas do arquivo original.
  site: 'https://jraoliveira-bio.github.io',
  base: '/oficinadecientistas',

  // Aplica o plugin de citações aos arquivos .md (Markdown das Content Collections)
  markdown: {
    // rehype-citations é o único plugin necessário para processar as citações.
    // Ele encontra as tags <cite> e constrói os popovers e a lista final.
    rehypePlugins: [rehypeCitations],
  },

  // Aplica a mesma configuração para arquivos .mdx, garantindo consistência.
  integrations: [
    mdx({
      rehypePlugins: [rehypeCitations],
    }),
  ],
});
