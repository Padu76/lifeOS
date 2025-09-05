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

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) router.replace("/dashboard/lifescore");
    })();
  }, [router]);

  function sanitizeOTP(v: string) {
    return v.replace(/\D/g, "").slice(0, 6); // solo cifre, max 6
  }

  const requestOtp = async () => {
    try {
      setLoading(true);
      setMsg(null);
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setPhase("otp");
      setMsg(
        "Email inviata. Inserisci il codice a 6 cifre (oppure clicca il link nella mail)."
      );
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
      const code = sanitizeOTP(otp);
      if (code.length !== 6) {
        setMsg("Inserisci le 6 cifre del codice.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;
      if (!data.session) throw new Error("Sessione non creata");
      router.replace("/dashboard/lifescore");
    } catch (e: any) {
      setMsg(e.message ?? "OTP non valido o scaduto");
    } finally {
      setLoading(false);
    }
  };

  const canSend = email.includes("@");

  return (
    <main
      style={{
        maxWidth: 520,
        margin: "60px auto",
        padding: "0 20px",
        fontFamily:
          "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }}>Accedi</h1>

      {phase === "email" ? (
        <>
          <label style={{ display: "block", marginBottom: 6 }}>Email</label>
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
            disabled={loading || !canSend}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: canSend ? "#111827" : "#f3f4f6",
              color: canSend ? "#fff" : "#9ca3af",
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Invio…" : "Invia codice / link"}
          </button>
        </>
      ) : (
        <>
          <label style={{ display: "block", marginBottom: 6 }}>
            Codice OTP (6 cifre)
          </label>
          <input
            value={otp}
            onChange={(e) => setOtp(sanitizeOTP(e.target.value))}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text");
              setOtp(sanitizeOTP(text));
            }}
            placeholder="000000"
            inputMode="numeric"
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              margin: "8px 0 12px",
              textAlign: "center",
              fontSize: 20,
              letterSpacing: 2,
            }}
          />
          <button
            onClick={verifyOtp}
            disabled={loading || sanitizeOTP(otp).length !== 6}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: sanitizeOTP(otp).length === 6 ? "#111827" : "#f3f4f6",
              color: sanitizeOTP(otp).length === 6 ? "#fff" : "#9ca3af",
              cursor:
                sanitizeOTP(otp).length === 6 ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Verifico…" : "Verifica e accedi"}
          </button>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={requestOtp}
              disabled={loading}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {loading ? "Re-invio…" : "Reinvia email"}
            </button>
          </div>

          <p style={{ marginTop: 12, opacity: 0.8, fontSize: 14 }}>
            Suggerimento: puoi anche cliccare il link nella mail &mdash; verrai
            portato su <code>/auth/callback</code> e l'accesso sarà automatico.
          </p>
        </>
      )}

      {msg && (
        <p style={{ marginTop: 12, color: "#b91c1c", fontSize: 14 }}>{msg}</p>
      )}
    </main>
  );
}
