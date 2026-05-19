-- Armed & Anchored — Supabase Schema
-- Paste this entire file into your Supabase SQL Editor and click Run

-- ── PROFILES ──────────────────────────────────────────────────────────────
-- Stores payment status and user metadata
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  paid        boolean default false,
  paid_at     timestamptz,
  stripe_session_id text,
  created_at  timestamptz default now()
);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── WEAPON ENTRIES ─────────────────────────────────────────────────────────
-- Stores all journal entries, tracker notes, declared weapons
create table public.weapon_entries (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  weapon_id   integer not null,
  field_key   text not null,
  field_value text default '',
  updated_at  timestamptz default now(),
  unique(user_id, weapon_id, field_key)
);

-- Auto-update updated_at on change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_weapon_entry_updated
  before update on public.weapon_entries
  for each row execute procedure public.handle_updated_at();

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────────
-- Users can only see and edit their own data

alter table public.profiles enable row level security;
alter table public.weapon_entries enable row level security;

-- Profiles: users can read and update only their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Weapon entries: full CRUD on own rows only
create policy "Users can view own entries"
  on public.weapon_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.weapon_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.weapon_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.weapon_entries for delete
  using (auth.uid() = user_id);

-- ── SERVICE ROLE POLICY ────────────────────────────────────────────────────
-- Allow the verify-payment API function to update paid status
create policy "Service role can update profiles"
  on public.profiles for update
  using (true)
  with check (true);
