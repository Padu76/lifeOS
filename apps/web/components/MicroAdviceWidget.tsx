'use client';

import React, { useRef, useEffect, useState } from 'react';
import { TrendingUp, Activity, Heart, Brain, Moon, Zap, Calendar, Target, Award, ChevronRight, Lightbulb, Clock, RefreshCw } from 'lucide-react';
import MicroAdviceWidget from '../components/MicroAdviceWidget';

interface MetricData {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface ChartData {
  day: string;
  score: number;
  stress: number;
  energy: number;
  sleep: number;
}

const useIntersectionObserver = (ref: React.RefObject<HTMLElement>, threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [ref, threshold]);

  return isIntersecting;
};

const LifeScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const [mounted, setMounted] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ringRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={`w-${size} h-${size} bg-white/10 rounded-full animate-pulse`} />;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div ref={ringRef} className={`relative`} style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isVisible ? strokeDashoffset : circumference}
          className="transition-all duration-2000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{score}</div>
          <div className="text-xs text-white/60">LifeScore</div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  metric: MetricData;
  icon: React.ReactNode;
  color: string;
  delay: number;
}> = ({ metric, icon, color, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef);

  return (
    <div
      ref={cardRef}
      className={`group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${color} rounded-xl group-hover:rotate-12 transition-transform duration-300`}>
          {icon}
        </div>
        <div className={`text-sm px-2 py-1 rounded-full ${
          metric.trend === 'up' ? 'bg-green-500/20 text-green-400' :
          metric.trend === 'down' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.change}%
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
      <div className="text-white/70 text-sm">{metric.label}</div>
    </div>
  );
};

const MiniChart: React.FC<{ data: ChartData[]; type: 'score' | 'stress' | 'energy' | 'sleep' }> = ({ data, type }) => {
  const maxValue = Math.max(...data.map(d => d[type]));
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d[type] / maxValue) * 100}`).join(' ');

  return (
    <div className="w-full h-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="url(#miniGradient)"
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const EnhancedDashboardPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const weekData: ChartData[] = [
    { day: 'Lun', score: 85, stress: 6, energy: 7, sleep: 8 },
    { day: 'Mar', score: 82, stress: 7, energy: 6, sleep: 7 },
    { day: 'Mer', score: 88, stress: 5, energy: 8, sleep: 8 },
    { day: 'Gio', score: 90, stress: 4, energy: 9, sleep: 9 },
    { day: 'Ven', score: 87, stress: 6, energy: 7, sleep: 8 },
    { day: 'Sab', score: 89, stress: 5, energy: 8, sleep: 8 },
    { day: 'Dom', score: 87, stress: 5, energy: 7, sleep: 9 },
  ];

  const metrics: MetricData[] = [
    { label: 'Stress Level', value: 5, trend: 'down', change: 12 },
    { label: 'Energy Level', value: 7, trend: 'up', change: 8 },
    { label: 'Sleep Quality', value: 8, trend: 'stable', change: 2 },
    { label: 'Focus Score', value: 6, trend: 'up', change: 15 },
  ];

  const recentActivities = [
    { id: 1, activity: 'Respirazione 4-7-8 completata', time: '2 ore fa', type: 'success' },
    { id: 2, activity: 'Camminata energizzante (15 min)', time: '4 ore fa', type: 'energy' },
    { id: 3, activity: 'Meditazione serale', time: 'Ieri', type: 'sleep' },
    { id: 4, activity: 'Sessione Pomodoro completata', time: 'Ieri', type: 'focus' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Fixed Background */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        style={{
          background: mounted
            ? `
              radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px,
                rgba(147, 197, 253, 0.1) 0%,
                transparent 50%),
              linear-gradient(135deg,
                #0f172a 0%,
                #1e1b4b 25%,
                #312e81 50%,
                #1e1b4b 75%,
                #0f172a 100%)
            `
            : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>
            <div className="hidden md:flex space-x-8 text-white/80">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/suggestions" className="hover:text-white transition-colors">Suggestions</a>
              <a href="/dashboard" className="text-white font-semibold">Dashboard</a>
              <a href="/profile" className="hover:text-white transition-colors">Profilo</a>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                La tua
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-xl text-white/70 max-w-2xl">
                Monitora i tuoi progressi e scopri insights personalizzati sul tuo benessere
              </p>
            </div>

            {/* Life Score Ring */}
            <div className="flex-shrink-0">
              <LifeScoreRing score={87} size={160} />
            </div>
          </div>
        </div>
      </section>

      {/* MicroAdvice Widget - Nuova sezione principale */}
      <section className="relative py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <MicroAdviceWidget 
            className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10"
            maxAdvices={2}
            autoRefresh={true}
          />
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="relative py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            Metriche principali
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <MetricCard
              metric={metrics[0]}
              icon={<Brain className="w-6 h-6 text-white" />}
              color="from-blue-500 to-purple-600"
              delay={0}
            />
            <MetricCard
              metric={metrics[1]}
              icon={<Zap className="w-6 h-6 text-white" />}
              color="from-orange-500 to-red-600"
              delay={100}
            />
            <MetricCard
              metric={metrics[2]}
              icon={<Moon className="w-6 h-6 text-white" />}
              color="from-indigo-500 to-purple-600"
              delay={200}
            />
            <MetricCard
              metric={metrics[3]}
              icon={<Target className="w-6 h-6 text-white" />}
              color="from-green-500 to-blue-600"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="relative py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Weekly Trend */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Andamento settimanale</h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'LifeScore', type: 'score' as const, color: 'text-blue-400' },
                  { label: 'Stress', type: 'stress' as const, color: 'text-red-400' },
                  { label: 'Energia', type: 'energy' as const, color: 'text-orange-400' },
                  { label: 'Sonno', type: 'sleep' as const, color: 'text-purple-400' },
                ].map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                      <span className="text-white text-sm">{weekData[weekData.length - 1][item.type]}</span>
                    </div>
                    <MiniChart data={weekData} type={item.type} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Attività recenti</h3>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'success' ? 'bg-green-400' :
                      activity.type === 'energy' ? 'bg-orange-400' :
                      activity.type === 'sleep' ? 'bg-purple-400' :
                      'bg-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="text-white font-medium">{activity.activity}</div>
                      <div className="text-white/60 text-sm">{activity.time}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="relative py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Achievements recenti</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Settimana perfetta', description: '7 giorni consecutivi di consigli completati', icon: '🔥', unlocked: true },
              { title: 'Maestro del respiro', description: '50 sessioni di respirazione completate', icon: '🫁', unlocked: true },
              { title: 'Energia stabile', description: 'Mantieni energia >7 per 5 giorni', icon: '⚡', unlocked: false },
            ].map((achievement, index) => (
              <div key={index} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}>
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{achievement.title}</h3>
                <p className="text-white/70 text-sm">{achievement.description}</p>
                {achievement.unlocked && (
                  <div className="mt-4 text-green-400 text-sm font-medium">✅ Sbloccato</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              Pronto per i prossimi consigli?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Continua il tuo percorso di benessere con suggerimenti personalizzati
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/suggestions"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
              >
                Nuovi Consigli
              </a>
              <a
                href="/profile"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
              >
                Aggiorna Profilo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedDashboardPage;