import Link from "next/link"
import { NEWS_CATEGORIES } from "@/lib/constants"

const categorySlug = (cat: string) =>
  cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              LC
            </div>
            <span className="font-bold text-lg hidden sm:block">
              La Colonia <span className="text-primary">Digital</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto">
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

          <Link
            href="/admin"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}
