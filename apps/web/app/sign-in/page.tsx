// apps/web/app/sign-in/page.tsx
"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"email"|"otp">("email");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    try {
      setLoading(true);
      setMsg(null);
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true }});
      if (error) throw error;
      setPhase("otp");
      setMsg("Codice inviato. Controlla la tua email.");
    } catch (e:any) {
      setMsg(e.message ?? "Errore nell'invio del codice");
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setMsg(null);
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp.trim(), type: "email" });
      if (error) throw error;
      if (!data.session) throw new Error("Sessione non creata.");
      window.location.href = "/suggestions";
    } catch (e:any) {
      setMsg(e.message ?? "OTP non valido");
    } finally { setLoading(false); }
  };

  return (
    <main style={{maxWidth:520, margin:"60px auto", padding:"0 20px", fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,sans-serif"}}>
      <h1>Accedi</h1>
      {phase === "email" ? (
        <>
          <label>Email</label>
          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="tuo@email.it"
            style={{display:"block", width:"100%", padding:12, borderRadius:10, border:"1px solid #e5e7eb", margin:"8px 0 12px"}}
          />
          <button onClick={requestOtp} disabled={loading || !email}
            style={{padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb"}}>
            {loading ? "Invio..." : "Invia codice"}
          </button>
        </>
      ) : (
        <>
          <label>Codice OTP (6 cifre)</label>
          <input
            value={otp}
            onChange={e=>setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            style={{display:"block", width:"100%", padding:12, borderRadius:10, border:"1px solid #e5e7eb", margin:"8px 0 12px", letterSpacing:4}}
          />
          <button onClick={verifyOtp} disabled={loading || otp.length!==6}
            style={{padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb"}}>
            {loading ? "Verifico..." : "Verifica e accedi"}
          </button>
        </>
      )}
      {msg && <p style={{marginTop:12, opacity:.8}}>{msg}</p>}
    </main>
  );
}
