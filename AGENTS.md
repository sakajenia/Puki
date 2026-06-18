# Puki — notes for contributors / agents

- Expo SDK 56 + TypeScript, `expo-router` (file-based routes under `app/`).
- Backend is Supabase (auth, Postgres, Storage). Client in `lib/supabase.ts`; config via
  `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`).
- Data access goes through the typed helpers in `lib/`. Schema + RLS live in
  `supabase/migrations/0001_init.sql` — keep app queries in sync with the policies there.
- The core UX is the guided recorder at `app/(cleaner)/job/[id]/record.tsx`: one area at a
  time, big tap targets, forced recording per area. Keep it dead simple.
- Expo APIs change between SDKs — check the v56 docs before changing native modules:
  https://docs.expo.dev/versions/v56.0.0/
