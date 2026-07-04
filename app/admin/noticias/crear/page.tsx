import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ArticleForm } from "@/components/admin/ArticleForm"
import { verifySession } from "@/lib/dal"
import { createArticle } from "@/actions/articles"

export default async function AdminCreateNewsPage() {
  await verifySession()

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <Link
          href="/admin/noticias"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a noticias
        </Link>
        <h1 className="text-2xl font-bold">Nueva noticia</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Redacta y publica un nuevo artículo</p>
      </div>

      <ArticleForm submitLabel="Crear noticia" onSubmit={createArticle} />
    </div>
  )
}
