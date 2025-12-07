import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, origin_city, origin_state, dest_city, dest_state, equipment, min_rate_per_mile, available_date, notes } = body;
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data: carrier, error: carrierError } = await supabase
    .from('carriers')
    .select('*')
    .eq('email', email)
    .single();
  if (carrierError || !carrier) return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
  if (!carrier.is_active_subscriber) return NextResponse.json({ error: 'Subscription inactive' }, { status: 402 });

  const { error } = await supabase.from('carrier_truck_intents').insert({
    carrier_id: carrier.id,
    origin_city,
    origin_state,
    dest_city,
    dest_state,
    equipment,
    min_rate_per_mile: min_rate_per_mile ? Number(min_rate_per_mile) : null,
    available_date,
    notes,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to create intent' }, { status: 500 });
  }

  const freshnessCutoff = Date.now() - 48 * 60 * 60 * 1000;
  const { data: intents } = await supabase
    .from('carrier_truck_intents')
    .select('*')
    .eq('carrier_id', carrier.id)
    .order('created_at', { ascending: false });

  const intentsWithFreshness = (intents || []).map((intent) => ({
    ...intent,
    is_fresh: new Date(intent.created_at).getTime() >= freshnessCutoff,
  }));

  return NextResponse.json({ intents: intentsWithFreshness });
}
