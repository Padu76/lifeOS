'use client';

import React, { useRef, useEffect, useState } from 'react';
import { TrendingUp, Activity, Heart, Brain, Moon, Zap, Calendar, Target, Award, ChevronRight, Menu, X, ArrowLeft } from 'lucide-react';
import MicroAdviceWidget from '../../components/MicroAdviceWidget';
import { supabase, callEdgeFunction } from '../../lib/supabase';

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

interface DashboardData {
  life_score: number;
  metrics: MetricData[];
  weekly_data: ChartData[];
  recent_activities: Array<{
    id: number;
    activity: string;
    time: string;
    type: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
}

// Mobile Menu Component
const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-lg border-l border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            LifeOS
          </span>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-6 space-y-6">
          {[
            { href: '/', label: 'Home' },
            { href: '/suggestions', label: 'Suggestions' },
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/settings', label: 'Settings' }
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block text-lg font-semibold text-white/80 hover:text-white transition-colors py-2"
            >
              {item.label}
            </a>
          ))}
          
          <div className="pt-6 border-t border-white/20">
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

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

  if (!mounted) return <div className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full animate-pulse" />;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div ref={ringRef} className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
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
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{score}</div>
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
      className={`group bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 min-h-[44px] active:scale-95 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${color} rounded-xl group-hover:rotate-12 transition-transform duration-300`}>
          {icon}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${
          metric.trend === 'up' ? 'bg-green-500/20 text-green-400' :
          metric.trend === 'down' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.change}%
        </div>
      </div>

      <div className="text-xl sm:text-2xl font-bold text-white mb-1">{metric.value}</div>
      <div className="text-white/70 text-xs sm:text-sm">{metric.label}</div>
    </div>
  );
};

