export const dynamic = "force-dynamic"

import Link from "next/link"
import { FileText, CheckCircle, Archive, Eye, PenLine } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { verifySession } from "@/lib/dal"
import { getDashboardStats, getAllArticlesAdmin } from "@/actions/articles"

export default async function AdminDashboardPage() {
  await verifySession()
  const [stats, allArticles] = await Promise.all([getDashboardStats(), getAllArticlesAdmin()])
  const recent = allArticles.slice(0, 8)

  const statCards = [
    { label: "Total artículos", value: stats.total, icon: FileText, color: "text-blue-500" },
    { label: "Publicados", value: stats.published, icon: CheckCircle, color: "text-green-500" },
    { label: "Borradores", value: stats.drafts, icon: PenLine, color: "text-amber-500" },
    { label: "Archivados", value: stats.archived, icon: Archive, color: "text-muted-foreground" },
    { label: "Total vistas", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-purple-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumen de La Colonia Digital</p>
        </div>
        <Link href="/admin/noticias/crear" className={cn(buttonVariants())}>
          + Nueva noticia
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Artículos recientes</CardTitle>
          <Link href="/admin/noticias" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay artículos todavía.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((article) => (
                <div key={article.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.author} · {(article.categories ?? []).join(", ")} ·{" "}
                      {new Date(article.publishedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {article.status === "published" && <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Publicado</Badge>}
                    {article.status === "draft" && <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">Borrador</Badge>}
                    {article.status === "archived" && <Badge variant="secondary" className="text-xs">Archivado</Badge>}
                    <Link href={`/admin/noticias/${article.id}/editar`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
