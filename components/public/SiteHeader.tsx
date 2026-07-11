import Link from "next/link"
import Image from "next/image"
import { NEWS_CATEGORIES } from "@/lib/constants"

const categorySlug = (cat: string) =>
  cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      {/* Barra principal */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 md:h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="La Colonial Digital"
              width={200}
              height={66}
              className="h-10 md:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Categorías — desktop */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NEWS_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/categoria/${categorySlug(cat)}`}
                className="px-3 py-1.5 text-sm text-muted-foreground rounded-md hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Barra de categorías — móvil */}
      <div className="md:hidden border-t border-border">
        <div className="flex overflow-x-auto px-4 py-1.5 gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {NEWS_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/categoria/${categorySlug(cat)}`}
              className="shrink-0 px-3 py-1 text-xs font-medium text-muted-foreground rounded-full border border-border hover:text-foreground hover:border-primary transition-colors whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
