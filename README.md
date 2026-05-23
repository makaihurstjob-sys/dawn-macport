# A'New Dawn Coaching Website

A production-oriented React, TanStack Router, Tailwind, Framer Motion, and Supabase website for A'New Dawn Coaching.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env
```

3. Add your Supabase project URL, publishable key, project id, and Cal.com booking URL.

4. Start the dev server:

```bash
npm run dev
```

## Routes

- `/` public landing page
- `/book` qualifying quiz and scheduler placeholder
- `/form` hidden intake survey
- `/dawn-gate-9vK2mQ7p` hidden admin login
- `/dev-gate-n9Qk4Lw8` hidden developer login
- `/dashboard` protected dashboard

The hidden routes are intentionally not linked from public navigation or footer. Dashboard access still depends on Supabase authentication and row-level security.

## Production Notes

- Run `npm run build` before deploying.
- Keep external URLs in `src/config/site.ts` or environment variables.
- Do not commit real secrets. The Supabase publishable key is safe for browser use, but service role keys must never be exposed.
- Use Supabase Auth for dashboard users, then set their `profiles.role` to `admin` or `developer`.
- Replace placeholder brand imagery and scheduler URL before launch.

## Handoff Docs

- `docs/client-notes-transcription.md` keeps the transcription from the client phone-note photos.
- `docs/client-asset-request.md` is ready to paste into Notion as the final owner asset/request form.
- `docs/handoff-package.md` collects the launch links, Supabase setup, Cal.com setup, hosting notes, and final QA checklist.
