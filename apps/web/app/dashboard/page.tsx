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
  return (<svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}><path d={path} fill="none" stroke="currentColor" strokeWidth="2"/>{data.map((d,i)=>{const[x,y]=toXY(i,d.y);return<circle key={i} cx={x} cy={y} r="3"/>;})}{data.map((d,i)=>{const[x]=toXY(i,d.y);return<text key={'t'+i} x={x} y={height-8} fontSize="10" textAnchor="middle" fill="#6b7280">{fmt(d.x)}</text>;})}</svg>);
}
function BarChart({ data }: { data: { x: string; y: number }[] }){
  const height=160,width=680,padding=32,maxY=Math.max(1,...data.map(d=>d.y)); const xStep=(width-padding*2)/data.length;
  return (<svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>{data.map((d,i)=>{const barW=Math.max(6,xStep*0.6); const x=padding+i*xStep+(xStep-barW)/2; const h=(d.y/maxY)*(height-padding*1.5); const y=height-padding-h; return<rect key={i} x={x} y={y} width={barW} height={h}/>;})}{data.map((d,i)=>{const x=padding+i*xStep+xStep/2;return<text key={'t'+i} x={x} y={height-8} fontSize="10" textAnchor="middle" fill="#6b7280">{fmt(d.x)}</text>;})}</svg>);
}

export default function DashboardPage(){
  const [loading,setLoading]=useState(true); const [msg,setMsg]=useState<string|null>(null); const [life,setLife]=useState<LifeScore[]>([]); const [acts,setActs]=useState<Activity[]>([]);
  useEffect(()=>{(async()=>{setLoading(true);setMsg(null);const{data:{session}}=await supabase.auth.getSession();if(!session){setMsg('Non sei autenticato.');setLoading(false);return;}const user=session.user;
    const {data:l}=await supabase.from('lifescores').select('date,score').eq('user_id',user.id).order('date',{ascending:true});
    const {data:a}=await supabase.from('user_suggestions').select('date,completed').eq('user_id',user.id);
    setLife((l??[])as LifeScore[]); setActs((a??[])as Activity[]); setLoading(false);})();},[]);
  const days=useMemo(()=>rangeDays(14),[]);
  const lifeSeries=useMemo(()=>{const map=new Map(life.map(d=>[d.date,d.score]));return days.map(d=>({x:d,y:map.get(d)??0}));},[life,days]);
  const completedSeries=useMemo(()=>{const count=new Map<string,number>();acts.forEach(a=>count.set(a.date,(count.get(a.date)??0)+(a.completed?1:0)));return days.map(d=>({x:d,y:count.get(d)??0}));},[acts,days]);
  return (<main style={{maxWidth:900,margin:'32px auto',padding:'0 20px'}}><h1>Dashboard</h1>{loading&&<p>Carico…</p>}{msg&&<p>{msg}</p>}{!loading&&!msg&&(<><h3>LifeScore</h3><LineChart data={lifeSeries}/><h3>Attività completate</h3><BarChart data={completedSeries}/></>)}</main>);
}
