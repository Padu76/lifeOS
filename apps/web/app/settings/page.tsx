'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Bell, Shield, Brain, Palette, Moon, Sun,
  Globe, Clock, Target, Heart, Save, RefreshCw, LogOut, Trash2, Menu, X, ArrowLeft,
  Zap, Smile, Coffee, Calendar, AlertCircle, CheckCircle, Wifi, WifiOff, Loader
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Enhanced types for notification preferences
interface NotificationPreferences {
  enabled: boolean;
  categories: {
    stress_relief: boolean;
    energy_boost: boolean;
    sleep_prep: boolean;
    celebration: boolean;
    mindfulness: boolean;
    emergency: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
  frequency_limits: {
    max_daily: number;
    min_gap_minutes: number;
    respect_dnd: boolean;
  };
  delivery_channels: {
    push_notifications: boolean;
    in_app_only: boolean;
    email_backup: boolean;
  };
  tone_preference: 'adaptive' | 'encouraging' | 'gentle' | 'direct';
  circadian_optimization: boolean;
  emotional_awareness: boolean;
}

interface CircadianSettings {
  chronotype: 'early_bird' | 'night_owl' | 'intermediate' | 'custom';
  natural_wake_time: string;
  natural_sleep_time: string;
  enable_smart_timing: boolean;
  preferred_intervention_types: string[];
}

interface UserPreferences {
  display_name: string;
  email: string;
  timezone: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'realtime' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
  smart_notifications: NotificationPreferences;
  circadian_settings: CircadianSettings;
  advice_frequency: 'high' | 'medium' | 'low';
  advice_tone: 'encouraging' | 'gentle' | 'direct' | 'playful';
  focus_areas: string[];
  max_daily_suggestions: number;
  data_sharing: boolean;
  analytics_enabled: boolean;
  improvement_suggestions: boolean;
  theme: 'dark' | 'light' | 'auto';
  accent_color: string;
}

const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  categories: {
    stress_relief: true,
    energy_boost: true,
    sleep_prep: true,
    celebration: true,
    mindfulness: true,
    emergency: true
  },
  quiet_hours: {
    enabled: true,
    start_time: '22:00',
    end_time: '07:00'
  },
  frequency_limits: {
    max_daily: 5,
    min_gap_minutes: 90,
    respect_dnd: true
  },
  delivery_channels: {
    push_notifications: false,
    in_app_only: true,
    email_backup: false
  },
  tone_preference: 'adaptive',
  circadian_optimization: true,
  emotional_awareness: true
};

const defaultCircadianSettings: CircadianSettings = {
  chronotype: 'intermediate',
  natural_wake_time: '07:00',
  natural_sleep_time: '23:00',
  enable_smart_timing: true,
  preferred_intervention_types: ['mindfulness', 'stress_relief']
};

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
  smart_notifications: defaultNotificationPreferences,
  circadian_settings: defaultCircadianSettings,
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

// Mock functions for demo
const mockUser = {
  id: 'demo-user-123',
  email: 'andrea.padoan@gmail.com',
  user_metadata: { full_name: 'Andrea' }
};

const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user;
    }
    return mockUser;
  } catch {
    return mockUser;
  }
};

// Components remain the same...
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
            { href: '/notifications', label: 'Notifications' },
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

