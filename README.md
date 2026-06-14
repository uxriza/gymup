# GymUp

GymUp is a mobile-first personal workout tracker built for structured training sessions, exercise-by-exercise progress logging, and lightweight user sync with Supabase.

## Product scope

- Exercise-based workout flow:
  warm-up -> choose exercise -> set/rest cycle -> cooldown -> save session
- Built-in workout programs:
  `Push Dasar`, `Pull Dasar`, `Kaki + Core`, `Full Body`
- Custom workout mode:
  users can start a manual session and choose exercises freely
- Workout history:
  session summaries, exercise details, duration, sets, reps, and weight
- Exercise catalog:
  read-only exercise list with search, category filters, thumbnails, video, and instructions
- Account and sync:
  email sign up / sign in, Supabase sync, profile name personalization
- Admin monitoring:
  `/admin` dashboard for user and activity analytics
- Observability:
  Sentry for frontend error monitoring

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI primitives
- Zustand with persist middleware
- Supabase Auth + Database
- Sentry React SDK

## Project structure

```text
src/
  components/    Shared UI, auth, sync, and feedback components
  data.ts        Default workout and exercise seed data
  lib/           Utilities, labels, i18n, Supabase, Sentry, analytics sync
  pages/         Home, workout, history, catalog, auth, admin
  store/         Zustand workout and app state
  types.ts       Shared domain types
```

## Core features

### 1. Workout sessions

- Session lock while a workout is active
- Session timer and rest timer
- Rep counter and working weight selection
- Lightweight reward overlay when an exercise is completed
- Wake Lock API support while a workout is active, when supported by the browser

### 2. Local-first behavior

- Primary app state runs locally through Zustand persist
- Active sessions survive reloads and returning from the background
- History stays available locally even when sync is delayed

### 3. Remote sync

- User app state syncs to `gymup_sync_states`
- Analytics upserts to:
  `profiles`, `workout_sessions`, `session_exercises`
- Supabase RLS separates normal user data from admin analytics access

### 4. Authentication

- Email/password sign up and sign in
- Email verification redirect to `/verified`
- Display name update after login
- Logout confirmation flow

### 5. Internationalization

- Built-in language switch for Indonesian and English
- Shared labels and date formatting follow the selected language

## Environment variables

Create a `.env.local` file for local development.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ENABLE_REMOTE_SYNC=true
VITE_SENTRY_DSN=
VITE_APP_ENV=development
```

If your Supabase project exposes a publishable key instead of the anon key naming, the app also supports:

```env
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## Local development

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Deployment

The app is prepared for Vercel deployment.

Minimum production environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ENABLE_REMOTE_SYNC=true
VITE_SENTRY_DSN=
VITE_APP_ENV=production
```

Redeploy after any environment variable update.

## Supabase notes

GymUp depends on:

- Auth for user accounts
- `gymup_sync_states` for app state sync
- `profiles` for limited public profile data
- `workout_sessions` for session analytics
- `session_exercises` for per-exercise session analytics
- `admin_email_allowlist` for admin dashboard access

The first admin user is added manually in the database.

## Current status

GymUp is in good shape for private beta:

- mobile-first UI
- production auth flow
- Supabase sync
- admin monitoring MVP
- Sentry monitoring

Recommended ongoing checks for future iterations:

- external asset fallback review
- production smoke testing after major flow changes
- RLS review whenever the Supabase schema changes
