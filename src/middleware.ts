import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

// Secret keys - must match auth.ts
const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret-min-32-chars!',
)
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-min-32-chars!',
)

const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'
const ACCESS_TOKEN_EXPIRY = '15m'

// Routes that require authentication
const protectedRoutes = ['/', '/dashboard', '/profile', '/glitch', '/noel', '/booster']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register']

async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, ACCESS_TOKEN_SECRET)
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    }
  } catch {
    return null
  }
}

async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, REFRESH_TOKEN_SECRET)
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    }
  } catch {
    return null
  }
}

async function generateAccessToken(payload: { userId: string; username: string }) {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_TOKEN_SECRET)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Skip middleware for API routes (except auth check routes)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  // Try to verify access token
  let user = accessToken ? await verifyAccessToken(accessToken) : null
  let newAccessToken: string | null = null

  // If access token is invalid but refresh token exists, try to refresh
  if (!user && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken)
    if (refreshPayload) {
      // Generate new access token
      newAccessToken = await generateAccessToken(refreshPayload)
      user = refreshPayload
    }
  }

  // Handle protected routes
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Handle auth routes (redirect to home if already logged in)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Continue with request, possibly setting new access token
  const response = NextResponse.next()

  // If we refreshed the access token, set the new cookie
  if (newAccessToken) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
