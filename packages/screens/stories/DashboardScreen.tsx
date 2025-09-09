import type { Meta, StoryObj } from '@storybook/react';
import { DashboardScreen } from '@lifeos/screens';

const meta = {
  title: 'Screens/DashboardScreen',
  component: DashboardScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Dashboard Screen is the main hub of LifeOS, displaying current advice, life score, metrics, and recent activities. Features real-time advice generation, interactive components, achievement notifications, and seamless navigation to analytics and settings.',
      },
    },
  },
  argTypes: {
    navigation: {
      description: 'React Navigation object',
      table: {
        type: { summary: 'any' },
      },
    },
  },
} satisfies Meta<typeof DashboardScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock navigation object
const mockNavigation = {
  goBack: () => console.log('Navigate back'),
  navigate: (screen: string) => console.log(`Navigate to ${screen}`),
  replace: (screen: string) => console.log(`Replace with ${screen}`),
};

// Mock dashboard data
const mockDashboardData = {
  current_life_score: {
    overall_score: 8.2,
    stress: 3.1,
    energy: 8.4,
    sleep: 7.8,
    mood: 8.1,
    focus: 6.9,
  },
  today_stats: {
    interventions_completed: 3,
    total_interventions_today: 5,
    avg_rating_today: 4.2,
    total_engagement_minutes_today: 45,
    streak_days: 12,
  },
  weekly_trends: [
    {
      metric_name: 'Energia',
      current_value: 8.4,
      previous_value: 7.8,
      change_percentage: 7.7,
      trend: 'improving' as const,
    },
    {
      metric_name: 'Stress',
      current_value: 3.1,
      previous_value: 4.2,
      change_percentage: -26.2,
      trend: 'improving' as const,
    },
    {
      metric_name: 'Sonno',
      current_value: 7.8,
      previous_value: 7.5,
      change_percentage: 4.0,
      trend: 'improving' as const,
    },
  ],
  recent_activities: [
    {
      type: 'advice_completed',
      description: 'Completato esercizio di respirazione 4-7-8',
      timestamp: '2024-03-15T10:30:00Z',
      impact_score: 4.5,
    },
    {
      type: 'achievement_unlocked',
      description: 'Sbloccato achievement "Settimana Produttiva"',
      timestamp: '2024-03-15T09:15:00Z',
      impact_score: 5.0,
    },
    {
      type: 'advice_dismissed',
      description: 'Rimandato consiglio su pausa mindful',
      timestamp: '2024-03-15T08:45:00Z',
      impact_score: 2.0,
    },
  ],
  recent_achievements: [
    {
      title: 'Settimana Produttiva',
      description: 'Hai completato almeno 3 consigli al giorno per 7 giorni consecutivi',
      icon: '🏆',
      category: 'consistency',
      unlocked_at: '2024-03-15T09:15:00Z',
    },
  ],
};

const mockCurrentAdvice = {
  id: 'advice_123',
  session_id: 'session_456',
  content: 'Prova questo esercizio di respirazione 4-7-8: inspira per 4 secondi, trattieni per 7, espira per 8. Ripeti 3 volte per ridurre lo stress.',
  category: 'stress_management',
  estimated_duration_minutes: 3,
  created_at: '2024-03-15T11:00:00Z',
  health_context: {
    stress_level: 6,
    energy_level: 4,
    current_mood: 'stressed',
  },
};

// Loading State
export const LoadingState: Story = {
  render: () => (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #374151',
          borderTop: '3px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Caricamento dashboard...</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state shown during initial dashboard data fetch.',
      },
    },
  },
};

// Error State
export const ErrorState: Story = {
  render: () => (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#ef4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        maxWidth: '300px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 12px', fontSize: '16px' }}>Impossibile caricare la dashboard</p>
        <button 
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => console.log('Retry')}
        >
          Riprova
        </button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error state when dashboard fails to load.',
      },
    },
  },
};

