'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Brain, Heart, Moon, TrendingUp, Zap, Star, Users, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';

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

const LifeScorePreview: React.FC = () => {
  const [score, setScore] = useState(87);
  const [hovering, setHovering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(circleRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-64 h-64 mx-auto bg-white/10 rounded-full animate-pulse" />
    );
  }

  const circumference = 2 * Math.PI * 60;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      ref={circleRef}
      className={`relative w-64 h-64 mx-auto transition-all duration-1000 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Background glow */}
      <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
        hovering ? 'shadow-[0_0_100px_rgba(147,197,253,0.4)]' : 'shadow-[0_0_50px_rgba(147,197,253,0.2)]'
      }`} />
      
      {/* SVG Circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r="60"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx="64"
          cy="64"
          r="60"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={isVisible ? strokeDashoffset : circumference}
          className="transition-all duration-2000 ease-out"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent transition-all duration-500 ${
            hovering ? 'scale-110' : 'scale-100'
          }`}>
            {score}
          </div>
          <div className="text-sm text-white/70 mt-1">LifeScore</div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-20 opacity-0'
      }`}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    >
      {/* Floating icon */}
      <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
        {icon}
      </div>
      
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { y: scrollY } = useScrollPosition();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

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

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>
            <div className="hidden md:flex space-x-8 text-white/80">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/suggestions" className="hover:text-white transition-colors">Suggestions</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/profile" className="hover:text-white transition-colors">Profilo</a>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Inizia Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center text-center"
        style={{ transform: heroTransform }}
      >
        <div 
          className="relative z-10 max-w-4xl mx-auto px-6"
          style={{
            transform: `translate(${mouseParallaxX}px, ${mouseParallaxY}px)`
          }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Trasforma la tua vita con
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              l'AI del benessere
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Il coach virtuale che ti aiuta ogni giorno a migliorare sonno, energia e benessere 
            attraverso consigli personalizzati e tutorial guidati.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <span className="relative z-10">Scopri Come Funziona</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-lg">
              Guarda Demo
            </button>
          </div>

          {/* LifeScore Preview */}
          <LifeScorePreview />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 bg-gradient-to-b from-white/50 to-transparent rounded-full" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Come funziona LifeOS
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Quattro funzionalità che trasformano i tuoi dati in azioni concrete per il benessere
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-white" />}
              title="LifeScore Intelligente"
              description="Un algoritmo avanzato analizza sonno, attività fisica e stato mentale per darti un punteggio giornaliero da 0 a 100."
              delay={0}
            />
            
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Consigli Personalizzati"
              description="Suggerimenti specifici basati sui tuoi dati reali: respirazione, micro-pause, esercizi mirati per la tua situazione."
              delay={200}
            />
            
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-white" />}
              title="Tutorial Guidati"
              description="Non sai come fare respirazione 4-7-8 o meditazione? Ti guidiamo passo passo con animazioni interattive e timer."
              delay={400}
            />
            
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Analytics Avanzate"
              description="Visualizza i tuoi progressi nel tempo con grafici dettagliati e insights personalizzati per ottimizzare i risultati."
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <div className="flex justify-center mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <blockquote className="text-2xl md:text-3xl text-white font-light italic mb-8 leading-relaxed">
              "In sole 2 settimane il mio sonno è migliorato del 40% e mi sento molto più energico durante il giorno"
            </blockquote>
            
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
              <div className="text-left">
                <div className="text-white font-semibold">Marco R.</div>
                <div className="text-white/60 text-sm">Utilizzatore Beta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Inizia il tuo percorso di benessere
          </h2>
          
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            Unisciti a migliaia di persone che hanno già migliorato la loro qualità di vita con LifeOS
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl">
              <span className="relative z-10 flex items-center gap-3">
                Inizia Gratis Ora
                <Zap className="w-6 h-6" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Gratis per sempre
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              2000+ utenti attivi
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/20 backdrop-blur-lg border-t border-white/10 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4 md:mb-0">
              LifeOS
            </div>
            
            <div className="flex gap-8 text-white/60 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Termini</a>
              <a href="#" className="hover:text-white transition-colors">Contatti</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-white/40 text-sm">
            © 2024 LifeOS. Trasforma la tua vita, un giorno alla volta.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
