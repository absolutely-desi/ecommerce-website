// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
    
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Create JWT token with jose
    const token = await new SignJWT({ 
      email: adminEmail, 
      role: 'admin' 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)
        
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax'
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}