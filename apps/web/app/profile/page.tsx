'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type LifeScore = { date: string; score: number };
type UserSuggestion = { date: string; completed: boolean; suggestion_id: number };

export default function ProfilePage(){
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string|null>(null);
  const [email, setEmail] = useState<string>('');
  const [avgScore, setAvgScore] = useState<number>(0);
  const [completedTotal, setCompletedTotal] = useState<number>(0);

  // extras
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [busyReset, setBusyReset] = useState(false);
  const [busyLogoutAll, setBusyLogoutAll] = useState(false);
  const [busyExport, setBusyExport] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setMsg('Non sei autenticato.'); setLoading(false); return; }
      const user = session.user;
      setEmail(user.email ?? user.id);

      // Media LifeScore (tutto lo storico dell'utente)
      const { data: ls, error: e1 } = await supabase
        .from('lifescores')
        .select('score, user_id');
      if (e1) { setMsg(e1.message); setLoading(false); return; }
      const myScores = (ls ?? []).filter((x: any) => true); // RLS già limita a user corrente
      const values = myScores.map((x: any) => x.score).filter((n: any) => typeof n === 'number');
      setAvgScore(values.length ? Math.round(values.reduce((s: number, v: number) => s + v, 0) / values.length) : 0);

      // Attività completate totali
      const { data: us, error: e2 } = await supabase
        .from('user_suggestions')
        .select('completed');
      if (e2) { setMsg(e2.message); setLoading(false); return; }
      const total = (us ?? []).reduce((s: number, r: any) => s + (r.completed ? 1 : 0), 0);
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

      const tables = ['lifescores', 'user_suggestions', 'health_metrics', 'events'];
      let failures: string[] = [];
      for (const t of tables){
        const { error } = await supabase.from(t).delete().eq('user_id', user.id);
        if (error) failures.push(`${t}: ${error.message}`);
      }
      setMsg(failures.length ? 
        'Reset parziale: alcune tabelle non sono state pulite. Vedi suggerimenti policy in basso.' :
        'Reset dati completato.');
    } catch (e:any){
      setMsg(e.message ?? 'Errore durante il reset.');
    } finally {
      setBusyReset(false);
    }
  };

  const onChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) { alert('Inserisci una email valida.'); return; }
    try{
      setChangingEmail(true);
      setMsg(null);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setMsg('Email aggiornata: controlla la casella per confermare la modifica.');
      setNewEmail('');
    } catch (e:any){
      setMsg(e.message ?? 'Errore durante il cambio email.');
    } finally {
      setChangingEmail(false);
    }
  };

  const onLogoutAll = async () => {
    try{
      setBusyLogoutAll(true);
      setMsg(null);
      // Revoca tutte le sessioni (disponibile su supabase-js v2)
      const { error } = await supabase.auth.signOut({ scope: 'global' as any });
      if (error) throw error;
      setMsg('Sei stato disconnesso da tutti i dispositivi.');
    } catch (e:any){
      setMsg(e.message ?? 'Errore nel logout globale.');
    } finally {
      setBusyLogoutAll(false);
    }
  };

  const onExportJSON = async () => {
    try{
      setBusyExport(true);
      setMsg(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non sei autenticato');
      const user = session.user;

      const [lsRes, usRes] = await Promise.all([
        supabase.from('lifescores').select('date, score').order('date',{ascending:true}),
        supabase.from('user_suggestions').select('date, completed, suggestion_id').order('date',{ascending:true})
      ]);
      if (lsRes.error) throw lsRes.error;
      if (usRes.error) throw usRes.error;

      const payload = {
        exported_at: new Date().toISOString(),
        user: { id: user.id, email: user.email },
        lifescores: (lsRes.data ?? []) as LifeScore[],
        user_suggestions: (usRes.data ?? []) as UserSuggestion[],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lifeos_export.json';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Esportazione completata (JSON scaricato).');
    } catch (e:any){
      setMsg(e.message ?? 'Errore durante export.');
    } finally {
      setBusyExport(false);
    }
  };

  return (
    <main style={{maxWidth:820, margin:'32px auto', padding:'0 20px', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}}>
      <h1>Profilo</h1>

      {loading && <p>Carico…</p>}
      {msg && <p style={{background:'#FEF3C7', border:'1px solid #FDE68A', padding:12, borderRadius:10}}>{msg}</p>}

      {!loading && (
        <div style={{display:'grid', gap:16}}>

          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <h3 style={{marginTop:0}}>Account</h3>
            <div style={{display:'grid', gap:10}}>
              <div><strong>Email</strong>: {email}</div>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Nuova email" style={{padding:'6px 8px', border:'1px solid #e5e7eb', borderRadius:8, flex:1}} />
                <button onClick={onChangeEmail} disabled={changingEmail} style={{padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8}}>
                  {changingEmail ? 'Invio…' : 'Cambia email'}
                </button>
              </div>
              <div>
                <button onClick={onLogoutAll} disabled={busyLogoutAll} style={{padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8}}>
                  {busyLogoutAll ? 'Disconnetto…' : 'Logout da tutti i dispositivi'}
                </button>
              </div>
            </div>
          </section>

          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <h3 style={{marginTop:0}}>Riepilogo</h3>
            <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
              <div style={{border:'1px solid #eee', borderRadius:10, padding:'10px 12px', minWidth:160}}>
                <div style={{opacity:.8, fontSize:13}}>LifeScore medio</div>
                <div style={{fontSize:24, fontWeight:700}}>{avgScore}</div>
              </div>
              <div style={{border:'1px solid #eee', borderRadius:10, padding:'10px 12px', minWidth:160}}>
                <div style={{opacity:.8, fontSize:13}}>Attività completate</div>
                <div style={{fontSize:24, fontWeight:700}}>{completedTotal}</div>
              </div>
              <div style={{display:'flex', alignItems:'center'}}>
                <button onClick={onExportJSON} disabled={busyExport} style={{padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8}}>
                  {busyExport ? 'Esporto…' : '⬇️ Scarica dati (JSON)'}
                </button>
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

create policy if not exists "lifescores delete own" on lifescores for delete using (auth.uid() = user_id);
create policy if not exists "user_suggestions delete own" on user_suggestions for delete using (auth.uid() = user_id);
create policy if not exists "health delete own" on health_metrics for delete using (auth.uid() = user_id);
create policy if not exists "events delete own" on events for delete using (auth.uid() = user_id);
`}
              </pre>
            </details>
          </section>

        </div>
      )}
    </main>
  );
}
