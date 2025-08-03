// src/config.ts
import { defineCollection, z } from 'astro:content';

// Define a coleção para o curso de escrita
const cursoEscritaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    menu: z.boolean(), 
    ordem: z.number(), // Para ordenar as aulas no menu
    shortTitle: z.string().optional(), // Título curto para o menu (opcional)
  }),
});

export const collections = {
  'curso-escrita': cursoEscritaCollection,
};