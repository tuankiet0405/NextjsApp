-- Applied to production on 2026-11-20.
alter table public.guests
  add column if not exists role text not null default 'guest';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'guests_role_check') then
    alter table public.guests add constraint guests_role_check check (role in ('guest', 'admin'));
  end if;
end $$;
