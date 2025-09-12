'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Types for API responses
interface CircadianProfile {
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  natural_wake_time: string;
  natural_sleep_time: string;
  peak_energy_hours: number[];
  low_energy_hours: number[];
  stress_peak_hours: number[];
  optimal_intervention_windows: TimeWindow[];
}

interface TimeWindow {
  start_hour: number;
  end_hour: number;
  effectiveness_score: number;
  intervention_type: 'stress_relief' | 'energy_boost' | 'mindfulness' | 'celebration';
  frequency_limit: number;
}

interface EmotionalState {
  current_state: 'stressed' | 'energetic' | 'tired' | 'balanced' | 'anxious' | 'motivated';
  confidence: number;
  factors: string[];
  trend: 'improving' | 'stable' | 'declining';
}

interface ScheduledNotification {
  id: string;
  scheduled_time: string;
  type: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  status: 'scheduled' | 'delivered' | 'failed' | 'cancelled';
  user_action?: 'opened' | 'dismissed' | 'completed' | 'snoozed';
  delivery_context?: any;
  created_at: string;
}

interface NotificationAnalytics {
  delivery_rate: number;
  open_rate: number;
  completion_rate: number;
  optimal_timing_accuracy: number;
  user_satisfaction_score: number;
  total_sent: number;
  total_opened: number;
  total_completed: number;
}

