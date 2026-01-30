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
    updatedAt: z.string().optional(),       // ou z.date().optional() se preferir datas como Date

    // Referências bibliográficas da aula
    references: z.array(referenceSchema).default([]),
  }),
});

export const collections = {
  "curso-escrita": cursoEscritaCollection,
};

// (Opcional) Tipos TypeScript prontos para usar em componentes/plugins
export type Reference = z.infer<typeof referenceSchema>;
