"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Archive, RotateCcw, Star } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  deleteArticle,
  archiveArticle,
  restoreArticle,
  reorderArticles,
  toggleFeatured,
} from "@/actions/articles"
import type { Article } from "@/lib/db/schema"
import { toast } from "sonner"

interface ArticleListProps {
  articles: Article[]
  showDrag?: boolean
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published")
    return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Publicado</Badge>
  if (status === "draft")
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Borrador</Badge>
  return <Badge variant="secondary" className="bg-muted text-muted-foreground">Archivado</Badge>
}

function ArticleRow({
  article,
  showDrag,
  onDelete,
  onArchive,
  onRestore,
  onToggleFeatured,
}: {
  article: Article
  showDrag: boolean
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onToggleFeatured: (id: string, val: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: article.id,
    disabled: !showDrag,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
    >
      {showDrag && (
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {(article.categories ?? []).join(" · ")}
          </span>
          <StatusBadge status={article.status} />
          {article.isFeatured && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30">
              <Star className="w-2.5 h-2.5 mr-1" />Destacado
            </Badge>
          )}
        </div>
        <p className="font-medium text-sm leading-snug truncate">{article.title}</p>
        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>·</span>
          <span>{new Date(article.publishedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span>·</span>
          <span>{article.views.toLocaleString()} vistas</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
        {article.status === "published" && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title={article.isFeatured ? "Quitar destacado" : "Marcar como destacado"}
            onClick={() => onToggleFeatured(article.id, !article.isFeatured)}
          >
            <Star className={`w-3.5 h-3.5 ${article.isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
          </Button>
        )}
        <Link href={`/admin/noticias/${article.id}/editar`} title="Editar" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "h-7 w-7 inline-flex items-center justify-center")}>
          <Pencil className="w-3.5 h-3.5" />
        </Link>
        {article.status !== "archived" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Archivar"
            onClick={() => onArchive(article.id)}
          >
            <Archive className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Restaurar como borrador"
            onClick={() => onRestore(article.id)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          title="Eliminar"
          onClick={() => onDelete(article.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function ArticleList({ articles: initialArticles, showDrag = false }: ArticleListProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = articles.findIndex((a) => a.id === active.id)
    const newIndex = articles.findIndex((a) => a.id === over.id)
    const reordered = arrayMove(articles, oldIndex, newIndex)
    setArticles(reordered)
    startTransition(async () => {
      try {
        await reorderArticles(reordered.map((a) => a.id))
      } catch {
        toast.error("No se pudo guardar el nuevo orden")
        setArticles(initialArticles)
      }
    })
  }

  const handleDelete = (id: string) => setDeleteTarget(id)

  const confirmDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget
    setDeleteTarget(null)
    startTransition(async () => {
      try {
        await deleteArticle(id)
        setArticles((prev) => prev.filter((a) => a.id !== id))
        toast.success("Noticia eliminada")
      } catch {
        toast.error("No se pudo eliminar la noticia")
      }
    })
  }

  const handleArchive = (id: string) => {
    startTransition(async () => {
      try {
        await archiveArticle(id)
        setArticles((prev) =>
          prev.map((a) => a.id === id ? { ...a, status: "archived", isFeatured: false } : a)
        )
        toast.success("Noticia archivada")
      } catch {
        toast.error("No se pudo archivar la noticia")
      }
    })
  }

  const handleRestore = (id: string) => {
    startTransition(async () => {
      try {
        await restoreArticle(id)
        setArticles((prev) =>
          prev.map((a) => a.id === id ? { ...a, status: "draft" } : a)
        )
        toast.success("Noticia restaurada como borrador")
      } catch {
        toast.error("No se pudo restaurar")
      }
    })
  }

  const handleToggleFeatured = (id: string, val: boolean) => {
    startTransition(async () => {
      try {
        await toggleFeatured(id, val)
        setArticles((prev) =>
          prev.map((a) => {
            if (val && a.id !== id) return { ...a, isFeatured: false }
            if (a.id === id) return { ...a, isFeatured: val }
            return a
          })
        )
        toast.success(val ? "Marcado como destacado" : "Quitado de destacados")
      } catch {
        toast.error("No se pudo actualizar")
      }
    })
  }

  if (articles.length === 0) {
    return (
      <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
        No hay artículos en esta sección.
      </div>
    )
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={articles.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <div className={`space-y-2 ${isPending ? "opacity-70 pointer-events-none" : ""}`}>
            {articles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                showDrag={showDrag}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta noticia?</DialogTitle>
            <DialogDescription>
              Esta acción es permanente. El artículo y todas sus imágenes serán eliminados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
