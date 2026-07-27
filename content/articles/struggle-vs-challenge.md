---
title: "Transforming a struggle into a personal challenge"
publishDate: 2025-05-02
description: "How I pushed myself to code a personal web-site due to an university lab."
slug: "struggle-vs-challenge"
featured: true
---

## Intro

I have some experience building front-end projects, although it was never really my main focus. At almost every hackathon I attended with friends, I somehow ended up being responsible for the front end because nobody else knew React or another front-end framework.

So yes, I knew enough to build something. I had just never felt particularly excited about doing it.

That changed one morning during a web programming class.

At around 9 a.m., while I was still trying to come up with a topic for one of our assignments, I noticed a friend working on his own personal website (https://eduard-balamatiuc.com/). He was technically completing the same assignment, but he was not building something only because the university required it. He was creating something useful for himself.

That was the moment the idea clicked.

I decided to treat the website as a personal challenge. It should represent me, my work, and the quality of my craft. My thinking was roughly:

> If this website represents me, I should make it genuinely good.

## Building the website

To give myself some additional motivation, I immediately bought the `max-plamadeala.com` domain.

My logic was simple: I had already spent money on it, so now I had to build something.

I also borrowed my friend’s idea of using [Astro](https://astro.build/). Astro is designed primarily for content-driven websites, which makes it a good choice for personal websites, blogs, and documentation.

One feature I particularly like is Astro’s content collection system.

For example, I keep my articles inside a directory like this:

```text
content/
└── articles/
    ├── first-article.md
    └── second-article.md
```

I can then define the structure of an article inside `content.config.ts`:

```ts
const articlesCollection = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./content/articles",
  }),
  schema: z.object({
    title: z.string(),
    ...
  }),
});

export const collections = {
  articles: articlesCollection,
};
```

The loader finds the Markdown files inside the articles directory, while the schema validates the metadata associated with every article.

After that, retrieving all articles is straightforward:

```ts
const allArticles = await getCollection("articles");
```

That is essentially it. Astro loads and validates the content, and the application can use it to generate article pages, lists, and previews.

For a relatively small amount of configuration, you get a clean and structured content system.

The website does not currently have a backend. Features such as starred articles are stored in the browser using `localStorage`.

This means the site is entirely client-side. When you star an article, that preference is saved only in your browser. You can inspect it through your browser’s developer tools under:

```text
Application → Local Storage
```

This approach would not be appropriate for data that needs to be shared across devices or protected securely. For a simple personal website preference, however, it keeps the architecture lightweight and avoids introducing a backend unnecessarily.

## What I learned

The main lesson was not really about Astro or front-end development.

It was about turning an obligation into something personally useful.

Instead of completing another university assignment and forgetting about it, I used it as an opportunity to build something I could continue improving after the course ended.

Sometimes the easiest way to become motivated is to connect a task you have to do with something you actually care about.

Thanks for reading. Feel free to leave feedback, share your own experience building a personal website, or correct anything I may have misunderstood about Astro.