LifeOS – STEP 2: daily-rollup parametrica (Europe/Rome)
Date: 2025-09-04

Questo zip contiene il file COMPLETO che sostituisce la tua Edge Function:
- supabase/functions/daily-rollup/index.ts

Cosa fa:
- Legge i record di "health_metrics" del giorno (parametro ?day=YYYY-MM-DD)
- Default: "oggi" calcolato sul fuso Europe/Rome
- Calcola mood/sleep/steps score e LifeScore pesato (0.3/0.3/0.4)
- Calcola trend vs giorno precedente da "lifescores"
- Upsert su "lifescores" con onConflict (user_id, date)
- Risponde con JSON { ok, processed, day, errors }

---
Deploy (Supabase CLI)
1) Deploy funzione
   supabase functions deploy daily-rollup --project-ref <PROJECT_REF>

2) Secrets (nome variabili come da tuo repo)
   supabase secrets set --project-ref <PROJECT_REF> \
     PROJECT_URL="https://<PROJECT_REF>.supabase.co" \
     SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>"

3) Test manuale (usa oggi)
   supabase functions invoke daily-rollup --project-ref <PROJECT_REF> --no-verify-jwt

   Test con giorno specifico (POST):
   supabase functions invoke daily-rollup --project-ref <PROJECT_REF> --no-verify-jwt --body '{"day":"2025-09-04"}'

---
Scheduler (Supabase Dashboard)
- Vai su Edge Functions → daily-rollup → Schedule
- Cron per "00:05 Europe/Rome":
  * Durante ora legale (CEST, UTC+2): 22:05 UTC → cron: 5 22 * * *
  * Durante ora solare (CET, UTC+1): 23:05 UTC → cron: 5 23 * * *
  Opzione semplice: pianifica a 00:05 UTC (cron: 5 0 * * *), che corrisponde alle 02:05 in estate / 01:05 in inverno.

Note:
- La function è parametrica: puoi invocarla passando ?day=YYYY-MM-DD o nel body JSON { "day": "YYYY-MM-DD" }.
- Non modifica "user_suggestions". Se vuoi generare suggerimenti nella stessa run, dimmelo e preparo una versione che popola "user_suggestions" in base al punteggio (compatibile con la tua tabella "suggestions").
