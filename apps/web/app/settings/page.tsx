'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Bell, Shield, Brain, Palette, Moon, Sun, 
  Globe, Clock, Target, Heart, Save, RefreshCw, LogOut, Trash2 
} from 'lucide-react';
import { supabase, callEdgeFunction, getCurrentUser } from '../../lib/supabase';

interface UserPreferences {
  // Profile
  display_name: string;
  email: string;
  timezone: string;
  
  // Notifications
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'realtime' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
  
  // AI Settings
  advice_frequency: 'high' | 'medium' | 'low';
  advice_tone: 'encouraging' | 'gentle' | 'direct' | 'playful';
  focus_areas: string[];
  max_daily_suggestions: number;
  
  // Privacy
  data_sharing: boolean;
  analytics_enabled: boolean;
  improvement_suggestions: boolean;
  
  // Theme
  theme: 'dark' | 'light' | 'auto';
  accent_color: string;
}

const defaultPreferences: UserPreferences = {
  display_name: '',
  email: '',
  timezone: 'Europe/Rome',
  notifications_enabled: true,
  email_notifications: true,
  push_notifications: false,
  notification_frequency: 'daily',
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  advice_frequency: 'medium',
  advice_tone: 'encouraging',
  focus_areas: ['stress', 'energy', 'sleep'],
  max_daily_suggestions: 3,
  data_sharing: false,
  analytics_enabled: true,
  improvement_suggestions: true,
  theme: 'dark',
  accent_color: 'blue'
};

