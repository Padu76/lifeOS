'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type LifeScore = { date: string; score: number };
type Activity = { date: string; completed: boolean | null };

function fmt(d: string){ const [y,m,day] = d.split('-').map(Number); return `${String(day).padStart(2,'0')}/${String(m).padStart(2,'0')}`; }
function rangeDays(n:number){ const out:string[]=[]; const today=new Date(); for(let i=n-1;i>=0;i--){const d=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()-i)); out.push(d.toISOString().slice(0,10));} return out; }

function movingAvg(series: {x:string;y:number}[], window=7){
  const out = series.map((_,i)=>{
    const start = Math.max(0, i-window+1);
    const slice = series.slice(start, i+1).map(p=>p.y).filter(v=>v>0);
    const avg = slice.length ? Math.round(slice.reduce((s,v)=>s+v,0)/slice.length) : 0;
    return { x: series[i].x, y: avg };
  });
  return out;
}

// Interactive LineChart with tooltip + optional overlay series
function LineChart({ data, overlay }: { data: { x: string; y: number }[], overlay?: { x: string; y: number }[] }){
  const height=200, width=760, padding=36;
  const ys=[...data.map(d=>d.y), ...(overlay?overlay.map(o=>o.y):[])];
  const minY=Math.min(0,...ys), maxY=Math.max(100,...ys);
  const xStep=(width-padding*2)/Math.max(1,data.length-1);
  const toXY=(i:number,y:number)=>{const x=padding+i*xStep; const ny=(y-minY)/(maxY-minY||1); const yy=height-padding-ny*(height-padding*1.8); return [x,yy];};

  const [hover, setHover] = useState<{i:number, x:number, y:number} | null>(null);

  const path = data.map((d,i)=>{const [x,y]=toXY(i,d.y); return i===0?`M ${x} ${y}`:`L ${x} ${y}`;}).join(' ');
  const overlayPath = overlay ? overlay.map((d,i)=>{const [x,y]=toXY(i,d.y); return i===0?`M ${x} ${y}`:`L ${x} ${y}`;}).join(' ') : '';

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.target as SVGElement).closest('svg')!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const i = Math.round((mx - padding)/xStep);
    if (i<0 || i>=data.length) { setHover(null); return; }
    const [x,y] = toXY(i, data[i].y);
    setHover({ i, x, y });
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}
         onMouseMove={onMove} onMouseLeave={()=>setHover(null)}
         style={{border:'1px solid #eee', borderRadius:10, background:'#fff'}}>

      {/* axes labels x */}
      {data.map((d,i)=>{const [x] = toXY(i,d.y); return <text key={'t'+i} x={x} y={height-8} fontSize="10" textAnchor="middle" fill="#6b7280">{fmt(d.x)}</text>;})}

      {/* main line */}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      {data.map((d,i)=>{const [x,y]=toXY(i,d.y); return <circle key={'c'+i} cx={x} cy={y} r="3" />;})}

      {/* overlay moving average */}
      {overlay && <path d={overlayPath} fill="none" strokeDasharray="4 4" stroke="currentColor" strokeWidth="2" opacity="0.6" />}

      {/* tooltip */}
      {hover && (
        <g>
          <line x1={hover.x} x2={hover.x} y1={padding*0.4} y2={height-padding*0.4} stroke="#9ca3af" strokeDasharray="3 3"/>
          <circle cx={hover.x} cy={hover.y} r="4" fill="#111827" />
          <rect x={hover.x+8} y={Math.max(hover.y-22, 8)} rx="6" ry="6" width="120" height="40" fill="#111827" opacity="0.9" />
          <text x={hover.x+16} y={Math.max(hover.y-6, 22)} fontSize="11" fill="#fff">
            {fmt(data[hover.i].x)} • {data[hover.i].y}
          </text>
          {overlay && <text x={hover.x+16} y={Math.max(hover.y+10, 38)} fontSize="11" fill="#c7d2fe">
            MA7: {overlay[hover.i].y}
          </text>}
        </g>
      )}
    </svg>
  );
}

function BarChart({ data }: { data: { x: string; y: number }[] }){
  const height=200,width=760,padding=36,maxY=Math.max(1,...data.map(d=>d.y));
  const xStep=(width-padding*2)/data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}
         style={{border:'1px solid #eee', borderRadius:10, background:'#fff'}}>
      {data.map((d,i)=>{
        const barW=Math.max(6,xStep*0.6);
        const x=padding+i*xStep+(xStep-barW)/2;
        const h=(d.y/maxY)*(height-padding*1.8);
        const y=height-padding-h;
        return <rect key={i} x={x} y={y} width={barW} height={h} />;
      })}
      {data.map((d,i)=>{
        const x=padding+i*xStep+xStep/2;
        return <text key={'t'+i} x={x} y={height-8} fontSize="10" textAnchor="middle" fill="#6b7280">{fmt(d.x)}</text>;
      })}
    </svg>
  );
}

function downloadCSV(filename: string, rows: {date: string, lifescore?: number, completed_count?: number}[]) {
  const header = ['date','lifescore','completed_count'];
  const csv = [header.join(',')].concat(
    rows.map(r => [r.date, r.lifescore ?? '', r.completed_count ?? ''].join(','))
  ).join('\\n');
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
  const [showMA, setShowMA] = useState(true);

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

  const lifeMA = useMemo(()=> movingAvg(lifeSeries, 7), [lifeSeries]);

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
    <main style={{maxWidth:980, margin:'32px auto', padding:'0 20px', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}}>
      <h1 style={{marginBottom:6}}>Dashboard</h1>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12, flexWrap:'wrap'}}>
        <span style={{opacity:.8}}>Periodo:</span>
        {[7,14,30].map(r => (
          <button key={r} onClick={()=>setRange(r as 7|14|30)} style={{padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8, background: r===range ? '#f3f4f6' : 'white'}}>
            {r} giorni
          </button>
        ))}
        <label style={{display:'flex', alignItems:'center', gap:6, marginLeft:12}}>
          <input type="checkbox" checked={showMA} onChange={()=>setShowMA(s=>!s)} />
          Mostra media mobile 7gg
        </label>
        <button onClick={exportCSV} style={{marginLeft:'auto', padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:8}}>⬇️ Export CSV</button>
      </div>

      {loading && <p>Carico…</p>}
      {msg && <p style={{background:'#FEF3C7', border:'1px solid #FDE68A', padding:12, borderRadius:10}}>{msg}</p>}

      {!loading && !msg && (
        <div style={{display:'grid', gap:16}}>
          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <h3 style={{margin:0}}>LifeScore</h3>
              <div style={{opacity:.8}}>Media ({range}gg): <strong>{avg}</strong></div>
            </div>
            <LineChart data={lifeSeries} overlay={showMA ? lifeMA : undefined} />
          </section>

          <section style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <h3 style={{margin:0}}>Attività completate</h3>
              <div style={{opacity:.8}}>Somma ({range}gg): <strong>{completedSeries.reduce((s,d)=>s+d.y,0)}</strong></div>
            </div>
            <BarChart data={completedSeries} />
          </section>
        </div>
      )}
    </main>
  );
}
