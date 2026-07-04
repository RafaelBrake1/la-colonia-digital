import Link from "next/link"
import Image from "next/image"
import type { Article } from "@/lib/db/schema"

interface HeroSectionProps {
  article: Article
  label?: string
}

export function HeroSection({ article, label = "Última noticia" }: HeroSectionProps) {
  const mainImage = article.images[0]

  return (
    <Link href={`/noticias/${article.slug}`} className="group relative block rounded-2xl overflow-hidden bg-foreground min-h-[380px] sm:min-h-[440px]">
      {mainImage && (
        <Image
          src={mainImage.url}
          alt={mainImage.alt || article.title}
          fill
          priority
          className="object-cover opacity-70 group-hover:opacity-80 group-hover:scale-[1.02] transition-all duration-500"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
        <span className="inline-block rounded-full bg-amber-400 text-black px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
          {article.isFeatured ? "Destacado" : label}
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-balance">
          {article.title}
        </h1>
        <p className="mt-2 text-white/80 text-sm sm:text-base line-clamp-2 max-w-2xl">
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-3 text-white/70 text-sm">
          <span>{article.author}</span>
          <span>·</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {new Date(article.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>·</span>
          <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {article.category}
          </span>
        </div>
      </div>
    </Link>
  )
}
