'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Brain, Heart, Moon, TrendingUp, Zap, Star, Users, Shield, Play, CheckCircle, ArrowRight, BarChart3, Clock, Target, Menu, X } from 'lucide-react';
import Link from 'next/link';

// SSR-safe scroll position hook
const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({ y: 0, progress: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      
      setScrollPosition({ y: scrollY, progress });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

// SSR-safe intersection observer hook
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
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block text-lg font-semibold text-white/80 hover:text-white transition-colors py-2"
            >
              {item.label}
            </Link>
          ))}
          
          <div className="pt-6 border-t border-white/20">
            <Link
              href="/sign-in"
              onClick={onClose}
              className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg text-center hover:scale-105 transition-transform"
            >
              Inizia Gratis
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

// Smooth scroll utility
const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// Interactive Demo Component
const DashboardPreview: React.FC = () => {
  const [currentMetric, setCurrentMetric] = useState(0);
  const [mounted, setMounted] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(demoRef);

  const metrics = [
    { label: 'LifeScore', value: 87, color: 'from-blue-400 to-purple-500' },
    { label: 'Energia', value: 78, color: 'from-orange-400 to-red-500' },
    { label: 'Sonno', value: 92, color: 'from-indigo-400 to-purple-500' },
    { label: 'Stress', value: 34, color: 'from-green-400 to-blue-500' }
  ];

  useEffect(() => {
    setMounted(true);
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible, metrics.length]);

  if (!mounted) {
    return <div className="w-full max-w-sm h-48 sm:h-60 bg-white/10 rounded-2xl animate-pulse mx-auto" />;
  }

  const current = metrics[currentMetric];

  return (
    <div 
      ref={demoRef}
      className={`relative w-full max-w-sm mx-auto transition-all duration-1000 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold text-sm sm:text-base">Dashboard Live</h4>
          <div className="flex space-x-1">
            {metrics.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentMetric ? 'bg-blue-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${current.color} bg-clip-text text-transparent mb-2`}>
            {current.value}
          </div>
          <div className="text-white/70 mb-4 text-sm sm:text-base">{current.label}</div>
          
          {/* Mini chart simulation */}
          <div className="flex items-end justify-between h-8 sm:h-12 mb-4">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className={`w-4 sm:w-6 bg-gradient-to-t ${current.color} rounded-t opacity-70`}
                style={{ 
                  height: `${15 + Math.random() * 20}px`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
          
          <div className="text-xs text-white/50">Ultimi 7 giorni</div>
        </div>
      </div>
    </div>
  );
};

const StatCounter: React.FC<{ target: number; label: string; delay: number }> = ({ target, label, delay }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(counterRef);

  useEffect(() => {
    if (!isVisible || started) return;

    setTimeout(() => {
      setStarted(true);
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, delay);
  }, [isVisible, target, started, delay]);

  return (
    <div ref={counterRef} className="text-center px-2">
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{count}+</div>
      <div className="text-white/70 text-xs sm:text-sm lg:text-base">{label}</div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  delay: number;
}> = ({ icon, title, description, features, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-20 opacity-0'
      }`}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    >
      <div className="relative z-10 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6 group-hover:rotate-12 transition-transform duration-300">
        {icon}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{title}</h3>
        <p className="text-white/70 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{description}</p>
        
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-white/80 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  role: string;
  metrics: string;
  delay: number;
}> = ({ quote, author, role, metrics, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef);

  return (
    <div
      ref={cardRef}
      className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 border border-white/20 transition-all duration-700 ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-20 opacity-0'
      }`}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    >
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      
      <blockquote className="text-white/90 mb-6 italic leading-relaxed text-sm sm:text-base">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
          {author.charAt(0)}
        </div>
        <div>
          <div className="text-white font-semibold text-sm sm:text-base">{author}</div>
          <div className="text-white/60 text-xs sm:text-sm">{role}</div>
        </div>
      </div>
      
      <div className="text-green-400 text-xs sm:text-sm font-medium bg-green-500/20 px-3 py-1 rounded-full inline-block">
        {metrics}
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { y: scrollY } = useScrollPosition();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Only apply transforms after mount to avoid hydration mismatch
  const heroTransform = mounted ? `translateY(${scrollY * 0.5}px)` : 'translateY(0px)';
  const bgTransform = mounted ? `translateY(${scrollY * 0.3}px)` : 'translateY(0px)';
  const mouseParallaxX = mounted && typeof window !== 'undefined' 
    ? (mousePosition.x - window.innerWidth / 2) * 0.01 
    : 0;
  const mouseParallaxY = mounted && typeof window !== 'undefined'
    ? (mousePosition.y - window.innerHeight / 2) * 0.01 
    : 0;

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Fixed Background with Dynamic Gradient */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        style={{
          transform: bgTransform,
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

      {/* Animated Background Elements */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 text-white font-bold text-lg">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/suggestions" className="hover:text-white transition-colors">Suggestions</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
            </div>
            
            {/* Desktop CTA */}
            <Link href="/sign-in" className="hidden md:block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Inizia Gratis
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Apri menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center text-center px-4 sm:px-6"
        style={{ transform: heroTransform }}
      >
        <div 
          className="relative z-10 max-w-7xl mx-auto w-full"
          style={{
            transform: `translate(${mouseParallaxX}px, ${mouseParallaxY}px)`
          }}
        >
          {/* Enhanced Typography with Mobile Scaling */}
          <h1 className="font-black text-white mb-6 sm:mb-8 leading-[0.9] tracking-tight">
            <span className="block font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/80 mb-2 sm:mb-4">Il futuro del</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
              BENESSERE
            </span>
            <span className="block font-light text-xl sm:text-2xl md:text-3xl lg:text-5xl text-white/80 mt-2 sm:mt-4">è qui</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light px-4">
            L'AI coach che trasforma i tuoi dati biometrici in azioni concrete per migliorare 
            <span className="text-white font-medium"> sonno, energia e focus</span> ogni singolo giorno.
          </p>

          {/* Statistics - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16 max-w-2xl mx-auto">
            <StatCounter target={87} label="LifeScore Medio" delay={0} />
            <StatCounter target={2400} label="Utenti Attivi" delay={200} />
            <StatCounter target={94} label="% Miglioramento" delay={400} />
          </div>

          {/* CTA Buttons - Mobile Optimized */}
          <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4">
            <Link 
              href="/dashboard"
              className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="relative z-10">Guarda Demo Live</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <button 
              onClick={() => scrollToSection('features-section')}
              className="border-2 border-white/30 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-lg flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Scopri Come
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Interactive Demo */}
          <div className="px-4">
            <DashboardPreview />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 bg-gradient-to-b from-white/50 to-transparent rounded-full" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Come <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">funziona</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto px-4">
              Quattro pilastri che trasformano i tuoi dati in miglioramenti concreti e misurabili
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
              title="LifeScore Avanzato"
              description="Algoritmo proprietario che analizza 50+ parametri biometrici per un punteggio di benessere da 0 a 100."
              features={[
                "Analisi sonno REM/non-REM",
                "Variabilità cardiaca HRV", 
                "Pattern di attività fisica",
                "Stress levels real-time"
              ]}
              delay={0}
            />
            
            <FeatureCard
              icon={<Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
              title="AI Personalizzata"
              description="Consigli specifici basati sui tuoi pattern unici, non su statistiche generiche."
              features={[
                "Machine learning adattivo",
                "Timing ottimale per azioni",
                "Progressione personalizzata",
                "Feedback in tempo reale"
              ]}
              delay={200}
            />
            
            <FeatureCard
              icon={<Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
              title="Tutorial Interattivi"
              description="Sessioni guidate step-by-step per respirazione, meditazione, power nap e micro-pause."
              features={[
                "Respirazione 4-7-8 guidata",
                "Power nap con audio 3D",
                "Meditazione progressiva",
                "Stretching desk-friendly"
              ]}
              delay={400}
            />
            
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
              title="Analytics Predittive"
              description="Non solo tracking, ma previsioni sui tuoi pattern di benessere per ottimizzare i risultati."
              features={[
                "Trend predittivi 7-30 giorni",
                "Alert preventivi burnout",
                "Insights correlazioni",
                "ROI del benessere"
              ]}
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Risultati <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">reali</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/70 px-4">
              Persone vere, miglioramenti misurabili, trasformazioni durature
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <TestimonialCard
              quote="In 3 settimane il mio LifeScore è passato da 64 a 89. Dormo meglio, ho più energia e la produttività è aumentata del 40%."
              author="Marco Rossi"
              role="Product Manager"
              metrics="+39% miglioramento sonno"
              delay={0}
            />
            
            <TestimonialCard
              quote="L'AI ha capito che il mio picco di energia è alle 14:30. Ora programmo i task più impegnativi in quel momento. Game changer!"
              author="Sofia Chen"
              role="UX Designer"
              metrics="+52% focus pomeridiano"
              delay={200}
            />
            
            <TestimonialCard
              quote="I power nap guidati di 15 minuti hanno sostituito il caffè del pomeriggio. Mi sento più lucido e dormo meglio la notte."
              author="Alessandro Bianchi"
              role="Startup Founder"
              metrics="+73% qualità sonno"
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8">
            Inizia la tua
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              trasformazione
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Unisciti a 2.400+ persone che hanno già migliorato la loro qualità di vita con LifeOS. 
            Risultati misurabili in 14 giorni o rimborso garantito.
          </p>

          <div className="flex flex-col gap-6 justify-center items-center mb-8 sm:mb-12 px-4">
            <Link href="/sign-in" className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl hover:scale-105 transition-all duration-300 shadow-2xl w-full sm:w-auto">
              <span className="relative z-10 flex items-center gap-3 justify-center">
                Inizia Gratis per 30 giorni
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-white/60 text-sm px-4">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>30 giorni gratis</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>2.400+ utenti attivi</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <span>Risultati garantiti</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/30 backdrop-blur-lg border-t border-white/10 py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div className="lg:col-span-2">
              <Link href="/" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4 block">
                LifeOS
              </Link>
              <p className="text-white/60 max-w-md mb-6 text-sm sm:text-base">
                La piattaforma AI che trasforma i tuoi dati biometrici in azioni concrete per il benessere. 
                Risultati misurabili, miglioramenti duraturi.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Prodotto</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <Link href="/dashboard" className="block hover:text-white transition-colors">Dashboard</Link>
                <Link href="/suggestions" className="block hover:text-white transition-colors">AI Coaching</Link>
                <Link href="/settings" className="block hover:text-white transition-colors">Personalizzazione</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Supporto</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <Link href="/help" className="block hover:text-white transition-colors">Centro Aiuto</Link>
                <a href="mailto:support@lifeos.app" className="block hover:text-white transition-colors">Contattaci</a>
                <Link href="/legal/privacy" className="block hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-white/10 gap-4">
            <div className="text-white/40 text-sm text-center sm:text-left">
              © 2024 LifeOS. Trasforma la tua vita, un giorno alla volta.
            </div>
            
            <div className="flex items-center gap-4 text-white/60">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Tempo medio setup: 3 minuti</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;