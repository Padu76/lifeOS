'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import SuggestionCard from '../../components/SuggestionCard';
import TutorialManager from '../../components/TutorialManager';

// Enhanced tutorial data with voice guidance
const TUTORIAL_DATA: { [key: string]: any } = {
  'breathing-478': {
    title: 'Respirazione 4-7-8',
    short_copy: 'Tecnica di respirazione per ridurre stress e ansia in 2 minuti',
    category: 'breathing',
    duration_sec: 120,
    difficulty: 1,
    tutorial: [
      {
        step: 1,
        instruction: 'Trova una posizione comoda seduto o sdraiato',
        duration_sec: 15,
        animation_type: null,
        voice_guidance: {
          start: 'Benvenuto nella sessione di respirazione 4-7-8. Questa tecnica ti aiuterà a ridurre stress e ansia.',
          during: 'Scegli una posizione in cui ti senti stabile e rilassato.'
        }
      },
      {
        step: 2,
        instruction: 'Posiziona la punta della lingua contro i denti superiori',
        duration_sec: 10,
        animation_type: null,
        voice_guidance: {
          start: 'Posiziona delicatamente la punta della lingua dietro i denti superiori.',
          during: 'Mantieni questa posizione per tutta la pratica.'
        }
      },
      {
        step: 3,
        instruction: 'Espira completamente attraverso la bocca facendo un suono "whoosh"',
        duration_sec: 8,
        animation_type: null,
        voice_guidance: {
          start: 'Ora espira completamente attraverso la bocca.',
          during: 'Fai un suono whoosh mentre espiri tutto l\'aria.'
        }
      },
      {
        step: 4,
        instruction: 'Inspira silenziosamente dal naso contando fino a 4',
        duration_sec: 4,
        animation_type: 'breathing_circle',
        voice_guidance: {
          start: 'Chiudi la bocca e inspira lentamente dal naso.',
          during: 'Inspira per quattro secondi.'
        }
      },
      {
        step: 5,
        instruction: 'Trattieni il respiro contando fino a 7',
        duration_sec: 7,
        animation_type: 'breathing_circle',
        voice_guidance: {
          start: 'Ora trattieni il respiro.',
          during: 'Mantieni l\'aria nei polmoni per sette secondi.'
        }
      },
      {
        step: 6,
        instruction: 'Espira dalla bocca contando fino a 8 con il suono "whoosh"',
        duration_sec: 8,
        animation_type: 'breathing_circle',
        voice_guidance: {
          start: 'Espira lentamente dalla bocca.',
          during: 'Fai il suono whoosh per otto secondi.'
        }
      },
      {
        step: 7,
        instruction: 'Ripeti il ciclo 3-4 volte per il massimo beneficio',
        duration_sec: 68,
        animation_type: 'breathing_circle',
        audio_cue: 'Inspira 4... trattieni 7... espira 8...',
        voice_guidance: {
          start: 'Ottimo! Ora ripetiamo insieme questo ciclo.',
          during: 'Continua a seguire il ritmo. Lascia che il respiro ti calmi.',
          end: 'Perfetto. Senti come il tuo corpo si è rilassato. Porta questa calma con te.'
        }
      }
    ]
  },
  'meditation-5min': {
    title: 'Meditazione Mindfulness',
    short_copy: 'Sessione guidata di 5 minuti per centrare mente e corpo',
    category: 'meditation',
    duration_sec: 300,
    difficulty: 2,
    tutorial: [
      {
        step: 1,
        instruction: 'Trova un posto tranquillo dove non verrai disturbato',
        duration_sec: 15,
        animation_type: null,
        voice_guidance: {
          start: 'Benvenuto in questa sessione di meditazione mindfulness di cinque minuti.',
          during: 'Scegli uno spazio dove ti senti sicuro e tranquillo.'
        }
      },
      {
        step: 2,
        instruction: 'Siediti comodamente con la schiena dritta, piedi appoggiati a terra',
        duration_sec: 15,
        animation_type: null,
        voice_guidance: {
          start: 'Trova una posizione seduta comoda.',
          during: 'La schiena eretta ma non rigida. I piedi ben appoggiati al suolo.'
        }
      },
      {
        step: 3,
        instruction: 'Chiudi delicatamente gli occhi o abbassa lo sguardo',
        duration_sec: 10,
        animation_type: null,
        voice_guidance: {
          start: 'Ora chiudi dolcemente gli occhi.',
          during: 'Oppure abbassa lo sguardo verso il basso se preferisci.'
        }
      },
      {
        step: 4,
        instruction: 'Porta l\'attenzione al tuo respiro naturale, senza modificarlo',
        duration_sec: 60,
        animation_type: 'breathing_circle',
        voice_guidance: {
          start: 'Porta la tua attenzione al respiro.',
          during: 'Non cercare di cambiarlo. Osserva semplicemente come fluisce naturalmente.',
          end: 'Nota come l\'aria entra ed esce dal tuo corpo.'
        }
      },
      {
        step: 5,
        instruction: 'Quando la mente vaga, gentilmente riporta l\'attenzione al respiro',
        duration_sec: 120,
        animation_type: 'breathing_circle',
        voice_guidance: {
          start: 'È normale che la mente vaghi.',
          during: 'Quando noti che stai pensando, riporta dolcemente l\'attenzione al respiro. Senza giudizio.',
          end: 'Ogni volta che torni al respiro, stai rafforzando la tua consapevolezza.'
        }
      },
      {
        step: 6,
        instruction: 'Nota le sensazioni del corpo: tensioni, calore, contatto con la sedia',
        duration_sec: 45,
        animation_type: null,
        voice_guidance: {
          start: 'Ora espandi la tua consapevolezza al corpo.',
          during: 'Nota le sensazioni: dove tocchi la sedia, eventuali tensioni, la temperatura.',
          end: 'Semplicemente osserva, senza bisogno di cambiare nulla.'
        }
      },
      {
        step: 7,
        instruction: 'Torna al respiro, lascia che sia il tuo ancoraggio nel presente',
        duration_sec: 45,
        animation_type: 'breathing_circle',
        voice_guidance: {
          start: 'Torna ancora una volta al respiro.',
          during: 'Il respiro è sempre qui, nel momento presente. È il tuo ancoraggio.',
          end: 'Questo momento, questo respiro, è tutto ciò che esiste ora.'
        }
      },
      {
        step: 8,
        instruction: 'Muovi delicatamente dita delle mani e dei piedi',
        duration_sec: 15,
        animation_type: null,
        voice_guidance: {
          start: 'Iniziamo a tornare gentilmente.',
          during: 'Muovi lentamente le dita delle mani e dei piedi.',
          end: 'Porta questa presenza mentale con te nel resto della giornata.'
        }
      }
    ]
  },
  'walk-10min': {
    title: 'Camminata Energizzante',
    short_copy: 'Passeggiata di 10 minuti per riattivare corpo e mente',
    category: 'movement',
    duration_sec: 600,
    difficulty: 1,
    tutorial: [
      {
        step: 1,
        instruction: 'Indossa scarpe comode e abbigliamento adeguato',
        duration_sec: 30,
        animation_type: null,
        voice_guidance: {
          start: 'Benvenuto alla tua camminata energizzante di dieci minuti.',
          during: 'Assicurati di indossare scarpe comode e abbigliamento adeguato al tempo.'
        }
      },
      {
        step: 2,
        instruction: 'Inizia con passi lenti per riscaldare i muscoli',
        duration_sec: 60,
        animation_type: 'movement',
        voice_guidance: {
          start: 'Inizia a camminare lentamente.',
          during: 'Senti i piedi che toccano il suolo. Ogni passo risveglia il tuo corpo.',
          end: 'I muscoli si stanno riscaldando. Respira naturalmente.'
        }
      },
      {
        step: 3,
        instruction: 'Aumenta gradualmente il ritmo fino a un passo sostenuto',
        duration_sec: 240,
        animation_type: 'movement',
        voice_guidance: {
          start: 'Ora trova il tuo ritmo naturale.',
          during: 'Accelera gradualmente. Respira profondamente. Senti l\'energia che aumenta.',
          end: 'Perfetto. Mantieni questo ritmo che ti fa sentire vivo ed energico.'
        }
      },
      {
        step: 4,
        instruction: 'Concentrati sulla postura: spalle rilassate, sguardo avanti',
        duration_sec: 180,
        animation_type: 'movement',
        voice_guidance: {
          start: 'Controlla la tua postura.',
          during: 'Spalle rilassate, schiena dritta. Lo sguardo verso l\'orizzonte. Cammina con fiducia.',
          end: 'Senti come una buona postura ti dà energia e presenza.'
        }
      },
      {
        step: 5,
        instruction: 'Nota l\'ambiente: colori, suoni, profumi intorno a te',
        duration_sec: 120,
        animation_type: null,
        voice_guidance: {
          start: 'Ora apri i tuoi sensi all\'ambiente.',
          during: 'Nota i colori, i suoni, i profumi. Sii presente in questo momento.',
          end: 'Questa consapevolezza rende ogni camminata un\'esperienza ricca.'
        }
      }
    ]
  },
  'power-nap': {
    title: 'Power Nap Rigenerante',
    short_copy: 'Micro-sonno di 15 minuti per ricaricare energia',
    category: 'rest',
    duration_sec: 900,
    difficulty: 2,
    tutorial: [
      {
        step: 1,
        instruction: 'Trova un posto tranquillo e confortevole',
        duration_sec: 30,
        animation_type: null,
        voice_guidance: {
          start: 'Benvenuto alla tua sessione di power nap rigenerante.',
          during: 'Trova un luogo tranquillo dove puoi rilassarti completamente per quindici minuti.'
        }
      },
      {
        step: 2,
        instruction: 'Imposta una sveglia per 15 minuti (non di più)',
        duration_sec: 15,
        animation_type: null,
        voice_guidance: {
          start: 'È importante impostare una sveglia.',
          during: 'Quindici minuti è la durata perfetta per ricaricarti senza sentirti intontito.'
        }
      },
      {
        step: 3,
        instruction: 'Sdraiati o siediti comodamente, chiudi gli occhi',
        duration_sec: 30,
        animation_type: null,
        voice_guidance: {
          start: 'Trova la posizione più comoda per te.',
          during: 'Chiudi dolcemente gli occhi e inizia a lasciare andare le tensioni.',
          end: 'Permetti al tuo corpo di sprofondare nella superficie su cui riposi.'
        }
      },
      {
        step: 4,
        instruction: 'Rilassa tutti i muscoli partendo dai piedi',
        duration_sec: 120,
        animation_type: null,
        voice_guidance: {
          start: 'Iniziamo un rilassamento progressivo.',
          during: 'Parti dai piedi... le gambe... l\'addome... le spalle... il viso. Ogni muscolo si rilassa.',
          end: 'Tutto il corpo ora è pesante e rilassato.'
        }
      },
      {
        step: 5,
        instruction: 'Respira lentamente e profondamente',
        duration_sec: 180,
        animation_type: 'breathing_circle',
        voice_guidance: {
          start: 'Porta l\'attenzione al respiro.',
          during: 'Respiri lenti e profondi. Ogni espirazione ti porta più in profondità nel rilassamento.',
          end: 'Lascia che il respiro ti guidi verso un riposo rigenerante.'
        }
      },
      {
        step: 6,
        instruction: 'Non forzare il sonno, accetta qualsiasi stato di riposo',
        duration_sec: 510,
        animation_type: null,
        voice_guidance: {
          start: 'Non è necessario dormire profondamente.',
          during: 'Anche solo riposare la mente è rigenerante. Lasciati andare senza aspettative.',
          end: 'Il tuo corpo e la tua mente si stanno ricaricando naturalmente.'
        }
      },
      {
        step: 7,
        instruction: 'Muovi delicatamente mani e piedi prima di alzarti',
        duration_sec: 15,
        animation_type: 'movement',
        voice_guidance: {
          start: 'È ora di tornare dolcemente.',
          during: 'Muovi lentamente le dita, stira delicatamente il corpo.',
          end: 'Ti senti rigenerato e pronto per continuare la giornata con energia rinnovata.'
        }
      }
    ]
  }
};

