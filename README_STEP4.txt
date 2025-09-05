LifeOS – STEP 4: pesi/obiettivi per utente
Date: 2025-09-05

Contenuto:
1) supabase/migrations/0004_lifescore_weights.sql
2) apps/web/app/settings/lifescore/page.tsx
3) supabase/functions/daily-rollup/index.ts

Comandi (CMD):
cd /d "C:\Users\padu7\OneDrive\Desktop\lifeOS"
git checkout main
git pull --rebase
git add "supabase\migrations\0004_lifescore_weights.sql" "apps\web\app\settings\lifescore\page.tsx" "supabase\functions\daily-rollup\index.ts"
git commit -m "LifeScore: lifescore_weights table + settings page + rollup reads per-user weights/goals"
git push origin main

supabase link --project-ref gkchrasexlqwlvrtcaug
supabase db push
supabase functions deploy daily-rollup
