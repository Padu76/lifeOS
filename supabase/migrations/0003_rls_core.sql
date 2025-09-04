-- RLS & policy core per LifeScore Basic

-- Abilita RLS (idempotente)
alter table if exists public.health_metrics enable row level security;
alter table if exists public.lifescores enable row level security;
alter table if exists public.user_suggestions enable row level security;
alter table if exists public.suggestions enable row level security;

-- Vincolo unico (user_id, date) su health_metrics, safe-add
do $$
begin
  if not exists (
    select 1
    from   pg_constraint
    where  conname = 'health_metrics_user_date_key'
  ) then
    alter table public.health_metrics
      add constraint health_metrics_user_date_key unique (user_id, "date");
  end if;
end$$;

-- HEALTH_METRICS: solo proprietario
create policy if not exists health_metrics_select_own
  on public.health_metrics for select
  using (auth.uid() = user_id);

create policy if not exists health_metrics_insert_own
  on public.health_metrics for insert
  with check (auth.uid() = user_id);

create policy if not exists health_metrics_update_own
  on public.health_metrics for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists health_metrics_delete_own
  on public.health_metrics for delete
  using (auth.uid() = user_id);

-- LIFESCORES: sola lettura proprietario (inserimenti/aggiornamenti via Edge Function/DB)
create policy if not exists lifescores_select_own
  on public.lifescores for select
  using (auth.uid() = user_id);

-- USER_SUGGESTIONS: lettura proprietario, update proprietario
create policy if not exists user_suggestions_select_own
  on public.user_suggestions for select
  using (auth.uid() = user_id);

create policy if not exists user_suggestions_update_own
  on public.user_suggestions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- SUGGESTIONS: sola lettura (catalogo pubblico)
create policy if not exists suggestions_select_all
  on public.suggestions for select
  using (true);
