import Link from "next/link"
import Image from "next/image"
import type { Article } from "@/lib/db/schema"

interface NewsCardProps {
  article: Article
  compact?: boolean
}

export function NewsCard({ article, compact = false }: NewsCardProps) {
  const mainImage = article.images[0]

  if (compact) {
    return (
      <Link href={`/noticias/${article.slug}`} className="group flex gap-3 py-2">
        {mainImage && (
          <div className="relative shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-muted">
            <Image src={mainImage.url} alt={mainImage.alt || article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{article.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{article.views.toLocaleString()} vistas</p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/noticias/${article.slug}`} className="group block rounded-xl border border-border bg-card overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {mainImage && (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image src={mainImage.url} alt={mainImage.alt || article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      {!mainImage && (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-xs">Sin imagen</span>
        </div>
      )}
      <div className="p-4">
        <span className="inline-block rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
          {article.category}
        </span>
        <h3 className="mt-2 font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>·</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {new Date(article.publishedAt).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
          </time>
        </div>
      </div>
    </Link>
  )
}