// Dashboard with Current Advice
export const WithCurrentAdvice: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', overflow: 'auto' }}>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>
            Bentornato
          </h1>
          <p style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '20px', marginBottom: '16px' }}>
            Fai una camminata veloce di 5 minuti all'aperto. L'aria fresca e il movimento aiuteranno a mantenere l'energia alta.
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              flex: 1,
              backgroundColor: '#10b981',
              border: 'none',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Inizia camminata
            </button>
            <button style={{
              backgroundColor: '#374151',
              border: 'none',
              color: '#e5e7eb',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              Snooze 30min
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{ 
            backgroundColor: '#16213e',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Life Score</h4>
            <div style={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>8.4</div>
            <div style={{ color: '#10b981', fontSize: '12px' }}>+0.2 da ieri</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#16213e',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Oggi</h4>
            <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>3/5</div>
            <div style={{ color: '#9ca3af', fontSize: '12px' }}>consigli completati</div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with achievement celebration and continued engagement.',
      },
    },
  },
};

// Weekly Progress View
export const WeeklyProgress: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', overflow: 'auto' }}>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>
            Bentornato
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0 }}>
            Domenica, 17 marzo • Fine settimana
          </p>
        </div>

        {/* Weekly Summary Card */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Riepilogo Settimanale</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#7c3aed', fontSize: '20px', fontWeight: 'bold' }}>21/25</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>Consigli completati</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}>4.6</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>Rating medio</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#f59e0b', fontSize: '20px', fontWeight: 'bold' }}>156m</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>Tempo totale</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
              <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
              {[3, 4, 2, 3, 5, 4, 0].map((count, i) => (
                <div key={i} style={{ 
                  flex: 1, 
                  height: '24px', 
                  backgroundColor: count > 0 ? '#7c3aed' : '#374151',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {count || ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Metrics */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Trend Settimanali</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Energia', current: 8.4, change: '+7.7%', trend: 'up' },
              { name: 'Stress', current: 3.1, change: '-26.2%', trend: 'up' },
              { name: 'Sonno', current: 7.8, change: '+4.0%', trend: 'up' },
            ].map((metric, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#1f2937',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#e5e7eb', fontSize: '14px' }}>{metric.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    color: metric.trend === 'up' ? '#10b981' : '#ef4444', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}>
                    {metric.change}
                  </span>
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                    {metric.current}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rest Day Message */}
        <div style={{ 
          backgroundColor: '#065f46',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🌿</span>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>Giorno di Riposo</h3>
          <p style={{ color: '#d1fae5', fontSize: '14px', marginBottom: '16px' }}>
            Hai lavorato duramente questa settimana! Prenditi del tempo per rilassarti e ricaricare le energie.
          </p>
          <button style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}>
            Consigli di recupero
          </button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing weekly progress summary and rest day encouragement.',
      },
    },
  },
};

// Mobile Layout
export const MobileLayout: Story = {
  render: () => (
    <div style={{ width: '375px', height: '812px', backgroundColor: '#1a1a2e', margin: '0 auto', overflow: 'auto' }}>
      <div style={{ padding: '16px' }}>
        {/* Mobile Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>
            Bentornato
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            Venerdì, 15 marzo
          </p>
        </div>

        {/* Mobile Advice Card */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #7c3aed'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px', marginRight: '10px' }}>🧘</span>
            <div>
              <h3 style={{ color: '#fff', fontSize: '14px', margin: '0 0 2px' }}>Pausa mindful</h3>
              <span style={{ color: '#7c3aed', fontSize: '11px', fontWeight: '600' }}>3 min</span>
            </div>
          </div>
          
          <p style={{ color: '#e5e7eb', fontSize: '13px', lineHeight: '18px', marginBottom: '12px' }}>
            Fermati per 2 minuti e concentrati solo sul tuo respiro. Aiuterà a ridurre lo stress.
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              flex: 1,
              backgroundColor: '#7c3aed',
              border: 'none',
              color: '#fff',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              Inizia
            </button>
            <button style={{
              backgroundColor: '#374151',
              border: 'none',
              color: '#e5e7eb',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
              Dopo
            </button>
          </div>
        </div>

        {/* Mobile Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ 
            backgroundColor: '#16213e',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#7c3aed', fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>8.2</div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>Life Score</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#16213e',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>12</div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>Giorni streak</div>
          </div>
        </div>

        {/* Mobile Today Progress */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Oggi</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>Consigli completati</span>
              <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: 'bold' }}>3/5</span>
            </div>
            <div style={{ height: '4px', backgroundColor: '#374151', borderRadius: '2px' }}>
              <div style={{ width: '60%', height: '100%', backgroundColor: '#7c3aed', borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>4.2</div>
              <div style={{ color: '#9ca3af' }}>Rating</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>45m</div>
              <div style={{ color: '#9ca3af' }}>Tempo</div>
            </div>
          </div>
        </div>

        {/* Mobile Recent Activities */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Attività Recenti</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '✅', text: 'Respirazione completata', time: '2h fa' },
              { icon: '🏆', text: 'Achievement sbloccato', time: '3h fa' },
              { icon: '⏰', text: 'Consiglio posticipato', time: '4h fa' },
            ].map((activity, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '8px',
                backgroundColor: '#1f2937',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '14px', marginRight: '8px' }}>{activity.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e5e7eb', fontSize: '12px' }}>{activity.text}</div>
                  <div style={{ color: '#9ca3af', fontSize: '10px' }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard optimized for mobile devices with compact layout.',
      },
    },
  },
};

// Full Featured Dashboard
export const FullFeatured: Story = {
  args: {
    navigation: mockNavigation,
  },
  render: (args) => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', overflow: 'hidden' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Status Bar */}
        <div style={{ height: '24px', backgroundColor: '#1a1a2e' }} />
        
        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>
                Bentornato
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, textTransform: 'capitalize' }}>
                {new Date().toLocaleDateString('it-IT', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>

            {/* Current Advice */}
            <div style={{ 
              backgroundColor: '#16213e',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid #7c3aed',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>🧘</span>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px' }}>Micro-consiglio per te</h3>
                    <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '600' }}>3 minuti • Gestione stress</span>
                  </div>
                </div>
                
                <p style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '20px', marginBottom: '16px' }}>
                  Prova questo esercizio di respirazione 4-7-8: inspira per 4 secondi, trattieni per 7, espira per 8. Ripeti 3 volte per ridurre lo stress.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => console.log('Complete advice')}
                    style={{
                      flex: 1,
                      backgroundColor: '#7c3aed',
                      border: 'none',
                      color: '#fff',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Inizia ora
                  </button>
                  <button 
                    onClick={() => console.log('Snooze advice')}
                    style={{
                      backgroundColor: '#374151',
                      border: 'none',
                      color: '#e5e7eb',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Più tardi
                  </button>
                  <button 
                    onClick={() => console.log('Dismiss advice')}
                    style={{
                      backgroundColor: '#ef4444',
                      border: 'none',
                      color: '#fff',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Decorative background */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
              }} />
            </div>

            {/* Life Score Ring */}
            <div style={{ 
              backgroundColor: '#16213e',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Life Score</h3>
              <div 
                onClick={() => args.navigation.navigate('Analytics')}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ 
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '8px solid #374151',
                  borderTop: '8px solid #7c3aed',
                  borderRight: '8px solid #7c3aed',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <span style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>8.2</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Benessere generale</p>
                <p style={{ color: '#10b981', fontSize: '12px' }}>+0.3 da ieri</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ 
              backgroundColor: '#16213e',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Metriche Rapide</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {mockDashboardData.weekly_trends.map((trend, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ 
                      color: trend.trend === 'improving' ? '#10b981' : '#ef4444', 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    }}>
                      {trend.current_value.toFixed(1)}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}>
                      {trend.metric_name}
                    </div>
                    <div style={{ 
                      color: trend.trend === 'improving' ? '#10b981' : '#ef4444', 
                      fontSize: '10px' 
                    }}>
                      {trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today Stats */}
            <div style={{ 
              backgroundColor: '#16213e',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Oggi</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#7c3aed', fontSize: '20px', fontWeight: 'bold' }}>
                    {mockDashboardData.today_stats.interventions_completed}/{mockDashboardData.today_stats.total_interventions_today}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '12px' }}>Consigli completati</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#f59e0b', fontSize: '20px', fontWeight: 'bold' }}>
                    {mockDashboardData.today_stats.streak_days}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '12px' }}>Giorni di streak</div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div style={{ 
              backgroundColor: '#16213e',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Attività Recenti</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mockDashboardData.recent_activities.map((activity, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#1f2937',
                    borderRadius: '8px'
                  }}>
                    <span style={{ 
                      fontSize: '20px', 
                      marginRight: '12px',
                      width: '24px',
                      textAlign: 'center'
                    }}>
                      {activity.type === 'advice_completed' ? '✅' :
                       activity.type === 'achievement_unlocked' ? '🏆' : '⏰'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#e5e7eb', fontSize: '14px', marginBottom: '2px' }}>
                        {activity.description}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                        {new Date(activity.timestamp).toLocaleTimeString('it-IT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <div style={{ 
                      color: activity.impact_score >= 4 ? '#10b981' : 
                             activity.impact_score >= 3 ? '#f59e0b' : '#ef4444',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {activity.impact_score?.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom spacing */}
            <div style={{ height: '40px' }} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete dashboard with all features, interactions, and real data.',
      },
    },
  },
};: '#9ca3af', fontSize: '16px', margin: 0 }}>
            {new Date().toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        {/* Current Advice Card */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #7c3aed'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🧘</span>
            <div>
              <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px' }}>Micro-consiglio per te</h3>
              <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '600' }}>3 minuti • Gestione stress</span>
            </div>
          </div>
          
          <p style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '20px', marginBottom: '16px' }}>
            {mockCurrentAdvice.content}
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              flex: 1,
              backgroundColor: '#7c3aed',
              border: 'none',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Inizia ora
            </button>
            <button style={{
              backgroundColor: '#374151',
              border: 'none',
              color: '#e5e7eb',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              Più tardi
            </button>
          </div>
        </div>

        {/* Life Score Ring */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Life Score</h3>
          <div style={{ 
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '8px solid #374151',
            borderTop: '8px solid #7c3aed',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>8.2</span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '12px' }}>Benessere generale</p>
        </div>

        {/* Today Stats */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Oggi</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#7c3aed', fontSize: '20px', fontWeight: 'bold' }}>3/5</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>Consigli completati</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}>12</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>Giorni di streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with active advice card and user engagement.',
      },
    },
  },
};

// Dashboard without Advice
export const WithoutAdvice: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', overflow: 'auto' }}>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>
            Bentornato
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0 }}>
            Venerdì, 15 marzo
          </p>
        </div>

        {/* No Advice State */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>✨</span>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>Tutto fatto per ora!</h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>
            Hai completato tutti i consigli disponibili. Il prossimo arriverà quando sarà il momento giusto.
          </p>
          <button style={{
            backgroundColor: '#7c3aed',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}>
            Genera nuovo consiglio
          </button>
        </div>

        {/* Life Score and other components */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ 
            backgroundColor: '#16213e',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Life Score</h4>
            <div style={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>8.2</div>
            <div style={{ color: '#10b981', fontSize: '12px' }}>+0.3 oggi</div>
          </div>
          
          <div style={{ 
            backgroundColor: '#16213e',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Streak</h4>
            <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>12</div>
            <div style={{ color: '#9ca3af', fontSize: '12px' }}>giorni consecutivi</div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard when no current advice is available.',
      },
    },
  },
};

// Dashboard with Achievement
export const WithAchievement: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', overflow: 'auto' }}>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>
            Bentornato
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0 }}>
            Venerdì, 15 marzo
          </p>
        </div>

        {/* Achievement Banner */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>🏆</span>
              <div>
                <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 4px', fontWeight: 'bold' }}>
                  Nuovo Achievement!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: 0 }}>
                  Settimana Produttiva
                </p>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '16px' }}>
              Hai completato almeno 3 consigli al giorno per 7 giorni consecutivi
            </p>
            <button style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Visualizza tutti
            </button>
          </div>
          
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
          }} />
        </div>

        {/* Current Advice */}
        <div style={{ 
          backgroundColor: '#16213e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>💪</span>
            <div>
              <h3 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px' }}>Continua il momentum!</h3>
              <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '600' }}>5 minuti • Energia</span>
            </div>
          </div>
          
          <p style={{ color
