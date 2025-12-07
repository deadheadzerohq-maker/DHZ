'use client';

import { FormEvent, useState } from 'react';

const initialForm = {
  postedByType: 'broker',
  companyName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  originCity: '',
  originState: '',
  destCity: '',
  destState: '',
  equipment: '',
  rateTotal: '',
  ratePerMile: '',
  miles: '',
  pickupDate: '',
  notes: '',
};

export default function BrokerPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitted' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');
    try {
      const res = await fetch('/api/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error('Unable to post load');
      }
      setStatus('submitted');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message);
    }
  };

  return (
    <main className="grid gap-8">
      <section className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm max-w-4xl">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-brand-700">For brokers & shippers</p>
            <h1 className="text-3xl font-bold leading-tight">Post a load for free</h1>
            <p className="text-slate-600">
              Deadhead Zero routes your loads to carriers who already raised their hands for your lane. Early access is free.
            </p>
          </div>
          {status === 'submitted' ? (
            <div className="p-4 bg-brand-50 border border-brand-100 rounded-lg">
              <p className="font-semibold text-brand-800">Thanks! We’ve received your load.</p>
              <p className="text-sm text-brand-700">We’ll start matching it to active carriers and email you once it’s live.</p>
            </div>
          ) : null}
          {status === 'error' && <p className="text-sm text-red-600">{message}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700">I am a</label>
              <select
                value={form.postedByType}
                onChange={(e) => handleChange('postedByType', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              >
                <option value="broker">Broker</option>
                <option value="shipper">Shipper</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Company name</label>
              <input
                required
                value={form.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Contact name</label>
              <input
                required
                value={form.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Contact email</label>
              <input
                required
                type="email"
                value={form.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Contact phone (optional)</label>
              <input
                value={form.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Origin city</label>
              <input
                required
                value={form.originCity}
                onChange={(e) => handleChange('originCity', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Origin state</label>
              <input
                required
                value={form.originState}
                onChange={(e) => handleChange('originState', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Destination city</label>
              <input
                required
                value={form.destCity}
                onChange={(e) => handleChange('destCity', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Destination state</label>
              <input
                required
                value={form.destState}
                onChange={(e) => handleChange('destState', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Equipment</label>
              <select
                required
                value={form.equipment}
                onChange={(e) => handleChange('equipment', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select equipment</option>
                <option value="reefer">Reefer</option>
                <option value="van">Van</option>
                <option value="flatbed">Flatbed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Total or target rate</label>
              <input
                required
                value={form.rateTotal}
                onChange={(e) => handleChange('rateTotal', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Rate per mile</label>
              <input
                value={form.ratePerMile}
                onChange={(e) => handleChange('ratePerMile', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Miles (optional)</label>
              <input
                value={form.miles}
                onChange={(e) => handleChange('miles', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Pickup date</label>
              <input
                required
                type="date"
                value={form.pickupDate}
                onChange={(e) => handleChange('pickupDate', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 h-24 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-lg bg-brand-600 px-6 py-3 text-white font-semibold shadow hover:bg-brand-500"
              >
                Submit load
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
