'use client';

import { FormEvent, useState } from 'react';

export default function CarrierPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        throw new Error('Unable to start checkout');
      }
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid gap-8">
      <section className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
        <div className="space-y-5 max-w-3xl">
          <p className="text-sm font-semibold text-brand-700">For carriers</p>
          <h1 className="text-4xl font-bold leading-tight">Lock in the lanes you want. We deliver matching loads.</h1>
          <p className="text-lg text-slate-600">
            Deadhead Zero – Reverse Load Board™ is carrier-first. Set your preferred origin/destination, equipment, and rate, then relax while we email you strong matches. One flat fee: $149/month through Deadhead Zero Logistics LLC.
          </p>
          <form onSubmit={handleCheckout} className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Email to start checkout</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@carrier.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="whitespace-nowrap inline-flex justify-center rounded-lg bg-brand-600 px-6 py-3 text-white font-semibold shadow hover:bg-brand-500"
              >
                {loading ? 'Starting...' : 'Start for $149/month'}
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
          <div className="grid sm:grid-cols-3 gap-4 pt-4 text-sm text-slate-700">
            <div className="p-4 bg-brand-50 rounded-lg">
              <p className="font-semibold">Automated matching</p>
              <p>We check new loads every 15 minutes.</p>
            </div>
            <div className="p-4 bg-brand-50 rounded-lg">
              <p className="font-semibold">Zero bidding</p>
              <p>Only loads matching your intents reach your inbox.</p>
            </div>
            <div className="p-4 bg-brand-50 rounded-lg">
              <p className="font-semibold">Flat pricing</p>
              <p>$149/mo via Stripe. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
