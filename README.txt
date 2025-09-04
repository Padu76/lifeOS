LifeOS – Step 1 patch (check-in + RLS)
Date: 2025-09-04

Files inclusi (percorso relativo alla root del repo):
1) apps/web/app/checkin/page.tsx
2) supabase/migrations/0003_rls_core.sql

Istruzioni:
1) Copia le cartelle nel tuo repo mantenendo la stessa struttura.
2) Esegui migrazione:
   - Sposta 0003_rls_core.sql nella cartella migrations del tuo progetto Supabase
   - Esegui: supabase db push
3) Avvia l'app, autentica un utente e apri /checkin per salvare il primo check-in.

Note:
- L'import del client è relativo a apps/web/lib/supabase.ts
- La pagina usa il fuso Europe/Rome per la data di oggi.
- Dopo questo step, passeremo alla function daily-rollup parametrica e allo scheduler.
