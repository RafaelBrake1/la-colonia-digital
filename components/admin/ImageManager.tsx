"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, Link2, Trash2, ChevronUp, ChevronDown, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IMAGE_POSITIONS, IMAGE_SIZES } from "@/lib/constants"
import type { ImageInput } from "@/actions/articles"
import { toast } from "sonner"

interface ImageManagerProps {
  images: ImageInput[]
  onChange: (images: ImageInput[]) => void
  onBlobUploaded?: (url: string) => void
}

export function ImageManager({ images, onChange, onBlobUploaded }: ImageManagerProps) {
  const [urlInput, setUrlInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const add = (img: Partial<ImageInput> & { url: string }) => {
    onChange([
      ...images,
      {
        url: img.url,
        alt: img.alt ?? "",
        caption: img.caption ?? "",
        position: img.position ?? "arriba",
        size: img.size ?? "completa",
      },
    ])
  }

  const update = (index: number, patch: Partial<ImageInput>) => {
    onChange(images.map((img, i) => (i === index ? { ...img, ...patch } : img)))
  }

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const move = (index: number, dir: "up" | "down") => {
    const target = dir === "up" ? index - 1 : index + 1
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const handleUrlAdd = () => {
    const url = urlInput.trim()
    if (!url) return
    add({ url })
    setUrlInput("")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? "Error al subir la imagen")
      add({ url: data.url, alt: file.name.replace(/\.[^.]+$/, "") })
      onBlobUploaded?.(data.url)
      toast.success("Imagen subida correctamente")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {/* Add image controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="https://... pegar URL de imagen"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlAdd())}
          />
          <Button type="button" variant="outline" onClick={handleUrlAdd} disabled={!urlInput.trim()}>
            <Link2 className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-1" />
            {isUploading ? "Subiendo…" : "Subir foto"}
          </Button>
        </div>
      </div>

      {/* Image list */}
      {images.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
          <ImageIcon className="mx-auto mb-2 w-8 h-8 opacity-40" />
          <p className="text-sm">No hay imágenes. Sube una foto o pega una URL.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((img, index) => (
            <div key={`${img.url}-${index}`} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
                <span className="text-sm font-medium">Imagen {index + 1}</span>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => move(index, "up")} title="Subir">
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === images.length - 1} onClick={() => move(index, "down")} title="Bajar">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="destructive" size="icon-sm" onClick={() => remove(index)} title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="p-3 space-y-3">
                {/* Preview */}
                {img.url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted max-h-40">
                    <Image src={img.url} alt={img.alt || `Imagen ${index + 1}`} fill className="object-cover" />
                  </div>
                )}

                {/* URL */}
                <div>
                  <Label className="text-xs mb-1">URL</Label>
                  <Input
                    value={img.url}
                    onChange={(e) => update(index, { url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {/* Alt + Caption */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs mb-1">Texto alternativo (alt)</Label>
                    <Input
                      value={img.alt}
                      onChange={(e) => update(index, { alt: e.target.value })}
                      placeholder="Descripción de la imagen"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1">Leyenda (caption)</Label>
                    <Input
                      value={img.caption ?? ""}
                      onChange={(e) => update(index, { caption: e.target.value })}
                      placeholder="Leyenda opcional"
                    />
                  </div>
                </div>

                {/* Position + Size */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs mb-1">Posición</Label>
                    <Select value={img.position} onValueChange={(v) => update(index, { position: v as ImageInput["position"] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_POSITIONS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1">Tamaño</Label>
                    <Select value={img.size} onValueChange={(v) => update(index, { size: v as ImageInput["size"] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_SIZES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
