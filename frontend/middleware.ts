import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE = "access_token" // must match backend cookie name

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? ""
  const { pathname } = req.nextUrl

  // Never apply auth to static assets or API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next()
  }

  // If authenticated users hit /login or /signup, send them home
  if (token && (pathname === "/login" || pathname === "/signup")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Always allow unauthenticated access to login/signup
  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.next()
  }

  // Protect only specific pages
  const needsAuth =
    pathname === "/" ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/portfolio")

  if (needsAuth && !token) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    // Optional: url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/leaderboard/:path*", "/portfolio/:path*", "/login", "/signup"],
}


