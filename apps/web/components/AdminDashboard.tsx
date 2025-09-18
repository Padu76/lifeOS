'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, Activity, TrendingUp, Target, Award, 
  MousePointer, Clock, Globe, BarChart3, RefreshCw,
  ArrowUp, ArrowDown, Shield, AlertTriangle, Search,
  Mail, Calendar, CheckCircle, XCircle, Eye
} from 'lucide-react';
import { supabase, supabaseAdmin } from '../lib/supabase';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  raw_user_meta_data: any;
}

interface UserStats {
  total_users: number;
  new_users_today: number;
  new_users_week: number;
  active_users_today: number;
  active_users_week: number;
  confirmed_users: number;
}

interface UsageStats {
  total_lifescores: number;
  total_micro_advices: number;
  total_suggestions: number;
  tutorial_sessions: number;
  avg_lifescore: number;
  active_sessions_today: number;
}

const StatCard = ({ title, value, change, icon, color }: any) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${
            change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {change > 0 ? <ArrowUp className="w-3 h-3" /> : change < 0 ? <ArrowDown className="w-3 h-3" /> : <></>}
            {change !== 0 && Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/70 text-sm">{title}</div>
    </div>
  );
};

const UserTable = ({ users, searchTerm, setSearchTerm }: { 
  users: UserData[], 
  searchTerm: string, 
  setSearchTerm: (term: string) => void 
}) => {
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Mai';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (confirmed: boolean, lastSignIn: string | null) => {
    if (!confirmed) return 'text-red-400';
    if (!lastSignIn) return 'text-yellow-400';
    const daysSinceLogin = (Date.now() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLogin <= 7 ? 'text-green-400' : 'text-orange-400';
  };

  const getStatusText = (confirmed: boolean, lastSignIn: string | null) => {
    if (!confirmed) return 'Non confermato';
    if (!lastSignIn) return 'Mai loggato';
    const daysSinceLogin = (Date.now() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin <= 1) return 'Attivo oggi';
    if (daysSinceLogin <= 7) return 'Attivo settimana';
    if (daysSinceLogin <= 30) return 'Attivo mese';
    return 'Inattivo';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            Utenti Registrati ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Utente
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Registrazione
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Ultimo Login
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/5">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{user.email}</div>
                      <div className="text-white/50 text-xs">ID: {user.id.split('-')[0]}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-white/70 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(user.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-white/70 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDate(user.last_sign_in_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex items-center gap-2 text-sm ${getStatusColor(!!user.email_confirmed_at, user.last_sign_in_at)}`}>
                      {user.email_confirmed_at ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {getStatusText(!!user.email_confirmed_at, user.last_sign_in_at)}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-white/50">
            Nessun utente trovato
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Controlla localStorage per auth persistente
  useEffect(() => {
    const savedAuth = localStorage.getItem('lifeos_admin_auth');
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Padu76') {
      setIsAuthenticated(true);
      setPasswordError('');
      // Salva in localStorage per non ripetere
      localStorage.setItem('lifeos_admin_auth', 'authenticated');
    } else {
      setPasswordError('Password non corretta');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('lifeos_admin_auth');
    window.location.href = '/dashboard';
  };

  const loadAdminData = async () => {
    try {
      console.log('Loading admin data...');
      
      // Carica utenti usando solo Admin API (auth.users non è accessibile via REST)
      let usersToLoad: UserData[] = [];

      try {
        console.log('Calling admin listUsers API...');
        
        if (!supabaseAdmin) {
          throw new Error('Admin client not available - service_role key missing');
        }
        
        const { data: authResponse, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        console.log('Admin API response:', authResponse);
        console.log('Admin API error:', authError);
        
        if (authError) {
          console.error('Admin API error:', authError);
        }
        
        if (authResponse?.users) {
          console.log(`Found ${authResponse.users.length} users`);
          usersToLoad = authResponse.users.map(u => ({
            id: u.id,
            email: u.email || '',
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at || null,
            email_confirmed_at: u.email_confirmed_at || null,
            raw_user_meta_data: u.user_metadata || {}
          }));
          console.log('Mapped users:', usersToLoad);
        } else {
          console.warn('No users found in admin API response');
        }
      } catch (adminAPIError) {
        console.error('Admin API failed:', adminAPIError);
      }

      setUsers(usersToLoad);
      console.log('Set users state:', usersToLoad);

      // Calcola stats utenti
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const totalUsers = usersToLoad.length;
      const newToday = usersToLoad.filter(u => new Date(u.created_at) >= today).length;
      const newWeek = usersToLoad.filter(u => new Date(u.created_at) >= weekAgo).length;
      const activeToday = usersToLoad.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= today).length;
      const activeWeek = usersToLoad.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= weekAgo).length;
      const confirmed = usersToLoad.filter(u => u.email_confirmed_at).length;

      setUserStats({
        total_users: totalUsers,
        new_users_today: newToday,
        new_users_week: newWeek,
        active_users_today: activeToday,
        active_users_week: activeWeek,
        confirmed_users: confirmed
      });

      // Carica stats utilizzo dalle tabelle reali
      const [lifescoresRes, microAdvicesRes, suggestionsRes, tutorialRes] = await Promise.all([
        supabase.from('lifescores').select('score', { count: 'exact' }),
        supabase.from('micro_advices').select('id', { count: 'exact' }),
        supabase.from('suggestions').select('id', { count: 'exact' }),
        supabase.from('tutorial_sessions').select('id', { count: 'exact' })
      ]);

      // Calcola media lifescore
      const { data: lifescoreData } = await supabase
        .from('lifescores')
        .select('score')
        .not('score', 'is', null);
      
      const avgLifescore = lifescoreData && lifescoreData.length > 0 
        ? lifescoreData.reduce((sum, item) => sum + (item.score || 0), 0) / lifescoreData.length 
        : 0;

      // Count sessioni attive oggi
      const { count: todaySessionsCount } = await supabase
        .from('micro_advice_sessions')
        .select('id', { count: 'exact' })
        .gte('created_at', today.toISOString());

      setUsageStats({
        total_lifescores: lifescoresRes.count || 0,
        total_micro_advices: microAdvicesRes.count || 0,
        total_suggestions: suggestionsRes.count || 0,
        tutorial_sessions: tutorialRes.count || 0,
        avg_lifescore: Math.round(avgLifescore * 10) / 10,
        active_sessions_today: todaySessionsCount || 0
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  useEffect(() => {
    const initializeAdmin = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          window.location.href = '/sign-in';
          return;
        }

        setUser(session.user);
        
        if (!isAuthenticated) {
          setLoading(false);
          return;
        }
        
        await loadAdminData();
        
      } catch (error) {
        console.error('Admin initialization error:', error);
        window.location.href = '/sign-in';
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();
  }, [isAuthenticated]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadAdminData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Password login screen
  if (!isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-white/70 text-sm mt-2">Inserisci la password per accedere alla dashboard admin</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-white/70 text-sm font-medium mb-2">
                Password Admin
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inserisci password"
                required
              />
            </div>
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm">
                {passwordError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              Accedi Admin
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/dashboard" className="text-white/60 hover:text-white text-sm">
              Torna alla Dashboard Utente
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Caricamento Admin Dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Errore nel caricamento</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-lg"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-400" />
                Admin Dashboard - LifeOS
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Ultimo aggiornamento: {lastRefresh ? lastRefresh.toLocaleString('it-IT') : 'Mai'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Aggiornando...' : 'Aggiorna'}
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform"
              >
                Logout Admin
              </button>
              
              <a
                href="/dashboard"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-transform"
              >
                Dashboard Utente
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        {userStats && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Statistiche Utenti
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Utenti Totali"
                value={formatNumber(userStats.total_users)}
                icon={<Users className="w-6 h-6 text-white" />}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Nuovi Oggi"
                value={userStats.new_users_today}
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="Nuovi Settimana"
                value={userStats.new_users_week}
                icon={<Activity className="w-6 h-6 text-white" />}
                color="from-purple-500 to-purple-600"
              />
              <StatCard
                title="Attivi Oggi"
                value={userStats.active_users_today}
                icon={<Eye className="w-6 h-6 text-white" />}
                color="from-orange-500 to-orange-600"
              />
              <StatCard
                title="Attivi Settimana"
                value={userStats.active_users_week}
                icon={<Clock className="w-6 h-6 text-white" />}
                color="from-cyan-500 to-cyan-600"
              />
              <StatCard
                title="Email Confermate"
                value={`${userStats.confirmed_users} (${Math.round(userStats.confirmed_users / userStats.total_users * 100)}%)`}
                icon={<Mail className="w-6 h-6 text-white" />}
                color="from-emerald-500 to-emerald-600"
              />
            </div>
          </section>
        )}

        {/* Usage Stats */}
        {usageStats && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Activity className="w-6 h-6 text-purple-400" />
              Statistiche Utilizzo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="LifeScores Totali"
                value={formatNumber(usageStats.total_lifescores)}
                icon={<Target className="w-6 h-6 text-white" />}
                color="from-blue-500 to-purple-600"
              />
              <StatCard
                title="Media LifeScore"
                value={usageStats.avg_lifescore.toFixed(1)}
                icon={<Award className="w-6 h-6 text-white" />}
                color="from-green-500 to-blue-600"
              />
              <StatCard
                title="Micro-Consigli Generati"
                value={formatNumber(usageStats.total_micro_advices)}
                icon={<MousePointer className="w-6 h-6 text-white" />}
                color="from-purple-500 to-pink-600"
              />
              <StatCard
                title="Suggestions Totali"
                value={formatNumber(usageStats.total_suggestions)}
                icon={<Globe className="w-6 h-6 text-white" />}
                color="from-cyan-500 to-blue-600"
              />
              <StatCard
                title="Tutorial Completati"
                value={formatNumber(usageStats.tutorial_sessions)}
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                color="from-orange-500 to-red-600"
              />
              <StatCard
                title="Sessioni Oggi"
                value={usageStats.active_sessions_today}
                icon={<Activity className="w-6 h-6 text-white" />}
                color="from-emerald-500 to-green-600"
              />
            </div>
          </section>
        )}

        {/* Users Table */}
        <section>
          <UserTable 
            users={users} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;