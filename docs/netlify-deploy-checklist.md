# Netlify Deployment Checklist

This project is a TanStack Start app with protected routes, Supabase auth, and server output. Do not deploy it as a static drag-and-drop folder.

Official reference: https://docs.netlify.com/frameworks/tanstack-start/

## Current Status

- Local project builds successfully with the current TanStack/Lovable/Cloudflare-oriented setup.
- Local environment can be connected to the active Supabase project through environment variables.
- This local machine does not currently expose `npm`, `npx`, `bun`, `pnpm`, `yarn`, or the `netlify` CLI in the shell path.
- Netlify deployment uses `@netlify/vite-plugin-tanstack-start` and `netlify.toml`.

## Required Before Netlify Deploy

1. Connect this repo/project to Netlify.
2. Confirm Netlify's TanStack Start adapter is installed in the production repo:

```sh
npm install -D @netlify/vite-plugin-tanstack-start
```

3. Confirm `vite.config.ts` includes the Netlify adapter per the current Netlify TanStack Start docs.
4. Confirm `netlify.toml` exists:

```toml
[build]
  command = "npm run build"
  publish = "dist/client"
```

5. In Netlify, add these environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_CAL_BOOKING_URL`

Do not place the service role key in a client-facing document. It should only live in Netlify environment variables or secure password storage.

## Supabase Checklist

Run these migrations in Supabase SQL Editor, in this order:

1. `supabase/migrations/20260512235202_ab38c8ef-2538-46ef-a4f3-7feaabab0472.sql`
2. `supabase/migrations/20260512235236_add1a852-aab7-4e62-a39d-4c2d7f667605.sql`
3. `supabase/migrations/20260523053000_booking_name_settings_delete.sql`
4. `supabase/migrations/20260523143500_delete_dashboard_entries_rpc.sql`

Then create auth users and assign roles:

```sql
insert into public.profiles (id, username, role)
select id, email, 'admin'::public.app_role
from auth.users
where email = 'ADMIN_EMAIL_HERE'
on conflict (id) do update
set role = 'admin'::public.app_role,
    username = excluded.username;

insert into public.profiles (id, username, role)
select id, email, 'developer'::public.app_role
from auth.users
where email = 'DEVELOPER_EMAIL_HERE'
on conflict (id) do update
set role = 'developer'::public.app_role,
    username = excluded.username;
```

Current temporary accounts:

- Regular admin: `badge-sleek-garlic@duck.com`
- Developer admin: `aloft-upbeat-visor@duck.com`

## Cal.com / Google Calendar

Google Calendar should be connected inside Cal.com. The website only needs the public Cal.com booking URL.

After logging into the dashboard:

1. Open `/dashboard`.
2. Go to `Settings`.
3. Paste the public Cal.com booking URL.
4. Save.
5. Test `/book` and complete the quiz.

The booking page will show the live scheduler once a valid Cal.com URL is saved or provided through `VITE_CAL_BOOKING_URL`.

## QA Before Sending The Client Link

- `/` loads and the homepage looks correct on desktop and mobile.
- `/book` advances through all 3 questions.
- `/book` asks for a name after the quiz.
- Booking quiz submission appears in `/dashboard`.
- Booking quiz cards can be deleted from `/dashboard`.
- `/form` submits a survey entry.
- Survey entries appear under `Survey Entries`.
- Notes can be created and deleted.
- Admin login works at `/dawn-gate-9vK2mQ7p`.
- Developer login works at `/dev-gate-n9Qk4Lw8`.
- Developer account sees the Developer dashboard tab.
- Contact form submits to Supabase.
- Production build passes.

## Known Launch Blockers

- Netlify site/project link is not connected in this local workspace yet.
- Final Cal.com URL is pending unless the owner has already created it.
- Client portrait, testimonials, service prices, and final contact details still need owner approval.
