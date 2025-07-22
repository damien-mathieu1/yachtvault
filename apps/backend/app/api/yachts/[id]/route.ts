import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database connection not configured.' },
      { status: 500 }
    );
  }

  // Récupérer l'ID depuis l'URL
  const id = req.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ success: false, error: 'Yacht ID is required.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('yachts_enhance_data')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Yacht not found.' }, { status: 404 });
      }
      throw error;
    }

    if (data) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: 'Yacht not found.' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Error fetching yacht by ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal server error occurred.',
        details: error.message
      },
      { status: 500 }
    );
  }
}
