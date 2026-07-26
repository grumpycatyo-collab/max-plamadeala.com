# max-plamadeala.com

Current version: `2.1.0`

This is the site that powers `max-plamadeala.com`, built on
[Astro](https://astro.build/).

## How to run

### Development

```
npm install
npm run dev
```

### Build

```
npm run build
```

## Architecture

### Content

Writing, projects, and static pages (like `/about`) are Markdown files
under `./content`, defined as Astro content collections in
`src/content.config.ts`. Adding a new article or project is just adding
a new `.md` file with the right frontmatter — no code changes needed.

### Pages

Routes are file-based under `src/pages`, following Astro's conventions:
`work.astro` and `writing.astro` render the list views, `writing/[slug].astro`
renders individual posts.

### Layout & components

`src/layouts/Layout.astro` wraps every page with the shared head, theme
handling, and global styles. Shared UI (header, footer, star button, etc.)
lives under `src/components`.
