export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ArticleForm } from "@/components/admin/ArticleForm"
import { verifySession } from "@/lib/dal"
import { getArticleById, updateArticle } from "@/actions/articles"
import type { ArticleInput } from "@/actions/articles"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminEditNewsPage({ params }: Props) {
  await verifySession()
  const { id } = await params
  const article = await getArticleById(id)

  if (!article) notFound()

  const handleUpdate = async (input: ArticleInput) => {
    "use server"
    await updateArticle(id, input)
  }

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
        <h1 className="text-2xl font-bold">Editar noticia</h1>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">{article.title}</p>
      </div>

      <ArticleForm article={article} submitLabel="Guardar cambios" onSubmit={handleUpdate} />
    </div>
  )
}
