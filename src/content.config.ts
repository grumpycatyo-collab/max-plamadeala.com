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
  }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/projects" }),
  schema: z.object({
    title: z.string(),
    link: z.string(),
    slug: z.string(),
    imagePath: z.string().optional(),
    // Marks a project to stand out in the work list.
    featured: z.boolean().optional().default(false),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/pages" }),
  schema: z.object({
    title: z.string(),
    // Spotify track/album/playlist URL, e.g. https://open.spotify.com/track/...
    spotifyTrack: z.string().optional(),
  }),
});

export const collections = {
  'articles': articlesCollection,
  'projects': projectsCollection,
  'pages': pagesCollection,
}; 