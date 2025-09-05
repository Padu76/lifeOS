import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-6xl font-bold mb-6">
            LifeOS
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Trasforma la tua vita con<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              l'AI del benessere
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Il coach virtuale che ti aiuta ogni giorno a migliorare sonno, energia e benessere 
            attraverso consigli personalizzati e tutorial guidati.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/sign-in"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Inizia Gratis
            </Link>
            <Link 
              href="#features"
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-gray-300 transition-colors"
            >
              Scopri Come Funziona
            </Link>
          </div>
        </div>
      </section>

      {/* LifeScore Preview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                87
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Il tuo LifeScore di oggi</h3>
            <p className="text-gray-600">
              Un punteggio unico che unisce sonno, attività fisica ed energia mentale
            </p>
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-green-600 text-xl">😴</span>
                </div>
                <div className="text-sm text-gray-600">Sonno</div>
                <div className="font-semibold text-green-600">Ottimo</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-blue-600 text-xl">🚶</span>
                </div>
                <div className="text-sm text-gray-600">Attività</div>
                <div className="font-semibold text-blue-600">Buona</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <span className="text-purple-600 text-xl">🧠</span>
                </div>
                <div className="text-sm text-gray-600">Energia</div>
                <div className="font-semibold text-purple-600">Alta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Come funziona LifeOS
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quattro funzionalità che trasformano i tuoi dati in azioni concrete per il benessere
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">LifeScore Intelligente</h3>
              <p className="text-gray-600 mb-4">
                Un algoritmo avanzato analizza sonno, attività fisica e stato mentale per darti 
                un punteggio giornaliero da 0 a 100.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Pesi dinamici basati sui tuoi pattern</li>
                <li>• Trend settimanali e mensili</li>
                <li>• Predizioni su stress e energia</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Consigli Personalizzati</h3>
              <p className="text-gray-600 mb-4">
                Suggerimenti specifici basati sui tuoi dati reali: respirazione, micro-pause, 
                esercizi mirati per la tua situazione.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Consigli contestuali e tempestivi</li>
                <li>• Azioni da 5-10 minuti</li>
                <li>• Adattamento continuo alle tue abitudini</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🎓</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Tutorial Guidati</h3>
              <p className="text-gray-600 mb-4">
                Non sai come fare respirazione 4-7-8 o meditazione? Ti guidiamo passo passo 
                con animazioni interattive e timer.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Respirazione guidata con animazioni</li>
                <li>• Meditazioni audio di 5 minuti</li>
                <li>• Esercizi di stretching illustrati</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Integrazione Totale</h3>
              <p className="text-gray-600 mb-4">
                Sincronizzazione automatica con Apple Health, Google Fit e i principali 
                wearable per un monitoraggio senza sforzo.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Apple Watch e smartwatch Android</li>
                <li>• Dati di sonno e attività automatici</li>
                <li>• Input manuale opzionale</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Tre passi per iniziare
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connetti i tuoi dati</h3>
              <p className="text-gray-600">
                Sincronizza Health app o inserisci manualmente sonno, passi e umore quotidiano
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ricevi il tuo LifeScore</h3>
              <p className="text-gray-600">
                L'AI analizza i tuoi pattern e calcola il punteggio benessere giornaliero
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Segui i consigli</h3>
              <p className="text-gray-600">
                Ricevi suggerimenti personalizzati con tutorial step-by-step per migliorare
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Pronto a trasformare la tua vita?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Unisciti a migliaia di persone che ogni giorno migliorano il loro benessere con LifeOS
            </p>
            <Link 
              href="/sign-in"
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-block"
            >
              Inizia Gratis Oggi
            </Link>
            <p className="text-sm text-blue-200 mt-4">
              Nessuna carta di credito richiesta • Setup in 2 minuti
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
