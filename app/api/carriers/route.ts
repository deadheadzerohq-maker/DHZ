import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data: carrier } = await supabase.from('carriers').select('*').eq('email', email).single();
  const freshnessCutoff = Date.now() - 48 * 60 * 60 * 1000;
  const { data: intents } = await supabase
    .from('carrier_truck_intents')
    .select('*')
    .eq('carrier_id', carrier?.id || '')
    .order('created_at', { ascending: false });

  const intentsWithFreshness = (intents || []).map((intent) => ({
    ...intent,
    is_fresh: new Date(intent.created_at).getTime() >= freshnessCutoff,
  }));

  return NextResponse.json({ carrier, intents: intentsWithFreshness });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, name, company_name, mc_number } = body;
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('carriers')
    .upsert({ email, name, company_name, mc_number }, { onConflict: 'email' })
    .select('*')
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to save carrier' }, { status: 500 });
  }
  return NextResponse.json({ carrier: data });
}
