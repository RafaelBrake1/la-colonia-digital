"use client"

import { useState, useTransition, useRef, useCallback } from "react"
import { TipTapEditor } from "@/components/editor/TipTapEditor"
import { ImageManager } from "./ImageManager"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { NEWS_CATEGORIES } from "@/lib/constants"
import type { ArticleInput, ImageInput } from "@/actions/articles"
import type { Article } from "@/lib/db/schema"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ArticleFormProps {
  article?: Article | null
  onSubmit: (input: ArticleInput) => Promise<void>
  submitLabel: string
}

function toDatetimeLocal(date: Date | string): string {
  const d = new Date(date)
  const offset = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function ArticleForm({ article, onSubmit, submitLabel }: ArticleFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  // Rastrear URLs subidas a Vercel Blob en esta sesión
  const blobUrlsRef = useRef<string[]>([])
  const trackBlobUrl = useCallback((url: string) => {
    blobUrlsRef.current.push(url)
  }, [])

  const [title, setTitle] = useState(article?.title ?? "")
  const [slug, setSlug] = useState(article?.slug ?? "")
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "")
  const [content, setContent] = useState(article?.content ?? "")
  const [category, setCategory] = useState(article?.category ?? NEWS_CATEGORIES[0])
  const [author, setAuthor] = useState(article?.author ?? "")
  const [status, setStatus] = useState<"published" | "draft" | "archived">(
    (article?.status as "published" | "draft" | "archived") ?? "draft"
  )
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false)
  const [publishedAt, setPublishedAt] = useState(
    toDatetimeLocal(article?.publishedAt ?? new Date())
  )
  const [images, setImages] = useState<ImageInput[]>(
    (article?.images ?? []).map((img) => ({
      url: img.url,
      alt: img.alt,
      caption: img.caption,
      position: img.position as ImageInput["position"],
      size: img.size as ImageInput["size"],
    }))
  )

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!article) setSlug(slugify(val))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !excerpt.trim() || !content.trim() || !author.trim()) {
      setError("Título, resumen, contenido y autor son obligatorios.")
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await onSubmit({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content,
          category,
          author: author.trim(),
          status,
          isFeatured: status === "published" ? isFeatured : false,
          publishedAt: new Date(publishedAt).toISOString(),
          images,
        })
        toast.success(article ? "Noticia actualizada" : "Noticia creada")
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al guardar"
        // redirect throws, so only show error if it's a real error
        if (!msg.includes("NEXT_REDIRECT")) {
          setError(msg)
          toast.error(msg)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Información principal */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">Información principal</h3>

        <div className="space-y-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ingresa el título de la noticia"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">URL (slug)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="url-de-la-noticia"
          />
          <p className="text-xs text-muted-foreground">Se genera automáticamente desde el título. Solo letras, números y guiones.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="excerpt">Resumen *</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Breve resumen para las previsualizaciones"
            rows={3}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Contenido *</Label>
          <TipTapEditor
            value={content}
            onChange={setContent}
            placeholder="Redacta el contenido completo de la noticia…"
          />
        </div>
      </div>

      {/* Imágenes */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h3 className="font-semibold">Imágenes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sube imágenes o pega URLs. Configura la posición y tamaño de cada una dentro del artículo.
          </p>
        </div>
        <ImageManager images={images} onChange={setImages} onBlobUploaded={trackBlobUrl} />
      </div>

      {/* Metadatos */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">Categoría y publicación</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Categoría</Label>
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEWS_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="author">Autor *</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nombre del redactor"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(v) => {
              setStatus(v as typeof status)
              if (v !== "published") setIsFeatured(false)
            }}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="publishedAt">Fecha de publicación</Label>
            <Input
              id="publishedAt"
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="isFeatured"
            checked={isFeatured}
            disabled={status !== "published"}
            onCheckedChange={(v) => setIsFeatured(Boolean(v))}
          />
          <Label htmlFor="isFeatured" className="cursor-pointer font-normal">
            Marcar como noticia destacada (aparece en el hero del inicio)
          </Label>
        </div>
        {status !== "published" && (
          <p className="text-xs text-muted-foreground -mt-2">Solo las noticias publicadas pueden ser destacadas.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline" }))}
          onClick={async () => {
            // Eliminar blobs subidos pero no guardados
            const urls = blobUrlsRef.current
            if (urls.length > 0) {
              try {
                await fetch("/api/upload", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ urls }),
                })
              } catch {
                // Ignorar errores de limpieza
              }
            }
            router.push("/admin/noticias")
          }}
        >
          Cancelar
        </button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
