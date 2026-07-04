import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/session"

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Solo proteger rutas /admin excepto /admin/login
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const token = request.cookies.get("lcd_session")?.value
    const session = await decrypt(token)

    if (!session?.userId) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // Redirigir a /admin si ya está logueado e intenta acceder al login
  if (path === "/admin/login") {
    const token = request.cookies.get("lcd_session")?.value
    const session = await decrypt(token)
    if (session?.userId) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
