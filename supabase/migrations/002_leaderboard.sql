-- Leaderboard: capture display_name from signup metadata + ranked scores RPC

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
    nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Aggregated scores only (no meal text). Today uses UTC calendar day to match
-- server-side ranking; weekly is rolling 7 days; overall respects overall_reset_at.
create or replace function public.get_leaderboard()
returns table (
  user_id uuid,
  display_name text,
  today integer,
  weekly integer,
  overall integer
)
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select
      (date_trunc('day', now() at time zone 'utc') at time zone 'utc') as day_start,
      (now() - interval '7 days') as week_start
  ),
  scored as (
    select
      p.id as user_id,
      nullif(trim(p.display_name), '') as display_name,
      (
        select round(avg(m.health_score))::integer
        from public.meals m
        cross join bounds b
        where m.user_id = p.id
          and m.logged_at >= b.day_start
          and m.logged_at < b.day_start + interval '1 day'
      ) as today,
      (
        select round(avg(m.health_score))::integer
        from public.meals m
        cross join bounds b
        where m.user_id = p.id
          and m.logged_at >= b.week_start
      ) as weekly,
      (
        select round(avg(m.health_score))::integer
        from public.meals m
        where m.user_id = p.id
          and m.logged_at >= p.overall_reset_at
      ) as overall
    from public.profiles p
  )
  select
    s.user_id,
    s.display_name,
    s.today,
    s.weekly,
    s.overall
  from scored s
  order by
    s.weekly desc nulls last,
    s.overall desc nulls last,
    s.today desc nulls last,
    s.display_name asc nulls last;
$$;

revoke all on function public.get_leaderboard() from public;
grant execute on function public.get_leaderboard() to authenticated;
