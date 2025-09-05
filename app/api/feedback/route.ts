import { NextRequest, NextResponse } from 'next/server';
import { filtersSchema } from '@/lib/validations';
import { supabase } from '@/lib/supabase';
import { getMockFeedback } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = filtersSchema.parse({
      email: searchParams.get('email') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    });

    try {
      // Try to use Supabase first
      const client = supabase();
      
      let query = client
        .from('chat')
        .select('id, created_at, title, email, feedback, comment_selection, comment_additional')
        .not('feedback', 'is', null);
      
      if (filters.email) {
        query = query.eq('email', filters.email);
      }
      
      if (filters.from) {
        query = query.gte('created_at', filters.from);
      }
      
      if (filters.to) {
        query = query.lte('created_at', filters.to + 'T23:59:59.999Z');
      }

      const { data: feedback, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query error, falling back to mock data:', error);
        const result = getMockFeedback(filters);
        return NextResponse.json(result);
      }

      return NextResponse.json(feedback || []);
    } catch (supabaseError) {
      console.warn('Supabase not available, using mock data:', supabaseError);
      // Fall back to mock data when Supabase is not available
      const result = getMockFeedback(filters);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}