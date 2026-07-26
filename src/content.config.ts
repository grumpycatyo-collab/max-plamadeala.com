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
    // Indicates whether the article is featured or highlighted.
    featured: z.boolean().optional().default(false),
    // Short topic label shown next to the date, e.g. "Go", "Reliability".
    topic: z.string().optional(),
  }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/projects" }),
  schema: z.object({
    title: z.string(),
    link: z.string(),
    slug: z.string(),
    imagePath: z.string().optional(),
  }),
});

const caseStudiesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/case-studies" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    // One-sentence description shown in list rows.
    oneLiner: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    // Headline measurable result, shown in list rows (e.g. "MTTR -35%").
    result: z.string(),
    // Controls display order in the Selected Work list (lower first).
    order: z.number().default(0),
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
  'caseStudies': caseStudiesCollection,
  'pages': pagesCollection,
}; 