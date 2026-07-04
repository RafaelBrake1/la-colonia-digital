import Link from "next/link"
import { NEWS_CATEGORIES } from "@/lib/constants"

const categorySlug = (cat: string) =>
  cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">LC</div>
              <span className="font-bold text-base">La Colonia Digital</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu fuente de noticias locales e internacionales, con la información que importa.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Secciones</h4>
            <ul className="space-y-1.5">
              {NEWS_CATEGORIES.slice(0, 4).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/categoria/${categorySlug(cat)}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Más secciones</h4>
            <ul className="space-y-1.5">
              {NEWS_CATEGORIES.slice(4).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/categoria/${categorySlug(cat)}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} La Colonia Digital. Todos los derechos reservados.</p>
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Acceso admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
