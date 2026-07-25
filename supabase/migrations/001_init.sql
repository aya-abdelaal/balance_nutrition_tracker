-- Balance Nutrition Track — initial schema
-- Run in Supabase SQL editor or via CLI

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  overall_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Meals
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  raw_text text not null,
  health_score integer not null check (health_score >= 0 and health_score <= 100),
  carbs smallint not null default 0 check (carbs >= 0 and carbs <= 10),
  protein smallint not null default 0 check (protein >= 0 and protein <= 10),
  fats smallint not null default 0 check (fats >= 0 and fats <= 10),
  fiber smallint not null default 0 check (fiber >= 0 and fiber <= 10),
  sugar smallint not null default 0 check (sugar >= 0 and sugar <= 10),
  vitamins smallint not null default 0 check (vitamins >= 0 and vitamins <= 10),
  flags text[] not null default '{}',
  summary text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists meals_user_logged_at_idx
  on public.meals (user_id, logged_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.meals enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "meals_select_own" on public.meals;
create policy "meals_select_own"
  on public.meals for select
  using (auth.uid() = user_id);

drop policy if exists "meals_insert_own" on public.meals;
create policy "meals_insert_own"
  on public.meals for insert
  with check (auth.uid() = user_id);

drop policy if exists "meals_delete_own" on public.meals;
create policy "meals_delete_own"
  on public.meals for delete
  using (auth.uid() = user_id);
