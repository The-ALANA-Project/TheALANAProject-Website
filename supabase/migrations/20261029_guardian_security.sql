-- Guardian security hardening for The ALANA Project.
-- Run only after the Guardian Edge Function and matching frontend are deployed.

begin;

create extension if not exists pgcrypto;

-- Short-lived, one-time wallet authorization challenges.
create table if not exists public.guardian_nonces (
  id uuid primary key default gen_random_uuid(),
  nonce_hash text not null unique,
  wallet_address text not null,
  origin text not null,
  message text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Opaque Guardian sessions. Only a hash of the browser token is stored.
create table if not exists public.guardian_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  wallet_address text not null,
  origin text not null,
  expires_at timestamptz not null,
  last_verified_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.guardian_rate_limits (
  id bigint generated always as identity primary key,
  wallet_address text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists guardian_rate_limits_lookup
  on public.guardian_rate_limits (wallet_address, action, created_at desc);

create table if not exists public.guardian_audit_log (
  id bigint generated always as identity primary key,
  wallet_address text not null,
  action text not null,
  resource text not null,
  record_id text,
  success boolean not null,
  request_id uuid not null,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists guardian_audit_log_wallet_created
  on public.guardian_audit_log (wallet_address, created_at desc);

alter table public.guardian_nonces enable row level security;
alter table public.guardian_sessions enable row level security;
alter table public.guardian_rate_limits enable row level security;
alter table public.guardian_audit_log enable row level security;

revoke all on table
  public.guardian_nonces,
  public.guardian_sessions,
  public.guardian_rate_limits,
  public.guardian_audit_log
from anon, authenticated;

grant all on table
  public.guardian_nonces,
  public.guardian_sessions,
  public.guardian_rate_limits,
  public.guardian_audit_log
to service_role;

grant usage, select on sequence public.guardian_rate_limits_id_seq to service_role;
grant usage, select on sequence public.guardian_audit_log_id_seq to service_role;

-- Remove the policies that currently allow unrestricted public mutations.
drop policy if exists "guardian write" on public.blog_curations;
drop policy if exists "public read" on public.blog_curations;
drop policy if exists "Allow all operations" on public.community_members;
drop policy if exists "Allow all operations" on public.community_story_flags;
drop policy if exists "Allow all operations" on public.community_ticker_items;
drop policy if exists "Public can read active ticker items" on public.community_ticker_items;

-- All managed content is read and written by the server boundary only.
alter table public.blog_curations enable row level security;
alter table public.community_members enable row level security;
alter table public.community_story_flags enable row level security;
alter table public.community_ticker_items enable row level security;
alter table public.community_tools enable row level security;
alter table public.hub_onboarding enable row level security;
alter table public.hub_webinars enable row level security;
alter table public.whitepaper_sections enable row level security;

revoke all on table
  public.blog_curations,
  public.community_members,
  public.community_story_flags,
  public.community_ticker_items,
  public.community_tools,
  public.hub_onboarding,
  public.hub_webinars,
  public.whitepaper_sections
from anon, authenticated;

grant all on table
  public.blog_curations,
  public.community_members,
  public.community_story_flags,
  public.community_ticker_items,
  public.community_tools,
  public.hub_onboarding,
  public.hub_webinars,
  public.whitepaper_sections
to service_role;

-- Normalize any historical duplicate hero state before enforcing one hero.
with retained_hero as (
  select guid
  from public.blog_curations
  where is_hero = true
  order by display_order asc nulls last, guid asc
  limit 1
)
update public.blog_curations
set is_hero = false
where is_hero = true
  and guid not in (select guid from retained_hero);

create unique index if not exists blog_curations_single_hero
  on public.blog_curations ((is_hero))
  where is_hero = true;

-- Atomically clear the previous hero and set the requested article.
create or replace function public.guardian_set_blog_hero(target_guid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.blog_curations
  set is_hero = false
  where is_hero = true;

  insert into public.blog_curations (guid, visible, display_order, is_hero)
  values (target_guid, true, null, true)
  on conflict (guid) do update
  set is_hero = true;
end;
$$;

revoke all on function public.guardian_set_blog_hero(text) from public, anon, authenticated;
grant execute on function public.guardian_set_blog_hero(text) to service_role;

-- Create the intended public-read image bucket. Uploads remain service-only.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'community-members',
  'community-members',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;
