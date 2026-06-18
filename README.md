# Puki 🧹

Puki helps cleaning agencies and homeowners **remotely verify** that a cleaning was
actually done — every room, every detail.

There are two kinds of users:

- **Owner / agency** — creates a place, lists the areas to clean, assigns a cleaner, and
  later **watches a short video of each area** to approve the work or ask for a redo.
- **Cleaner** — opens the assigned job and is **guided step-by-step** through every area
  ("Step 3 of 8 — Kitchen") with one big **Record** button. The app forces a short clip
  for each area, so nothing gets skipped, no matter how non-technical the cleaner is.

This is the iOS-first MVP, built with **Expo (React Native)** and **Supabase**.

## Tech stack

- Expo (SDK 56) + TypeScript, `expo-router` for navigation
- `expo-camera` (video), `expo-video` (playback), `expo-image-picker`
- Supabase — Auth, Postgres, and Storage (private video bucket), protected by Row Level Security

## 1. Set up Supabase (the free backend)

1. Create a free project at <https://supabase.com>.
2. Open **SQL Editor**, paste the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
   and run it. This creates the tables, security policies, the `cleaning-videos` storage
   bucket, and a trigger that creates a profile on sign-up.
3. (MVP convenience) In **Authentication → Sign In / Providers → Email**, you may turn
   **Confirm email** *off* so test accounts can log in immediately. Profiles are still
   created correctly either way.
4. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.

## 2. Configure the app

```bash
cp .env.example .env
# then edit .env and paste your values:
#   EXPO_PUBLIC_SUPABASE_URL=...
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3. Run it on your iPhone

```bash
npm install
npx expo start --tunnel
```

Install **Expo Go** from the App Store on your iPhone, then scan the QR code printed in the
terminal. The app opens on your phone. (Recording video requires a real device — the
camera is not available in the iOS Simulator.)

> To later ship to the App Store, build a standalone binary with EAS:
> `npx eas build -p ios`. The camera/photo permission strings are already configured in
> `app.json`.

## Try the full loop

1. Register a **cleaner** account ("I do the cleaning").
2. Register an **owner** account ("I manage cleanings") on a second device or after logging out.
3. As the owner: **+ New cleaning job** → name the place, pick the cleaner, adjust the area
   list, **Create job**.
4. As the cleaner: tap the job → record a short clip for **every** area (Redo / Looks good),
   it auto-advances → **Send for review**.
5. As the owner: open the job → **Watch** each area's video → **Approve** or **Ask to redo**.

## Project layout

```
app/                       # expo-router screens
  _layout.tsx              # auth-gated routing (login / owner / cleaner)
  (auth)/                  # login, register (role chooser)
  (cleaner)/
    index.tsx              # "Jobs to do" list
    job/[id]/record.tsx    # the guided room-by-room recording flow ★
  (owner)/
    index.tsx              # job list
    new-job.tsx            # create property + areas + assign cleaner
    job/[id].tsx           # review videos, approve / redo
components/                # BigButton, ProgressDots, StatusBadge, ClipPreview
lib/                       # supabase client, auth context, upload helpers, types, theme
supabase/migrations/       # database schema + RLS + storage
```

## Not in this MVP (planned next)

- Full review dashboard (filters, history, per-area comments/ratings)
- Push notifications (assigned / submitted / redo)
- Cleaner invitations & richer assignment workflow
- Android polish and App Store production build
- Video compression / longer retention beyond the free-tier storage limit
