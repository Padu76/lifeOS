## Deploy Supabase Edge Function `daily-rollup`

1) Installa CLI e collega il progetto:
```bash
npm i -g supabase
supabase login
supabase link --project-ref <PROJECT_REF>
```

2) Deploy funzione:
```bash
supabase functions deploy daily-rollup --project-ref <PROJECT_REF>
```

3) Imposta variabili ambiente della funzione (Dashboard → Project Settings → Functions):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

4) Scheduler (Dashboard → Edge Functions → daily-rollup → Schedule):
- Esegui ogni giorno alle 07:00 (cron expression es. `0 7 * * *`).

## Migrazione 0002
Esegui `supabase/migrations/0002_user_preferences.sql` dal SQL editor o via CLI:
```bash
supabase db push
```
