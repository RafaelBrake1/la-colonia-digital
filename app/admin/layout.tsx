import Link from "next/link"
import { LayoutDashboard, Newspaper, LogOut } from "lucide-react"
import { logout } from "@/actions/auth"

const navItems = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-foreground text-background flex flex-col border-r border-border/10">
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
              LC
            </div>
            <div>
              <p className="font-bold text-sm leading-none">La Colonia</p>
              <p className="text-xs text-white/50 leading-none mt-0.5">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
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

        <div className="p-3 border-t border-white/10">
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
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 bg-muted/20">{children}</main>
      </div>
    </div>
  )
}
