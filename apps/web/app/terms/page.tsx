'use client';

import React from 'react';
import { FileText, ArrowLeft, Users, AlertTriangle, Scale, CheckCircle } from 'lucide-react';

const TermsPage: React.FC = () => {
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
              <div className="text-lg sm:text-xl font-bold text-white">Terms of Service</div>
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
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Termini di Servizio
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Le regole e condizioni per l'utilizzo di LifeOS. Leggi attentamente prima di utilizzare l'app.
          </p>
          <div className="text-sm text-white/50 mt-4">
            Ultimo aggiornamento: 12 Settembre 2025
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Acceptance */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Accettazione dei Termini</h2>
            </div>
            
            <div className="text-white/80 leading-relaxed">
              <p className="mb-4">
                Utilizzando LifeOS, accetti automaticamente questi termini di servizio. Se non sei d'accordo, ti preghiamo di non utilizzare l'app.
              </p>
              <p>
                Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno comunicate tramite l'app e diventeranno effettive dopo 30 giorni dalla notifica.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Descrizione del Servizio</h2>
            </div>
            
            <div className="text-white/80 space-y-4">
              <p className="leading-relaxed">
                LifeOS è una piattaforma di benessere digitale che utilizza intelligenza artificiale per fornire consigli personalizzati su:
              </p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Gestione dello stress e tecniche di rilassamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Miglioramento della qualità del sonno</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Aumento dell'energia e della produttività</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Tecniche di mindfulness e meditazione</span>
                </li>
              </ul>
              
              <p className="leading-relaxed">
                Il servizio è fornito "così com'è" e potrebbe subire interruzioni per manutenzione o miglioramenti.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Responsabilità dell'Utente</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Account e Sicurezza</h3>
                <div className="text-white/80 space-y-2">
                  <p>• Mantenere riservate le credenziali di accesso</p>
                  <p>• Fornire informazioni accurate durante la registrazione</p>
                  <p>• Notificare immediatamente accessi non autorizzati</p>
                  <p>• Utilizzare l'app solo per scopi personali e legali</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Utilizzo Appropriato</h3>
                <div className="text-white/80 space-y-2">
                  <p>• Non tentare di violare la sicurezza dell'app</p>
                  <p>• Non utilizzare bot o sistemi automatizzati</p>
                  <p>• Non condividere contenuti inappropriati o illegali</p>
                  <p>• Rispettare i diritti di proprietà intellettuale</p>
                </div>
              </div>
            </div>
          </section>

          {/* Medical Disclaimer */}
          <section className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-red-400/20">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Disclaimer Medico</h2>
            </div>
            
            <div className="text-white/80 space-y-4">
              <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
                <p className="font-semibold text-red-300 mb-2">IMPORTANTE:</p>
                <p className="text-sm leading-relaxed">
                  LifeOS NON è un dispositivo medico e NON fornisce diagnosi, trattamenti o consigli medici. 
                  I contenuti sono solo a scopo informativo e di benessere generale.
                </p>
              </div>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Consulta sempre un medico per problemi di salute</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Non interrompere terapie mediche senza consultare uno specialista</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>In caso di emergenza, contatta immediatamente i servizi di emergenza</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>I risultati possono variare e non sono garantiti</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Proprietà Intellettuale</h2>
            
            <div className="text-white/80 space-y-4">
              <p className="leading-relaxed">
                Tutti i contenuti, algoritmi, design e funzionalità di LifeOS sono protetti da copyright e altre leggi sulla proprietà intellettuale.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">I Tuoi Dati</h3>
                  <p className="text-sm">Mantieni la proprietà dei tuoi dati personali e del benessere.</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Contenuti LifeOS</h3>
                  <p className="text-sm">Algoritmi, consigli AI e interfaccia rimangono di nostra proprietà.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Limitations */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Limitazioni di Responsabilità</h2>
            
            <div className="text-white/80 space-y-4 text-sm">
              <p className="leading-relaxed">
                LifeOS è fornito "così com'è" senza garanzie di alcun tipo. Non siamo responsabili per:
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p>• Interruzioni del servizio</p>
                  <p>• Perdita di dati</p>
                  <p>• Problemi tecnici</p>
                </div>
                <div className="space-y-1">
                  <p>• Decisioni basate sui consigli</p>
                  <p>• Risultati non raggiunti</p>
                  <p>• Problemi di compatibilità</p>
                </div>
              </div>
              
              <p className="text-xs text-white/60 bg-white/5 p-3 rounded-lg">
                La nostra responsabilità massima è limitata all'importo pagato per il servizio negli ultimi 12 mesi.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Sospensione e Terminazione</h2>
            
            <div className="text-white/80 space-y-4">
              <p className="leading-relaxed">
                Possiamo sospendere o terminare il tuo account in caso di:
              </p>
              
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Violazione di questi termini</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Attività fraudolente o illegali</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Mancato pagamento (per servizi premium)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Abuso del sistema o degli altri utenti</span>
                </li>
              </ul>
              
              <p className="text-sm bg-white/5 p-3 rounded-lg">
                Puoi cancellare il tuo account in qualsiasi momento dalle impostazioni. La cancellazione è permanente e irreversibile.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Legge Applicabile</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Questi termini sono regolati dalle leggi italiane. Qualsiasi controversia sarà risolta presso i tribunali competenti di Milano, Italia.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-blue-400/20 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Domande sui Termini?</h2>
            <p className="text-white/80 mb-6">
              Contattaci per chiarimenti su questi termini di servizio.
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

export default TermsPage;