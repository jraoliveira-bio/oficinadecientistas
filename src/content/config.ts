// src/content/config.ts

import { defineCollection, z } from 'astro:content';

// 1. Defina a estrutura de uma única referência (NOVO)
const referenceSchema = z.object({
  key: z.string(), // Identificador único, ex: "mayr1942"
  author: z.string().optional(),
  year: z.string().optional(),
  title: z.string(),
  text: z.string(), // O texto completo da citação
  doi: z.string().url().optional(),
  url: z.string().url().optional(),
  scholar_query: z.string().optional(),
});

// Define a coleção para o curso de escrita
const cursoEscritaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // --- SEUS CAMPOS EXISTENTES ---
    title: z.string(),
    description: z.string(),
    menu: z.boolean(),
    ordem: z.number(), // Para ordenar as aulas no menu
    shortTitle: z.string().optional(), // Título curto para o menu (opcional)

    // 2. Adicione o novo campo de referências aqui (NOVO)
    references: z.array(referenceSchema).default([]),
  }),
});

export const collections = {
  'curso-escrita': cursoEscritaCollection,
};