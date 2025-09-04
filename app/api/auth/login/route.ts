import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const validUsername = process.env.DASH_USER;
    const validPassword = process.env.DASH_PASS;
    
    if (username === validUsername && password === validPassword) {
      const response = NextResponse.json({ success: true });
      
      // Set a simple session cookie
      response.cookies.set({
        name: 'auth-session',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
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