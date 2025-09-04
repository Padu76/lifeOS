export const clamp01 = (n:number)=> Math.max(0, Math.min(1, n));
export const normalizeSteps = (steps:number, target=7000)=> clamp01(steps/target);
export const normalizeSleep = (hours:number, ideal=8)=> clamp01(hours/ideal);
export const normalizeMood = (mood:number)=> clamp01((mood-1)/4); // 1..5 -> 0..1
export const normalizeStress = (stress:number)=> clamp01((stress-1)/4); // 1..5 -> 0..1 (alto=1)
export const normalizeHR = (hr:number, baseline:number)=> clamp01((hr - baseline) / Math.max(5, baseline*0.2));
