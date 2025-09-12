'use client';

import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, Database, Settings } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <a 
              href="/" 
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Home</span>
            </a>
            
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-white">Privacy Policy</div>
            </div>
            
            <div className="w-16"></div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            La tua privacy è fondamentale. Ecco come proteggiamo e utilizziamo i tuoi dati in LifeOS.
          </p>
          <div className="text-sm text-white/50 mt-4">
            Ultimo aggiornamento: 12 Settembre 2025
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Data Collection */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Dati che Raccogliamo</h2>
            </div>
            
            <div className="space-y-4 text-white/80">
              <div>
                <h3 className="font-semibold text-white mb-2">Informazioni Account</h3>
                <p className="leading-relaxed">Email, nome e preferenze di profilo per personalizzare la tua esperienza.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">Dati Benessere</h3>
                <p className="leading-relaxed">Check-in giornalieri, metriche di stress, energia, sonno e focus che inserisci volontariamente.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">Utilizzo App</h3>
                <p className="leading-relaxed">Interazioni con consigli AI, completamento attività e pattern di utilizzo per migliorare i suggerimenti.</p>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Come Utilizziamo i Dati</h2>
            </div>
            
            <div className="space-y-4 text-white/80">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="leading-relaxed"><strong>Personalizzazione:</strong> Generare consigli AI specifici per il tuo benessere e pattern comportamentali.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="leading-relaxed"><strong>Analytics:</strong> Calcolare il tuo LifeScore e mostrare progressi nel tempo.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="leading-relaxed"><strong>Miglioramento:</strong> Perfezionare algoritmi e suggerimenti basandoci su pattern aggregati e anonimi.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="leading-relaxed"><strong>Sicurezza:</strong> Proteggere il tuo account e prevenire utilizzi impropri.</p>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-green-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Protezione dei Dati</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Crittografia</h3>
                <p className="text-white/80 text-sm leading-relaxed">Tutti i dati sono crittografati in transito e a riposo utilizzando standard industriali.</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Accesso Limitato</h3>
                <p className="text-white/80 text-sm leading-relaxed">Solo personale autorizzato può accedere ai dati, esclusivamente per supporto tecnico.</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Backup Sicuri</h3>
                <p className="text-white/80 text-sm leading-relaxed">Backup automatici crittografati per prevenire perdite di dati.</p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Monitoraggio</h3>
                <p className="text-white/80 text-sm leading-relaxed">Sistemi di monitoraggio 24/7 per rilevare e prevenire accessi non autorizzati.</p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Condivisione Dati</h2>
            </div>
            
            <div className="text-white/80 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">Non vendiamo mai i tuoi dati personali.</strong> Condividiamo informazioni solo in questi casi specifici:
              </p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Provider di servizi tecnici (Supabase, Vercel) per funzionalità dell'app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Autorità legali se richiesto dalla legge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Dati aggregati e anonimi per ricerca sul benessere (solo con tuo consenso)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* User Rights */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">I Tuoi Diritti</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Accesso</h3>
                <p className="text-white/80 text-sm">Puoi richiedere una copia di tutti i tuoi dati.</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Correzione</h3>
                <p className="text-white/80 text-sm">Puoi correggere informazioni imprecise nel tuo profilo.</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Cancellazione</h3>
                <p className="text-white/80 text-sm">Puoi richiedere la cancellazione completa del tuo account.</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Portabilità</h3>
                <p className="text-white/80 text-sm">Puoi esportare i tuoi dati in formato leggibile.</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-blue-400/20 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Domande sulla Privacy?</h2>
            <p className="text-white/80 mb-6">
              Contattaci per qualsiasi domanda sui tuoi dati o questa policy.
            </p>
            <a 
              href="/support" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Contatta il Supporto
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;