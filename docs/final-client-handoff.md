# A'New Dawn Coaching Website Handoff

Prepared for the A'New Dawn Coaching website launch package.

## Website Links

Replace `LIVE_SITE_URL` with the final Netlify domain once deployed.

- Website: `LIVE_SITE_URL/`
- Booking: `LIVE_SITE_URL/book`
- Optional survey: `LIVE_SITE_URL/form`
- Admin login: `LIVE_SITE_URL/dawn-gate-9vK2mQ7p`
- Developer login: `LIVE_SITE_URL/dev-gate-n9Qk4Lw8`
- Dashboard: `LIVE_SITE_URL/dashboard`

## Login Access

Admin login:

- Email: `badge-sleek-garlic@duck.com`
- Password: add the current password before sending
- Login page: `LIVE_SITE_URL/dawn-gate-9vK2mQ7p`

Developer login:

- Email: `aloft-upbeat-visor@duck.com`
- Password: add the current password before sending
- Login page: `LIVE_SITE_URL/dev-gate-n9Qk4Lw8`

Do not send the Supabase service role key, Netlify environment variable values, or private backend credentials in the client-facing handoff.

## What Is Included

- Public homepage for A'New Dawn Coaching.
- Booking quiz with 3 guided questions and a name capture step.
- Scheduler-ready booking completion screen.
- Optional hidden survey form for deeper client intake.
- Protected admin dashboard.
- Protected developer dashboard.
- Contact form storage.
- Booking quiz storage.
- Survey entry storage.
- Dashboard notes.
- Cal.com booking URL setting inside the dashboard.

## Dashboard Overview

The dashboard is where the owner can review:

- Contact messages
- Booking quiz submissions
- Survey entries
- Internal notes
- Cal.com booking URL setting

The developer login also includes a developer view with structured JSON data for easier troubleshooting.

## Booking / Calendar Setup

The website is designed to use Cal.com for booking. Google Calendar should be connected inside the owner's Cal.com account.

Once the owner has a Cal.com booking link:

1. Log in through the admin login.
2. Open the dashboard.
3. Go to `Settings`.
4. Paste the public Cal.com booking URL.
5. Save.
6. Test the public booking page.

After this is complete, people who finish the booking quiz will see the live scheduler.

## Current Content Source

The homepage copy was rewritten from the notes provided by the owner. The current focus areas are:

- Identity
- Purpose
- Faith-aligned strategy
- Clarity
- Confidence
- Consistency
- The Dawn Method
- 12-week transformation language

The source transcription is saved internally in `docs/client-notes-transcription.md`.

## Still Needed From Owner

- Final portrait/photo for the About section.
- Final testimonials.
- Final service names and pricing.
- Final contact email and phone number.
- Final Cal.com booking link.
- Any preferred replacement copy or edits.
- Confirmation that the homepage messaging feels accurate.

## Optional Owner Form

The hidden survey/request form can be sent to the owner if more details are needed:

`LIVE_SITE_URL/form`

Suggested use:

- Upload/provide portrait.
- Provide testimonials.
- Provide Cal.com link.
- Provide service/pricing details.
- Request copy edits.
- Share final contact information.

## Final QA

Before sending the live site:

- Confirm the homepage loads correctly on desktop and mobile.
- Confirm booking quiz submissions appear in the dashboard.
- Confirm survey form submissions appear in the dashboard.
- Confirm the admin login works.
- Confirm the developer login works.
- Confirm Cal.com opens after the quiz.
- Confirm all owner-facing links use the final Netlify domain.
