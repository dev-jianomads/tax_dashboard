import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMockEmails } from '@/lib/mockData';

export async function GET() {
  try {
    try {
      // Try to use Supabase first
      const client = supabase();
      const { data: chats, error } = await client
        .from('chat')
        .select('email')
        .order('email');

      if (error) {
        console.warn('Supabase query error, falling back to mock data:', error);
        const uniqueEmails = getMockEmails();
        return NextResponse.json(uniqueEmails);
      }

      const uniqueEmails = [...new Set(chats.map((chat: any) => chat.email))].sort();
      return NextResponse.json(uniqueEmails);
    } catch (supabaseError) {
      console.warn('Supabase not available, using mock data:', supabaseError);
      // Fall back to mock data when Supabase is not available
      const uniqueEmails = getMockEmails();
      return NextResponse.json(uniqueEmails);
    }
  } catch (error) {
    console.error('Error in emails API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}