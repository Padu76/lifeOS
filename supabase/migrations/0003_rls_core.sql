-- 0003_rls_core.sql (FIXED)
-- Compatibile con Postgres (niente "CREATE POLICY IF NOT EXISTS").
-- Strategia: DROP POLICY IF EXISTS -> CREATE POLICY

-- Abilita RLS (idempotente)
alter table if exists public.health_metrics enable row level security;
alter table if exists public.lifescores enable row level security;
alter table if exists public.user_suggestions enable row level security;
alter table if exists public.suggestions enable row level security;

-- Vincolo unico (user_id, date) su health_metrics (safe add)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'health_metrics_user_date_key'
  ) then
    alter table public.health_metrics
      add constraint health_metrics_user_date_key unique (user_id, "date");
  end if;
end$$;

-- HEALTH_METRICS: solo proprietario
DROP POLICY IF EXISTS health_metrics_select_own ON public.health_metrics;
CREATE POLICY health_metrics_select_own
  ON public.health_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS health_metrics_insert_own ON public.health_metrics;
CREATE POLICY health_metrics_insert_own
  ON public.health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS health_metrics_update_own ON public.health_metrics;
CREATE POLICY health_metrics_update_own
  ON public.health_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS health_metrics_delete_own ON public.health_metrics;
CREATE POLICY health_metrics_delete_own
  ON public.health_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- LIFESCORES: sola lettura proprietario (scrive il server)
DROP POLICY IF EXISTS lifescores_select_own ON public.lifescores;
CREATE POLICY lifescores_select_own
  ON public.lifescores FOR SELECT
  USING (auth.uid() = user_id);

-- USER_SUGGESTIONS: lettura proprietario, update proprietario
DROP POLICY IF EXISTS user_suggestions_select_own ON public.user_suggestions;
CREATE POLICY user_suggestions_select_own
  ON public.user_suggestions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_suggestions_update_own ON public.user_suggestions;
CREATE POLICY user_suggestions_update_own
  ON public.user_suggestions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SUGGESTIONS: sola lettura (catalogo pubblico)
DROP POLICY IF EXISTS suggestions_select_all ON public.suggestions;
CREATE POLICY suggestions_select_all
  ON public.suggestions FOR SELECT
  USING (true);