export default function NotificationsDashboard() {
  const [circadianProfile, setCircadianProfile] = useState<CircadianProfile | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get auth token
  useEffect(() => {
    const getAuthToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAuthToken(session.access_token);
      }
    };
    getAuthToken();
  }, []);

  useEffect(() => {
    if (authToken) {
      loadDashboardData();
    }
  }, [authToken]);

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    if (!authToken) {
      throw new Error('No auth token available');
    }

    const response = await fetch(`/api/notifications/${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load all data in parallel
      const [
        circadianData,
        emotionalData,
        scheduledData,
        analyticsData
      ] = await Promise.allSettled([
        makeAuthenticatedRequest('circadian-profile'),
        makeAuthenticatedRequest('emotional-state'),
        makeAuthenticatedRequest('scheduled?limit=10&timeframe=upcoming'),
        makeAuthenticatedRequest('analytics?period=week')
      ]);

      // Handle circadian profile
      if (circadianData.status === 'fulfilled' && circadianData.value.success) {
        setCircadianProfile(circadianData.value.data);
      } else {
        console.warn('Could not load circadian profile:', circadianData);
      }

      // Handle emotional state
      if (emotionalData.status === 'fulfilled' && emotionalData.value.success) {
        setEmotionalState(emotionalData.value.data);
      } else {
        console.warn('Could not load emotional state:', emotionalData);
      }

      // Handle scheduled notifications
      if (scheduledData.status === 'fulfilled' && scheduledData.value.success) {
        setScheduledNotifications(scheduledData.value.data);
      } else {
        console.warn('Could not load scheduled notifications:', scheduledData);
      }

      // Handle analytics
      if (analyticsData.status === 'fulfilled' && analyticsData.value.success) {
        setAnalytics(analyticsData.value.data);
      } else {
        console.warn('Could not load analytics:', analyticsData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dei dati');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!authToken) return;
    
    setTestMode(true);
    setError(null);
    
    try {
      const response = await makeAuthenticatedRequest('test', {
        method: 'POST',
        body: JSON.stringify({
          type: 'immediate',
          category: 'mindfulness',
          message: 'Test notifica: il sistema funziona correttamente!'
        })
      });

      if (response.success) {
        // Add test notification to the list
        const testNotification: ScheduledNotification = {
          id: response.data.id,
          scheduled_time: new Date().toISOString(),
          type: 'test',
          message: response.data.message,
          priority: 'normal',
          status: 'delivered',
          created_at: new Date().toISOString()
        };

        setScheduledNotifications(prev => [testNotification, ...prev]);
        
        // Reload analytics to reflect the test
        setTimeout(() => {
          loadDashboardData();
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Errore nell\'invio della notifica di test');
    } finally {
      setTimeout(() => setTestMode(false), 2000);
    }
  };

  const handleScheduleNotification = async () => {
    if (!authToken) return;
    
    try {
      const response = await makeAuthenticatedRequest('scheduled', {
        method: 'POST',
        body: JSON.stringify({
          schedule_new: {
            type: 'micro_advice',
            message: 'Promemoria benessere programmato intelligentemente'
          }
        })
      });

      if (response.success) {
        // Reload scheduled notifications
        const scheduledData = await makeAuthenticatedRequest('scheduled?limit=10&timeframe=upcoming');
        if (scheduledData.success) {
          setScheduledNotifications(scheduledData.data);
        }
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      setError('Errore nella programmazione della notifica');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1 && diffHours > -1) {
      return 'Ora';
    } else if (diffHours < 24 && diffHours > 0) {
      return `Tra ${Math.ceil(diffHours)} ore`;
    } else if (diffHours < 0 && diffHours > -24) {
      return `${Math.abs(Math.floor(diffHours))} ore fa`;
    } else {
      return date.toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'stressed': return 'text-red-600 bg-red-50';
      case 'anxious': return 'text-orange-600 bg-orange-50';
      case 'energetic': return 'text-green-600 bg-green-50';
      case 'motivated': return 'text-blue-600 bg-blue-50';
      case 'tired': return 'text-gray-600 bg-gray-50';
      case 'balanced': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'normal': return 'text-blue-700 bg-blue-100';
      case 'low': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderCircadianVisualization = () => {
    if (!circadianProfile) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">Profilo circadiano non disponibile</div>
          <div className="text-xs mt-1">I dati verranno generati con l\'uso dell\'app</div>
        </div>
      );
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-1 text-center text-xs">
          {hours.map(hour => (
            <div key={hour} className="font-mono text-gray-500">
              {hour.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
        
        {/* Energy levels */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Livelli Energia</div>
          <div className="grid grid-cols-12 gap-1 h-6">
            {hours.map(hour => {
              const isHighEnergy = circadianProfile.peak_energy_hours.includes(hour);
              const isLowEnergy = circadianProfile.low_energy_hours.includes(hour);
              
              let bgColor = 'bg-gray-100';
              if (isHighEnergy) bgColor = 'bg-green-400';
              else if (isLowEnergy) bgColor = 'bg-red-300';
              
              return (
                <div
                  key={hour}
                  className={`rounded-sm ${bgColor} transition-colors`}
                  title={`${hour}:00 - ${isHighEnergy ? 'Alta energia' : isLowEnergy ? 'Bassa energia' : 'Normale'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Stress patterns */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Pattern Stress</div>
          <div className="grid grid-cols-12 gap-1 h-6">
            {hours.map(hour => {
              const isStressPeak = circadianProfile.stress_peak_hours.includes(hour);
              
              return (
                <div
                  key={hour}
                  className={`rounded-sm ${isStressPeak ? 'bg-orange-400' : 'bg-gray-100'} transition-colors`}
                  title={`${hour}:00 - ${isStressPeak ? 'Picco stress' : 'Normale'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Optimal intervention windows */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Finestre Ottimali Intervento</div>
          <div className="grid grid-cols-12 gap-1 h-6">
            {hours.map(hour => {
              const window = circadianProfile.optimal_intervention_windows.find(
                w => hour >= w.start_hour && hour <= w.end_hour
              );
              
              let bgColor = 'bg-gray-100';
              let title = `${hour}:00`;
              
              if (window) {
                switch (window.intervention_type) {
                  case 'stress_relief':
                    bgColor = 'bg-purple-400';
                    title += ' - Stress Relief';
                    break;
                  case 'energy_boost':
                    bgColor = 'bg-yellow-400';
                    title += ' - Energy Boost';
                    break;
                  case 'mindfulness':
                    bgColor = 'bg-blue-400';
                    title += ' - Mindfulness';
                    break;
                  case 'celebration':
                    bgColor = 'bg-pink-400';
                    title += ' - Celebration';
                    break;
                }
                title += ` (${(window.effectiveness_score * 100).toFixed(0)}% efficacia)`;
              }
              
              return (
                <div
                  key={hour}
                  className={`rounded-sm ${bgColor} transition-colors`}
                  title={title}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <span>Alta energia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-300 rounded-sm"></div>
              <span>Bassa energia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
              <span>Picco stress</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
              <span>Stress relief</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
              <span>Energy boost</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
              <span>Mindfulness</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Caricamento dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Smart Notifications
            </h1>
            <p className="text-white/70 mt-1">
              Sistema intelligente di notifiche basato su analisi circadiana ed empatica
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleScheduleNotification}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
            >
              Programma Notifica
            </button>
            <button 
              onClick={handleTestNotification}
              disabled={testMode}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
            >
              {testMode ? 'Invio...' : 'Test Notifica'}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-200">
              <span className="text-sm">⚠️ {error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-300 hover:text-red-100"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Current Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Emotional State */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg p-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Stato Emotivo Attuale</h3>
            {emotionalState ? (
              <div className="space-y-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStateColor(emotionalState.current_state)}`}>
                  {emotionalState.current_state.charAt(0).toUpperCase() + emotionalState.current_state.slice(1)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Confidenza</span>
                    <span className="font-medium text-white">{(emotionalState.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${emotionalState.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-white/60">Fattori:</div>
                  {emotionalState.factors.map((factor, index) => (
                    <div key={index} className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-white/60 text-sm">Stato emotivo non disponibile</div>
            )}
          </div>

          {/* Chronotype Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg p-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Profilo Circadiano</h3>
            {circadianProfile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Cronotipo</span>
                  <span className="text-sm font-medium text-white capitalize">
                    {circadianProfile.chronotype.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Risveglio naturale</span>
                  <span className="text-sm font-medium text-white">{circadianProfile.natural_wake_time}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Sonno naturale</span>
                  <span className="text-sm font-medium text-white">{circadianProfile.natural_sleep_time}</span>
                </div>

                <div className="pt-2 border-t border-white/20">
                  <div className="text-xs text-white/60 mb-1">Finestre ottimali oggi:</div>
                  <div className="text-xs text-blue-300">
                    {circadianProfile.optimal_intervention_windows.length} finestre attive
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/60 text-sm">Profilo circadiano non disponibile</div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg p-4">
            <h3 className="text-sm font-medium text-white/80 mb-3">Statistiche Rapide</h3>
            {analytics ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Tasso consegna</span>
                  <span className="text-sm font-medium text-white">{(analytics.delivery_rate * 100).toFixed(0)}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Tasso apertura</span>
                  <span className="text-sm font-medium text-white">{(analytics.open_rate * 100).toFixed(0)}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Tasso completamento</span>
                  <span className="text-sm font-medium text-white">{(analytics.completion_rate * 100).toFixed(0)}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Precisione timing</span>
                  <span className="text-sm font-medium text-white">{(analytics.optimal_timing_accuracy * 100).toFixed(0)}%</span>
                </div>
              </div>
            ) : (
              <div className="text-white/60 text-sm">Statistiche non disponibili</div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Circadian Visualization */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pattern Circadiani (24h)</h3>
            {renderCircadianVisualization()}
          </div>

          {/* Scheduled Notifications */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Notifiche Programmate ({scheduledNotifications.length})
            </h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {scheduledNotifications.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <div className="text-sm">Nessuna notifica programmata</div>
                  <div className="text-xs mt-2">Usa il pulsante "Programma Notifica" per crearne una</div>
                </div>
              ) : (
                scheduledNotifications.map((notification) => (
                  <div key={notification.id} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className="text-xs text-white/60">
                          {formatDate(notification.scheduled_time)}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </div>
                    </div>
                    
                    <div className="text-sm text-white/90">
                      {notification.message}
                    </div>
                    
                    <div className="text-xs text-white/50">
                      Tipo: {notification.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Analytics Dettagliate</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {(analytics.delivery_rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/80">Consegna</div>
                <div className="text-xs text-white/60 mt-1">Notifiche arrivate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {(analytics.open_rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/80">Apertura</div>
                <div className="text-xs text-white/60 mt-1">Notifiche aperte</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {(analytics.completion_rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/80">Completamento</div>
                <div className="text-xs text-white/60 mt-1">Azioni completate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {(analytics.optimal_timing_accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/80">Timing</div>
                <div className="text-xs text-white/60 mt-1">Precisione oraria</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {(analytics.user_satisfaction_score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-white/80">Soddisfazione</div>
                <div className="text-xs text-white/60 mt-1">Rating utente</div>
              </div>
            </div>

            {/* Additional metrics if available */}
            {analytics.total_sent > 0 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-xl font-bold text-white">{analytics.total_sent}</div>
                    <div className="text-sm text-white/70">Totale inviate</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{analytics.total_opened}</div>
                    <div className="text-sm text-white/70">Totale aperte</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{analytics.total_completed}</div>
                    <div className="text-sm text-white/70">Totale completate</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}