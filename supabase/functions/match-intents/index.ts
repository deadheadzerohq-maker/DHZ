import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.2';
import OpenAI from 'https://esm.sh/openai@4.83.0';

interface CarrierIntent {
  id: string;
  carrier_id: string;
  origin_state: string;
  dest_state: string;
  equipment: string;
  available_date: string;
  min_rate_per_mile: number | null;
  carriers: {
    email: string;
    name: string | null;
    is_active_subscriber: boolean;
  };
}

serve(async () => {
  const url = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!url || !serviceKey) return new Response('Missing env', { status: 500 });

  const supabase = createClient(url, serviceKey);
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: intents, error: intentError } = await supabase
    .from('carrier_truck_intents')
    .select('*, carriers!inner(email, name, is_active_subscriber)')
    .eq('is_active', true)
    .gte('created_at', cutoff);

  if (intentError) {
    console.error(intentError);
    return new Response('Intent query failed', { status: 500 });
  }

  const activeIntents = (intents || []).filter((intent) => intent.carriers.is_active_subscriber);

  const emailPayload: Record<string, { carrierName?: string; matches: any[]; intentIds: string[] }> = {};

  for (const intent of activeIntents as any as CarrierIntent[]) {
    const loadQuery = supabase
      .from('loads')
      .select('*')
      .eq('equipment', intent.equipment)
      .eq('origin_state', intent.origin_state)
      .eq('dest_state', intent.dest_state)
      .eq('pickup_date', intent.available_date)
      .eq('status', 'open')
      .gte('created_at', cutoff);

    if (intent.min_rate_per_mile !== null) {
      loadQuery.gte('rate_per_mile', intent.min_rate_per_mile);
    }

    const { data: loads, error: loadError } = await loadQuery;
    if (loadError) {
      console.error(loadError);
      continue;
    }

    for (const load of loads || []) {
      const score = 100;
      await supabase.from('intent_load_matches').upsert({
        carrier_intent_id: intent.id,
        load_id: load.id,
        match_score: score,
        sent_to_carrier: false,
      });

      if (!emailPayload[intent.carriers.email]) {
        emailPayload[intent.carriers.email] = { carrierName: intent.carriers.name || undefined, matches: [], intentIds: [] };
      }

      emailPayload[intent.carriers.email].matches.push({
        origin: `${load.origin_city}, ${load.origin_state}`,
        destination: `${load.dest_city}, ${load.dest_state}`,
        equipment: load.equipment,
        rate: load.rate_per_mile ? `$${load.rate_per_mile}/mi` : load.rate_total ? `$${load.rate_total} total` : 'Rate not provided',
        pickup: load.pickup_date,
      });
      if (!emailPayload[intent.carriers.email].intentIds.includes(intent.id)) {
        emailPayload[intent.carriers.email].intentIds.push(intent.id);
      }
    }
  }

  if (resendKey) {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    for (const [email, payload] of Object.entries(emailPayload)) {
      const html = openaiKey
        ? await generateWithOpenAI(payload.matches, openaiKey)
        : fallbackTemplate(payload.matches, payload.carrierName);
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Deadhead Zero – Reverse Load Board <alerts@deadheadzero.com>',
          to: email,
          subject: 'Deadhead Zero – New loads matching your lanes',
          html,
        }),
      });

      if (payload.intentIds.length > 0) {
        await supabase
          .from('intent_load_matches')
          .update({ sent_to_carrier: true, sent_at: new Date().toISOString() })
          .eq('sent_to_carrier', false)
          .in('carrier_intent_id', payload.intentIds);
      }
    }
  }

  return new Response(
    JSON.stringify({ sent: Object.keys(emailPayload).length, cutoff }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});

async function generateWithOpenAI(matches: any[], key: string) {
  const client = new OpenAI({ apiKey: key });
  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: `Draft a concise HTML email summarizing these load matches for Deadhead Zero – Reverse Load Board™: ${JSON.stringify(
      matches
    )}`,
  });
  return (response.output[0]?.content[0] as any)?.text || fallbackTemplate(matches);
}

function fallbackTemplate(matches: any[], carrierName?: string) {
  const rows = matches
    .map(
      (m) => `<li><strong>${m.origin} → ${m.destination}</strong> (${m.equipment}) - ${m.rate}, pickup ${m.pickup}</li>`
    )
    .join('');
  return `<div style="font-family: Arial, sans-serif;">
    <h2>Hi ${carrierName || 'carrier'}, new Deadhead Zero matches are ready</h2>
    <p>We only include intents and loads newer than 48 hours.</p>
    <ul>${rows}</ul>
  </div>`;
}
