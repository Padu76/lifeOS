'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

function MMSS(total:number){
  const m = Math.floor(total/60), s = total%60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function useTick(seconds: number){
  const [sec, setSec] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setSec(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, []);
  return sec;
}

function Breathing478(){
  const [phase, setPhase] = useState<'inhale'|'hold'|'exhale'>('inhale');
  const [remaining, setRemaining] = useState(4);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let seconds = phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8;
    const t = setInterval(() => {
      seconds--;
      setRemaining(seconds);
      if (seconds <= 0){
        clearInterval(t);
        if (phase === 'inhale') setPhase('hold');
        else if (phase === 'hold') setPhase('exhale');
        else { setCycle(c=>c+1); setPhase('inhale'); }
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div style={{textAlign:'center'}}>
      <div style={{width:180, height:180, borderRadius:90, margin:'10px auto', background:'#E6F4EA'}} />
      <h3>{phase==='inhale'?'Inspira (4)':phase==='hold'?'Trattieni (7)':'Espira (8)'}</h3>
      <div>Secondi: {remaining>=0?remaining:0}</div>
      <div>Cicli completati: {cycle} / 5</div>
    </div>
  );
}

function todayISODate(){
  const d = new Date();
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return iso.toISOString().slice(0,10);
}

export default function SuggestionDetail(){
  const params = useParams();
  const key = String(params?.key ?? '');
  const router = useRouter();
  const [title, desc, body] = useMemo(() => {
    if (key==='breathing-478') return ['Respirazione 4-7-8','5 cicli guidati', <Breathing478 key="b"/>];
    if (key==='5min-meditation') return ['Meditazione 5 minuti','Siediti e segui il respiro', <div key="m" style={{textAlign:'center', fontSize:36, fontWeight:700}}>{MMSS(useTick(300))}</div>];
    if (key==='10min-walk') return ['Camminata 10 minuti','Cammina a passo svelto', <div key="w" style={{textAlign:'center', fontSize:36, fontWeight:700}}>{MMSS(useTick(600))}</div>];
    return ['Suggerimento','Dettaglio', <div key="x">Coming soon</div>];
  }, [key]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const markCompleted = async () => {
    try{
      setSaving(true);
      setMsg(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setMsg('Non sei autenticato.'); return; }
      const user = session.user;
      const { data: s } = await supabase.from('suggestions').select('id').eq('key', key).maybeSingle();
      if (!s) { setMsg('Suggestion non trovata.'); return; }
      const date = todayISODate();
      const { data: us } = await supabase
        .from('user_suggestions')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('suggestion_id', s.id)
        .eq('date', date)
        .maybeSingle();
      if (!us) { setMsg('Nessuna riga assegnata per oggi.'); return; }

      const { error: e3 } = await supabase
        .from('user_suggestions')
        .update({ completed: true })
        .eq('id', us.id);
      if (e3) throw e3;
      setMsg('Segnato come completato ✅');
      setTimeout(()=>router.push('/suggestions'), 800);
    } catch (e:any){
      setMsg(e.message ?? 'Errore');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{maxWidth:680, margin:'40px auto', padding:'0 20px'}}>
      <h1>{title}</h1>
      <p>{desc}</p>
      <div style={{margin:'16px 0'}}>{body}</div>
      <button onClick={markCompleted} disabled={saving} style={{padding:'10px 14px', borderRadius:10, border:'1px solid #e5e7eb'}}>
        {saving ? 'Salvo…' : 'Segna come completato'}
      </button>
      {msg && <p style={{marginTop:10}}>{msg}</p>}
    </main>
  );
}
