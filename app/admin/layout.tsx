import Link from "next/link"
import { LayoutDashboard, Newspaper, LogOut } from "lucide-react"
import { logout } from "@/actions/auth"

const navItems = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Sidebar desktop / Top bar móvil ── */}
      <aside className="bg-foreground text-background flex-shrink-0 md:w-56 md:min-h-screen md:flex md:flex-col border-b md:border-b-0 md:border-r border-white/10">

        {/* Logo + nav móvil (horizontal) */}
        <div className="flex items-center justify-between px-4 py-3 md:p-4 md:border-b md:border-white/10">
          <Link href="/">
            <img src="/logo.png" alt="La Colonial Digital" className="h-8 md:h-9 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="hidden md:block text-xs text-white/50">Admin</p>

          {/* Iconos de nav — solo móvil */}
          <nav className="flex md:hidden items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            ))}
            <form action={logout}>
              <button
                type="submit"
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </nav>
        </div>

        {/* Nav vertical — solo desktop */}
        <nav className="hidden md:block flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout — solo desktop */}
        <div className="hidden md:block p-3 border-t border-white/10">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 bg-muted/20 min-w-0">{children}</main>
    </div>
  )
}
