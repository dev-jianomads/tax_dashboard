import { NextRequest, NextResponse } from 'next/server';
import { filtersSchema } from '@/lib/validations';
import { supabase } from '@/lib/supabase';
import { getMockMetrics } from '@/lib/mockData';

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
      
      // Fetch chats with filters
      let query = client.from('chat').select('*');
      
      if (filters.email) {
        query = query.eq('email', filters.email);
      }
      
      if (filters.from) {
        query = query.gte('created_at', filters.from);
      }
      
      if (filters.to) {
        query = query.lte('created_at', filters.to + 'T23:59:59.999Z');
      }

      const { data: chats, error } = await query;

      if (error) {
        console.warn('Supabase query error, falling back to mock data:', error);
        const metrics = getMockMetrics(filters);
        return NextResponse.json(metrics);
      }

      // Calculate metrics from real data
      const scenariosCount = chats.length;
      const latestFive = chats
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(chat => ({
          id: chat.id,
          created_at: chat.created_at,
          title: chat.title,
          email: chat.email,
        }));
      const totalProcessTime = chats.reduce((sum, chat) => sum + (chat.processTime || 0), 0);
      const avgProcessTime = scenariosCount > 0 ? totalProcessTime / scenariosCount : 0;

      // Calculate engagement
      let engagement = 0;
      if (scenariosCount > 0) {
        const chatIds = chats.map(chat => chat.id);
        const { count: conversationCount, error: convError } = await client
          .from('conversation')
          .select('*', { count: 'exact', head: true })
          .in('chat_id', chatIds);

        if (!convError && conversationCount !== null) {
          engagement = conversationCount / scenariosCount;
        }
      }

      const metrics = {
        scenariosCount,
        latestFive,
        totalProcessTime,
        avgProcessTime,
        engagement,
      };

      return NextResponse.json(metrics);
    } catch (supabaseError) {
      console.warn('Supabase not available, using mock data:', supabaseError);
      // Fall back to mock data when Supabase is not available
      const metrics = getMockMetrics(filters);
      return NextResponse.json(metrics);
    }
  } catch (error) {
    console.error('Error in metrics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}