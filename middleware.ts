import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Skip middleware for login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/api/auth/login')) {
    return NextResponse.next();
  }

  // Check for protected routes
  const isProtectedRoute = pathname.startsWith('/admin') || 
                          pathname.startsWith('/user') || 
                          (pathname.startsWith('/api') && !pathname.startsWith('/api/auth/login'));
  
  if (isProtectedRoute || pathname === '/') {
    const token = request.cookies.get('auth-session')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify the JWT token
      await jwtVerify(token, secret);
    } catch (error) {
      // Invalid or expired token, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-session');
      return response;
    }
    
    // Redirect authenticated root access to admin
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};