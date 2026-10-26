-- ROYALPLAY DEMO ONLY. No cash deposits, withdrawals, wagering, or prizes.
-- Run this file in Supabase SQL Editor in a fresh project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  demo_points integer not null default 1000 check (demo_points >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.demo_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_name text not null check (char_length(game_name) between 1 and 60),
  delta_points integer not null,
  points_after integer not null check (points_after >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.demo_activity enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
for select to authenticated using (auth.uid() = id);

drop policy if exists "Users can read own demo activity" on public.demo_activity;
create policy "Users can read own demo activity" on public.demo_activity
for select to authenticated using (auth.uid() = user_id);

-- Users cannot directly update their points. Changes only occur through the function below.
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.demo_activity from anon, authenticated;
grant select on public.profiles, public.demo_activity to authenticated;

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, demo_points)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', 'Member'), 40), 1000)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_royalplay on auth.users;
create trigger on_auth_user_created_royalplay
after insert on auth.users
for each row execute procedure public.create_profile_for_new_user();

create or replace function public.play_demo_round(p_game text)
returns table(delta_points integer, demo_points integer)
language plpgsql security invoker set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_delta integer;
  v_points integer;
  v_game text := left(coalesce(p_game, 'Demo game'), 60);
begin
  if v_user is null then
    raise exception 'Login required';
  end if;
  if v_game not in ('Slot Studio','Roulette Lab','Blackjack Table','Prediksi Bola','Undian Angka','Card Room') then
    raise exception 'Game tidak dikenal';
  end if;

  -- Small, bounded demo-only score changes. No real-money wagering or payout.
  v_delta := case when random() < 0.5 then 10 else -10 end;

  update public.profiles
     set demo_points = greatest(0, demo_points + v_delta)
   where id = v_user
   returning public.profiles.demo_points into v_points;

  if not found then
    raise exception 'Profil belum tersedia. Coba logout lalu login kembali.';
  end if;

  v_delta := v_points - (select p.demo_points - v_delta from public.profiles p where p.id = v_user);
  insert into public.demo_activity(user_id, game_name, delta_points, points_after)
  values (v_user, v_game, v_delta, v_points);

  return query select v_delta, v_points;
end;
$$;

revoke all on function public.play_demo_round(text) from public, anon;
grant execute on function public.play_demo_round(text) to authenticated;
