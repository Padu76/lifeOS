'use client';

import React, { useRef, useEffect, useState } from 'react';
import { User, Settings, Bell, Shield, Trash2, Save, Camera, Moon, Sun, Heart, Brain, Zap } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  chronotype: 'early_bird' | 'intermediate' | 'night_owl';
  sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic';
  preferred_tone: 'professional' | 'friendly' | 'casual' | 'motivational';
  focus_areas: string[];
  avatar?: string;
}

interface NotificationSettings {
  push_enabled: boolean;
  advice_notifications: boolean;
  achievement_notifications: boolean;
  weekly_report_notifications: boolean;
  reminder_notifications: boolean;
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

const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay: number;
}> = ({ title, icon, children, delay }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef);

  return (
    <div
      ref={sectionRef}
      className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Marco Rossi',
    email: 'marco.rossi@email.com',
    chronotype: 'early_bird',
    sensitivity_level: 'moderate',
    preferred_tone: 'friendly',
    focus_areas: ['Gestione stress', 'Energia e vitalità', 'Qualità del sonno'],
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    push_enabled: true,
    advice_notifications: true,
    achievement_notifications: true,
    weekly_report_notifications: true,
    reminder_notifications: false,
  });

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNotificationChange = (field: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
    setHasChanges(true);
  };

  const handleFocusAreaToggle = (area: string) => {
    const currentAreas = profile.focus_areas;
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    
    handleProfileChange('focus_areas', newAreas);
  };

  const handleSave = () => {
    // Save logic here
    setHasChanges(false);
    console.log('Saving profile:', profile, 'notifications:', notifications);
  };

  const focusAreaOptions = [
    'Gestione stress',
    'Energia e vitalità',
    'Qualità del sonno',
    'Focus e concentrazione',
    'Attività fisica',
    'Alimentazione',
    'Relazioni sociali',
    'Mindfulness',
    'Produttività',
    'Recovery e riposo',
    'Apprendimento',
    'Creatività',
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
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/profile" className="text-white font-semibold">Profilo</a>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Il tuo
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Profilo
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Personalizza la tua esperienza LifeOS per ottenere consigli più efficaci
            </p>
          </div>

          {/* Save Banner */}
          {hasChanges && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-lg animate-slide-in">
              <div className="flex items-center gap-3">
                <span>Hai modifiche non salvate</span>
                <button
                  onClick={handleSave}
                  className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-full text-sm transition-colors"
                >
                  Salva ora
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="relative px-6 pb-20">
        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Profile Info */}
          <FormSection
            title="Informazioni personali"
            icon={<User className="w-5 h-5 text-white" />}
            delay={0}
          >
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-white">{profile.name}</div>
                  <div className="text-white/60">{profile.email}</div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Nome completo</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Preferences */}
          <FormSection
            title="Preferenze personali"
            icon={<Settings className="w-5 h-5 text-white" />}
            delay={100}
          >
            <div className="space-y-6">
              {/* Chronotype */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Quando ti senti più produttivo?</label>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { key: 'early_bird', label: '🌅 Mattiniero', desc: 'Al meglio la mattina presto' },
                    { key: 'intermediate', label: '☀️ Intermedio', desc: 'Costante durante il giorno' },
                    { key: 'night_owl', label: '🌙 Nottambulo', desc: 'Più attivo la sera/notte' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleProfileChange('chronotype', option.key)}
                      className={`p-4 rounded-lg border transition-all ${
                        profile.chronotype === option.key
                          ? 'bg-blue-500/20 border-blue-400 text-white'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-80">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sensitivity */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Intensità dei consigli</label>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { key: 'gentle', label: '🌸 Delicato', desc: 'Suggerimenti leggeri' },
                    { key: 'moderate', label: '⚖️ Moderato', desc: 'Bilanciato' },
                    { key: 'enthusiastic', label: '🚀 Entusiasta', desc: 'Energico e sfidante' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleProfileChange('sensitivity_level', option.key)}
                      className={`p-4 rounded-lg border transition-all ${
                        profile.sensitivity_level === option.key
                          ? 'bg-purple-500/20 border-purple-400 text-white'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-80">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Tono di comunicazione</label>
                <div className="grid md:grid-cols-4 gap-3">
                  {[
                    { key: 'professional', label: '💼 Professionale' },
                    { key: 'friendly', label: '😊 Amichevole' },
                    { key: 'casual', label: '🤙 Informale' },
                    { key: 'motivational', label: '💪 Motivazionale' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleProfileChange('preferred_tone', option.key)}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        profile.preferred_tone === option.key
                          ? 'bg-cyan-500/20 border-cyan-400 text-white'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Focus Areas */}
          <FormSection
            title="Aree di interesse"
            icon={<Brain className="w-5 h-5 text-white" />}
            delay={200}
          >
            <div>
              <p className="text-white/70 mb-4">Seleziona le aree su cui vuoi concentrarti (2-6 aree)</p>
              <div className="grid md:grid-cols-3 gap-3">
                {focusAreaOptions.map((area) => (
                  <button
                    key={area}
                    onClick={() => handleFocusAreaToggle(area)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      profile.focus_areas.includes(area)
                        ? 'bg-green-500/20 border-green-400 text-white'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium text-sm">{area}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-white/60">
                Selezionate: {profile.focus_areas.length} aree
              </div>
            </div>
          </FormSection>

          {/* Notifications */}
          <FormSection
            title="Notifiche"
            icon={<Bell className="w-5 h-5 text-white" />}
            delay={300}
          >
            <div className="space-y-4">
              {[
                { key: 'push_enabled', label: 'Notifiche push', desc: 'Ricevi notifiche sul dispositivo' },
                { key: 'advice_notifications', label: 'Consigli personalizzati', desc: 'Notifiche per nuovi suggerimenti' },
                { key: 'achievement_notifications', label: 'Achievement', desc: 'Celebra i tuoi traguardi' },
                { key: 'weekly_report_notifications', label: 'Report settimanali', desc: 'Riassunto dei progressi' },
                { key: 'reminder_notifications', label: 'Promemoria', desc: 'Ricordati di completare i consigli' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{setting.label}</div>
                    <div className="text-white/60 text-sm">{setting.desc}</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(setting.key as keyof NotificationSettings)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[setting.key as keyof NotificationSettings]
                        ? 'bg-blue-500'
                        : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[setting.key as keyof NotificationSettings]
                          ? 'translate-x-7'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Danger Zone */}
          <FormSection
            title="Zona pericolosa"
            icon={<Shield className="w-5 h-5 text-white" />}
            delay={400}
          >
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-red-400 font-medium">Elimina account</div>
                    <div className="text-red-300/60 text-sm">Questa azione non può essere annullata</div>
                  </div>
                  <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Save Button */}
          <div className="flex justify-center pt-8">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all ${
                hasChanges
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 shadow-lg'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Salva modifiche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
