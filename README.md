# Sika Boafo

## Local setup

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project.
4. Set `VITE_PAYSTACK_PUBLIC_KEY` if paid checkout is enabled.
5. Run `npm install`, then `npm run dev`.

## Production release

1. Apply the SQL files in `supabase/migrations` to the production Supabase project.
2. In Supabase Authentication, configure the production site URL and redirect URL:
   `https://your-domain.example/#/auth/callback`
   Registration confirmation links redirect through `#/auth/callback?next=/pricing`
   and then open Business Plans. Add the equivalent URL for your production domain to
   Supabase's redirect allow list.
3. Configure Google OAuth only if Google sign-in is enabled.
4. Build with `npm run build`.
5. Deploy the complete `dist` folder to a static host with SPA fallback to `index.html`.
6. Serve the site over HTTPS and set the production environment variables in the hosting provider.
7. Deploy the payment verification function and set its secret without exposing it to the browser:

```bash
supabase db push
supabase functions deploy verify-paystack-payment
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_your_secret_key
```

Use the matching `pk_live_...` public key as `VITE_PAYSTACK_PUBLIC_KEY` in the hosting provider. Never put an `sk_live_...` or `sk_test_...` key in `.env.local` or frontend code. The `008_secure_payments.sql` migration prevents browser sessions from changing a business plan directly.
8. The Business checkout charges GH₵30 for the first month and GH₵60 for each additional month selected, up to 12 months. The dashboard route remains locked until the verified Business plan is loaded from Supabase.
9. Configure Paystack webhooks to a server-side endpoint before relying on recurring billing or asynchronous mobile-money confirmation. The current checkout verifies the transaction immediately, while webhook handling should reconcile delayed or reversed transactions.
10. Test registration, email confirmation, login, product creation, sales, reports, logout, payment verification, dashboard access, and mobile scrolling.

The owner account `princetechstudio@gmail.com` is configured as a dashboard
access bypass for administration and testing. It still requires a valid
Supabase login and does not mark the business as paid or bypass Paystack
verification for other accounts. Remove this exception before handing the
repository to another operator.

The app uses hash-based routes, so the host must serve `index.html` for `/` and must not rewrite JavaScript or CSS asset requests to HTML. The service worker cache is versioned in `public/sw.js`; deploy that file with every release.

## CEO dashboard

Apply `supabase/migrations/006_ceo_pin.sql` and then `supabase/migrations/007_fix_ceo_pin_pgcrypto.sql` to production. If the old `gen_salt` error remains, rerun the complete 007 file; it recreates the functions after installing `pgcrypto` in the `extensions` schema. A signed-in business owner can open Settings, create a 4-digit CEO PIN, and then open `/#/ceo`. The PIN is hashed and verified inside Supabase; it is never stored in browser storage. The dashboard is scoped to the signed-in owner's business.

## Platform admin dashboard

The platform admin dashboard is available at `/#/admin`. It is read-only and loads
business, user, and payment summaries through the protected `admin-overview`
Supabase Edge Function. Configure the administrator email in both the frontend
allowlist and the server-side secret:

```bash
VITE_DEVELOPER_EMAILS=you@example.com
supabase secrets set ADMIN_EMAILS=you@example.com
npm run build
```

Deploy the function after applying the configuration:

```bash
supabase functions deploy admin-overview
```

Users whose signed-in email is not on the frontend allowlist receive 404, and
the Edge Function separately rejects any email not in `ADMIN_EMAILS`. Never put
the Supabase service-role key in Netlify or browser code.
