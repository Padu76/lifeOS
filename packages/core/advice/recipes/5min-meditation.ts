import { Suggestion } from '../../../types';

export const meditation5min: Suggestion = {
  id: 'meditation-5min-uuid',
  key: 'meditation-5min',
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
      animation_type: null
    },
    {
      step: 2,
      instruction: 'Siediti comodamente con la schiena dritta, piedi appoggiati a terra',
      duration_sec: 15,
      animation_type: null
    },
    {
      step: 3,
      instruction: 'Chiudi delicatamente gli occhi o abbassa lo sguardo',
      duration_sec: 10,
      animation_type: null
    },
    {
      step: 4,
      instruction: 'Porta l\'attenzione al tuo respiro naturale, senza modificarlo',
      duration_sec: 30,
      animation_type: 'breathing_circle',
      audio_cue: 'Respira naturalmente... osserva il flusso dell\'aria che entra ed esce'
    },
    {
      step: 5,
      instruction: 'Quando la mente vaga, gentilmente riporta l\'attenzione al respiro',
      duration_sec: 60,
      animation_type: 'breathing_circle',
      audio_cue: 'Se i pensieri arrivano, lasciali andare... torna al respiro'
    },
    {
      step: 6,
      instruction: 'Nota le sensazioni del corpo: tensioni, calore, contatto con la sedia',
      duration_sec: 45,
      animation_type: null,
      audio_cue: 'Esplora le sensazioni del corpo... senza giudicare'
    },
    {
      step: 7,
      instruction: 'Torna al respiro, lascia che sia il tuo ancoraggio nel presente',
      duration_sec: 60,
      animation_type: 'breathing_circle',
      audio_cue: 'Il respiro come ancora... sempre disponibile nel momento presente'
    },
    {
      step: 8,
      instruction: 'Espandi la consapevolezza: suoni, odori, tutto l\'ambiente circostante',
      duration_sec: 30,
      animation_type: null,
      audio_cue: 'Amplia la tua consapevolezza... percepisci l\'ambiente intorno'
    },
    {
      step: 9,
      instruction: 'Muovi delicatamente dita delle mani e dei piedi',
      duration_sec: 15,
      animation_type: null
    },
    {
      step: 10,
      instruction: 'Quando sei pronto, apri lentamente gli occhi',
      duration_sec: 20,
      animation_type: null,
      audio_cue: 'Porta questa calma con te nel resto della giornata'
    }
  ],
  triggers: [
    {
      condition: 'high_stress',
      priority: 7
    },
    {
      condition: 'burnout_risk',
      priority: 8
    },
    {
      condition: 'declining_trend',
      priority: 6
    }
  ]
};

export const bodyScan: Suggestion = {
  id: 'body-scan-uuid',
  key: 'body-scan',
  title: 'Body Scan Rilassante',
  short_copy: 'Scansione corporea per rilasciare tensioni',
  category: 'meditation',
  duration_sec: 420,
  difficulty: 2,
  tutorial: [
    {
      step: 1,
      instruction: 'Sdraiati comodamente sulla schiena, braccia lungo i fianchi',
      duration_sec: 20,
      animation_type: null
    },
    {
      step: 2,
      instruction: 'Chiudi gli occhi e fai tre respiri profondi',
      duration_sec: 20,
      animation_type: 'breathing_circle'
    },
    {
      step: 3,
      instruction: 'Porta l\'attenzione alla sommità della testa, nota tutte le sensazioni',
      duration_sec: 30,
      animation_type: null,
      audio_cue: 'Inizia dalla testa... nota tensioni, calore, formicolii'
    },
    {
      step: 4,
      instruction: 'Scendi lentamente verso fronte, occhi, guance, mascella',
      duration_sec: 45,
      animation_type: null,
      audio_cue: 'Rilassa la fronte... gli occhi... lascia andare la tensione della mascella'
    },
    {
      step: 5,
      instruction: 'Passa al collo e alle spalle, spesso accumulo di stress',
      duration_sec: 45,
      animation_type: null,
      audio_cue: 'Collo e spalle... zone che trattengono stress... lascia che si ammorbidiscano'
    },
    {
      step: 6,
      instruction: 'Continua con braccia, avambracci, mani e dita',
      duration_sec: 60,
      animation_type: null,
      audio_cue: 'Braccia completamente rilassate... dalle spalle fino alla punta delle dita'
    },
    {
      step: 7,
      instruction: 'Petto e respiro: senti l\'espansione e contrazione naturale',
      duration_sec: 45,
      animation_type: 'breathing_circle',
      audio_cue: 'Il petto che si espande e si contrae... respiro libero e naturale'
    },
    {
      step: 8,
      instruction: 'Addome, schiena, bacino: centro del corpo, lascia andare',
      duration_sec: 60,
      animation_type: null,
      audio_cue: 'Centro del corpo... addome morbido... schiena che si rilassa'
    },
    {
      step: 9,
      instruction: 'Gambe, cosce, polpacci, piedi: sostegno che si abbandona',
      duration_sec: 75,
      animation_type: null,
      audio_cue: 'Gambe pesanti e rilassate... piedi completamente abbandonati'
    },
    {
      step: 10,
      instruction: 'Tutto il corpo ora rilassato, respira nella totalità',
      duration_sec: 20,
      animation_type: 'breathing_circle',
      audio_cue: 'Tutto il corpo in pace... porta questa sensazione con te'
    }
  ],
  triggers: [
    {
      condition: 'high_stress',
      priority: 6
    },
    {
      condition: 'low_sleep',
      priority: 5
    }
  ]
};
