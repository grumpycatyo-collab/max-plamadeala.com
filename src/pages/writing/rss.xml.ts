import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles');
  const sorted = articles.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );

  return rss({
    title: "Max P. — Writing",
    description: "Notes on Go, distributed systems, reliability, and applied AI.",
    site: context.site ?? "https://max-plamadeala.com",
    items: sorted.map(article => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishDate,
      link: `/writing/${article.data.slug}`,
    })),
  });
}
