import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseClient: any = null;

// Initialize with public environment variables
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: { 
        'x-application-name': 'praxio-dashboard'
      }
    }
  });
} else {
  console.warn('❌ Supabase not configured:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey
  });
}

export const supabase = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }
  return supabaseClient;
};

export interface Chat {
  id: number;
  created_at: string;
  title: string;
  scenario: string;
  user_id: string;
  email: string;
  processTime: number;
  research: string;
  draft: string;
  citations: string;
  citationsURL: string;
  citationsList: string;
  citationsArray: any;
  usedcitationsA: string;
  questions: string;
  model: string;
  archive: boolean;
  feedback: number;
  comment_sel0: string;
  comment_add0: string;
  updated_on: string;
}

export interface Conversation {
  id: number;
  created_at: string;
  type: 'user' | 'assistant';
  content: string;
  chat_id: number;
}