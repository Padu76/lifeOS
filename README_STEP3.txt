LifeOS – STEP 3: rollup + user_suggestions + mini dashboard
Date: 2025-09-04

Questo zip contiene:
1) supabase/functions/daily-rollup/index.ts
   - Sostituisce lo STEP 2 (stessa path), aggiunge la generazione di user_suggestions:
     * cancella suggerimenti esistenti del giorno (user_id, date)
     * inserisce 1–3 suggerimenti in base ai punteggi (steps/sleep/mood)
     * usa il catalogo "suggestions" se disponibile (id, category), altrimenti fallback testuale

2) apps/web/app/dashboard/lifescore/page.tsx
   - Nuova pagina con badge "Oggi", sparkline ultimi 7 giorni (SVG, senza dipendenze) e lista suggerimenti del giorno
   - Link rapido a /checkin

---
Deploy
A) Edge Function
   supabase functions deploy daily-rollup --project-ref <PROJECT_REF>

B) Web
   Copia il file page.tsx nella path indicata, push su GitHub; Vercel auto-deploy.

C) Scheduler
   In Supabase Dashboard → Edge Functions → daily-rollup → Schedule
   - CEST (UTC+2): 00:05 Europe/Rome = 22:05 UTC → cron: 5 22 * * *
   - CET  (UTC+1): 00:05 Europe/Rome = 23:05 UTC → cron: 5 23 * * *
   Oppure semplice: 5 0 * * * (00:05 UTC).

Note schema
- user_suggestions: la function prova prima a cancellare i suggerimenti esistenti del giorno; se lo schema non ha le colonne "text"/"category" (fallback), l'insert verrà ignorato senza bloccare il rollup.
- suggestions: se esiste e ha (id, category), verranno presi suggerimenti dalla categoria pertinente.
- lifescores: lettura UI per ultimi 7 giorni; oggi calcolato in Europe/Rome.

Test manuale
- Invoke oggi:
  supabase functions invoke daily-rollup --project-ref <PROJECT_REF> --no-verify-jwt
- Invoke giorno specifico:
  supabase functions invoke daily-rollup --project-ref <PROJECT_REF> --no-verify-jwt --body '{"day":"2025-09-04"}'
