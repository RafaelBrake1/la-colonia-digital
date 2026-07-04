import Image from "next/image"
import type { ArticleImage } from "@/lib/db/schema"
import type { ImagePosition } from "@/lib/constants"

interface ArticleImagesProps {
  images: ArticleImage[]
  position: ImagePosition
}

const sizeClasses: Record<string, string> = {
  pequena: "w-1/4",
  mediana: "w-1/2",
  grande: "w-3/4",
  completa: "w-full",
}

export function ArticleImages({ images, position }: ArticleImagesProps) {
  const filtered = images.filter((img) => img.position === position)
  if (filtered.length === 0) return null

  if (position === "izquierda" || position === "derecha") {
    return (
      <>
        {filtered.map((img) => (
          <figure
            key={img.id}
            className={`${position === "izquierda" ? "float-left mr-4" : "float-right ml-4"} mb-4 ${sizeClasses[img.size]}`}
          >
            <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
              <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
            </div>
            {img.caption && (
              <figcaption className="text-xs text-muted-foreground text-center mt-1.5 italic">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </>
    )
  }

  if (position === "ancho-completo") {
    return (
      <div className="my-6 -mx-4 sm:mx-0 space-y-4">
        {filtered.map((img) => (
          <figure key={img.id}>
            <div className="relative aspect-[21/9] overflow-hidden sm:rounded-xl">
              <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
            </div>
            {img.caption && (
              <figcaption className="text-xs text-muted-foreground text-center mt-2 italic px-4 sm:px-0">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    )
  }

  // centro, arriba, abajo
  return (
    <div className={`my-6 flex flex-col items-center gap-4`}>
      {filtered.map((img) => (
        <figure key={img.id} className={sizeClasses[img.size]}>
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
          </div>
          {img.caption && (
            <figcaption className="text-xs text-muted-foreground text-center mt-1.5 italic">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
