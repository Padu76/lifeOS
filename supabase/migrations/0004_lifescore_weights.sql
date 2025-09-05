-- 0004_lifescore_weights.sql (FIXED)
-- Rimuove "CREATE POLICY IF NOT EXISTS" (non supportato): usa DROP POLICY IF EXISTS -> CREATE POLICY

create table if not exists public.lifescore_weights (
  user_id uuid primary key references auth.users(id) on delete cascade,
  w_mood numeric(4,3) not null default 0.30 check (w_mood >= 0 and w_mood <= 1),
  w_sleep numeric(4,3) not null default 0.30 check (w_sleep >= 0 and w_sleep <= 1),
  w_steps numeric(4,3) not null default 0.40 check (w_steps >= 0 and w_steps <= 1),
  steps_goal int not null default 8000 check (steps_goal between 500 and 100000),
  sleep_goal numeric(4,2) not null default 7.50 check (sleep_goal between 3 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- timestamp update trigger (idempotente)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'lifescore_weights_set_updated_at'
  ) then
    create trigger lifescore_weights_set_updated_at
      before update on public.lifescore_weights
      for each row execute procedure public.set_updated_at();
  end if;
end$$;

-- RLS
alter table public.lifescore_weights enable row level security;

DROP POLICY IF EXISTS lifescore_weights_select_own ON public.lifescore_weights;
CREATE POLICY lifescore_weights_select_own
  ON public.lifescore_weights FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS lifescore_weights_insert_own ON public.lifescore_weights;
CREATE POLICY lifescore_weights_insert_own
  ON public.lifescore_weights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS lifescore_weights_update_own ON public.lifescore_weights;
CREATE POLICY lifescore_weights_update_own
  ON public.lifescore_weights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
