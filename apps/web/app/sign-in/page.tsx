// apps/web/app/sign-in/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // se sei già loggato → vai in dashboard
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) router.replace("/dashboard/lifescore");
    })();
  }, [router]);

  const requestOtp = async () => {
    try {
      setLoading(true);
      setMsg(null);
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo, // <<< forza redirect alla callback
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setPhase("otp");
      setMsg("Email inviata. Inserisci il codice a 6 cifre oppure clicca il link nella mail.");
    } catch (e: any) {
      setMsg(e.message ?? "Errore nell'invio del codice");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setMsg(null);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: "email", // verifica OTP email (login/signup)
      });
      if (error) throw error;
      if (!data.session) throw new Error("Sessione non creata");
      router.replace("/dashboard/lifescore");
    } catch (e: any) {
      setMsg(e.message ?? "OTP non valido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 520,
        margin: "60px auto",
        padding: "0 20px",
        fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
      }}
    >
      <h1>Accedi</h1>

      {phase === "email" ? (
        <>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tuo@email.it"
            type="email"
            autoComplete="email"
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              margin: "8px 0 12px",
            }}
          />
          <button
            onClick={requestOtp}
            disabled={loading || !email}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb" }}
          >
            {loading ? "Invio…" : "Invia codice / link"}
          </button>
        </>
      ) : (
        <>
          <label>Codice OTP (6 cifre)</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              margin: "8px 0 12px",
              letterSpacing: 4,
              textAlign: "center",
            }}
          />
          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb" }}
          >
            {loading ? "Verifico…" : "Verifica e accedi"}
          </button>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={requestOtp}
              disabled={loading}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
            >
              {loading ? "Re-invio…" : "Reinvia email"}
            </button>
          </div>
        </>
      )}

      {msg && <p style={{ marginTop: 12, opacity: 0.8 }}>{msg}</p>}
    </main>
  );
}
