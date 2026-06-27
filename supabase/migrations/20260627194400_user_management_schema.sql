-- Phase 3: user management schema (docs/design-user-management.md §6)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.teams (
  slug         text primary key,
  name         text not null,
  short        text,
  league       text not null default 'greek-super-league',
  colors       jsonb,
  created_at   timestamptz not null default now()
);

create table public.players (
  id           uuid primary key default gen_random_uuid(),
  team_slug    text not null references public.teams(slug) on delete cascade,
  num          int  not null,
  name         text not null,
  age          int,
  nat          text,
  reg          text not null check (reg in ('home', 'eu', 'noneu')),
  rating       int,
  pos          text[] not null,
  pos2         text[] not null default '{}',
  wage         numeric,
  market_value numeric,
  transfer_fee numeric,
  contract_end int,
  on_loan      boolean not null default false,
  updated_at   timestamptz not null default now(),
  unique (team_slug, num)
);

create index players_team_slug_idx on public.players (team_slug);

create table public.team_admins (
  user_id   uuid not null references auth.users(id) on delete cascade,
  team_slug text not null references public.teams(slug) on delete cascade,
  primary key (user_id, team_slug)
);

create table public.board_scenarios (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  team_slug  text not null,
  name       text not null default 'current',
  state      jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, team_slug, name)
);

create index board_scenarios_user_team_idx on public.board_scenarios (user_id, team_slug);

create table public.quiz_results (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  team_slug  text not null,
  decisions  jsonb not null default '{}',
  summary    jsonb not null,
  archetype  text,
  created_at timestamptz not null default now()
);

create index quiz_results_user_team_idx on public.quiz_results (user_id, team_slug, created_at desc);

-- ---------------------------------------------------------------------------
-- Auth helpers (security definer — read profiles/team_admins for RLS)
-- ---------------------------------------------------------------------------

create or replace function public.is_global_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.is_team_admin(p_team_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_global_admin()
    or exists (
      select 1 from public.team_admins ta
      where ta.user_id = auth.uid() and ta.team_slug = p_team_slug
    );
$$;

revoke all on function public.is_global_admin() from public;
revoke all on function public.is_team_admin(text) from public;
grant execute on function public.is_global_admin() to authenticated, anon;
grant execute on function public.is_team_admin(text) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Profile lifecycle
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', 'Guest')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile_admin_flag()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    raise exception 'is_admin cannot be changed by users';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_admin
  before update on public.profiles
  for each row execute function public.protect_profile_admin_flag();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.team_admins enable row level security;
alter table public.board_scenarios enable row level security;
alter table public.quiz_results enable row level security;

-- profiles: own row only; is_admin not self-settable (trigger above)
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- teams: public read; writes for global admins only
create policy "teams_select_all"
  on public.teams for select
  using (true);

create policy "teams_write_admin"
  on public.teams for all
  using (public.is_global_admin())
  with check (public.is_global_admin());

-- players: public read; writes for team/global admins
create policy "players_select_all"
  on public.players for select
  using (true);

create policy "players_insert_admin"
  on public.players for insert
  with check (public.is_team_admin(team_slug));

create policy "players_update_admin"
  on public.players for update
  using (public.is_team_admin(team_slug))
  with check (public.is_team_admin(team_slug));

create policy "players_delete_admin"
  on public.players for delete
  using (public.is_team_admin(team_slug));

-- team_admins: users see their own grants; global admins manage all
create policy "team_admins_select"
  on public.team_admins for select
  using (user_id = auth.uid() or public.is_global_admin());

create policy "team_admins_write_admin"
  on public.team_admins for all
  using (public.is_global_admin())
  with check (public.is_global_admin());

-- board_scenarios & quiz_results: scoped to auth.uid()
create policy "board_scenarios_own"
  on public.board_scenarios for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "quiz_results_own"
  on public.quiz_results for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
