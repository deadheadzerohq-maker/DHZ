import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const handleActivation = async (email: string, active: boolean) => {
    await supabase
      .from('carriers')
      .upsert({ email, is_active_subscriber: active })
      .eq('email', email);
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer_email) await handleActivation(session.customer_email, true);
        break;
      }
      case 'customer.subscription.updated':
      case 'invoice.payment_succeeded': {
        const subscription = event.data.object as Stripe.Subscription;
        const email = (subscription as any)?.customer_email || subscription?.metadata?.email;
        if (email) await handleActivation(email, true);
        break;
      }
      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const subscription = event.data.object as Stripe.Subscription;
        const email = (subscription as any)?.customer_email || subscription?.metadata?.email;
        if (email) await handleActivation(email, false);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error', err);
    return NextResponse.json({ error: 'Webhook failure' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
