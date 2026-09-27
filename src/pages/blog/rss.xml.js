// Feed RSS da Prancheta → /blog/rss.xml (um diário de bordo pede um jeito de ser acompanhado).
// Os links dos itens são caminhos com a base; o @astrojs/rss completa com o domínio de `site`.
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { withBase } from "@/lib/url";

export async function GET(context) {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.dataPublicacao.getTime() - a.data.dataPublicacao.getTime()
  );

  return rss({
    title: "A Prancheta — bastidores da Oficina de Cientistas",
    description:
      "Bastidores, decisões de design e notas de laboratório do projeto Oficina de Cientistas.",
    site: new URL(withBase("blog/"), context.site),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.dataPublicacao,
      description: post.data.summary,
      categories: post.data.tags,
      link: withBase(`blog/${post.slug}/`),
    })),
    customData: "<language>pt-br</language>",
  });
}
