import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const validUsername = process.env.DASH_USER;
    const validPassword = process.env.DASH_PASS;
    
    if (username === validUsername && password === validPassword) {
      // Create a JWT token
      const token = await new SignJWT({ username, authenticated: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);

      const response = NextResponse.json({ success: true });
      
      // Detect if we're in an iframe/cross-origin context
      const isIframe = request.headers.get('sec-fetch-dest') === 'iframe' || 
                      request.headers.get('sec-fetch-site') === 'cross-site';
      
      // Set cookie with appropriate settings for environment
      response.cookies.set('auth-session', token, {
        httpOnly: true,
        secure: true, // Always true for production
        sameSite: isIframe ? 'none' : 'lax', // 'none' for iframe, 'lax' for standalone
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      
      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}