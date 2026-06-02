# A'New Dawn Customer Portal + QR Launch

## Domains

Use `anewdawncoaching.org` as the production domain.

- Public website: `https://anewdawncoaching.org`
- WWW alias: `https://www.anewdawncoaching.org`
- Customer/course app: `https://app.anewdawncoaching.org`

In Netlify, add all three domains to the same project unless a separate app project is created later.

## GoDaddy DNS

After GoDaddy finishes verification, connect DNS to Netlify:

- Add the apex/root domain `anewdawncoaching.org` in Netlify.
- Add `www.anewdawncoaching.org` in Netlify.
- Add `app.anewdawncoaching.org` in Netlify.
- Follow the exact DNS records Netlify gives you for the apex and subdomains.
- Wait for Netlify HTTPS certificates to finish provisioning.

If Netlify is managing DNS for the domain, add `app.anewdawncoaching.org` through the site's domain settings/custom domains area. Netlify may warn that a manual CNAME to `*.netlify.app` is unnecessary or conflicting because it can create the needed managed record automatically.

## Netlify Environment Variables

Keep these in Netlify environment variables, not in public code:

```txt
SUPABASE_URL=https://ayjsgmdpzlsokfgyjhsl.supabase.co
SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key, server only>
VITE_SUPABASE_URL=https://ayjsgmdpzlsokfgyjhsl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
VITE_PUBLIC_SITE_URL=https://app.anewdawncoaching.org
VITE_CAL_BOOKING_URL=<Cal.com booking link when ready>
```

`SUPABASE_SERVICE_ROLE_KEY` is required for the dashboard customer invite helper. Never expose it in browser code or client-side docs.

## Supabase Setup

Run the migration:

```txt
supabase/migrations/20260602120000_customer_courses_qr.sql
supabase/migrations/20260602154500_onboarding_worksheet_resource.sql
supabase/migrations/20260602230000_activate_customer_invites.sql
```

The final invite activation migration turns a customer's `invited` enrollment into `active` when they log into the portal for the first time.

Then update Supabase Auth URL settings:

- Site URL: `https://app.anewdawncoaching.org`
- Redirect URLs:
  - `https://anewdawncoaching.org/*`
  - `https://www.anewdawncoaching.org/*`
  - `https://app.anewdawncoaching.org/*`
  - `https://anew-dawn.netlify.app/*` while the Netlify preview URL is still in use
  - local development URL if needed

Recommended security settings:

- Keep customer signup invite-only.
- Turn on email confirmation when ready.
- Enable MFA for admin/developer accounts.
- Keep row level security enabled.

## Customer Setup Flow

1. Log into `/dawn-gate-9vK2mQ7p` as admin or `/dev-gate-n9Qk4Lw8` as developer.
2. Open `/dashboard`.
3. Go to `Customers / Courses`.
4. Enter the customer's name and email.
5. Assign `The Dawn Method`.
6. Send the invite.
7. Customer accepts the Supabase invite, creates a password, and logs in through `/customer-login`.

Included setup scope is one course and up to five customer accounts.

## QR Flow

Default QR short route:

```txt
https://app.anewdawncoaching.org/go/dawn-method
```

Behavior:

- Not logged in: redirects to `/customer-login`, then opens the intended course.
- Logged in but not enrolled: course page shows access unavailable.
- Logged in and enrolled: opens the course.

QR codes are route helpers only. Course access is controlled by Supabase Auth, role checks, and RLS.