const MiniChart: React.FC<{ data: ChartData[]; type: 'score' | 'stress' | 'energy' | 'sleep' }> = ({ data, type }) => {
  const maxValue = Math.max(...data.map(d => d[type]));
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d[type] / maxValue) * 100}`).join(' ');

  return (
    <div className="w-full h-16 sm:h-20">
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

const Dashboard: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiCallMade, setApiCallMade] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);

  // Mock data fallback
  const fallbackData: DashboardData = {
    life_score: 87,
    metrics: [
      { label: 'Stress Level', value: 5, trend: 'down', change: 12 },
      { label: 'Energy Level', value: 7, trend: 'up', change: 8 },
      { label: 'Sleep Quality', value: 8, trend: 'stable', change: 2 },
      { label: 'Focus Score', value: 6, trend: 'up', change: 15 },
    ],
    weekly_data: [
      { day: 'Lun', score: 85, stress: 6, energy: 7, sleep: 8 },
      { day: 'Mar', score: 82, stress: 7, energy: 6, sleep: 7 },
      { day: 'Mer', score: 88, stress: 5, energy: 8, sleep: 8 },
      { day: 'Gio', score: 90, stress: 4, energy: 9, sleep: 9 },
      { day: 'Ven', score: 87, stress: 6, energy: 7, sleep: 8 },
      { day: 'Sab', score: 89, stress: 5, energy: 8, sleep: 8 },
      { day: 'Dom', score: 87, stress: 5, energy: 7, sleep: 9 },
    ],
    recent_activities: [
      { id: 1, activity: 'Respirazione 4-7-8 completata', time: '2 ore fa', type: 'success' },
      { id: 2, activity: 'Camminata energizzante (15 min)', time: '4 ore fa', type: 'energy' },
      { id: 3, activity: 'Meditazione serale', time: 'Ieri', type: 'sleep' },
      { id: 4, activity: 'Sessione Pomodoro completata', time: 'Ieri', type: 'focus' },
    ],
    achievements: [
      { title: 'Settimana perfetta', description: '7 giorni consecutivi di consigli completati', icon: '🔥', unlocked: true },
      { title: 'Maestro del respiro', description: '50 sessioni di respirazione completate', icon: '🫁', unlocked: true },
      { title: 'Energia stabile', description: 'Mantieni energia >7 per 5 giorni', icon: '⚡', unlocked: false },
    ]
  };

  // Check auth state and load data
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log('🚀 === DASHBOARD INITIALIZATION START ===');
      setLoading(true);
      
      try {
        // Check for authenticated user
        console.log('🔍 Checking authentication...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('❌ No authenticated user found, redirecting to sign-in');
          window.location.href = '/sign-in';
          return;
        }

        console.log('✅ User authenticated:', {
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.created_at
        });
        setUser(session.user);

        // Try to load real dashboard data
        console.log('📡 === API CALL START ===');
        setApiCallMade(true);
        
        try {
          const apiPayload = {
            user_id: session.user.id,
            time_range: '7d',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };
          
          console.log('📤 API Payload:', apiPayload);
          
          const data = await callEdgeFunction('get-wellness-dashboard', apiPayload);
          
          console.log('🔥 === API RESPONSE START ===');
          console.log('Raw API Response:', data);
          console.log('Response type:', typeof data);
          console.log('Response keys:', data ? Object.keys(data) : 'No keys (null/undefined)');
          
          if (data && data.dashboard) {
            console.log('📊 Dashboard data found:', {
              life_score: data.dashboard.life_score,
              metrics_count: data.dashboard.metrics?.length,
              weekly_data_count: data.dashboard.weekly_data?.length,
              activities_count: data.dashboard.recent_activities?.length,
              achievements_count: data.dashboard.achievements?.length
            });
          } else {
            console.log('📊 No dashboard data in response');
          }
          console.log('🔥 === API RESPONSE END ===');
          
          if (data && data.dashboard) {
            console.log('✅ Using API data for dashboard');
            setDashboardData({
              life_score: data.dashboard.life_score || fallbackData.life_score,
              metrics: data.dashboard.metrics || fallbackData.metrics,
              weekly_data: data.dashboard.weekly_data || fallbackData.weekly_data,
              recent_activities: data.dashboard.recent_activities || fallbackData.recent_activities,
              achievements: data.dashboard.achievements || fallbackData.achievements
            });
            setApiSuccess(true);
          } else {
            console.log('⚠️ API returned but no dashboard data, using fallback');
            setDashboardData(fallbackData);
            setApiSuccess(false);
          }
        } catch (apiError) {
          console.log('❌ === API CALL FAILED ===');
          console.error('API Error Details:', {
            message: apiError instanceof Error ? apiError.message : String(apiError),
            stack: apiError instanceof Error ? apiError.stack : undefined,
            name: apiError instanceof Error ? apiError.name : typeof apiError
          });
          console.log('Using fallback data due to API failure');
          setDashboardData(fallbackData);
          setApiSuccess(false);
        }
        
        console.log('📡 === API CALL END ===');
        
      } catch (err: any) {
        console.error('💥 Critical auth error:', err);
        window.location.href = '/sign-in';
        return;
      } finally {
        setLoading(false);
        console.log('🏁 === DASHBOARD INITIALIZATION END ===');
      }
    };

    initializeDashboard();
  }, []);

  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-base sm:text-lg">Caricamento dashboard...</div>
          {apiCallMade && (
            <div className="text-white/60 text-sm mt-2">
              {apiSuccess ? 'Caricamento dati reali...' : 'Caricamento dati demo...'}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!dashboardData || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-red-400 text-base sm:text-lg mb-4">Errore nel caricamento della dashboard</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-lg transition-colors min-h-[44px]"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

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

      {/* Single Navigation Header */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left: Home button */}
            <a 
              href="/" 
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors min-w-0 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Home</span>
            </a>
            
            {/* Center: Title and User Info */}
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-white">Dashboard</div>
              <div className="text-xs text-white/60 flex items-center gap-2">
                {user.email}
                {/* Debug info */}
                {apiCallMade && (
                  <span className={`px-2 py-1 rounded text-xs ${
                    apiSuccess 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-orange-500/20 text-orange-300'
                  }`}>
                    {apiSuccess ? 'API OK' : 'Fallback'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Right: Menu/Navigation */}
            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-6 text-white/80 text-sm">
                <a href="/" className="hover:text-white transition-colors">Home</a>
                <a href="/suggestions" className="hover:text-white transition-colors">Suggestions</a>
                <a href="/dashboard" className="text-white font-semibold">Dashboard</a>
                <a href="/settings" className="hover:text-white transition-colors">Settings</a>
              </div>
              
              {/* Desktop Logout */}
              <button 
                onClick={handleLogout}
                className="hidden md:block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full font-medium hover:scale-105 transition-transform text-sm"
              >
                Logout
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Apri menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-6 sm:pb-8 lg:pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 mb-8">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                La tua
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-2xl">
                Monitora i tuoi progressi e scopri insights personalizzati sul tuo benessere
              </p>
            </div>

            {/* Life Score Ring */}
            <div className="flex-shrink-0 relative">
              <LifeScoreRing score={dashboardData.life_score} />
            </div>
          </div>
        </div>
      </section>

      {/* MicroAdvice Widget with Dashboard Data */}
      <section className="relative py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <MicroAdviceWidget 
            className="bg-white/5 backdrop-blur-lg rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10"
            maxAdvices={2}
            autoRefresh={true}
            dashboardData={{
              current_life_score: {
                stress: dashboardData.metrics[0].value,
                energy: dashboardData.metrics[1].value,
                sleep: dashboardData.metrics[2].value,
                overall: dashboardData.life_score,
                last_updated: new Date().toISOString()
              },
              metrics: dashboardData.metrics
            }}
          />
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="relative py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-3">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Metriche principali
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <MetricCard
              metric={dashboardData.metrics[0]}
              icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              color="from-blue-500 to-purple-600"
              delay={0}
            />
            <MetricCard
              metric={dashboardData.metrics[1]}
              icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              color="from-orange-500 to-red-600"
              delay={100}
            />
            <MetricCard
              metric={dashboardData.metrics[2]}
              icon={<Moon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              color="from-indigo-500 to-purple-600"
              delay={200}
            />
            <MetricCard
              metric={dashboardData.metrics[3]}
              icon={<Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              color="from-green-500 to-blue-600"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="relative py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Weekly Trend */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                <h3 className="text-lg sm:text-xl font-bold text-white">Andamento settimanale</h3>
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
                      <span className="text-white text-sm">{dashboardData.weekly_data[dashboardData.weekly_data.length - 1][item.type]}</span>
                    </div>
                    <MiniChart data={dashboardData.weekly_data} type={item.type} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                <h3 className="text-lg sm:text-xl font-bold text-white">Attività recenti</h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {dashboardData.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors min-h-[44px] active:scale-95">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-400' :
                      activity.type === 'energy' ? 'bg-orange-400' :
                      activity.type === 'sleep' ? 'bg-purple-400' :
                      'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm sm:text-base line-clamp-2">{activity.activity}</div>
                      <div className="text-white/60 text-xs sm:text-sm">{activity.time}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="relative py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Achievements recenti</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {dashboardData.achievements.map((achievement, index) => (
              <div key={index} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 min-h-[44px] ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{achievement.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{achievement.title}</h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{achievement.description}</p>
                {achievement.unlocked && (
                  <div className="mt-3 sm:mt-4 text-green-400 text-xs sm:text-sm font-medium">✓ Sbloccato</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
              Continua il tuo percorso
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/70 mb-6 sm:mb-8">
              Esplora nuovi consigli personalizzati per il tuo benessere
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/suggestions"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-transform min-h-[44px] flex items-center justify-center"
              >
                Nuovi Consigli
              </a>
              <a
                href="/checkin"
                className="border-2 border-white/30 text-white px-6 sm:px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/10 transition-colors min-h-[44px] flex items-center justify-center"
              >
                Check-in Giornaliero
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;