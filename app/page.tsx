import Link from 'next/link';

const bullets = [
  'Carriers set the lanes they actually want to run',
  'Brokers & shippers post loads for free',
  'Automated matching delivers curated emails to carriers',
];

export default function HomePage() {
  return (
    <main className="grid gap-10">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-sm font-semibold border border-brand-100">
              Deadhead Zero – Reverse Load Board™
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              Stop chasing loads. Let Deadhead Zero bring the right freight to you.
            </h1>
            <p className="text-lg text-slate-600">
              Carriers tell us where they WANT to run, and we email curated matches. Brokers and shippers submit freight once and we route it to carriers already waiting for those lanes. Operated by Deadhead Zero Logistics LLC.
            </p>
            <ul className="space-y-2 text-slate-700">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/carrier"
                className="inline-flex justify-center rounded-lg bg-brand-600 px-6 py-3 text-white font-semibold shadow hover:bg-brand-500"
              >
                I’m a Carrier
              </Link>
              <Link
                href="/broker"
                className="inline-flex justify-center rounded-lg border border-slate-300 px-6 py-3 text-slate-800 font-semibold hover:border-brand-300 hover:text-brand-700"
              >
                I’m a Broker/Shipper
              </Link>
            </div>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg space-y-5">
            <p className="font-semibold text-slate-200">Matching snapshot</p>
            <div className="space-y-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span>Dallas, TX → Atlanta, GA (reefer)</span>
                <span className="font-semibold">$3.15/mi</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chicago, IL → Columbus, OH (van)</span>
                <span className="font-semibold">$2.85/mi</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fresno, CA → Phoenix, AZ (flatbed)</span>
                <span className="font-semibold">$3.40/mi</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              We continuously scan new loads against your truck intents and email you only the good fits.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
