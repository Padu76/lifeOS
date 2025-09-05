-- 0005_auth_sync_and_fixes.sql
-- Fix per sincronizzazione users con auth.users e compatibilità LifeScore

-- 1. Aggiungi campo energy mancante in health_metrics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'health_metrics' AND column_name = 'energy'
  ) THEN
    ALTER TABLE public.health_metrics 
    ADD COLUMN energy int CHECK (energy BETWEEN 1 AND 5);
  END IF;
END$$;

-- 2. Aggiungi colonne breakdown in lifescores per compatibilità con il calculator
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lifescores' AND column_name = 'sleep_score'
  ) THEN
    ALTER TABLE public.lifescores 
    ADD COLUMN sleep_score int,
    ADD COLUMN activity_score int,
    ADD COLUMN mental_score int,
    ADD COLUMN reasons jsonb DEFAULT '[]';
  END IF;
END$$;

-- 3. Funzione per sincronizzare users con auth.users
CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Inserisci utente in public.users se non esiste
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name);
  
  RETURN NEW;
END;
$$;

-- 4. Trigger per auto-sync quando si registra nuovo utente
DROP TRIGGER IF EXISTS sync_user_on_signup ON auth.users;
CREATE TRIGGER sync_user_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_from_auth();

-- 5. Sincronizza utenti esistenti (one-time)
INSERT INTO public.users (id, email, name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  au.created_at
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, users.name);

-- 6. Aggiungi colonna suggestion_key in user_suggestions per analytics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_suggestions' AND column_name = 'suggestion_key'
  ) THEN
    ALTER TABLE public.user_suggestions 
    ADD COLUMN suggestion_key text;
    
    -- Popola suggestion_key per record esistenti
    UPDATE public.user_suggestions 
    SET suggestion_key = s.key
    FROM public.suggestions s
    WHERE user_suggestions.suggestion_id = s.id
    AND user_suggestions.suggestion_key IS NULL;
  END IF;
END$$;

-- 7. Aggiungi indici per performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_metrics_user_date 
  ON public.health_metrics (user_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lifescores_user_date 
  ON public.lifescores (user_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_suggestions_user_date 
  ON public.user_suggestions (user_id, date DESC);

-- 8. Funzione helper per debug
CREATE OR REPLACE FUNCTION public.debug_user_data(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  table_name text,
  record_count bigint,
  latest_date date,
  notes text
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'users'::text,
    (SELECT COUNT(*) FROM public.users WHERE id = target_user_id),
    NULL::date,
    CASE 
      WHEN EXISTS(SELECT 1 FROM public.users WHERE id = target_user_id) 
      THEN 'User exists' 
      ELSE 'User missing' 
    END;
    
  RETURN QUERY
  SELECT 
    'health_metrics'::text,
    (SELECT COUNT(*) FROM public.health_metrics WHERE user_id = target_user_id),
    (SELECT MAX(date) FROM public.health_metrics WHERE user_id = target_user_id),
    'Daily check-in data';
    
  RETURN QUERY
  SELECT 
    'lifescores'::text,
    (SELECT COUNT(*) FROM public.lifescores WHERE user_id = target_user_id),
    (SELECT MAX(date) FROM public.lifescores WHERE user_id = target_user_id),
    'Calculated scores';
    
  RETURN QUERY
  SELECT 
    'user_suggestions'::text,
    (SELECT COUNT(*) FROM public.user_suggestions WHERE user_id = target_user_id),
    (SELECT MAX(date) FROM public.user_suggestions WHERE user_id = target_user_id),
    'Suggestion history';
END;
$$;

-- 9. RLS per nuove colonne (eredita dalle tabelle esistenti)
-- Le policy esistenti coprono già le nuove colonne