// apps/web/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main style={{maxWidth:720, margin:"60px auto", padding:"0 20px", fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, sans-serif"}}>
      <h1 style={{fontSize:42, marginBottom:8}}>LifeOS</h1>
      <p style={{opacity:.8, marginBottom:24}}>Il sistema operativo della vita quotidiana.</p>

      <div style={{display:"flex", gap:12}}>
        <Link href="/sign-in" style={{padding:"12px 16px", borderRadius:12, border:"1px solid #e5e7eb", textDecoration:"none"}}>
          🚪 Accedi
        </Link>
        <Link href="/suggestions" style={{padding:"12px 16px", borderRadius:12, border:"1px solid #e5e7eb", textDecoration:"none"}}>
          💡 Suggestions (demo)
        </Link>
      </div>

      <hr style={{margin:"28px 0"}} />

      <h3>Come funziona l’MVP</h3>
      <ol>
        <li>Fai <strong>Accedi</strong> con OTP email.</li>
        <li>La funzione <em>daily-rollup</em> su Supabase genera suggerimenti.</li>
        <li>Vai su <strong>Suggestions</strong> per vederli.</li>
      </ol>
    </main>
  );
}
