Auth FIX v2 – elimina loop magic link
Date: 2025-09-05

Cosa risolve:
- Link email che punta alla home (redirect_to root) e crea loop
- Token in fragment (#access_token=...) non gestiti

Cosa fa:
- Sign-in forza emailRedirectTo a /auth/callback
- Callback gestisce **entrambi** i casi:
  1) ?token_hash=...&type=email  → verifyOtp()
  2) #access_token=...&refresh_token=...  → setSession()

File inclusi (sostituisci integralmente):
- apps/web/app/sign-in/page.tsx
- apps/web/app/auth/callback/page.tsx
- apps/web/app/auth/callback/CallbackClient.tsx

Checklist Supabase → Auth → URL Configuration:
- Site URL: https://life-os-web-red.vercel.app
- Redirect URLs: 
  https://life-os-web-red.vercel.app
  https://*.vercel.app
  http://localhost:3000

Opzione (più robusta, no fragment):
- Vai su Email Templates → "Magic Link" e usa un link personalizzato che passa il token_hash alla callback:
  <a href="{ .SiteURL }/auth/callback?token_hash={ .TokenHash }&type=email">Accedi</a>
