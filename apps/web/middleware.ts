import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const supabaseToken = req.cookies.get('sb-access-token')
  if (!supabaseToken && (req.nextUrl.pathname.startsWith('/suggestions') || req.nextUrl.pathname.startsWith('/dashboard'))) {
    const loginUrl = new URL('/sign-in', req.url)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}
export const config = { matcher: ['/suggestions/:path*','/dashboard/:path*'] }
