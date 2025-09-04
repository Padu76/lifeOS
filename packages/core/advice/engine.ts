import type { LifeScoreOutput } from '../scoring/lifeScore';

export type Suggestion = {
  key: string;
  title: string;
  short_copy: string;
  duration_sec: number;
  tutorial?: any;
  priority?: number;
};

export function generateSuggestions(ls: LifeScoreOutput): Suggestion[] {
  const out: Suggestion[] = [];
  if (ls.flags.high_stress) {
    out.push({
      key: 'breathing-478',
      title: 'Respirazione 4-7-8',
      short_copy: '5 cicli di respiro guidato per abbassare lo stress',
      duration_sec: 120,
      priority: 100
    });
  }
  if (ls.flags.low_sleep) {
    out.push({
      key: '5min-meditation',
      title: 'Meditazione 5 minuti',
      short_copy: 'Rilassa la mente prima di dormire',
      duration_sec: 300,
      priority: 90
    });
  }
  if (ls.flags.low_activity) {
    out.push({
      key: '10min-walk',
      title: 'Camminata veloce 10 min',
      short_copy: 'Attiva l’energia senza stressare',
      duration_sec: 600,
      priority: 80
    });
  }
  // fallback
  if (out.length === 0) {
    out.push({
      key: 'gratitude-note',
      title: 'Nota di gratitudine',
      short_copy: 'Scrivi 1 cosa positiva di oggi',
      duration_sec: 60,
      priority: 10
    });
  }
  return out.sort((a,b)=> (b.priority??0)-(a.priority??0));
}
