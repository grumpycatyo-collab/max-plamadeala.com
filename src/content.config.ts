import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articlesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/articles" }),
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    }),
    description: z.string().optional(),
    featured: z.boolean().optional().default(false), 
  }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/projects" }),
  schema: z.object({
    title: z.string(),
    link: z.string(),
    slug: z.string(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/pages" }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  'articles': articlesCollection,
  'projects': projectsCollection,
  'pages': pagesCollection,
}; 