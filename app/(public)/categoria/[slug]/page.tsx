export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { NewsCard } from "@/components/public/NewsCard"
import { HeroSection } from "@/components/public/HeroSection"
import { getArticlesByCategory } from "@/actions/articles"
import { NEWS_CATEGORIES } from "@/lib/constants"

interface Props {
  params: Promise<{ slug: string }>
}

// Reconstruye el nombre de categoría desde el slug
function getCategoryFromSlug(slug: string): string | undefined {
  return NEWS_CATEGORIES.find(
    (cat) =>
      cat
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-") === slug
  )
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = getCategoryFromSlug(slug)

  if (!category) notFound()

  const articles = await getArticlesByCategory(category)
  const hero = articles[0] ?? null
  const rest = articles.slice(1)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{category}</h1>

      {!hero && (
        <p className="text-muted-foreground">No hay noticias publicadas en esta categoría aún.</p>
      )}

      {hero && (
        <div className="mb-8">
          <HeroSection article={hero} />
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
