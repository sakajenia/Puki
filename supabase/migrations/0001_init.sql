-- Puki — initial schema, row level security, storage, and auth trigger.
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- It is idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null check (role in ('owner', 'cleaner')),
  full_name  text,
  lang       text default 'en',
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  name       text not null,
  address    text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  cleaner_id  uuid references public.profiles (id) on delete set null,
  status      text not null default 'assigned'
              check (status in ('assigned','in_progress','submitted','approved','redo')),
  created_at  timestamptz not null default now()
);

create table if not exists public.job_areas (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references public.jobs (id) on delete cascade,
  area_name   text not null,
  position    int  not null default 0,
  video_path  text,
  status      text not null default 'pending' check (status in ('pending','done')),
  created_at  timestamptz not null default now()
);

create index if not exists jobs_owner_idx   on public.jobs (owner_id);
create index if not exists jobs_cleaner_idx on public.jobs (cleaner_id);
create index if not exists job_areas_job_idx on public.job_areas (job_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a user signs up (role + name come from metadata).
-- This works whether or not email confirmation is enabled.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'cleaner'),
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles   enable row level security;
alter table public.properties enable row level security;
alter table public.jobs       enable row level security;
alter table public.job_areas  enable row level security;

-- profiles: any signed-in user can read profiles (owners need to pick a
-- cleaner). You can only create/edit your own.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- properties: owners manage their own; cleaners can read a property they are
-- assigned to (needed for the job list join).
drop policy if exists properties_select on public.properties;
create policy properties_select on public.properties
  for select to authenticated using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.jobs j
      where j.property_id = properties.id and j.cleaner_id = auth.uid()
    )
  );

drop policy if exists properties_write on public.properties;
create policy properties_write on public.properties
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- jobs: visible to the owner and the assigned cleaner. Owners create them;
-- both sides may update status.
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs
  for select to authenticated
  using (owner_id = auth.uid() or cleaner_id = auth.uid());

drop policy if exists jobs_insert on public.jobs;
create policy jobs_insert on public.jobs
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists jobs_update on public.jobs;
create policy jobs_update on public.jobs
  for update to authenticated
  using (owner_id = auth.uid() or cleaner_id = auth.uid())
  with check (owner_id = auth.uid() or cleaner_id = auth.uid());

-- job_areas: anyone who can see the parent job can read it; the owner creates
-- the areas; owner or cleaner may update (cleaner sets video_path/status).
drop policy if exists job_areas_select on public.job_areas;
create policy job_areas_select on public.job_areas
  for select to authenticated using (
    exists (
      select 1 from public.jobs j
      where j.id = job_areas.job_id
        and (j.owner_id = auth.uid() or j.cleaner_id = auth.uid())
    )
  );

drop policy if exists job_areas_insert on public.job_areas;
create policy job_areas_insert on public.job_areas
  for insert to authenticated with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_areas.job_id and j.owner_id = auth.uid()
    )
  );

drop policy if exists job_areas_update on public.job_areas;
create policy job_areas_update on public.job_areas
  for update to authenticated using (
    exists (
      select 1 from public.jobs j
      where j.id = job_areas.job_id
        and (j.owner_id = auth.uid() or j.cleaner_id = auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_areas.job_id
        and (j.owner_id = auth.uid() or j.cleaner_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: private bucket for the cleaning clips.
-- Path layout: jobs/<job_id>/<area_id>.mp4
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('cleaning-videos', 'cleaning-videos', false)
on conflict (id) do nothing;

-- The cleaner assigned to a job may upload/replace its clips.
drop policy if exists cleaning_videos_insert on storage.objects;
create policy cleaning_videos_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'cleaning-videos'
    and auth.uid() in (
      select cleaner_id from public.jobs
      where id::text = (storage.foldername(name))[2]
    )
  );

drop policy if exists cleaning_videos_update on storage.objects;
create policy cleaning_videos_update on storage.objects
  for update to authenticated using (
    bucket_id = 'cleaning-videos'
    and auth.uid() in (
      select cleaner_id from public.jobs
      where id::text = (storage.foldername(name))[2]
    )
  );

-- The owner and the cleaner of a job may read (needed to sign URLs).
drop policy if exists cleaning_videos_select on storage.objects;
create policy cleaning_videos_select on storage.objects
  for select to authenticated using (
    bucket_id = 'cleaning-videos'
    and auth.uid() in (
      select owner_id   from public.jobs where id::text = (storage.foldername(name))[2]
      union
      select cleaner_id from public.jobs where id::text = (storage.foldername(name))[2]
    )
  );
