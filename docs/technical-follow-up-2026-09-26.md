# Technical follow-up — September 26

## Completed locally
- Admin overview count cards are now keyboard-accessible buttons opening the Leads view.
- Overview reports total lead submissions across contact messages, booking quizzes and intake surveys. This is a submission count, not deduplicated people.
- Targeted component check verifies button semantics and callback. Full type check remains blocked by existing application/config errors listed below. Not deployed.

## Verified live, read-only
- /book renders the qualification quiz.
- /customer-login renders email/password login.
- /dashboard redirects unauthenticated visitors to admin login.
- Browser requests to the configured ayjsgmdpzlsokfgyjhsl.supabase.co site_settings endpoint fail with ERR_NAME_NOT_RESOLVED. This confirms a current connectivity blocker, not its cause. Historical pause notice is not proof of current project status.
- No booking was submitted and no customer email was sent.

## Booking source findings
- Initial qualification collects client_name only, not email or phone.
- Saves to booking_qualifications, then loads the Cal.com URL from site_settings (fallback https://cal.com/anewdawncoaching).
- Save failures/timeouts currently log a warning and still advance to scheduling.
- This code does not send booking confirmations. Official sender and calendar configuration require checking the Cal.com account and account access.
- Adding persistent email capture needs a coordinated schema/types/form/admin change; not yet implemented.

## Course resources
- Seeded D.A.W.N. resources and Client Onboarding Worksheet have no URLs in migrations. Current database values cannot be verified while backend is unavailable.
- Course page hides materials without URLs. Matching uses the first word of material titles, so final document-to-lesson mapping still needs review.
- Journals use localStorage; cross-device storage remains a client decision.

## Build blockers exposed by tsc --noEmit
- __root error component assumes Error where router supplies unknown.
- Dashboard timeout helper requires Promise rather than the Supabase thenable.
- Business setup call omits required theme props.
- vite.config.ts uses cloudflare option unsupported by installed config package types.

## Next work
1. Verify/restore the configured backend project and access, then test authenticated lead persistence and portal flows.
2. Resolve build blockers; verify admin navigation in browser before publishing.
3. Add booking email capture with its database migration and inspect scheduler confirmation settings.
4. Confirm exact approved service titles/logo placement from client materials before changing them.
5. Obtain real worksheet files/URLs and approved mapping; inspect current database inventory after backend recovery.
