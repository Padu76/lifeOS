# Edge Function `daily-rollup` – ENV corrette

Per Supabase Edge Functions, evita prefissi `SUPABASE_` nelle secrets.
Usa invece:
- `PROJECT_URL`        → es: https://<project>.supabase.co
- `SERVICE_ROLE_KEY`   → service_role key (server-only)

## Set da CLI (CMD)
```cmd
supabase secrets set PROJECT_URL=https://gkchrasexlqwlvrtcaug.supabase.co SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY> --project-ref gkchrasexlqwlvrtcaug
supabase functions deploy daily-rollup --project-ref gkchrasexlqwlvrtcaug
```

Nel codice, le variabili sono lette con:
```ts
const url = Deno.env.get("PROJECT_URL")!;
const key = Deno.env.get("SERVICE_ROLE_KEY")!;
```
