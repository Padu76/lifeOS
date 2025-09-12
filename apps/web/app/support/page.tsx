'use client';

import React, { useState } from 'react';
import { HelpCircle, ArrowLeft, Mail, MessageCircle, Book, Settings, Zap, Shield, AlertCircle, CheckCircle, Search } from 'lucide-react';

const SupportPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = [
    { id: 'all', label: 'Tutte', count: 12 },
    { id: 'account', label: 'Account', count: 4 },
    { id: 'features', label: 'Funzionalità', count: 5 },
    { id: 'privacy', label: 'Privacy', count: 3 }
  ];

  const faqs = [
    {
      category: 'account',
      question: 'Come creo un account LifeOS?',
      answer: 'Clicca su "Inizia Gratis" nella homepage e registrati con la tua email. Riceverai una email di conferma per attivare l\'account.'
    },
    {
      category: 'account',
      question: 'Posso cambiare la mia email?',
      answer: 'Sì, vai in Settings > Profilo e modifica la tua email. Dovrai confermare la nuova email prima che diventi attiva.'
    },
    {
      category: 'account',
      question: 'Come cancello il mio account?',
      answer: 'Vai in Settings > Privacy > Cancella Account. La cancellazione è permanente e tutti i dati verranno eliminati.'
    },
    {
      category: 'account',
      question: 'Ho dimenticato la password, cosa faccio?',
      answer: 'Nella pagina di login, clicca su "Password dimenticata?" e inserisci la tua email. Riceverai un link per reimpostare la password.'
    },
    {
      category: 'features',
      question: 'Come funziona il LifeScore?',
      answer: 'Il LifeScore è calcolato dai tuoi check-in giornalieri analizzando stress, energia, sonno e focus. Più dati fornisci, più preciso diventa.'
    },
    {
      category: 'features',
      question: 'Cosa sono i consigli AI personalizzati?',
      answer: 'L\'AI analizza i tuoi pattern e genera consigli specifici per migliorare il tuo benessere in base ai tuoi dati e preferenze.'
    },
    {
      category: 'features',
      question: 'Come faccio il check-in giornaliero?',
      answer: 'Vai nella sezione Check-in e valuta il tuo stress, energia, qualità del sonno e focus su una scala da 1 a 10.'
    },
    {
      category: 'features',
      question: 'Posso modificare un check-in passato?',
      answer: 'No, i check-in sono immutabili per garantire l\'accuratezza dei dati. Puoi aggiungere note per fornire contesto aggiuntivo.'
    },
    {
      category: 'features',
      question: 'Quanto spesso devo usare l\'app?',
      answer: 'Ti consigliamo un check-in giornaliero e di seguire i consigli AI. Anche 5-10 minuti al giorno possono fare la differenza.'
    },
    {
      category: 'privacy',
      question: 'I miei dati sono sicuri?',
      answer: 'Sì, utilizziamo crittografia end-to-end e standard di sicurezza bancari. I tuoi dati sono protetti e mai venduti a terzi.'
    },
    {
      category: 'privacy',
      question: 'Posso esportare i miei dati?',
      answer: 'Sì, vai in Settings > Privacy > Esporta Dati per scaricare tutti i tuoi dati in formato JSON.'
    },
    {
      category: 'privacy',
      question: 'Chi può vedere i miei dati?',
      answer: 'Solo tu puoi vedere i tuoi dati personali. Lo staff tecnico può accedere solo per supporto e in forma anonimizzata.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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
              <div className="text-lg sm:text-xl font-bold text-white">Centro Supporto</div>
            </div>
            
            <div className="w-16"></div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Come possiamo aiutarti?
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Trova risposte alle tue domande o contatta il nostro team di supporto per assistenza personalizzata.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Cerca nelle FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-full pl-12 pr-4 py-3 text-white placeholder-white/50 focus:border-blue-400/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <a 
            href="mailto:support@lifeos.app"
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all hover:scale-105 group"
          >
            <Mail className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
            <p className="text-white/70 text-sm mb-4">Inviaci una email per assistenza dettagliata</p>
            <span className="text-blue-400 text-sm font-medium">support@lifeos.app</span>
          </a>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <MessageCircle className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Live Chat</h3>
            <p className="text-white/70 text-sm mb-4">Chat in tempo reale con il supporto</p>
            <button className="text-green-400 text-sm font-medium opacity-60 cursor-not-allowed">
              Prossimamente
            </button>
          </div>

          <a 
            href="/legal/privacy"
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all hover:scale-105 group"
          >
            <Book className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Documentazione</h3>
            <p className="text-white/70 text-sm mb-4">Guide dettagliate e privacy policy</p>
            <span className="text-purple-400 text-sm font-medium">Esplora →</span>
          </a>
        </div>

        {/* Status */}
        <div className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-4 border border-green-400/20 mb-12">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <span className="text-green-300 font-medium">Tutti i sistemi operativi</span>
              <span className="text-green-300/70 text-sm ml-3">Ultimo aggiornamento: 2 minuti fa</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
            Domande Frequenti
          </h2>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <details key={index} className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden group">
                  <summary className="p-4 sm:p-6 cursor-pointer hover:bg-white/5 transition-colors list-none">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium text-sm sm:text-base pr-4">{faq.question}</h3>
                      <div className="text-white/50 group-open:rotate-180 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </summary>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-white/80 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">Nessuna FAQ trovata per la tua ricerca.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Cancella filtri
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Common Issues */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Settings className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Problemi di Account</h3>
            <p className="text-white/70 text-sm mb-4">Login, password, impostazioni profilo</p>
            <a href="mailto:support@lifeos.app?subject=Account Issue" className="text-blue-400 text-sm font-medium">
              Contatta Support →
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Zap className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">App non Funziona</h3>
            <p className="text-white/70 text-sm mb-4">Crash, caricamento lento, errori</p>
            <a href="mailto:support@lifeos.app?subject=Technical Issue" className="text-orange-400 text-sm font-medium">
              Segnala Bug →
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Shield className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Privacy e Dati</h3>
            <p className="text-white/70 text-sm mb-4">Sicurezza, esportazione, cancellazione</p>
            <a href="/privacy" className="text-green-400 text-sm font-medium">
              Privacy Policy →
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-blue-400/20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Non hai trovato quello che cerchi?</h2>
            <p className="text-white/70">
              Il nostro team di supporto è qui per aiutarti. Ti risponderemo entro 24 ore.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">Nome</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-blue-400/50 focus:outline-none transition-colors"
                    placeholder="Il tuo nome"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-blue-400/50 focus:outline-none transition-colors"
                    placeholder="La tua email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2 text-sm">Categoria</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400/50 focus:outline-none transition-colors">
                  <option value="" className="bg-slate-800">Seleziona una categoria</option>
                  <option value="account" className="bg-slate-800">Problemi Account</option>
                  <option value="technical" className="bg-slate-800">Problemi Tecnici</option>
                  <option value="billing" className="bg-slate-800">Fatturazione</option>
                  <option value="feature" className="bg-slate-800">Richiesta Funzionalità</option>
                  <option value="other" className="bg-slate-800">Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2 text-sm">Messaggio</label>
                <textarea
                  rows={5}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-blue-400/50 focus:outline-none transition-colors resize-y"
                  placeholder="Descrivi il tuo problema o la tua domanda..."
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Invia Messaggio
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-white/50 text-sm">
          <p>Tempo di risposta medio: 2-4 ore | Supporto attivo: Lun-Ven 9:00-18:00 CET</p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;