export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ArticleImages } from "@/components/public/ArticleImages"
import { NewsCard } from "@/components/public/NewsCard"
import { getArticleBySlug, getRelatedArticles, incrementViews } from "@/actions/articles"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article || article.status !== "published") {
    notFound()
  }

  // Incrementar vistas en background
  void incrementViews(article.id)

  const related = await getRelatedArticles(article.category, article.id, 3)
  const mainImage = article.images.find((img) => img.position === "arriba") ?? article.images[0]

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {article.category}
          </span>
          <time dateTime={article.publishedAt.toISOString()} className="text-sm text-muted-foreground">
            {new Date(article.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-balance">
          {article.title}
        </h1>

        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>

        <div className="mt-5 flex items-center gap-3 py-4 border-y border-border">
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
            {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium">{article.author}</p>
            <p className="text-xs text-muted-foreground">Redactor</p>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            {article.views.toLocaleString()} lecturas
          </div>
        </div>
      </header>

      {/* Main image (arriba) */}
      {mainImage && mainImage.position === "arriba" && (
        <figure className="mb-8">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image src={mainImage.url} alt={mainImage.alt || article.title} fill priority className="object-cover" />
          </div>
          {mainImage.caption && (
            <figcaption className="mt-2 text-xs text-muted-foreground text-center italic">
              {mainImage.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Ancho completo */}
      <ArticleImages images={article.images} position="ancho-completo" />

      {/* Contenido con imágenes flotantes */}
      <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary overflow-hidden">
        <ArticleImages images={article.images} position="izquierda" />
        <ArticleImages images={article.images} position="derecha" />
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {/* Centro */}
      <ArticleImages images={article.images} position="centro" />

      {/* Abajo */}
      <ArticleImages images={article.images} position="abajo" />

      {/* Relacionadas */}
      {related.length > 0 && (
        <section className="mt-14 pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-6">Noticias relacionadas</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <NewsCard key={r.id} article={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
