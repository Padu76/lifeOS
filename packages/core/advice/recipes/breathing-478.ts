import { Suggestion } from '../../../types';

export const breathing478: Suggestion = {
  id: 'breathing-478-uuid',
  key: 'breathing-478',
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
      animation_type: null
    },
    {
      step: 2,
      instruction: 'Posiziona la punta della lingua contro i denti superiori',
      duration_sec: 10,
      animation_type: null
    },
    {
      step: 3,
      instruction: 'Espira completamente attraverso la bocca facendo un suono "whoosh"',
      duration_sec: 8,
      animation_type: null
    },
    {
      step: 4,
      instruction: 'Chiudi la bocca e inspira silenziosamente dal naso contando fino a 4',
      duration_sec: 4,
      animation_type: 'breathing_circle'
    },
    {
      step: 5,
      instruction: 'Trattieni il respiro contando fino a 7',
      duration_sec: 7,
      animation_type: 'breathing_circle'
    },
    {
      step: 6,
      instruction: 'Espira dalla bocca contando fino a 8 con il suono "whoosh"',
      duration_sec: 8,
      animation_type: 'breathing_circle'
    },
    {
      step: 7,
      instruction: 'Questo completa un ciclo. Ripeti 3-4 volte per il massimo beneficio',
      duration_sec: 68,
      animation_type: 'breathing_circle',
      audio_cue: 'Inspira 4... trattieni 7... espira 8...'
    }
  ],
  triggers: [
    {
      condition: 'high_stress',
      priority: 8
    },
    {
      condition: 'burnout_risk',
      priority: 9
    }
  ]
};

export const breathing5Count: Suggestion = {
  id: 'breathing-5count-uuid',
  key: 'breathing-5count',
  title: 'Respirazione 5-5',
  short_copy: 'Respirazione equilibrata per calmare la mente',
  category: 'breathing',
  duration_sec: 180,
  difficulty: 1,
  tutorial: [
    {
      step: 1,
      instruction: 'Siediti comodamente con la schiena dritta',
      duration_sec: 10,
      animation_type: null
    },
    {
      step: 2,
      instruction: 'Chiudi gli occhi o fissa un punto fisso',
      duration_sec: 5,
      animation_type: null
    },
    {
      step: 3,
      instruction: 'Inspira lentamente dal naso contando fino a 5',
      duration_sec: 5,
      animation_type: 'breathing_circle'
    },
    {
      step: 4,
      instruction: 'Espira lentamente dalla bocca contando fino a 5',
      duration_sec: 5,
      animation_type: 'breathing_circle'
    },
    {
      step: 5,
      instruction: 'Continua questo ritmo per 3 minuti, concentrandoti solo sul respiro',
      duration_sec: 155,
      animation_type: 'breathing_circle',
      audio_cue: 'Inspira 5... espira 5... concentrati solo sul respiro'
    }
  ],
  triggers: [
    {
      condition: 'high_stress',
      priority: 6
    },
    {
      condition: 'declining_trend',
      priority: 5
    }
  ]
};
