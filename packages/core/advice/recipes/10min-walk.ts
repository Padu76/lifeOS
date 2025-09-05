import { Suggestion } from '../../../types';

export const walk10min: Suggestion = {
  id: 'walk-10min-uuid',
  key: 'walk-10min',
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
      animation_type: null
    },
    {
      step: 2,
      instruction: 'Inizia con passi lenti per riscaldare i muscoli',
      duration_sec: 60,
      animation_type: 'movement',
      audio_cue: 'Inizia dolcemente... senti i piedi che toccano il suolo'
    },
    {
      step: 3,
      instruction: 'Aumenta gradualmente il ritmo fino a un passo sostenuto',
      duration_sec: 120,
      animation_type: 'movement',
      audio_cue: 'Trova il tuo ritmo naturale... respira profondamente'
    },
    {
      step: 4,
      instruction: 'Concentrati sulla postura: spalle rilassate, sguardo avanti',
      duration_sec: 120,
      animation_type: 'movement',
      audio_cue: 'Postura eretta... spalle rilassate... sguardo verso l\'orizzonte'
    },
    {
      step: 5,
      instruction: 'Nota l\'ambiente: colori, suoni, profumi intorno a te',
      duration_sec: 180,
      animation_type: null,
      audio_cue: 'Sii presente... nota i dettagli dell\'ambiente circostante'
    },
    {
      step: 6,
      instruction: 'Ultimi 2 minuti: rallenta gradualmente il passo',
      duration_sec: 90,
      animation_type: 'movement',
      audio_cue: 'Rallenta dolcemente... senti l\'energia che circola nel corpo'
    }
  ],
  triggers: [
    {
      condition: 'low_activity',
      priority: 9
    },
    {
      condition: 'declining_trend',
      priority: 6
    }
  ]
};

export const stretchingBasic: Suggestion = {
  id: 'stretching-basic-uuid',
  key: 'stretching-basic',
  title: 'Stretching da Scrivania',
  short_copy: 'Esercizi di allungamento per chi lavora seduto',
  category: 'movement',
  duration_sec: 360,
  difficulty: 1,
  tutorial: [
    {
      step: 1,
      instruction: 'Alzati dalla sedia e trova uno spazio libero',
      duration_sec: 10,
      animation_type: null
    },
    {
      step: 2,
      instruction: 'Rotazioni del collo: lentamente a destra, poi a sinistra',
      duration_sec: 30,
      animation_type: 'movement',
      audio_cue: 'Movimenti lenti e controllati... ascolta il tuo corpo'
    },
    {
      step: 3,
      instruction: 'Spalle: alzale verso le orecchie, mantieni 5 secondi, rilascia',
      duration_sec: 30,
      animation_type: 'movement',
      audio_cue: 'Spalle su... mantieni... rilascia completamente'
    },
    {
      step: 4,
      instruction: 'Rotazioni delle spalle: 5 volte avanti, 5 volte indietro',
      duration_sec: 40,
      animation_type: 'movement',
      audio_cue: 'Cerchi ampi e fluidi... mobilizza tutta la spalla'
    },
    {
      step: 5,
      instruction: 'Allungamento laterale: braccio destro sopra la testa, piega a sinistra',
      duration_sec: 30,
      animation_type: 'movement',
      audio_cue: 'Senti l\'allungamento lungo il fianco... respira'
    },
    {
      step: 6,
      instruction: 'Ripeti dall\'altro lato: braccio sinistro, piega a destra',
      duration_sec: 30,
      animation_type: 'movement',
      audio_cue: 'Stesso allungamento dall\'altro lato'
    },
    {
      step: 7,
      instruction: 'Torsione spinale: mani sui fianchi, ruota il busto a destra',
      duration_sec: 25,
      animation_type: 'movement',
      audio_cue: 'Torsione controllata... mobilizza la colonna'
    },
    {
      step: 8,
      instruction: 'Torsione a sinistra, mantieni la postura eretta',
      duration_sec: 25,
      animation_type: 'movement'
    },
    {
      step: 9,
      instruction: 'Allungamento polpacci: un piede avanti, tallone a terra',
      duration_sec: 30,
      animation_type: 'movement',
      audio_cue: 'Senti l\'allungamento dietro la gamba'
    },
    {
      step: 10,
      instruction: 'Cambia gamba e ripeti l\'allungamento',
      duration_sec: 30,
      animation_type: 'movement'
    },
    {
      step: 11,
      instruction: 'Respiri profondi per concludere: inspira alzando le braccia',
      duration_sec: 20,
      animation_type: 'breathing_circle',
      audio_cue: 'Respiri finali... senti il corpo riattivato'
    }
  ],
  triggers: [
    {
      condition: 'low_activity',
      priority: 7
    },
    {
      condition: 'high_stress',
      priority: 4
    }
  ]
};

export const powerNap: Suggestion = {
  id: 'power-nap-uuid',
  key: 'power-nap',
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
      animation_type: null
    },
    {
      step: 2,
      instruction: 'Imposta una sveglia per 15 minuti (non di più)',
      duration_sec: 15,
      animation_type: null
    },
    {
      step: 3,
      instruction: 'Sdraiati o siediti comodamente, chiudi gli occhi',
      duration_sec: 30,
      animation_type: null
    },
    {
      step: 4,
      instruction: 'Rilassa tutti i muscoli partendo dai piedi',
      duration_sec: 60,
      animation_type: null,
      audio_cue: 'Rilassa piedi... gambe... tutto il corpo diventa pesante'
    },
    {
      step: 5,
      instruction: 'Respira lentamente e profondamente',
      duration_sec: 120,
      animation_type: 'breathing_circle',
      audio_cue: 'Respiro lento e profondo... lasciati andare'
    },
    {
      step: 6,
      instruction: 'Non forzare il sonno, accetta qualsiasi stato di riposo',
      duration_sec: 600,
      animation_type: null,
      audio_cue: 'Non importa se non dormi... il riposo è già benefico'
    },
    {
      step: 7,
      instruction: 'Quando suona la sveglia, svegliati lentamente',
      duration_sec: 30,
      animation_type: null
    },
    {
      step: 8,
      instruction: 'Muovi delicatamente mani e piedi prima di alzarti',
      duration_sec: 15,
      animation_type: 'movement'
    }
  ],
  triggers: [
    {
      condition: 'low_sleep',
      priority: 8
    },
    {
      condition: 'declining_trend',
      priority: 5
    }
  ]
};