const Settings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'ai' | 'privacy' | 'theme'>('profile');

  // Carica utente e preferenze
  useEffect(() => {
    const loadUserAndPreferences = async () => {
      setLoading(true);
      
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          window.location.href = '/sign-in';
          return;
        }
        
        setUser(currentUser);
        
        // Carica preferenze dalla Edge Function
        console.log('Loading user preferences...');
        const data = await callEdgeFunction('get-user-preferences', {
          user_id: currentUser.id
        });
        
        if (data && data.preferences) {
          setPreferences({
            ...defaultPreferences,
            ...data.preferences,
            email: currentUser.email || '',
            display_name: data.preferences.display_name || currentUser.user_metadata?.full_name || ''
          });
        } else {
          // Usa preferenze di default se non ci sono dati
          setPreferences({
            ...defaultPreferences,
            email: currentUser.email || '',
            display_name: currentUser.user_metadata?.full_name || ''
          });
        }
        
      } catch (err: any) {
        console.error('Error loading preferences:', err);
        setError('Errore nel caricamento delle preferenze');
        
        // Usa preferenze di default in caso di errore
        if (user) {
          setPreferences({
            ...defaultPreferences,
            email: user.email || '',
            display_name: user.user_metadata?.full_name || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserAndPreferences();
  }, []);

  const savePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      console.log('Saving preferences...', preferences);
      
      // Salva tramite Edge Function
      await callEdgeFunction('update-user-preferences', {
        user_id: user.id,
        preferences: preferences
      });
      
      setSuccessMessage('Preferenze salvate con successo!');
      
      // Nascondi messaggio dopo 3 secondi
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError('Errore nel salvataggio delle preferenze');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.')) {
      return;
    }
    
    try {
      // Qui implementeresti la logica di eliminazione account
      alert('Funzionalità di eliminazione account non ancora implementata');
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleFocusArea = (area: string) => {
    setPreferences(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area) 
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Caricamento impostazioni...</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profilo', icon: User },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'ai', label: 'AI & Consigli', icon: Brain },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'theme', label: 'Tema', icon: Palette }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>
            <div className="hidden md:flex space-x-8 text-white/80">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/suggestions" className="hover:text-white transition-colors">Suggestions</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/settings" className="text-white font-semibold">Settings</a>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-400" />
            Impostazioni
          </h1>
          <p className="text-white/70">Personalizza la tua esperienza LifeOS</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-400/20 rounded-lg text-red-300">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-400/20 rounded-lg text-green-300">
            {successMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-400" />
                    Profilo Utente
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Nome visualizzato</label>
                      <input
                        type="text"
                        value={preferences.display_name}
                        onChange={(e) => updatePreference('display_name', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50"
                        placeholder="Il tuo nome"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={preferences.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/50"
                      />
                      <p className="text-xs text-white/50 mt-1">L'email non può essere modificata</p>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Fuso orario</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => updatePreference('timezone', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      >
                        <option value="Europe/Rome">Europa/Roma</option>
                        <option value="Europe/London">Europa/Londra</option>
                        <option value="America/New_York">America/New York</option>
                        <option value="America/Los_Angeles">America/Los Angeles</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Bell className="w-6 h-6 text-blue-400" />
                    Notifiche
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Notifiche abilitate</div>
                        <div className="text-white/60 text-sm">Ricevi notifiche per consigli e promemoria</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notifications_enabled}
                          onChange={(e) => updatePreference('notifications_enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Notifiche email</div>
                        <div className="text-white/60 text-sm">Ricevi riassunti via email</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.email_notifications}
                          onChange={(e) => updatePreference('email_notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Frequenza notifiche</label>
                      <select
                        value={preferences.notification_frequency}
                        onChange={(e) => updatePreference('notification_frequency', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      >
                        <option value="realtime">In tempo reale</option>
                        <option value="daily">Giornaliere</option>
                        <option value="weekly">Settimanali</option>
                      </select>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Silenzioso dalle</label>
                        <input
                          type="time"
                          value={preferences.quiet_hours_start}
                          onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Silenzioso fino</label>
                        <input
                          type="time"
                          value={preferences.quiet_hours_end}
                          onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Brain className="w-6 h-6 text-blue-400" />
                    AI & Consigli
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Frequenza consigli</label>
                      <select
                        value={preferences.advice_frequency}
                        onChange={(e) => updatePreference('advice_frequency', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      >
                        <option value="high">Alta (più consigli)</option>
                        <option value="medium">Media (bilanciato)</option>
                        <option value="low">Bassa (meno consigli)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Tono dei consigli</label>
                      <select
                        value={preferences.advice_tone}
                        onChange={(e) => updatePreference('advice_tone', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      >
                        <option value="encouraging">Incoraggiante</option>
                        <option value="gentle">Delicato</option>
                        <option value="direct">Diretto</option>
                        <option value="playful">Giocoso</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Massimi consigli giornalieri</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={preferences.max_daily_suggestions}
                        onChange={(e) => updatePreference('max_daily_suggestions', parseInt(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-white/60 text-sm mt-1">
                        <span>1</span>
                        <span className="text-white font-medium">{preferences.max_daily_suggestions}</span>
                        <span>10</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-3">Aree di focus</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {['stress', 'energy', 'sleep', 'focus', 'mood', 'productivity', 'exercise', 'nutrition'].map(area => (
                          <button
                            key={area}
                            onClick={() => toggleFocusArea(area)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              preferences.focus_areas.includes(area)
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                            }`}
                          >
                            {area.charAt(0).toUpperCase() + area.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    Privacy & Dati
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Condivisione dati</div>
                        <div className="text-white/60 text-sm">Condividi dati anonimi per migliorare il servizio</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.data_sharing}
                          onChange={(e) => updatePreference('data_sharing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Analytics</div>
                        <div className="text-white/60 text-sm">Consenti analisi per personalizzare l'esperienza</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics_enabled}
                          onChange={(e) => updatePreference('analytics_enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="border-t border-white/20 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Gestione Account</h3>
                      <div className="space-y-4">
                        <button
                          onClick={() => alert('Funzionalità export dati non ancora implementata')}
                          className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-lg transition-colors border border-blue-400/30"
                        >
                          Esporta i miei dati
                        </button>
                        
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-lg transition-colors border border-red-400/30 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Elimina Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Palette className="w-6 h-6 text-blue-400" />
                    Tema & Aspetto
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-3">Tema</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'dark', label: 'Scuro', icon: Moon },
                          { value: 'light', label: 'Chiaro', icon: Sun },
                          { value: 'auto', label: 'Auto', icon: Globe }
                        ].map(theme => {
                          const Icon = theme.icon;
                          return (
                            <button
                              key={theme.value}
                              onClick={() => updatePreference('theme', theme.value)}
                              className={`p-4 rounded-lg transition-all flex flex-col items-center gap-2 ${
                                preferences.theme === theme.value
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                  : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                              {theme.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-3">Colore accent</label>
                      <div className="grid grid-cols-6 gap-3">
                        {['blue', 'purple', 'green', 'orange', 'pink', 'cyan'].map(color => (
                          <button
                            key={color}
                            onClick={() => updatePreference('accent_color', color)}
                            className={`w-12 h-12 rounded-lg transition-all ${
                              preferences.accent_color === color
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                : 'hover:scale-110'
                            }`}
                            style={{
                              backgroundColor: {
                                blue: '#3B82F6',
                                purple: '#8B5CF6',
                                green: '#10B981',
                                orange: '#F59E0B',
                                pink: '#EC4899',
                                cyan: '#06B6D4'
                              }[color]
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Save Button */}
              <div className="flex items-center justify-between pt-8 border-t border-white/20">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
                
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salva Modifiche
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;