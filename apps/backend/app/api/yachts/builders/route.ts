import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables for builders route');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// GET endpoint to fetch unique yacht builders
export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database connection not configured.' },
      { status: 500 }
    );
  }

  try {
    // Call the RPC function to get distinct builders
    const { data, error } = await supabase.rpc('get_distinct_builders');

    if (error) {
      console.error('Supabase error fetching builders:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch builders from database' },
        { status: 500 }
      );
    }

    // The RPC function already returns unique builders
    const uniqueBuilders = data ? data.map((item: { builder: string }) => item.builder) : [];

    return NextResponse.json({ success: true, data: uniqueBuilders });

  } catch (error) {
    console.error('API error fetching builders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