type UserSuggestion = {
  id: number;
  date: string;
  suggestion_id?: number;
  suggestion_key?: string;
  priority?: number;
  reason?: string;
  completed: boolean;
  suggestion?: {
    id: string;
    key: string;
    title: string;
    short_copy: string | null;
    duration_sec: number | null;
    category?: string;
  } | null;
};

function todayISODate() {
  const d = new Date();
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return iso.toISOString().slice(0, 10);
}

export default function SuggestionsPage() {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTutorial, setCurrentTutorial] = useState<any | null>(null);
  const [triggeringRollup, setTriggeringRollup] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    setMsg(null);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMsg('Non sei autenticato. Accedi per vedere i tuoi suggerimenti.');
      setLoading(false);
      return;
    }
    
    const user = session.user;
    setUserId(user.id);

    try {
      const date = todayISODate();
      
      // Try to get suggestions from user_suggestions table (generated by Edge Function)
      const { data: userSuggestions, error: suggestionsError } = await supabase
        .from('user_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('priority', { ascending: false });

      if (suggestionsError) {
        console.warn('Error loading user suggestions:', suggestionsError);
      }

      let processedSuggestions: UserSuggestion[] = [];

      if (userSuggestions && userSuggestions.length > 0) {
        // We have AI-generated suggestions
        processedSuggestions = userSuggestions.map(us => {
          const suggestionKey = us.suggestion_key;
          const tutorialData = TUTORIAL_DATA[suggestionKey];
          
          return {
            id: us.id,
            date: us.date,
            suggestion_key: suggestionKey,
            priority: us.priority || 5,
            reason: us.reason,
            completed: us.completed,
            suggestion: tutorialData ? {
              id: suggestionKey,
              key: suggestionKey,
              title: tutorialData.title,
              short_copy: tutorialData.short_copy,
              duration_sec: tutorialData.duration_sec,
              category: tutorialData.category
            } : null
          };
        }).filter(s => s.suggestion); // Only include suggestions with tutorial data
      } else {
        // No AI suggestions yet, show default ones based on user's recent LifeScore
        const { data: recentScore } = await supabase
          .from('lifescores')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1);

        // Generate default suggestions based on score or provide fallbacks
        const defaultSuggestions = ['breathing-478', 'meditation-5min', 'walk-10min'];
        
        processedSuggestions = defaultSuggestions.map((key, index) => {
          const tutorialData = TUTORIAL_DATA[key];
          return {
            id: index + 1000, // temporary ID
            date: date,
            suggestion_key: key,
            priority: 5,
            reason: 'Suggerimento di benessere generale',
            completed: false,
            suggestion: {
              id: key,
              key: key,
              title: tutorialData.title,
              short_copy: tutorialData.short_copy,
              duration_sec: tutorialData.duration_sec,
              category: tutorialData.category
            }
          };
        });
      }

      setSuggestions(processedSuggestions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setMsg('Errore nel caricamento dei suggerimenti');
      setLoading(false);
    }
  };

  const triggerDailyRollup = async () => {
    if (!userId) return;
    
    setTriggeringRollup(true);
    try {
      // Call the Edge Function to generate new suggestions
      const response = await fetch('https://gkchrasexlqwlvrtcaug.functions.supabase.co/daily-rollup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: todayISODate()
        })
      });
      
      if (response.ok) {
        // Reload suggestions after Edge Function completes
        setTimeout(() => {
          loadSuggestions();
        }, 2000);
        setMsg('Suggerimenti aggiornati con l\'AI! I nuovi consigli includono guida vocale personalizzata.');
      } else {
        setMsg('Errore nell\'aggiornamento dei suggerimenti');
      }
    } catch (error) {
      console.error('Error triggering rollup:', error);
      setMsg('Errore di connessione');
    }
    setTriggeringRollup(false);
  };

  const handleStartTutorial = (suggestionKey: string) => {
    const tutorialData = TUTORIAL_DATA[suggestionKey];
    if (tutorialData) {
      setCurrentTutorial({
        id: suggestionKey,
        key: suggestionKey,
        ...tutorialData
      });
    }
  };

  const handleCompleteTutorial = async (timeSpent: number, feedback?: number) => {
    if (!currentTutorial || !userId) return;

    try {
      // Find the suggestion to mark as completed
      const suggestion = suggestions.find(s => s.suggestion_key === currentTutorial.key);
      
      if (suggestion && suggestion.id < 1000) { // Only update real DB suggestions, not temporary ones
        const { error } = await supabase
          .from('user_suggestions')
          .update({
            completed: true,
            feedback_mood: feedback,
            time_spent_sec: timeSpent
          })
          .eq('id', suggestion.id);

        if (error) {
          console.error('Error updating suggestion:', error);
        }
      }

      // Update local state
      setSuggestions(prev => 
        prev.map(s => 
          s.suggestion_key === currentTutorial.key 
            ? { ...s, completed: true }
            : s
        )
      );

      setCurrentTutorial(null);
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  };

  const handleSkipSuggestion = async (suggestionKey: string) => {
    // Mark as completed without doing the tutorial
    const suggestion = suggestions.find(s => s.suggestion_key === suggestionKey);
    
    if (suggestion && suggestion.id < 1000) {
      await supabase
        .from('user_suggestions')
        .update({ completed: true })
        .eq('id', suggestion.id);
    }

    setSuggestions(prev => 
      prev.map(s => 
        s.suggestion_key === suggestionKey 
          ? { ...s, completed: true }
          : s
      )
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento suggerimenti con guida vocale...</p>
        </div>
      </div>
    );
  }

  if (msg && msg.includes('autenticato')) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Richiesto</h1>
          <p className="text-gray-600 mb-6">{msg}</p>
          <Link 
            href="/sign-in"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Vai al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">I tuoi suggerimenti</h1>
        <p className="text-gray-600">Consigli personalizzati con guida vocale per migliorare il tuo benessere</p>
        
        {/* Voice feature highlight */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎤</span>
            <div>
              <h3 className="font-semibold text-purple-900">Guida Vocale Attiva</h3>
              <p className="text-sm text-purple-700">I tutorial includono istruzioni vocali personalizzate per ogni esercizio</p>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={triggerDailyRollup}
            disabled={triggeringRollup}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
          >
            {triggeringRollup ? 'Generazione...' : '🤖 Aggiorna con AI'}
          </button>
          
          <Link
            href="/checkin"
            className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
          >
            📊 Nuovo Check-in
          </Link>
        </div>
      </div>

      {/* Status messages */}
      {msg && (
        <div className={`mb-6 p-4 rounded-lg ${
          msg.includes('Errore') 
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {msg}
        </div>
      )}

      {/* Suggestions grid */}
      {suggestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💡</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nessun suggerimento per oggi</h2>
          <p className="text-gray-600 mb-6">
            Completa un check-in per ricevere consigli personalizzati con guida vocale
          </p>
          <Link
            href="/checkin"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Inizia Check-in
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={{
                id: suggestion.suggestion?.id || '',
                key: suggestion.suggestion_key || '',
                title: suggestion.suggestion?.title || '',
                short_copy: suggestion.suggestion?.short_copy || '',
                category: suggestion.suggestion?.category as any || 'breathing',
                duration_sec: suggestion.suggestion?.duration_sec || 300,
                difficulty: TUTORIAL_DATA[suggestion.suggestion_key || '']?.difficulty || 1,
                priority: suggestion.priority || 5,
                reason: suggestion.reason,
                completed: suggestion.completed
              }}
              onStart={handleStartTutorial}
              onSkip={handleSkipSuggestion}
            />
          ))}
        </div>
      )}

      {/* Tutorial Manager */}
      {currentTutorial && (
        <TutorialManager
          suggestion={currentTutorial}
          isOpen={!!currentTutorial}
          onClose={() => setCurrentTutorial(null)}
          onComplete={handleCompleteTutorial}
          onExit={() => setCurrentTutorial(null)}
        />
      )}
    </div>
  );
}
