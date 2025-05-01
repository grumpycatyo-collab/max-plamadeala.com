import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articlesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/articles" }),
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    slug: z.string(),
    description: z.string().optional(),
  }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/projects" }),
  schema: z.object({
    title: z.string(),
    link: z.string(),
    description: z.string(),
    slug: z.string(),
  }),
});

export const collections = {
  'articles': articlesCollection,
  'projects': projectsCollection,
}; 