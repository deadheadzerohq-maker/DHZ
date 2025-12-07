'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Carrier = {
  email: string;
  name: string;
  company_name: string;
  mc_number: string;
  is_active_subscriber: boolean;
};

type Intent = {
  id: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  equipment: string;
  min_rate_per_mile: string;
  available_date: string;
  notes: string;
  is_active: boolean;
  created_at?: string;
  is_fresh?: boolean;
};

const emptyProfile: Carrier = {
  email: '',
  name: '',
  company_name: '',
  mc_number: '',
  is_active_subscriber: false,
};

const emptyIntent = {
  origin_city: '',
  origin_state: '',
  dest_city: '',
  dest_state: '',
  equipment: 'van',
  min_rate_per_mile: '',
  available_date: '',
  notes: '',
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get('email') || '';

  const [profile, setProfile] = useState<Carrier>({ ...emptyProfile, email: emailParam });
  const [intents, setIntents] = useState<Intent[]>([]);
  const [intentForm, setIntentForm] = useState(emptyIntent);
  const [loading, setLoading] = useState(false);
  const [intentLoading, setIntentLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailInput, setEmailInput] = useState(emailParam);

  useEffect(() => {
    if (!emailParam) return;
    setEmailInput(emailParam);
    const fetchProfile = async () => {
      const res = await fetch(`/api/carriers?email=${encodeURIComponent(emailParam)}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          email: emailParam,
          name: data.carrier?.name || '',
          company_name: data.carrier?.company_name || '',
          mc_number: data.carrier?.mc_number || '',
          is_active_subscriber: !!data.carrier?.is_active_subscriber,
        });
        setIntents(data.intents || []);
      }
    };
    fetchProfile();
  }, [emailParam]);

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    router.replace(`/dashboard?email=${encodeURIComponent(emailInput)}`);
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Unable to save profile');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleIntentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIntentLoading(true);
    try {
      const res = await fetch('/api/truck-intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...intentForm, email: profile.email }),
      });
      if (!res.ok) throw new Error('Unable to save intent');
      const data = await res.json();
      setIntents(data.intents);
      setIntentForm(emptyIntent);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIntentLoading(false);
    }
  };

  if (!emailParam) {
    return (
      <main className="grid gap-4">
        <section className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm max-w-2xl">
          <h1 className="text-3xl font-bold mb-3">Enter your carrier email to view the dashboard</h1>
          <p className="text-slate-600">
            After checkout you’ll land here automatically. You can also enter the carrier email tied to your subscription to
            load your profile and intents.
          </p>
          <form onSubmit={handleEmailSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <input
              required
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              placeholder="you@carrier.com"
            />
            <button
              type="submit"
              className="inline-flex justify-center rounded-lg bg-brand-600 px-6 py-3 text-white font-semibold shadow hover:bg-brand-500"
            >
              Load dashboard
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="grid gap-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">Carrier profile</p>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-slate-600">Update your details and keep your intents fresh (expires after 48 hours).</p>
          </div>
          {!profile.is_active_subscriber && (
            <div className="bg-amber-50 text-amber-800 text-sm border border-amber-200 rounded-lg px-4 py-2 max-w-sm">
              <p className="font-semibold">Subscription inactive</p>
              <p className="text-amber-700">We can’t accept new intents until your subscription is active.</p>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <form onSubmit={handleProfileSubmit} className="grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <input
              disabled
              value={profile.email}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Company</label>
            <input
              value={profile.company_name}
              onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">MC number</label>
            <input
              value={profile.mc_number}
              onChange={(e) => setProfile({ ...profile, mc_number: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-lg bg-brand-600 px-6 py-3 text-white font-semibold shadow hover:bg-brand-500"
            >
              {loading ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Truck intents</h2>
            <p className="text-slate-600">Define the lanes you want to run. Intents older than 48 hours expire.</p>
          </div>
          {!profile.is_active_subscriber && (
            <p className="text-sm text-amber-700">Activate your subscription to add intents.</p>
          )}
        </div>
        <form onSubmit={handleIntentSubmit} className="grid md:grid-cols-3 gap-4" aria-disabled={!profile.is_active_subscriber}>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Origin city</label>
            <input
              required
              disabled={!profile.is_active_subscriber}
              value={intentForm.origin_city}
              onChange={(e) => setIntentForm({ ...intentForm, origin_city: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Origin state</label>
            <input
              required
              disabled={!profile.is_active_subscriber}
              value={intentForm.origin_state}
              onChange={(e) => setIntentForm({ ...intentForm, origin_state: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Destination city</label>
            <input
              required
              disabled={!profile.is_active_subscriber}
              value={intentForm.dest_city}
              onChange={(e) => setIntentForm({ ...intentForm, dest_city: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Destination state</label>
            <input
              required
              disabled={!profile.is_active_subscriber}
              value={intentForm.dest_state}
              onChange={(e) => setIntentForm({ ...intentForm, dest_state: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Equipment</label>
            <select
              disabled={!profile.is_active_subscriber}
              value={intentForm.equipment}
              onChange={(e) => setIntentForm({ ...intentForm, equipment: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            >
              <option value="van">Van</option>
              <option value="reefer">Reefer</option>
              <option value="flatbed">Flatbed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Minimum $/mile</label>
            <input
              disabled={!profile.is_active_subscriber}
              value={intentForm.min_rate_per_mile}
              onChange={(e) => setIntentForm({ ...intentForm, min_rate_per_mile: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Available date</label>
            <input
              required
              type="date"
              disabled={!profile.is_active_subscriber}
              value={intentForm.available_date}
              onChange={(e) => setIntentForm({ ...intentForm, available_date: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Notes</label>
            <textarea
              disabled={!profile.is_active_subscriber}
              value={intentForm.notes}
              onChange={(e) => setIntentForm({ ...intentForm, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 h-24 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={!profile.is_active_subscriber || intentLoading}
              className="inline-flex justify-center rounded-lg bg-brand-600 px-6 py-3 text-white font-semibold shadow hover:bg-brand-500"
            >
              {intentLoading ? 'Saving...' : 'Add intent'}
            </button>
          </div>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Existing intents</h3>
          {intents.length === 0 ? (
            <p className="text-slate-600 text-sm">No intents yet.</p>
          ) : (
            <div className="grid gap-3">
              {intents.map((intent) => (
                <div key={intent.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">
                      {intent.origin_city}, {intent.origin_state} → {intent.dest_city}, {intent.dest_state} ({intent.equipment})
                    </p>
                    <span className="text-sm text-slate-600">{intent.available_date}</span>
                  </div>
                  <p className="text-sm text-slate-700">Min ${intent.min_rate_per_mile || 'N/A'} / mile</p>
                  {intent.notes && <p className="text-sm text-slate-600 mt-1">Notes: {intent.notes}</p>}
                  {!intent.is_fresh && (
                    <p className="text-xs text-amber-700 mt-1">Expired (older than 48 hours; refresh to stay matchable)</p>
                  )}
                  {!intent.is_active && <p className="text-xs text-amber-700 mt-1">Inactive</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
