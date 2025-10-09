import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import remarkCiteToHtml from './src/plugins/remark-cite-to-html.mjs';
import rehypeRaw from 'rehype-raw';
import rehypeCitations from './src/plugins/rehype-citations.mjs';

export default defineConfig({
  site: 'https://jraoliveira-bio.github.io',
  base: '/oficinadecientistas',

  // → Aplica aos .md (Markdown “puro” das Content Collections)
  markdown: {
    remarkPlugins: [remarkCiteToHtml],          // <Cite/> / <ReferenceList/> → HTML
    rehypePlugins: [rehypeRaw] // parseia HTML bruto → transforma em [n] + lista
  },

  // → Aplica aos .mdx (como a sua precisao2.mdx)
  integrations: [
    mdx({
      remarkPlugins: [remarkCiteToHtml],
      rehypePlugins: [rehypeRaw]
    })
  ],
});
