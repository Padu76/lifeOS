'use client';

import { useState, useEffect } from 'react';

// Mock data types (would be imported from your types)
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
  scheduled_time: Date;
  type: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  status: 'scheduled' | 'delivered' | 'failed' | 'cancelled';
}

interface NotificationAnalytics {
  delivery_rate: number;
  open_rate: number;
  completion_rate: number;
  optimal_timing_accuracy: number;
  user_satisfaction_score: number;
}

export default function NotificationsDashboard() {
  const [circadianProfile, setCircadianProfile] = useState<CircadianProfile | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    // Simulate API calls - replace with real API endpoints
    try {
      // Load circadian profile
      const profileData: CircadianProfile = {
        chronotype: 'intermediate',
        natural_wake_time: '07:00',
        natural_sleep_time: '23:00',
        peak_energy_hours: [9, 10, 11, 15, 16],
        low_energy_hours: [13, 14, 20, 21],
        stress_peak_hours: [11, 17, 18],
        optimal_intervention_windows: [
          {
            start_hour: 9,
            end_hour: 11,
            effectiveness_score: 0.85,
            intervention_type: 'mindfulness',
            frequency_limit: 1
          },
          {
            start_hour: 14,
            end_hour: 16,
            effectiveness_score: 0.78,
            intervention_type: 'energy_boost',
            frequency_limit: 1
          },
          {
            start_hour: 17,
            end_hour: 19,
            effectiveness_score: 0.92,
            intervention_type: 'stress_relief',
            frequency_limit: 2
          }
        ]
      };
      setCircadianProfile(profileData);

      // Load current emotional state
      const emotionalData: EmotionalState = {
        current_state: 'balanced',
        confidence: 0.78,
        factors: ['sleep_quality: good', 'recent_activity: moderate', 'stress_trend: stable'],
        trend: 'stable'
      };
      setEmotionalState(emotionalData);

      // Load scheduled notifications
      const notificationsData: ScheduledNotification[] = [
        {
          id: '1',
          scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          type: 'stress_relief',
          message: 'Vedo che oggi il tuo livello di stress è un po\' alto. Se ti va, prova 2 minuti di respirazione lenta.',
          priority: 'normal',
          status: 'scheduled'
        },
        {
          id: '2',
          scheduled_time: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
          type: 'energy_boost',
          message: 'L\'energia sembra un po\' bassa oggi. Un piccolo movimento può risvegliare tutto!',
          priority: 'low',
          status: 'scheduled'
        }
      ];
      setScheduledNotifications(notificationsData);

      // Load analytics
      const analyticsData: NotificationAnalytics = {
        delivery_rate: 0.94,
        open_rate: 0.67,
        completion_rate: 0.45,
        optimal_timing_accuracy: 0.73,
        user_satisfaction_score: 0.81
      };
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTestMode(true);
    
    // Simulate sending a test notification
    const testNotification: ScheduledNotification = {
      id: 'test-' + Date.now(),
      scheduled_time: new Date(),
      type: 'test',
      message: 'Test notifica: il sistema funziona correttamente!',
      priority: 'normal',
      status: 'delivered'
    };

    setScheduledNotifications(prev => [testNotification, ...prev]);
    
    setTimeout(() => setTestMode(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  const renderCircadianVisualization = () => {
    if (!circadianProfile) return null;

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
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Notifications</h1>
          <p className="text-gray-600 mt-1">
            Sistema intelligente di notifiche basato su analisi circadiana ed empatica
          </p>
        </div>
        <button 
          onClick={handleTestNotification}
          disabled={testMode}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {testMode ? 'Invio...' : 'Test Notifica'}
        </button>
      </div>

      {/* Current Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Emotional State */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Stato Emotivo Attuale</h3>
          {emotionalState && (
            <div className="space-y-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStateColor(emotionalState.current_state)}`}>
                {emotionalState.current_state.charAt(0).toUpperCase() + emotionalState.current_state.slice(1)}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confidenza</span>
                  <span className="font-medium">{(emotionalState.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${emotionalState.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-600">Fattori:</div>
                {emotionalState.factors.map((factor, index) => (
                  <div key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chronotype Info */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Profilo Circadiano</h3>
          {circadianProfile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cronotipo</span>
                <span className="text-sm font-medium capitalize">
                  {circadianProfile.chronotype.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risveglio naturale</span>
                <span className="text-sm font-medium">{circadianProfile.natural_wake_time}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sonno naturale</span>
                <span className="text-sm font-medium">{circadianProfile.natural_sleep_time}</span>
              </div>

              <div className="pt-2 border-t">
                <div className="text-xs text-gray-600 mb-1">Finestre ottimali oggi:</div>
                <div className="text-xs text-blue-600">
                  {circadianProfile.optimal_intervention_windows.length} finestre attive
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Statistiche Rapide</h3>
          {analytics && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasso consegna</span>
                <span className="text-sm font-medium">{(analytics.delivery_rate * 100).toFixed(0)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasso apertura</span>
                <span className="text-sm font-medium">{(analytics.open_rate * 100).toFixed(0)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tasso completamento</span>
                <span className="text-sm font-medium">{(analytics.completion_rate * 100).toFixed(0)}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Precisione timing</span>
                <span className="text-sm font-medium">{(analytics.optimal_timing_accuracy * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circadian Visualization */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pattern Circadiani (24h)</h3>
          {renderCircadianVisualization()}
        </div>

        {/* Scheduled Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notifiche Programmate ({scheduledNotifications.length})
          </h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {scheduledNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">Nessuna notifica programmata</div>
              </div>
            ) : (
              scheduledNotifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.scheduled_time)}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      notification.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      notification.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {notification.status}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    {notification.message}
                  </div>
                  
                  <div className="text-xs text-gray-500">
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dettagliate</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(analytics.delivery_rate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Consegna</div>
              <div className="text-xs text-gray-500 mt-1">Notifiche arrivate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(analytics.open_rate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Apertura</div>
              <div className="text-xs text-gray-500 mt-1">Notifiche aperte</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(analytics.completion_rate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Completamento</div>
              <div className="text-xs text-gray-500 mt-1">Azioni completate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(analytics.optimal_timing_accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Timing</div>
              <div className="text-xs text-gray-500 mt-1">Precisione oraria</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {(analytics.user_satisfaction_score * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Soddisfazione</div>
              <div className="text-xs text-gray-500 mt-1">Rating utente</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
