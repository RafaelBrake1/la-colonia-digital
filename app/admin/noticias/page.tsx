import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArticleList } from "@/components/admin/ArticleList"
import { verifySession } from "@/lib/dal"
import { getAllArticlesAdmin } from "@/actions/articles"

export default async function AdminNewsListPage() {
  await verifySession()
  const all = await getAllArticlesAdmin()

  const published = all.filter((a) => a.status === "published")
  const drafts = all.filter((a) => a.status === "draft")
  const archived = all.filter((a) => a.status === "archived")

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Noticias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona y organiza tus publicaciones</p>
        </div>
        <Link href="/admin/noticias/crear" className={cn(buttonVariants())}>
          + Nueva noticia
        </Link>
      </div>

      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">
            Publicadas <span className="ml-1.5 text-xs opacity-70">({published.length})</span>
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Borradores <span className="ml-1.5 text-xs opacity-70">({drafts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archivadas <span className="ml-1.5 text-xs opacity-70">({archived.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-4">
          <p className="text-xs text-muted-foreground mb-3">
            Arrastra <span className="font-medium">⠿</span> para cambiar el orden de aparición en el sitio.
          </p>
          <ArticleList articles={published} showDrag />
        </TabsContent>

        <TabsContent value="drafts" className="mt-4">
          <ArticleList articles={drafts} />
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <ArticleList articles={archived} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
