import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { resendClient } from '@/lib/email';

export async function POST(request: Request) {
  const body = await request.json();
  const {
    postedByType,
    companyName,
    contactName,
    contactEmail,
    contactPhone,
    originCity,
    originState,
    destCity,
    destState,
    equipment,
    rateTotal,
    ratePerMile,
    miles,
    pickupDate,
    notes,
  } = body;

  if (!postedByType || !['broker', 'shipper'].includes(postedByType)) {
    return NextResponse.json({ error: 'posted_by_type must be broker or shipper' }, { status: 400 });
  }
  if (!companyName || !contactName || !contactEmail || !originCity || !originState || !destCity || !destState || !equipment || !pickupDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from('loads').insert({
    posted_by_type: postedByType,
    company_name: companyName,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    origin_city: originCity,
    origin_state: originState,
    dest_city: destCity,
    dest_state: destState,
    equipment,
    rate_total: rateTotal ? Number(rateTotal) : null,
    rate_per_mile: ratePerMile ? Number(ratePerMile) : null,
    miles: miles ? Number(miles) : null,
    pickup_date: pickupDate,
    notes,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to store load' }, { status: 500 });
  }

  try {
    const resend = resendClient();
    await resend.emails.send({
      from: 'Deadhead Zero – Reverse Load Board <alerts@deadheadzero.com>',
      to: contactEmail,
      subject: 'We received your load',
      html: `<p>Thanks ${contactName || ''}! We received your load from ${originCity}, ${originState} to ${destCity}, ${destState}. Deadhead Zero is matching it to active carriers now.</p>`,
    });
  } catch (err) {
    console.error('Resend error', err);
  }

  return NextResponse.json({ ok: true });
}
