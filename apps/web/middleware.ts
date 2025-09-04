import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware per proteggere le route /suggestions
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabaseToken = req.cookies.get('sb-access-token')

  // Se non c'è token e si sta cercando di accedere a /suggestions → redirect
  if (!supabaseToken && req.nextUrl.pathname.startsWith('/suggestions')) {
    const loginUrl = new URL('/sign-in', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/suggestions/:path*'],
}
