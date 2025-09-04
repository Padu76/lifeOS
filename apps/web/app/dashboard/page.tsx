'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type LifeScore = { date: string; score: number };
type Activity = { date: string; completed: boolean | null };

function fmt(d: string){ const [y,m,day] = d.split('-').map(Number); return `${String(day).padStart(2,'0')}/${String(m).padStart(2,'0')}`; }
function rangeDays(n:number){ const out:string[]=[]; const today=new Date(); for(let i=n-1;i>=0;i--){const d=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()-i)); out.push(d.toISOString().slice(0,10));} return out; }

function LineChart({ data }: { data: { x: string; y: number }[] }){
  const height=160,width=680,padding=32;
  const ys=data.map(d=>d.y); const minY=Math.min(0,...ys), maxY=Math.max(100,...ys);
  const xStep=(width-padding*2)/Math.max(1,data.length-1);
  const toXY=(i:number,y:number)=>{const x=padding+i*xStep; const ny=(y-minY)/(maxY-minY||1); const yy=height-padding-ny*(height-padding*1.5); return [x,yy];};
  const path=data.map((d,i)=>{const [x,y]=toXY(i,d.y); return i===0?`M ${x} ${y}`:`L ${x} ${y}`;}).join(' ');
  return (<svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{border:'1px solid #eee',borderRadius:10}}><path d={path} fill="none" stroke="currentColor" strokeWidth="2"/>{data.map((d,i)=>{const[x,y]=toXY(i,d.y);return<circle key={i} cx={x} cy={y} r="3"/>;})}{data.map((d,i)=>{const[x]=toXY(i,d.y);return<text key={'t'+i} x={x} y={height-8} fontSize="10" textAnchor="middle" fill="#6b7280">{fmt(d.x)}</text>;})}</svg>);
}
function BarChart({ data }: { data: { x: string; y: number }[] }){
  const height=160,width=680,padding=32,maxY=Math.max(1,...data.map(d=>d.y)); const xStep=(width-padding*2)/data.length;
  return (<svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{border:'1px solid #eee',borderRadius:10}}>{data.map((d,i)=>{const barW=Math.max(6,xStep*0.6); const x=padding+i*xStep+(xStep-barW)/2; const h=(d.y/maxY)*(height-padding*1.5); const y=height-padding-h; return<rect key={i} x={x} y={y} width={barW} height={h}/>;})}{data.map((d,i)=>{const x=padding+i*xStep+xStep/2;return<text key={'t'+i} x={x} y={height-8} fontSize="10" textAnchor="middle" fill="#6b7280">{fmt(d.x)}</text>;})}</svg>);
}

function downloadCSV(filename: string, rows: {date: string, lifescore?: number, completed_count?: number}[]) {
  const header = ['date','lifescore','completed_count'];
  const csv = [header.join(',')].concat(
    rows.map(r => [r.date, r.lifescore ?? '', r.completed_count ?? ''].join(','))
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage(){
  const [loading,setLoading]=useState(true);
  const [msg,setMsg]=useState<string|null>(null);
  const [life,setLife]=useState<LifeScore[]>([]);
  const [acts,setActs]=useState<Activity[]>([]);
  const [range,setRange]=useState<7|14|30>(14);

  useEffect(()=>{(async()=>{
    setLoading(true); setMsg(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setMsg('Non sei autenticato.'); setLoading(false); return; }
    const user = session.user;

    const from = new Date(Date.now() - 1000*60*60*24*30).toISOString().slice(0,10);
    const { data: l, error: e1 } = await supabase
      .from('lifescores')
      .select('date, score')
      .eq('user_id', user.id)
      .gte('date', from)
      .order('date', { ascending: true });
    if (e1) { setMsg(e1.message); setLoading(false); return; }

    const { data: a, error: e2 } = await supabase
      .from('user_suggestions')
      .select('date, completed')
      .eq('user_id', user.id)
      .gte('date', from);
    if (e2) { setMsg(e2.message); setLoading(false); return; }

    setLife((l??[]) as LifeScore[]);
    setActs((a??[]) as Activity[]);
    setLoading(false);
  })();},[]);

  const days = useMemo(()=>rangeDays(range),[range]);

  const lifeSeries = useMemo(()=>{
    const map = new Map(life.map(d=>[d.date,d.score]));
    return days.map(d => ({ x: d, y: map.get(d) ?? 0 }));
  }, [life, days]);

  const completedSeries = useMemo(()=>{
    const count = new Map<string, number>();
    acts.forEach(a => count.set(a.date, (count.get(a.date) ?? 0) + (a.completed ? 1 : 0)));
    return days.map(d => ({ x: d, y: count.get(d) ?? 0 }));
  }, [acts, days]);

  const avg = useMemo(()=>{
    const vals = lifeSeries.map(d=>d.y).filter(n=>n>0);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((s,v)=>s+v,0)/vals.length);
  }, [lifeSeries]);

  const exportCSV = () => {
    const merged = days.map(d => ({
      date: d,
      lifescore: lifeSeries.find(x => x.x === d)?.y ?? 0,
      completed_count: completedSeries.find(x => x.x === d)?.y ?? 0,
    }));
    downloadCSV(`dashboard_${range}d.csv`, merged);
  };

  return (
    <main style={{maxWidth:900, margin:'32px auto', padding:'0 20px', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}}>
      <h1 style={{marginBottom:6}}>Dashboard</h1>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
        <span style={{opacity:.8}}>Periodo:</span>
        {[7,14,30].map(r => (
          <button key={r} onClick={()=>setRange(r as 7|14|30)} style={{padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8, background: r===range ? '#f3f4f6' : 'white'}}>
            {r} giorni
          </button>
        ))}
        <button onClick={exportCSV} style={{marginLeft:'auto', padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8}}>⬇️ Export CSV</button>
      </div>

      {loading && <p>Carico…</p>}
      {msg && <p style={{background:'#FEF3C7', border:'1px solid #FDE68A', padding:12, borderRadius:10}}>{msg}</p>}

      {!loading && !msg && (
        <div style={{display:'grid', gap:16}}>
          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <h3 style={{margin:0}}>LifeScore</h3>
              <div style={{opacity:.8}}>Media: <strong>{avg}</strong></div>
            </div>
            <LineChart data={lifeSeries} />
          </section>

          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <h3 style={{margin:0}}>Attività completate</h3>
              <div style={{opacity:.8}}>Somma: <strong>{completedSeries.reduce((s,d)=>s+d.y,0)}</strong></div>
            </div>
            <BarChart data={completedSeries} />
          </section>
        </div>
      )}
    </main>
  );
}
