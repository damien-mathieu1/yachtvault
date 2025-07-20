import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Yacht data structure based on Supabase table
interface Yacht {
  name: string;
  builder: string;
  owner: string;
  flag: string;
  year_built: number;
  refit_year: string;
  length_m: number;
  beam_m: number;
  volume_gt: number;
  cruising_speed_kn: number;
  max_speed_kn: number;
  naval_architect: string;
  exterior_designer: string;
  interior_designer: string;
  sale_info: string;
  yacht_picture: string;
  detail_url: string;
}

// Initialize Supabase client with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// GET endpoint to fetch yachts with pagination
export async function GET(request: NextRequest) {
  // Check if Supabase is properly configured
  if (!supabase) {
    console.error('Supabase client not initialized - check environment variables');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection not configured. Please check environment variables.',
        details: {
          supabaseUrl: supabaseUrl ? 'Set' : 'Missing NEXT_PUBLIC_SUPABASE_URL',
          supabaseKey: supabaseKey ? 'Set' : 'Missing SUPABASE_SERVICE_ROLE_KEY'
        }
      },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const minLength = searchParams.get('minLength');
    const maxLength = searchParams.get('maxLength');
    const builder = searchParams.get('builder');
    const sortBy = searchParams.get('sortBy') || 'length_m.desc'; // Default sort

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query with filters
    let query = supabase
      .from('yachts')
      .select('*', { count: 'exact' });
    
    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,builder.ilike.%${search}%`);
    }
    
    // Apply length filters
    if (minLength) {
      query = query.gte('length_m', parseFloat(minLength));
    }
    if (maxLength) {
      query = query.lte('length_m', parseFloat(maxLength));
    }
    
    // Apply builder filter
    if (builder) {
      query = query.ilike('builder', `%${builder}%`);
    }
    
    // Apply sorting
    const [sortField, sortOrder] = sortBy.split('.');
    const allowedSortFields = ['length_m', 'year_built', 'max_speed_kn', 'volume_gt'];
    if (sortField && sortOrder && allowedSortFields.includes(sortField) && ['asc', 'desc'].includes(sortOrder)) {
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    } else {
      // Default or fallback sort if params are invalid
      query = query.order('length_m', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch yachts from database' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1
      },
      filters: {
        search,
        minLength,
        maxLength,
        builder,
        sortBy
      }
    });
  } catch (error) {
    console.error('API error:', error);
    const response = NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
    
    return response;
  }
}

