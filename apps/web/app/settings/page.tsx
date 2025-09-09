'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Settings as SettingsIcon, Bell, Shield, Brain, Palette, Moon, Sun,
  Globe, Clock, Target, Heart, Save, RefreshCw, LogOut, Trash2, Menu, X, ArrowLeft 
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
        </nav>
      </div>
    </div>
  );
};

// Mobile Tab Selector Component
const MobileTabSelector: React.FC<{
  tabs: readonly { id: string; label: string; icon: React.ComponentType<any> }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="lg:hidden mb-6">
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap min-h-[44px] ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-12 h-7 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
    </label>
  );
};

const Settings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'ai' | 'privacy' | 'theme'>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="text-center p-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-base sm:text-lg">Caricamento impostazioni...</div>
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
      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Navigation - Mobile Optimized */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Back button - sempre visibile */}
            <a 
              href="/" 
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors min-w-0 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Home</span>
            </a>
            
            {/* Logo centralized */}
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Apri menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 text-white/80">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/suggestions" className="hover:text-white transition-colors">Suggestions</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/settings" className="text-white font-semibold">Settings</a>
            </div>
            
            {/* Logout Button - Desktop only */}
            <button
              onClick={handleLogout}
              className="hidden md:block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-400" />
            Impostazioni
          </h1>
          <p className="text-white/70 text-sm sm:text-base">Personalizza la tua esperienza LifeOS</p>
        </div>

        {/* Messages - Mobile Optimized */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-400/20 rounded-lg text-red-300 text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-400/20 rounded-lg text-green-300 text-sm sm:text-base">
            {successMessage}
          </div>
        )}

        {/* Mobile Tab Selector */}
        <MobileTabSelector 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar - Desktop Only */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
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

          {/* Content - Mobile Optimized */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Profilo Utente
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm sm:text-base">Nome visualizzato</label>
                      <input
                        type="text"
                        value={preferences.display_name}
                        onChange={(e) => updatePreference('display_name', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 min-h-[44px] text-sm sm:text-base"
                        placeholder="Il tuo nome"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm sm:text-base">Email</label>
                      <input
                        type="email"
                        value={preferences.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/50 min-h-[44px] text-sm sm:text-base"
                      />
                      <p className="text-xs text-white/50 mt-1">L'email non può essere modificata</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-white font-medium mb-2 text-sm sm:text-base">Fuso orario</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => updatePreference('timezone', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white min-h-[44px] text-sm sm:text-base"
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
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Notifiche
                  </h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between min-h-[44px]">
                      <div>
                        <div className="text-white font-medium text-sm sm:text-base">Notifiche abilitate</div>
                        <div className="text-white/60 text-xs sm:text-sm">Ricevi notifiche per consigli e promemoria</div>
                      </div>
                      <ToggleSwitch
                        checked={preferences.notifications_enabled}
                        onChange={(checked) => updatePreference('notifications_enabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between min-h-[44px]">
                      <div>
                        <div className="text-white font-medium text-sm sm:text-base">Notifiche email</div>
                        <div className="text-white/60 text-xs sm:text-sm">Ricevi riassunti via email</div>
                      </div>
                      <ToggleSwitch
                        checked={preferences.email_notifications}
                        onChange={(checked) => updatePreference('email_notifications', checked)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm sm:text-base">Frequenza notifiche</label>
                      <select
                        value={preferences.notification_frequency}
                        onChange={(e) => updatePreference('notification_frequency', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white min-h-[44px] text-sm sm:text-base"
                      >
                        <option value="realtime">In tempo reale</option>
                        <option value="daily">Giornaliere</option>
                        <option value="weekly">Settimanali</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2 text-sm sm:text-base">Silenzioso dalle</label>
                        <input
                          type="time"
                          value={preferences.quiet_hours_start}
                          onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white min-h-[44px] text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2 text-sm sm:text-base">Silenzioso fino</label>
                        <input
                          type="time"
                          value={preferences.quiet_hours_end}
                          onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white min-h-[44px] text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    AI & Consigli
                  </h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm sm:text-base">Frequenza consigli</label>
                      <select
                        value={preferences.advice_frequency}
                        onChange={(e) => updatePreference('advice_frequency', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white min-h-[44px] text-sm sm:text-base"
                      >
                        <option value="high">Alta (più consigli)</option>
                        <option value="medium">Media (bilanciato)</option>
                        <option value="low">Bassa (meno consigli)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm sm:text-base">Tono dei consigli</label>
                      <select
                        value={preferences.advice_tone}
                        onChange={(e) => updatePreference('advice_tone', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white min-h-[44px] text-sm sm:text-base"
                      >
                        <option value="encouraging">Incoraggiante</option>
                        <option value="gentle">Delicato</option>
                        <option value="direct">Diretto</option>
                        <option value="playful">Giocoso</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm sm:text-base">Massimi consigli giornalieri</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={preferences.max_daily_suggestions}
                        onChange={(e) => updatePreference('max_daily_suggestions', parseInt(e.target.value))}
                        className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-white/60 text-xs sm:text-sm mt-1">
                        <span>1</span>
                        <span className="text-white font-medium">{preferences.max_daily_suggestions}</span>
                        <span>10</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-3 text-sm sm:text-base">Aree di focus</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {['stress', 'energy', 'sleep', 'focus', 'mood', 'productivity', 'exercise', 'nutrition'].map(area => (
                          <button
                            key={area}
                            onClick={() => toggleFocusArea(area)}
                            className={`px-3 py-2 rounded-lg transition-all text-xs sm:text-sm font-medium min-h-[44px] active:scale-95 ${
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
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Privacy & Dati
                  </h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between min-h-[44px]">
                      <div>
                        <div className="text-white font-medium text-sm sm:text-base">Condivisione dati</div>
                        <div className="text-white/60 text-xs sm:text-sm">Condividi dati anonimi per migliorare il servizio</div>
                      </div>
                      <ToggleSwitch
                        checked={preferences.data_sharing}
                        onChange={(checked) => updatePreference('data_sharing', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between min-h-[44px]">
                      <div>
                        <div className="text-white font-medium text-sm sm:text-base">Analytics</div>
                        <div className="text-white/60 text-xs sm:text-sm">Consenti analisi per personalizzare l'esperienza</div>
                      </div>
                      <ToggleSwitch
                        checked={preferences.analytics_enabled}
                        onChange={(checked) => updatePreference('analytics_enabled', checked)}
                      />
                    </div>
                    
                    <div className="border-t border-white/20 pt-4 sm:pt-6">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Gestione Account</h3>
                      <div className="space-y-3 sm:space-y-4">
                        <button
                          onClick={() => alert('Funzionalità export dati non ancora implementata')}
                          className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 sm:px-6 py-3 rounded-lg transition-colors border border-blue-400/30 min-h-[44px] text-sm sm:text-base"
                        >
                          Esporta i miei dati
                        </button>
                        
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 sm:px-6 py-3 rounded-lg transition-colors border border-red-400/30 flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                        >
                          <Trash2 className="w-4 h-4" />
                          Elimina Account
                        </button>
                        
                        {/* Mobile Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="w-full md:hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px] text-sm sm:text-base flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Tema & Aspetto
                  </h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-3 text-sm sm:text-base">Tema</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                              className={`p-4 rounded-lg transition-all flex flex-col items-center gap-2 min-h-[44px] active:scale-95 ${
                                preferences.theme === theme.value
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                  : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                              <span className="text-sm sm:text-base">{theme.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-3 text-sm sm:text-base">Colore accent</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {['blue', 'purple', 'green', 'orange', 'pink', 'cyan'].map(color => (
                          <button
                            key={color}
                            onClick={() => updatePreference('accent_color', color)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg transition-all active:scale-95 ${
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
              
              {/* Save Button - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 border-t border-white/20 gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors min-h-[44px] text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
                
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
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