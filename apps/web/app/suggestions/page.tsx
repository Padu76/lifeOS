'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

type Row = {
  id: number;
  date: string;
  suggestion_id: number;
  completed: boolean;
  suggestion?: {
    key: string;
    title: string;
    short_copy: string | null;
    duration_sec: number | null;
  } | null;
};

function todayISODate(){
  const d = new Date();
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return iso.toISOString().slice(0,10);
}

export default function SuggestionsPage(){
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMsg('Non sei autenticato. Accedi per vedere i tuoi suggerimenti.');
        setLoading(false);
        return;
      }
      const user = session.user;

      const date = todayISODate();
      const { data, error } = await supabase
        .from('user_suggestions')
        .select('id,date,suggestion_id,completed')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('created_at', { ascending: false });

      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }

      const ids = Array.from(new Set((data ?? []).map(r => r.suggestion_id)));
      let map = new Map<number, Row['suggestion']>();
      if (ids.length){
        const { data: cats } = await supabase
          .from('suggestions')
          .select('id,key,title,short_copy,duration_sec')
          .in('id', ids);
        (cats??[]).forEach((s:any) => map.set(s.id, { key: s.key, title: s.title, short_copy: s.short_copy, duration_sec: s.duration_sec }));
      }

      const rows: Row[] = (data ?? []).map(r => ({...r, suggestion: map.get(r.suggestion_id) ?? null}));
      setRows(rows);
      setLoading(false);
    })();
  }, []);

  return (
    <main style={{maxWidth:760, margin:'40px auto', padding:'0 20px'}}>
      <h1>Suggerimenti</h1>
      {loading && <p>Carico…</p>}
      {msg && <p>{msg} {msg.includes('Accedi') ? <Link href="/sign-in">👉 Vai al login</Link> : null}</p>}
      {!loading && !rows.length && !msg && <p>Nessun suggerimento per oggi.</p>}
      <div style={{display:'grid', gap:12}}>
        {rows.map(r => {
          const s = r.suggestion;
          if (!s) return null;
          return (
            <div key={r.id} style={{border:'1px solid #e5e7eb', borderRadius:12, padding:14, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{s.title}</div>
                <div style={{opacity:.8, fontSize:14}}>{s.short_copy ?? ''}</div>
                {s.duration_sec ? <div style={{opacity:.7, fontSize:12, marginTop:4}}>{Math.round(s.duration_sec/60)} min</div> : null}
              </div>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                {r.completed ? <span style={{fontSize:12, padding:'6px 10px', border:'1px solid #22c55e', color:'#16a34a', borderRadius:999}}>Completato</span> : null}
                <Link href={`/suggestions/${s.key}`} style={{padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:10}}>Apri</Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
