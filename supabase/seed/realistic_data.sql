-- realistic_data.sql
-- Seeder per generare dati realistici di test per l'utente corrente

-- Parametri configurabili
\set days_back 30
\set user_id '\'' :user_id '\''

-- Funzione per generare dati realistici
CREATE OR REPLACE FUNCTION generate_realistic_data(target_user_id uuid, days_count int DEFAULT 30)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_date date;
  day_offset int;
  base_steps int := 6500;
  base_sleep decimal := 7.5;
  stress_trend decimal := 2.8;
  mood_trend decimal := 3.2;
  energy_trend decimal := 3.1;
  weekend_factor decimal;
  random_variation decimal;
  is_weekend boolean;
  steps_val int;
  sleep_val decimal;
  mood_val int;
  stress_val int;
  energy_val int;
  active_minutes_val int;
  sleep_quality_val int;
  hr_avg_val int;
BEGIN
  -- Cancella dati esistenti per l'utente (opzionale - commenta se vuoi mantenere)
  DELETE FROM public.lifescores WHERE user_id = target_user_id;
  DELETE FROM public.health_metrics WHERE user_id = target_user_id;
  DELETE FROM public.user_suggestions WHERE user_id = target_user_id;
  
  -- Genera dati per ogni giorno
  FOR day_offset IN 0..days_count-1 LOOP
    current_date := CURRENT_DATE - day_offset;
    is_weekend := EXTRACT(DOW FROM current_date) IN (0, 6); -- 0=Sunday, 6=Saturday
    
    -- Fattori realistici
    weekend_factor := CASE WHEN is_weekend THEN 1.2 ELSE 0.9 END;
    random_variation := (random() - 0.5) * 0.4; -- ±20% variation
    
    -- Trend graduale nel tempo (miglioramento verso il presente)
    stress_trend := 2.8 + (day_offset::decimal / days_count) * 0.8; -- stress diminuisce
    mood_trend := 3.2 + ((days_count - day_offset)::decimal / days_count) * 0.6; -- mood migliora
    energy_trend := 3.1 + ((days_count - day_offset)::decimal / days_count) * 0.5; -- energia migliora
    
    -- Valori realistici con variazioni
    steps_val := GREATEST(1000, 
      base_steps + (random() - 0.5) * 3000 + 
      CASE WHEN is_weekend THEN -800 ELSE 400 END
    )::int;
    
    sleep_val := GREATEST(4.0, LEAST(10.0,
      base_sleep + (random() - 0.5) * 2.0 +
      CASE WHEN is_weekend THEN 0.5 ELSE -0.2 END
    ));
    
    active_minutes_val := GREATEST(0, 
      (steps_val / 200) + (random() * 20)::int
    );
    
    mood_val := GREATEST(1, LEAST(5,
      ROUND(mood_trend + random_variation + 
      CASE WHEN is_weekend THEN 0.3 ELSE 0 END)::int
    ));
    
    stress_val := GREATEST(1, LEAST(5,
      ROUND(stress_trend + random_variation + 
      CASE WHEN is_weekend THEN -0.4 ELSE 0.1 END)::int
    ));
    
    energy_val := GREATEST(1, LEAST(5,
      ROUND(energy_trend + random_variation +
      CASE WHEN is_weekend THEN 0.2 ELSE 0 END)::int
    ));
    
    sleep_quality_val := GREATEST(1, LEAST(5,
      ROUND(3.5 + (sleep_val - 7.5) * 0.3 + random_variation)::int
    ));
    
    hr_avg_val := GREATEST(50, LEAST(90,
      72 + (stress_val - 3) * 4 + (random() - 0.5) * 8
    )::int);
    
    -- Inserisci health_metrics
    INSERT INTO public.health_metrics (
      user_id, date, steps, active_minutes, sleep_hours, sleep_quality,
      hr_avg, mood, stress, energy, source
    ) VALUES (
      target_user_id, current_date, steps_val, active_minutes_val, 
      sleep_val, sleep_quality_val, hr_avg_val, mood_val, stress_val, 
      energy_val, 'manual'
    ) ON CONFLICT (user_id, date) DO UPDATE SET
      steps = EXCLUDED.steps,
      active_minutes = EXCLUDED.active_minutes,
      sleep_hours = EXCLUDED.sleep_hours,
      sleep_quality = EXCLUDED.sleep_quality,
      hr_avg = EXCLUDED.hr_avg,
      mood = EXCLUDED.mood,
      stress = EXCLUDED.stress,
      energy = EXCLUDED.energy;
  END LOOP;
  
  -- Genera LifeScores usando l'algoritmo semplificato
  INSERT INTO public.lifescores (user_id, date, score, sleep_score, activity_score, mental_score, trend_3d, trend_7d, flags, reasons)
  SELECT 
    hm.user_id,
    hm.date,
    -- Score semplificato (sarà ricalcolato dalla Edge Function)
    GREATEST(0, LEAST(100, 
      (LEAST(hm.sleep_hours / 8.0, 1.2) * 35)::int +
      (LEAST(hm.steps / 7000.0, 1.5) * 35)::int +
      ((hm.mood + (5 - hm.stress) + hm.energy) / 15.0 * 30)::int
    )),
    -- Breakdown scores
    GREATEST(0, LEAST(100, (LEAST(hm.sleep_hours / 8.0, 1.2) * 80 + (hm.sleep_quality - 1) / 4.0 * 20)::int)),
    GREATEST(0, LEAST(100, (LEAST(hm.steps / 7000.0, 1.5) * 60 + LEAST(hm.active_minutes / 30.0, 1.5) * 40)::int)),
    GREATEST(0, LEAST(100, ((hm.mood - 1) / 4.0 * 40 + (5 - hm.stress) / 4.0 * 30 + (hm.energy - 1) / 4.0 * 30)::int)),
    0, -- trend_3d (sarà calcolato)
    0, -- trend_7d (sarà calcolato)
    CASE 
      WHEN hm.sleep_hours < 6 OR hm.stress >= 4 OR hm.steps < 3000 
      THEN '{"needs_attention": true}'::jsonb
      ELSE '{}'::jsonb
    END,
    CASE 
      WHEN hm.sleep_hours < 6 AND hm.stress >= 4
      THEN '["Sonno insufficiente", "Stress elevato"]'::jsonb
      WHEN hm.sleep_hours < 6
      THEN '["Sonno insufficiente"]'::jsonb
      WHEN hm.stress >= 4
      THEN '["Stress elevato"]'::jsonb
      WHEN hm.steps < 3000
      THEN '["Attività fisica limitata"]'::jsonb
      ELSE '["Giornata equilibrata"]'::jsonb
    END
  FROM public.health_metrics hm
  WHERE hm.user_id = target_user_id
  ON CONFLICT (user_id, date) DO UPDATE SET
    score = EXCLUDED.score,
    sleep_score = EXCLUDED.sleep_score,
    activity_score = EXCLUDED.activity_score,
    mental_score = EXCLUDED.mental_score,
    flags = EXCLUDED.flags,
    reasons = EXCLUDED.reasons;
    
  -- Genera alcuni suggerimenti completati (realistici)
  INSERT INTO public.user_suggestions (
    user_id, suggestion_id, suggestion_key, date, reason, completed, 
    feedback_mood, time_spent_sec
  )
  SELECT 
    target_user_id,
    s.id,
    s.key,
    CURRENT_DATE - (random() * days_count)::int,
    '{"trigger": "low_mood"}'::jsonb,
    random() > 0.3, -- 70% completion rate
    CASE WHEN random() > 0.3 THEN (3 + random() * 2)::int ELSE NULL END,
    CASE WHEN random() > 0.3 THEN (s.duration_sec * (0.8 + random() * 0.4))::int ELSE NULL END
  FROM public.suggestions s
  WHERE s.key IN ('breathing-478', '5min-meditation', '10min-walk')
    AND random() > 0.4 -- Non tutti i giorni
  LIMIT 15;
  
  RAISE NOTICE 'Generated realistic data for user % for % days', target_user_id, days_count;
END;
$$;

-- Esegui il seeder per l'utente corrente (se autenticato)
DO $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NOT NULL THEN
    PERFORM generate_realistic_data(current_user_id, 30);
    RAISE NOTICE 'Realistic data generated successfully for user %', current_user_id;
  ELSE
    RAISE NOTICE 'No authenticated user found. Please run this after login.';
  END IF;
END;
$$;

-- Per uso manuale: sostituisci USER_ID_HERE con l'ID reale
-- SELECT generate_realistic_data('USER_ID_HERE'::uuid, 30);