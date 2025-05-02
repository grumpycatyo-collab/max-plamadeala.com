---
title: "Transforming a struggle into a personal challenge"
publishDate: 2025-05-02
description: "How I pushed myself to code a personal web-site due to an university lab."
slug: "struggle_vs_challenge"
featured: true
---

## Intro
First of all, I want to say that I've had some minor experiences with writing front-end projects. It was mainly because practically at every hackathon I went to with my friends, I was forced to write front-end (no one knew `React` or other front frameworks). So yeah, I do have some knowledge.

The website is more like a `How to get hyped up overnight?`. Imagine me, at 9 am thinking of the topic for Lab 6 at Web Programming and then I see @eduard-balamatiuc actually doing the lab, not because he is forced to, but because he is doing it for himself, since he's creating a personal website. In that exact moment, I got the thing, the big idea of doing a project for myself, and I took it as a personal challenge, something like: `I should make this website the image of myself, so it basically reflects how good I am at my craft. If I don't do it, I am an idiot.`

## About the site (quite technical)

After the grand momento, I immediately bought the `max-plamadeala.com` for additional motivation (`Man, I spent money on it, I should I use it then`). I also stole from @eduard-balamatiuc the idea of using [`Astro`](https://astro.build/) (Sorry, man). The idea behind `Astro` is that it is content-driven, meaning that it gives you everything in order for you to make documentation, blogs or content based web-sites. 

**Here is an example of how I use it to write articles:**

First of all in the directory root I'll create a `content/` for storing content, and then `content/articles/` to store multiple articles. The coolness of this thing (idk if this is strongly about `Astro` or not), is that you can create a `content.config.ts` somewhere and import every article:
```ts
const articlesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/articles" }),
  schema: z.object({
    title: z.string(),
    ...
  }),
});

export const collections = {
  'articles': articlesCollection,
  ...
}; 
```
Whereas the `loader` loads the glob associated with some extention from the mentioned above directory and then somewhere else you can just do:
```ts
const allArticles = await getCollection('articles');
```
And that's all 💥. You have everything done. Isn't it cool?


> Besides `Astro`, as memory, I used local storage, so the web-site is 100% client-sided, and if you inspect the website and navigate to `Application` -> `LocalStorage`, you'll every related info stored in there (mainly YOUR starred article).


## Lessons learnt

Try to use life struggles or things you don't want to do as opportunities for your personal development.
Transform `lab6` into `a personal web-site` or `gym` into `a place where I can have fun with my bros`.


Thanks for the attention, and please do comment or leave feedback in case you want to share your experience or want to correct me on something related to `Astro`.