import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deadhead Zero – Reverse Load Board™',
  description: 'Carrier-first matching operated by Deadhead Zero Logistics LLC.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-brand-50 to-white text-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">DZ</div>
              <div>
                <p className="text-lg font-semibold">Deadhead Zero – Reverse Load Board™</p>
                <p className="text-sm text-slate-500">Operated by Deadhead Zero Logistics LLC</p>
              </div>
            </div>
            <a className="text-sm font-semibold text-brand-700 hover:text-brand-500" href="/dashboard">
              Dashboard
            </a>
          </header>
          {children}
          <footer className="border-t border-slate-200 pt-6 text-sm text-slate-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p>© {new Date().getFullYear()} Deadhead Zero Logistics LLC</p>
              <p className="text-slate-500">
                Deadhead Zero – Reverse Load Board™ is a technology platform and not the freight broker of record for any
                shipment.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
