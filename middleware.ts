import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  const pathname = req.nextUrl.pathname

  // ─── Rutas públicas ─────────────────────────────────────
  const publicRoutes = ["/login"]

  const isPublicRoute = publicRoutes.includes(pathname)

  // ─── Si NO hay token y quiere entrar a privada ─────────
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    )
  }

  // ─── Si tiene token y quiere ir a login ────────────────
  if (token && pathname === "/login") {
    return NextResponse.redirect(
      new URL("/encuestador", req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/encuestador/:path*",
    "/dashboard/:path*",
    "/login",
  ],
}