# Deadhead Zero – Reverse Load Board™

Carrier-first SaaS marketplace operated by Deadhead Zero Logistics LLC. Carriers subscribe to post preferred lanes and receive matching loads via email. Brokers and shippers can post loads for free.

## Tech stack
- Next.js 14 (App Router, TypeScript)
- Supabase (Postgres + Auth + Edge Functions)
- Stripe Checkout for carrier subscriptions ($149/mo)
- Resend for transactional emails
- Optional OpenAI for nicer match email copy

## Environment variables
Copy `.env.example` and fill with your secrets.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_CARRIER_149=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Local development
1. Install dependencies
   ```bash
   npm install
   ```
2. Run the dev server
   ```bash
   npm run dev
   ```
3. The app will be available at `http://localhost:3000`.

> If you cannot install packages in this environment, push to GitHub/Vercel where installs run automatically.

## Supabase setup
1. Create a Supabase project and set the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` env vars.
2. Apply the schema:
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/schema.sql
   ```
3. Deploy the matching Edge Function and schedule (e.g., every 15 minutes) to keep intents/loads fresh (48-hour TTL):
   ```bash
   supabase functions deploy match-intents --project-ref <project-ref>
   supabase functions deploy cleanup-stale-records --project-ref <project-ref>
   ```
   Ensure the function has access to `RESEND_API_KEY`, `OPENAI_API_KEY`, and the Supabase service role key.
4. Add a Supabase cron job for `cleanup-stale-records` (e.g., every hour) to mark intents inactive and loads expired after 48 hours.

## Stripe
- Configure a single recurring price for carriers (`STRIPE_PRICE_ID_CARRIER_149`).
- Update `NEXT_PUBLIC_SITE_URL` for local and production.
- Add a webhook endpoint pointing to `/api/stripe-webhook` with the signing secret in `STRIPE_WEBHOOK_SECRET`.
- Successful checkout redirects to `/dashboard?email={email}`.

## Resend
- Set `RESEND_API_KEY` to enable transactional emails for load confirmations and carrier match summaries.

## Matching job
- See `supabase/functions/match-intents/index.ts` for the periodic matcher that emails carriers with matching loads. It only considers intents and loads newer than 48 hours.
- Schedule via Supabase cron: every 15 minutes is suggested.

## Deployment (Vercel)
1. Push this repo to GitHub.
2. Import into Vercel and choose the Next.js framework preset.
3. Set all env vars in Vercel.
4. Add the Stripe webhook URL from Vercel to your Stripe dashboard.
