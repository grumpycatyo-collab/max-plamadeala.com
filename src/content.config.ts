import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const articlesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/articles" }),
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    description: z.string().optional(),
  }),
});

export const collections = {
  'articles': articlesCollection,
}; 