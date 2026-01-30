// src/content.config.ts
// Astro v5: arquivo único de coleções na raiz de src/.
// Mantém sua coleção "curso-escrita" e adiciona a coleção "blog".

import { defineCollection, z } from "astro:content";

/**
 * Referência bibliográfica usada nas aulas.
 * - `text` é a string formatada que você exibe na lista final.
 * - Campos atômicos (author/year/title/doi/url) permitem evoluir no futuro (ex.: ABNT/APA).
 */
export const referenceSchema = z.object({
  key: z.string(),                  // identificador único (ex.: "mayr1942")
  author: z.string().optional(),
  year: z.string().optional(),
  title: z.string(),
  text: z.string(),                 // citação formatada pronta
  doi: z.string().url().optional(),
  url: z.string().url().optional(),
  scholar_query: z.string().optional(),
});

/**
 * Coleção principal do curso de escrita.
 * Os campos opcionais têm defaults para não quebrar conteúdo existente.
 * Os itens dessa coleção ficam em: src/content/curso-escrita/**
 */
const cursoEscritaCollection = defineCollection({
  type: "content",
  schema: z.object({
    // Campos básicos
    title: z.string(),
    description: z.string().optional(),
    shortTitle: z.string().optional(),      // título curto para menu (se quiser)
    menu: z.boolean().default(false),       // aparece no menu? (default: false)
    ordem: z.number().int().optional(),     // ordem no menu (se aplicável)

    // Metadados úteis (opcionais)
    draft: z.boolean().default(false),      // marcar aula como rascunho
    tags: z.array(z.string()).default([]),  // taxonomias simples
    updatedAt: z.string().optional(),       // mantenho string p/ compat; mude p/ z.date() se quiser

    // Referências bibliográficas da aula
    references: z.array(referenceSchema).default([]),
  }),
});

/**
 * Coleção do blog de desenvolvimento (“Os Bastidores”).
 * Os posts ficam em: src/content/blog/*.mdx
 * Importante: dataPublicacao é Date real (use YYYY-MM-DD no frontmatter).
 */
const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    dataPublicacao: z.date(),
    tags: z.array(z.string()),
    summary: z.string().optional(),
  }),
});

export const collections = {
  "curso-escrita": cursoEscritaCollection,
  blog: blogCollection,
};

// (Opcional) Tipos TypeScript para uso em componentes/plugins:
export type Reference = z.infer<typeof referenceSchema>;
