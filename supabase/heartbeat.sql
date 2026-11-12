-- Run once in Supabase SQL Editor. Safe to run again.
-- This table contains no user data. Only its single health-check row is public.
begin;

create table if not exists public.service_heartbeat (
  id integer primary key check (id = 1)
);

alter table public.service_heartbeat enable row level security;
revoke all on public.service_heartbeat from anon, authenticated;
grant select on public.service_heartbeat to anon, authenticated;

drop policy if exists "Read service heartbeat" on public.service_heartbeat;
create policy "Read service heartbeat"
on public.service_heartbeat for select
to anon, authenticated
using (id = 1);

insert into public.service_heartbeat (id) values (1)
on conflict (id) do nothing;

commit;
