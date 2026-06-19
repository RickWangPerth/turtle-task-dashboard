# Turtle Wishlist Tracker

Lightweight task tracking app for the Turtle Research Team.

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

## MVP Notes

- Role management UI is intentionally deferred.
- Assign the first admin manually in Supabase by updating `public.profiles.role`.
- Status history is recorded by a database trigger on `tasks.status` changes.
- File uploads are not part of MVP; use `related_url` and `screenshot_url`.
