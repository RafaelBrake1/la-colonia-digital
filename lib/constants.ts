export const NEWS_CATEGORIES = [
  "Política",
  "Economía",
  "Deportes",
  "Tecnología",
  "Entretenimiento",
  "Local",
  "Internacional",
] as const

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]

export const IMAGE_POSITIONS = [
  { value: "arriba", label: "Arriba del contenido" },
  { value: "centro", label: "Centro del contenido" },
  { value: "abajo", label: "Abajo del contenido" },
  { value: "izquierda", label: "Flotando a la izquierda" },
  { value: "derecha", label: "Flotando a la derecha" },
  { value: "ancho-completo", label: "Ancho completo" },
] as const

export const IMAGE_SIZES = [
  { value: "pequena", label: "Pequeña (25%)" },
  { value: "mediana", label: "Mediana (50%)" },
  { value: "grande", label: "Grande (75%)" },
  { value: "completa", label: "Completa (100%)" },
] as const

export type ImagePosition = (typeof IMAGE_POSITIONS)[number]["value"]
export type ImageSize = (typeof IMAGE_SIZES)[number]["value"]
export type ArticleStatus = "published" | "draft" | "archived"
