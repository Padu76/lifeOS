import { normalizeSteps, normalizeSleep, normalizeMood, normalizeStress, clamp01 } from './normalizers';

export type LifeScoreInput = {
  steps?: number;
  activeMinutes?: number;
  sleepHours?: number;
  hrAvg?: number | null;
  mood?: number;     // 1..5
  stress?: number;   // 1..5
  hrBaseline?: number | null; // opzionale
};

export type LifeScoreOutput = {
  score: number;          // 0..100
  flags: Record<string, boolean>;
  reasons: string[];
};

export function computeLifeScore(input: LifeScoreInput): LifeScoreOutput {
  const sleep = normalizeSleep(input.sleepHours ?? 0);         // 0..1
  const steps = normalizeSteps(input.steps ?? 0);              // 0..1
  const mood = normalizeMood(input.mood ?? 3);                 // 0..1
  const stress = normalizeStress(input.stress ?? 3);           // 0..1 (alto=1)

  // pesi dinamici: aumenta il peso della metrica peggiore
  const metrics = [sleep, steps, 1 - stress, mood];
  const minVal = Math.min(...metrics);
  const baseWeights = [0.35, 0.25, 0.25, 0.15];
  const idxWorst = metrics.indexOf(minVal);
  baseWeights[idxWorst] += 0.10;

  const score01 = clamp01(
    baseWeights[0]*sleep +
    baseWeights[1]*steps +
    baseWeights[2]*(1 - stress) +
    baseWeights[3]*mood
  );

  const flags: Record<string, boolean> = {
    low_sleep: sleep < 0.5,
    low_activity: steps < 0.5,
    high_stress: stress > 0.6,
    low_mood: mood < 0.4,
  };

  const reasons: string[] = [];
  if (flags.low_sleep) reasons.push('Sonno insufficiente');
  if (flags.low_activity) reasons.push('Attività fisica bassa');
  if (flags.high_stress) reasons.push('Stress percepito alto');
  if (flags.low_mood) reasons.push('Umore basso');

  return { score: Math.round(score01 * 100), flags, reasons };
}
