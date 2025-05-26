// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  console.log('🔥 MIDDLEWARE RUNNING for path:', request.nextUrl.pathname)
  
  if (request.nextUrl.pathname.startsWith('/obm-admin')) {
    const token = request.cookies.get('admin-token')?.value
    
    console.log('Middleware - Token found:', !!token)

    if (!token) {
      console.log('No token, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
      await jwtVerify(token, secret)
      console.log('✅ Token verified successfully')
      return NextResponse.next()
    } catch (error) {
      console.log('❌ Token verification failed:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/obm-admin/:path*'
}