# Turtle Team Delivery Board

Lightweight delivery board for the Turtle Research Team.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Apply SQL migrations from `supabase/migrations`.
5. Apply `supabase/seed.sql` for example tasks.
6. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Operation Notes

- Role management UI is intentionally deferred.
- Create users manually in Supabase Auth; public self-registration should remain disabled in Supabase settings.
- Assign the first Lead manually in Supabase by updating `public.profiles.role` to `admin`.
- Internal roles remain `admin`, `developer`, `team`, and `viewer`; the UI labels them Lead, Developer, Reporter, and Project Manager.
- Reporter and Project Manager views hide delivery-only fields such as epic, assignee, sprint, review status, environment, implementation plan, completion notes, UAT date, PROD date, version, and commit URL.
- `client_comment` is a legacy database field and is no longer shown in the UI or exports.
- Status history is recorded by a database trigger on `tasks.status` changes.
- File uploads are not part of MVP; use `related_url` and `screenshot_url`.
- Board work uses an `Active` sprint when one exists. If there is no Active sprint, the Board falls back to all non-Done tasks, including Backlog.
- After Phase 6-9, stop feature development and validate Iteration 1 with real work for at least one week before adding more features.
- `/admin` is available only to internal `admin` users. It manages existing profiles, iterations, and task setup through server actions and RLS-compatible Supabase operations.
- Notifications are intentionally deferred until real workflow usage has been tested.
- Imported wishlist tasks use `tasks.review_status` so Rick/Liz can triage them in Backlog.
- One-time import SQL lives at `supabase/imports/initial_wishlist_tasks.sql`; it inserts directly into `public.tasks` and does not use import batch tables.
- Delivery planning stays lightweight: `tasks.implementation_plan` records Rick's proposed approach, and `tasks.completion_notes` records what was implemented, tested, and released.
