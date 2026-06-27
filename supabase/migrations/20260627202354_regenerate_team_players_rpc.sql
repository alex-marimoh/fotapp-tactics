-- Issue #11: atomic delete+insert for team roster regeneration

create or replace function public.regenerate_team_players(
  p_team_slug text,
  p_players jsonb
)
returns setof public.players
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_team_admin(p_team_slug) then
    raise exception 'permission denied for team %', p_team_slug
      using errcode = '42501';
  end if;

  delete from public.players where team_slug = p_team_slug;

  return query
  insert into public.players (
    team_slug,
    num,
    name,
    age,
    nat,
    reg,
    rating,
    pos,
    pos2,
    wage,
    market_value,
    transfer_fee,
    contract_end,
    on_loan
  )
  select
    p_team_slug,
    (elem->>'num')::int,
    elem->>'name',
    nullif(elem->>'age', '')::int,
    nullif(elem->>'nat', ''),
    elem->>'reg',
    nullif(elem->>'rating', '')::int,
    coalesce(
      array(select jsonb_array_elements_text(coalesce(elem->'pos', '[]'::jsonb))),
      '{}'::text[]
    ),
    coalesce(
      array(select jsonb_array_elements_text(coalesce(elem->'pos2', '[]'::jsonb))),
      '{}'::text[]
    ),
    nullif(elem->>'wage', '')::numeric,
    nullif(elem->>'market_value', '')::numeric,
    nullif(elem->>'transfer_fee', '')::numeric,
    nullif(elem->>'contract_end', '')::int,
    coalesce((elem->>'on_loan')::boolean, false)
  from jsonb_array_elements(p_players) as elem
  returning *;
end;
$$;

revoke all on function public.regenerate_team_players(text, jsonb) from public;
grant execute on function public.regenerate_team_players(text, jsonb) to authenticated, anon;
