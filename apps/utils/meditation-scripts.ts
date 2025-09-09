// Interfacce per la meditazione
export interface UserProfile {
  stressLevel: 'low' | 'medium' | 'high';
  energyLevel: 'low' | 'medium' | 'high';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  preferredStyle: 'breathing-focused' | 'mindfulness' | 'body-scan' | 'loving-kindness';
}

export interface MeditationStep {
  time: number;
  text: string;
  type: 'intro' | 'instruction' | 'breathing' | 'encouragement' | 'guidance' | 'visualization' | 'mantra' | 'body_awareness' | 'transition' | 'awakening' | 'conclusion' | 'mindfulness' | 'release' | 'presence' | 'gratitude' | 'integration';
}

// Profilo utente di esempio
export const mockUserProfile: UserProfile = {
  stressLevel: 'high',
  energyLevel: 'low', 
  experienceLevel: 'beginner',
  timeOfDay: 'evening',
  preferredStyle: 'breathing-focused'
};

// Script di meditazione personalizzati
export const getMeditationScript = (profile: UserProfile, duration: number): MeditationStep[] => {
  const scripts: Record<string, MeditationStep[]> = {
    high_stress_beginner: [
      { time: 0, text: "Benvenuto. Trova una posizione comoda e chiudi gli occhi.", type: "intro" },
      { time: 10, text: "Porta l'attenzione al tuo respiro naturale, senza forzarlo.", type: "instruction" },
      { time: 30, text: "Inspira lentamente per 4 secondi...", type: "breathing" },
      { time: 40, text: "Trattieni per 2 secondi...", type: "breathing" },
      { time: 50, text: "Espira dolcemente per 6 secondi...", type: "breathing" },
      { time: 70, text: "Perfetto. Continua con questo ritmo naturale.", type: "encouragement" },
      { time: 90, text: "Se la mente vaga, è normale. Torna gentilmente al respiro.", type: "guidance" },
      { time: 120, text: "Senti come ogni espiro rilascia la tensione del giorno.", type: "visualization" },
      { time: 150, text: "Inspira calma, espira stress...", type: "mantra" },
      { time: 180, text: "Ancora qualche respiro profondo...", type: "instruction" },
      { time: 210, text: "Senti il tuo corpo completamente rilassato.", type: "body_awareness" },
      { time: 240, text: "Tra poco termineremo. Goditi questi ultimi momenti di pace.", type: "transition" },
      { time: 270, text: "Muovi delicatamente le dita delle mani e dei piedi.", type: "awakening" },
      { time: 285, text: "Quando sei pronto, apri gli occhi. Ben fatto!", type: "conclusion" }
    ],
    low_energy_evening: [
      { time: 0, text: "È stata una lunga giornata. È tempo di rilasciare tutto.", type: "intro" },
      { time: 15, text: "Lascia che il tuo corpo si abbandoni completamente.", type: "instruction" },
      { time: 35, text: "Respira profondamente, come onde che si infrangono dolcemente.", type: "breathing" },
      { time: 60, text: "Ogni respiro ti porta più in profondità nel rilassamento.", type: "visualization" },
      { time: 90, text: "Immagina di galleggiare su un lago tranquillo.", type: "visualization" },
      { time: 120, text: "La tua mente diventa silenziosa come l'acqua calma.", type: "mindfulness" },
      { time: 150, text: "Lascia andare i pensieri della giornata...", type: "release" },
      { time: 180, text: "Sei qui, ora, in perfetta pace.", type: "presence" },
      { time: 210, text: "Senti gratitudine per questo momento di calma.", type: "gratitude" },
      { time: 240, text: "Preparati dolcemente a tornare.", type: "transition" },
      { time: 270, text: "Porta questa calma con te.", type: "integration" },
      { time: 285, text: "Apri gli occhi quando ti senti pronto.", type: "conclusion" }
    ],
    medium_stress_intermediate: [
      { time: 0, text: "Siediti comodamente e prendi un momento per arrivare qui.", type: "intro" },
      { time: 20, text: "Osserva il tuo respiro senza giudicarlo.", type: "instruction" },
      { time: 45, text: "Nota le sensazioni del corpo contro la sedia.", type: "body_awareness" },
      { time: 75, text: "Se emergono pensieri, semplicemente notali.", type: "mindfulness" },
      { time: 105, text: "Torna sempre al respiro come al tuo ancoraggio.", type: "guidance" },
      { time: 135, text: "Inspira presenza, espira tensione.", type: "mantra" },
      { time: 165, text: "Senti lo spazio di calma che stai creando.", type: "visualization" },
      { time: 195, text: "Questo momento di pace ti appartiene.", type: "encouragement" },
      { time: 225, text: "Gradualmente espandi la consapevolezza.", type: "transition" },
      { time: 255, text: "Muovi lentamente le dita e i piedi.", type: "awakening" },
      { time: 285, text: "Apri gli occhi portando questa presenza con te.", type: "conclusion" }
    ]
  };

  const primaryKey = `${profile.stressLevel}_${profile.experienceLevel}`;
  const secondaryKey = `${profile.energyLevel}_${profile.timeOfDay}`;
  
  if (scripts[primaryKey]) {
    return scripts[primaryKey];
  }
  if (scripts[secondaryKey]) {
    return scripts[secondaryKey];
  }
  
  return scripts.high_stress_beginner;
};
