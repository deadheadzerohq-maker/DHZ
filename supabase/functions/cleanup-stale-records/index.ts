import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.2';

serve(async () => {
  const url = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return new Response('Missing env', { status: 500 });

  const supabase = createClient(url, serviceKey);
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { error: intentsError } = await supabase
    .from('carrier_truck_intents')
    .update({ is_active: false })
    .lt('created_at', cutoff);

  const { error: loadsError } = await supabase
    .from('loads')
    .update({ status: 'expired' })
    .lt('created_at', cutoff);

  const body = {
    intents_error: intentsError?.message,
    loads_error: loadsError?.message,
    cutoff,
  };

  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
});
