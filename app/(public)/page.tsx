export const dynamic = "force-dynamic"

import Link from "next/link"
import { HeroSection } from "@/components/public/HeroSection"
import { NewsCard } from "@/components/public/NewsCard"
import { getFeaturedArticle, getPublishedArticles, getTrendingArticles } from "@/actions/articles"

export default async function HomePage() {
  const [featured, latest, trending] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles(12),
    getTrendingArticles(5),
  ])

  const hero = featured ?? latest[0] ?? null
  const gridArticles = hero ? latest.filter((a) => a.id !== hero.id) : latest

  if (!hero) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">
        <h1 className="text-2xl font-bold mb-2">Bienvenido a La Colonia Digital</h1>
        <p>Aún no hay noticias publicadas. El admin puede crear la primera desde el panel.</p>
        <Link href="/admin" className="mt-4 inline-block text-primary hover:underline">
          Ir al panel admin →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <HeroSection article={hero} label={featured ? "Destacado" : "Última noticia"} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Últimas noticias */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Últimas Noticias</h2>
          </div>
          {gridArticles.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay más noticias publicadas.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {gridArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {trending.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">
                Tendencias
              </h3>
              <div className="divide-y divide-border">
                {trending.map((article, i) => (
                  <div key={article.id} className="py-2 first:pt-0 last:pb-0">
                    <Link href={`/noticias/${article.slug}`} className="flex gap-3 group">
                      <span className="flex-none w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {article.views.toLocaleString()} vistas
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">
              Más leídas
            </h3>
            <div className="space-y-1">
              {trending.map((article) => (
                <NewsCard key={article.id} article={article} compact />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
