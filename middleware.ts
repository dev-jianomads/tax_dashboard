import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/api/auth/login')) {
    return NextResponse.next();
  }

  // Check for protected routes
  const isProtectedRoute = pathname.startsWith('/admin') || 
                          pathname.startsWith('/user') || 
                          (pathname.startsWith('/api') && !pathname.startsWith('/api/auth/login'));
  
  if (isProtectedRoute || pathname === '/') {
    const authSession = request.cookies.get('auth-session')?.value;
    
    if (authSession !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
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