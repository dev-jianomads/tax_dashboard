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
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Skip middleware for login page and public assets
  if (pathname === '/login' || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') || 
      pathname.startsWith('/api/auth/login') ||
      pathname.startsWith('/api/') && pathname.includes('auth')) {
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

  // Add CORS headers to all responses
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};