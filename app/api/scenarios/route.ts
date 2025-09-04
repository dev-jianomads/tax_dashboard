import { NextRequest, NextResponse } from 'next/server';
import { filtersSchema } from '@/lib/validations';
import { supabase } from '@/lib/supabase';
import { getMockScenarios } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = filtersSchema.parse({
      email: searchParams.get('email') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '25',
    });

    try {
      // Try to use Supabase first
      const client = supabase();
      
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

      const { data: chats, error } = await query
        .order('created_at', { ascending: false })
        .range((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize - 1);

      if (error) {
        console.warn('Supabase query error, falling back to mock data:', error);
        const result = getMockScenarios(filters);
        return NextResponse.json(result);
      }

      // Get total count for pagination
      let countQuery = client.from('chat').select('*', { count: 'exact', head: true });
      
      if (filters.email) {
        countQuery = countQuery.eq('email', filters.email);
      }
      
      if (filters.from) {
        countQuery = countQuery.gte('created_at', filters.from);
      }
      
      if (filters.to) {
        countQuery = countQuery.lte('created_at', filters.to + 'T23:59:59.999Z');
      }

      const { count, error: countError } = await countQuery;

      const totalCount = countError ? 0 : (count || 0);
      const totalPages = Math.ceil(totalCount / filters.pageSize);

      const result = {
        data: chats || [],
        count: totalCount,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
      };

      return NextResponse.json(result);
    } catch (supabaseError) {
      console.warn('Supabase not available, using mock data:', supabaseError);
      // Fall back to mock data when Supabase is not available
      const result = getMockScenarios(filters);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error in scenarios API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}