const MobileTabSelector: React.FC<{
  tabs: readonly { id: 'profile' | 'notifications' | 'ai' | 'privacy' | 'theme'; label: string; icon: React.ComponentType<any> }[];
  activeTab: 'profile' | 'notifications' | 'ai' | 'privacy' | 'theme';
  onTabChange: (tab: 'profile' | 'notifications' | 'ai' | 'privacy' | 'theme') => void;
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

const SettingsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'ai' | 'privacy' | 'theme'>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [testingNotification, setTestingNotification] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Initialize settings and load user
  useEffect(() => {
    const initializeSettings = async () => {
      setLoading(true);
      
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          window.location.href = '/sign-in';
          return;
        }
        
        setUser(currentUser);
        
        // Load preferences from localStorage
        await loadLocalPreferences();
        
        // Use defaults with user data
        setPreferences(prev => ({
          ...prev,
          email: currentUser.email || '',
          display_name: currentUser.user_metadata?.full_name || ''
        }));
        
      } catch (err: any) {
        console.error('Error initializing settings:', err);
        setError('Errore nell\'inizializzazione delle impostazioni');
      } finally {
        setLoading(false);
      }
    };

    initializeSettings();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load preferences from local storage
  const loadLocalPreferences = async () => {
    try {
      const storedPrefs = localStorage.getItem('notification_preferences');
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs);
        setPreferences(prev => ({
          ...prev,
          smart_notifications: { ...defaultNotificationPreferences, ...parsed }
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const testSmartNotification = async () => {
    setTestingNotification(true);
    setError(null);
    
    try {
      // Show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('LifeOS Test', {
          body: 'Sistema automatizzato funzionante!',
          icon: '/favicon.ico'
        });
      }

      setSuccessMessage('Notifica di test inviata con successo! Sistema automatizzato attivo.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error testing notification:', error);
      setError('Errore nell\'invio della notifica di test');
    } finally {
      setTestingNotification(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setError('Le notifiche non sono supportate in questo browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setSuccessMessage('Permessi notifiche concessi!');
        await updateSmartNotificationPreference(['delivery_channels', 'push_notifications'], true);
        
        new Notification('LifeOS', {
          body: 'Notifiche abilitate con successo!',
          icon: '/favicon.ico'
        });
        
        setTimeout(() => setSuccessMessage(null), 3000);
      } else if (permission === 'denied') {
        setError('Permessi notifiche negati. Puoi riabilitarli dalle impostazioni del browser.');
        await updateSmartNotificationPreference(['delivery_channels', 'push_notifications'], false);
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError('Errore nella richiesta dei permessi notifiche');
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Update email in auth if changed
      if (preferences.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: preferences.email
        });
        
        if (emailError) {
          throw new Error('Errore aggiornamento email: ' + emailError.message);
        }
      }
      
      // Update display name in auth metadata
      if (preferences.display_name !== (user.user_metadata?.full_name || '')) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { full_name: preferences.display_name }
        });
        
        if (metadataError) {
          console.warn('Warning updating user metadata:', metadataError);
        }
      }
      
      // Save notification preferences to localStorage
      localStorage.setItem('notification_preferences', JSON.stringify(preferences.smart_notifications));
      setLastSync(new Date());
      
      setSuccessMessage('Preferenze salvate e sincronizzate!');
      
      const updatedUser = await getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError('Errore nel salvataggio delle preferenze: ' + err.message);
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
      alert('Funzionalità di eliminazione account non ancora implementata');
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateSmartNotificationPreference = async (path: string[], value: any) => {
    const newPrefs = { ...preferences };
    let current: any = newPrefs.smart_notifications;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setPreferences(newPrefs);
    
    // Auto-save to localStorage
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(newPrefs.smart_notifications));
    } catch (error) {
      console.error('Error auto-saving preference:', error);
    }
  };

  const updateCircadianSetting = async (key: keyof CircadianSettings, value: any) => {
    const newPrefs = {
      ...preferences,
      circadian_settings: {
        ...preferences.circadian_settings,
        [key]: value
      }
    };
    setPreferences(newPrefs);
    
    // Auto-save to localStorage
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(newPrefs.smart_notifications));
    } catch (error) {
      console.error('Error auto-saving circadian setting:', error);
    }
  };

  const toggleFocusArea = (area: string) => {
    setPreferences(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area) 
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  const toggleNotificationCategory = async (category: keyof typeof preferences.smart_notifications.categories) => {
    await updateSmartNotificationPreference(['categories', category], !preferences.smart_notifications.categories[category]);
  };

  const toggleInterventionType = async (type: string) => {
    const current = preferences.circadian_settings.preferred_intervention_types;
    const updated = current.includes(type) 
      ? current.filter(t => t !== type)
      : [...current, type];
    await updateCircadianSetting('preferred_intervention_types', updated);
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
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <a 
              href="/" 
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors min-w-0 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Home</span>
            </a>
            
            <div className="text-center">
              <div className="text-sm sm:text-base text-white/80">
                {user?.user_metadata?.full_name || user?.email || 'Utente'}
              </div>
              <div className="text-xs text-white/50 flex items-center gap-1">
                Settings
                {isOnline ? <Wifi className="w-3 h-3 text-green-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                {queueLength > 0 && <span className="text-orange-400">({queueLength})</span>}
              </div>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex space-x-8 text-white/80">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/suggestions" className="hover:text-white transition-colors">Suggestions</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/notifications" className="hover:text-white transition-colors">Notifications</a>
              <a href="/settings" className="text-white font-semibold">Settings</a>
            </div>
            
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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-400" />
            Impostazioni
          </h1>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1">
              {isOnline ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            {lastSync && (
              <span>Ultimo salvataggio: {lastSync.toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        {/* Messages */}
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

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
              
              {/* Enhanced Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 sm:space-y-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Notifiche Intelligenti
                  </h2>
                  
                  {/* Master Enable */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-white font-medium text-base sm:text-lg">Sistema Notifiche</div>
                        <div className="text-white/60 text-sm">Attiva le notifiche intelligenti</div>
                      </div>
                      <ToggleSwitch
                        checked={preferences.smart_notifications.enabled}
                        onChange={(checked) => updateSmartNotificationPreference(['enabled'], checked)}
                      />
                    </div>
                    
                    {preferences.smart_notifications.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={testSmartNotification}
                          disabled={testingNotification}
                          className="bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 text-blue-300 px-4 py-3 rounded-lg transition-colors border border-blue-400/30 min-h-[44px] text-sm flex items-center justify-center gap-2"
                        >
                          {testingNotification ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                          Test Notifica
                        </button>
                        
                        <a
                          href="/notifications"
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-3 rounded-lg transition-colors border border-purple-400/30 min-h-[44px] text-sm flex items-center justify-center gap-2"
                        >
                          <Target className="w-4 h-4" />
                          Dashboard
                        </a>
                      </div>
                    )}
                  </div>

                  {preferences.smart_notifications.enabled && (
                    <>
                      {/* Categories */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Categorie</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { key: 'stress_relief', label: 'Stress Relief', icon: Heart, description: 'Gestione dello stress' },
                            { key: 'energy_boost', label: 'Energy Boost', icon: Zap, description: 'Energia e vitalità' },
                            { key: 'sleep_prep', label: 'Sleep Prep', icon: Moon, description: 'Preparazione al sonno' },
                            { key: 'celebration', label: 'Celebration', icon: Smile, description: 'Riconoscimenti' },
                            { key: 'mindfulness', label: 'Mindfulness', icon: Brain, description: 'Consapevolezza' },
                            { key: 'emergency', label: 'Emergency', icon: AlertCircle, description: 'Emergenze' }
                          ].map(category => {
                            const Icon = category.icon;
                            return (
                              <div key={category.key} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5 text-blue-400" />
                                    <span className="text-white font-medium text-sm">{category.label}</span>
                                  </div>
                                  <ToggleSwitch
                                    checked={preferences.smart_notifications.categories[category.key as keyof typeof preferences.smart_notifications.categories]}
                                    onChange={() => toggleNotificationCategory(category.key as keyof typeof preferences.smart_notifications.categories)}
                                  />
                                </div>
                                <p className="text-white/60 text-xs">{category.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delivery channels */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Canali di Notifica</h3>
                        
                        <div className="border border-white/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-white font-medium text-sm">Notifiche Push</div>
                              <div className="text-white/60 text-xs">
                                Stato: {notificationPermission === 'granted' ? 'Abilitate' : 
                                       notificationPermission === 'denied' ? 'Bloccate' : 'Non richieste'}
                              </div>
                            </div>
                            <ToggleSwitch
                              checked={preferences.smart_notifications.delivery_channels.push_notifications && notificationPermission === 'granted'}
                              onChange={(checked) => {
                                if (checked && notificationPermission !== 'granted') {
                                  requestNotificationPermission();
                                } else {
                                  updateSmartNotificationPreference(['delivery_channels', 'push_notifications'], checked);
                                }
                              }}
                              disabled={notificationPermission === 'denied'}
                            />
                          </div>
                          
                          {notificationPermission === 'default' && (
                            <button
                              onClick={requestNotificationPermission}
                              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors border border-blue-400/30 text-sm"
                            >
                              Abilita Notifiche Browser
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Profile tab */}
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
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 min-h-[44px] text-sm sm:text-base focus:border-blue-400/50 focus:outline-none transition-colors"
                        placeholder="Il tuo nome"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2 text-sm sm:text-base">Email</label>
                      <input
                        type="email"
                        value={preferences.email}
                        onChange={(e) => updatePreference('email', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 min-h-[44px] text-sm sm:text-base focus:border-blue-400/50 focus:outline-none transition-colors"
                        placeholder="La tua email"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Save Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 border-t border-white/20 gap-4">
                <div className="flex items-center gap-4 text-sm text-white/60">
                  {isOnline ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>
                
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
                      Salva
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

export default SettingsPage;