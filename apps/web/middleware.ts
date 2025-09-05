import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Middleware di protezione semplice basata sul cookie di Supabase.
 * IMPORTANTE: /auth/callback è **sempre** libero, così il magic link/OTP può completarsi.
 */

const PUBLIC_PATHS = new Set<string>([
  '/',              // landing
  '/sign-in',       // login
  '/auth/callback', // callback OTP/magic link
])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow Next.js internals & asset files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.includes('.') // e.g. /images/logo.png
  ) {
    return NextResponse.next()
  }

  // Allow public routes (exact match or subpaths)
  for (const p of PUBLIC_PATHS) {
    if (pathname === p || pathname.startsWith(p + '/')) {
      return NextResponse.next()
    }
  }

  // Minimal check: se non c'è il cookie di accesso di Supabase → redirect a /sign-in
  const access = req.cookies.get('sb-access-token')?.value
  if (!access) {
    const url = req.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect_to', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Applica il middleware a tutto tranne API/static
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
