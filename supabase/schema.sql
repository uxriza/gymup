create table if not exists public.gymup_sync_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.gymup_sync_states enable row level security;

drop policy if exists "Users can read own GymUp sync state" on public.gymup_sync_states;
create policy "Users can read own GymUp sync state"
on public.gymup_sync_states
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own GymUp sync state" on public.gymup_sync_states;
create policy "Users can insert own GymUp sync state"
on public.gymup_sync_states
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own GymUp sync state" on public.gymup_sync_states;
create policy "Users can update own GymUp sync state"
on public.gymup_sync_states
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.admin_email_allowlist (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint admin_email_lowercase check (email = lower(email))
);

alter table public.admin_email_allowlist enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_email_allowlist
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can read admin allowlist" on public.admin_email_allowlist;
create policy "Admins can read admin allowlist"
on public.admin_email_allowlist
for select
to authenticated
using (public.is_admin());

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile and admins can read profiles" on public.profiles;
create policy "Users can read own profile and admins can read profiles"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.workout_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id text not null,
  workout_name text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes integer not null default 0,
  completed_exercise_count integer not null default 0,
  total_exercise_count integer not null default 0,
  total_sets integer not null default 0,
  total_reps integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_started_idx
on public.workout_sessions (user_id, started_at desc);

create index if not exists workout_sessions_started_idx
on public.workout_sessions (started_at desc);

alter table public.workout_sessions enable row level security;

drop policy if exists "Users can read own sessions and admins can read sessions" on public.workout_sessions;
create policy "Users can read own sessions and admins can read sessions"
on public.workout_sessions
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own sessions" on public.workout_sessions;
create policy "Users can insert own sessions"
on public.workout_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own sessions" on public.workout_sessions;
create policy "Users can update own sessions"
on public.workout_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own sessions" on public.workout_sessions;
create policy "Users can delete own sessions"
on public.workout_sessions
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.session_exercises (
  session_id text not null references public.workout_sessions(id) on delete cascade,
  exercise_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  category text,
  actual_sets integer not null default 0,
  actual_reps integer not null default 0,
  completed boolean not null default false,
  skipped boolean not null default false,
  weight_kg numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (session_id, exercise_id)
);

create index if not exists session_exercises_user_idx
on public.session_exercises (user_id);

create index if not exists session_exercises_completed_idx
on public.session_exercises (completed);

alter table public.session_exercises enable row level security;

drop policy if exists "Users can read own exercise analytics and admins can read exercise analytics" on public.session_exercises;
create policy "Users can read own exercise analytics and admins can read exercise analytics"
on public.session_exercises
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own exercise analytics" on public.session_exercises;
create policy "Users can insert own exercise analytics"
on public.session_exercises
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own exercise analytics" on public.session_exercises;
create policy "Users can update own exercise analytics"
on public.session_exercises
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own exercise analytics" on public.session_exercises;
create policy "Users can delete own exercise analytics"
on public.session_exercises
for delete
to authenticated
using (auth.uid() = user_id);
