import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID_CARRIER_149;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!stripeSecret || !priceId || !siteUrl) {
      return NextResponse.json({ error: 'Missing Stripe configuration' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?email=${encodeURIComponent(email)}`,
      cancel_url: `${siteUrl}/carrier?canceled=1`,
      metadata: { email },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error', error);
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}
