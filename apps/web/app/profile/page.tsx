'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type LifeScore = { score: number };
type CompletedCount = { count: number };

export default function ProfilePage(){
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string|null>(null);
  const [email, setEmail] = useState<string>('');
  const [avgScore, setAvgScore] = useState<number>(0);
  const [completedTotal, setCompletedTotal] = useState<number>(0);
  const [busyReset, setBusyReset] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setMsg('Non sei autenticato.'); setLoading(false); return; }
      const user = session.user;
      setEmail(user.email ?? user.id);

      // Media LifeScore (tutto lo storico)
      const { data: ls, error: e1 } = await supabase
        .from('lifescores')
        .select('score');
      if (e1) { setMsg(e1.message); setLoading(false); return; }

      const avg = (ls ?? []).map(x => (x as LifeScore).score).filter(n => typeof n === 'number');
      setAvgScore(avg.length ? Math.round(avg.reduce((s,v)=>s+v,0)/avg.length) : 0);

      // Attività completate totali
      const { data: us, error: e2 } = await supabase
        .from('user_suggestions')
        .select('completed');
      if (e2) { setMsg(e2.message); setLoading(false); return; }

      const total = (us ?? []).reduce((s, r: any) => s + (r.completed ? 1 : 0), 0);
      setCompletedTotal(total);

      setLoading(false);
    })();
  }, []);

  const onReset = async () => {
    if (!confirm('Sei sicuro di voler cancellare tutti i tuoi dati (LifeScore, suggerimenti, metriche)? Azione irreversibile.')) return;
    try{
      setBusyReset(true);
      setMsg(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non sei autenticato');
      const user = session.user;

      // Prova a cancellare i dati utente dalle principali tabelle (richiede policy DELETE)
      const tables = ['lifescores', 'user_suggestions', 'health_metrics', 'events'];
      for (const t of tables){
        const { error } = await supabase.from(t).delete().eq('user_id', user.id);
        if (error) {
          // Se non hai policy DELETE, lo segnaliamo ma non blocchiamo l'intero reset
          console.warn('Delete error on', t, error.message);
        }
      }
      setMsg('Reset dati completato (dove consentito dalle policy). Se qualcosa è rimasto, aggiungi le policy DELETE suggerite qui sotto.');
    } catch (e:any){
      setMsg(e.message ?? 'Errore durante il reset.');
    } finally {
      setBusyReset(false);
    }
  };

  return (
    <main style={{maxWidth:780, margin:'32px auto', padding:'0 20px', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}}>
      <h1>Profilo</h1>

      {loading && <p>Carico…</p>}
      {msg && <p style={{background:'#FEF3C7', border:'1px solid #FDE68A', padding:12, borderRadius:10}}>{msg}</p>}

      {!loading && (
        <div style={{display:'grid', gap:16}}>

          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <h3 style={{marginTop:0}}>Account</h3>
            <div style={{display:'grid', gap:6}}>
              <div><strong>Email</strong>: {email}</div>
            </div>
          </section>

          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <h3 style={{marginTop:0}}>Riepilogo</h3>
            <div style={{display:'flex', gap:20}}>
              <div style={{border:'1px solid #eee', borderRadius:10, padding:'10px 12px'}}>
                <div style={{opacity:.8, fontSize:13}}>LifeScore medio</div>
                <div style={{fontSize:24, fontWeight:700}}>{avgScore}</div>
              </div>
              <div style={{border:'1px solid #eee', borderRadius:10, padding:'10px 12px'}}>
                <div style={{opacity:.8, fontSize:13}}>Attività completate</div>
                <div style={{fontSize:24, fontWeight:700}}>{completedTotal}</div>
              </div>
            </div>
          </section>

          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <h3 style={{marginTop:0}}>Danger zone</h3>
            <p style={{opacity:.85, marginTop:6}}>Cancella i tuoi dati (LifeScore, suggerimenti assegnati e metriche). Questa azione non tocca l'account di autenticazione.</p>
            <button onClick={onReset} disabled={busyReset} style={{padding:'8px 12px', border:'1px solid #ef4444', color:'#b91c1c', borderRadius:10}}>
              {busyReset ? 'Ripulisco…' : 'Reset dati'}
            </button>
            <details style={{marginTop:10}}>
              <summary>Se il reset fallisce, aggiungi queste policy DELETE</summary>
              <pre style={{whiteSpace:'pre-wrap', fontSize:12, background:'#fafafa', padding:10, border:'1px solid #eee', borderRadius:8}}>
{`-- Supabase SQL: abilita DELETE per l'utente proprietario
alter table lifescores enable row level security;
alter table user_suggestions enable row level security;
alter table health_metrics enable row level security;
alter table events enable row level security;

-- Policy DELETE (own rows) se non già esistenti
create policy "lifescores delete own" on lifescores for delete using (auth.uid() = user_id);
create policy "user_suggestions delete own" on user_suggestions for delete using (auth.uid() = user_id);
create policy "health delete own" on health_metrics for delete using (auth.uid() = user_id);
create policy "events delete own" on events for delete using (auth.uid() = user_id);
`}
              </pre>
            </details>
          </section>

        </div>
      )}
    </main>
  );
}
