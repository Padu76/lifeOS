Auth FIX – OTP + Magic Link senza loop
Date: 2025-09-05

Cosa cambia:
- sign-in: invia **sia** codice OTP che magic link, con redirect dinamico a /auth/callback
- callback: verifica token_hash e poi redirect a /dashboard
- risolve il loop "torna alla landing" perché il redirect ora punta alla callback

File inclusi (sostituiscono gli esistenti):
- apps/web/app/sign-in/page.tsx
- apps/web/app/auth/callback/page.tsx
- apps/web/app/auth/callback/CallbackClient.tsx

Note:
- Assicurati che in Supabase → Auth → URL Configuration: 
  Site URL = https://life-os-web-red.vercel.app
  Redirect URLs = https://life-os-web-red.vercel.app , https://*.vercel.app , http://localhost:3000
- Il redirect è calcolato via window.location.origin, quindi funziona anche su preview Vercel.
