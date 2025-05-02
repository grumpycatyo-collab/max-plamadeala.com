# My thing

A personal website built with **Astro**, featuring articles, projects, and a blog with customizable content.

## Description

This is a personal portfolio website for Max Plamadeala (@grumpycatyo-collab) that showcases:

- Personal information and a brief bio
- Projects with descriptions and links
- Articles/blog posts with star/featuring functionality
- Dark mode support
- Responsive design for all devices

The website is built using *Astro with a content-driven approach*, making it easy to add new projects and articles without modifying the core codebase (good stuff).

## Application Flow

1. **Homepage**: 
   - Introduction section with a brief bio
   - Recent articles section
   - Call-to-action to view full articles list

2. **About Page**:
   - Detailed information about Max
   - Content is editable via Markdown files

3. **Projects Page**:
   - List of projects with title and description
   - Each project links to its GitHub repository

4. **Articles Section**:
   - List view of all articles with dates and descriptions
   - Article detail pages with full content
   - Star functionality to mark favorite articles

## Project Structure

```
max-plamadeala.com/
├── public/               # Static files
├── src/
│   ├── components/       # Reusable components (Header, StarButton, etc.)
│   ├── layouts/          # Page layouts
│   ├── pages/            # Page components and routes
│   └── content.config.ts # Content collection definitions
├── content/
│   ├── articles/         # Markdown files for articles
│   ├── projects/         # Markdown files for projects
│   └── pages/            # Markdown files for pages like About
└── package.json
```

## Getting Started

1. Clone the repository:
```sh
git clone https://github.com/grumpycatyo-collab/max-plamadeala.git
cd max-plamadeala
```

2. Install dependencies:
```sh
npm install
```

3. Run the development server:
```sh
npm run dev
```

4. Build for production:
```sh
npm run build
```

## Adding Content

### New Article

Create a new Markdown file in `content/articles/` with the following structure:

```md
---
title: "Your Article Title"
publishDate: 2023-06-15
description: "Brief description of your article"
slug: "unique-slug"
featured: false
---

Your article content goes here...
```

### New Project

Create a new Markdown file in `content/projects/` with the following structure:

```md
---
title: "Project Title"
link: "https://github.com/username/project"
slug: "project-slug"
---

Project description goes here...
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Max Plamadeala (@grumpycatyo-collab)

---

Feel free to use this website as a template for your own personal site!
But please, be original ;).
