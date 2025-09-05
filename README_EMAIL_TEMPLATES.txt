LifeOS – Supabase Email Templates
Data: 2025-09-05

Contenuto (pronti da copiare nel Dashboard Supabase → Auth → Emails → Templates):
- confirm-signup.html → scheda "Confirm signup" (usa { .Token } e { .TokenHash })
- magic-link.html     → scheda "Magic Link" (login)
- invite-user.html    → scheda "Invite user"
- reauthentication.html → scheda "Reauthentication"

I link puntano SEMPRE a: { .SiteURL }/auth/callback?token_hash={ .TokenHash }&type=email
In più, ogni template mostra il codice OTP: { .Token }

Istruzioni:
1) Apri ciascuna scheda in Supabase Dashboard → Auth → Emails → Templates → Source.
2) Incolla il contenuto HTML del file corrispondente e "Save".
3) Assicurati che in Auth → URL Configuration:
   - Site URL = https://life-os-web-red.vercel.app
   - Redirect URLs includa: https://life-os-web-red.vercel.app , https://*.vercel.app , http://localhost:3000
4) Genera una NUOVA email di login e prova.

Nota: i template email NON si possono deployare via git; vanno incollati nel Dashboard.
