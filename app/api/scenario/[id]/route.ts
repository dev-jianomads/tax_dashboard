import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMockScenario } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid scenario ID' }, { status: 400 });
    }

    try {
      // Try to use Supabase first
      const client = supabase();
      
      // Fetch chat details
      const { data: chat, error: chatError } = await client
        .from('chat')
        .select('*')
        .eq('id', id)
        .single();

      if (chatError || !chat) {
        console.warn('Supabase query error, falling back to mock data:', chatError);
        const result = getMockScenario(id);
        
        if (!result) {
          return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
        }
        
        return NextResponse.json(result);
      }

      // Fetch conversations
      const { data: conversations, error: convError } = await client
        .from('conversation')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      const result = {
        chat,
        conversations: conversations || [],
      };

      return NextResponse.json(result);
    } catch (supabaseError) {
      console.warn('Supabase not available, using mock data:', supabaseError);
      // Fall back to mock data when Supabase is not available
      const result = getMockScenario(id);
      
      if (!result) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
      }
      
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error in scenario API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}