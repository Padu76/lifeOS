/**
 * Supabase Edge Function: daily-rollup (env names updated)
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

type LifeScoreFlags = {
  low_sleep: boolean;
  low_activity: boolean;
  high_stress: boolean;
  low_mood: boolean;
};

function clamp01(n:number){ return Math.max(0, Math.min(1, n)); }
function normalizeSteps(steps:number, target=7000){ return clamp01((steps||0)/target); }
function normalizeSleep(hours:number, ideal=8){ return clamp01((hours||0)/ideal); }
function normalizeMood(mood:number){ return clamp01(((mood||3)-1)/4); }
function normalizeStress(stress:number){ return clamp01(((stress||3)-1)/4); }

function computeLifeScore(input: {steps?:number; sleepHours?:number; mood?:number; stress?:number}){
  const sleep = normalizeSleep(input.sleepHours ?? 0);
  const steps = normalizeSteps(input.steps ?? 0);
  const mood  = normalizeMood(input.mood ?? 3);
  const stress= normalizeStress(input.stress ?? 3);

  const metrics = [sleep, steps, 1 - stress, mood];
  const baseWeights = [0.35, 0.25, 0.25, 0.15];
  const minVal = Math.min(...metrics);
  const idxWorst = metrics.indexOf(minVal);
  baseWeights[idxWorst] += 0.10;

  const score01 = clamp01(
    baseWeights[0]*sleep +
    baseWeights[1]*steps +
    baseWeights[2]*(1 - stress) +
    baseWeights[3]*mood
  );

  const flags: LifeScoreFlags = {
    low_sleep: sleep < 0.5,
    low_activity: steps < 0.5,
    high_stress: stress > 0.6,
    low_mood: mood < 0.4,
  };

  return { score: Math.round(score01*100), flags };
}

serve(async (req) => {
  const url = Deno.env.get("PROJECT_URL")!;
  const key = Deno.env.get("SERVICE_ROLE_KEY")!;
  if (!url || !key) {
    return new Response(JSON.stringify({ ok:false, error: "Missing PROJECT_URL or SERVICE_ROLE_KEY" }), { status: 500 });
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const today = new Date();
  const y = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()-1));
  const yDateStr = y.toISOString().slice(0,10);

  const { data: rows, error } = await supabase
    .from("health_metrics")
    .select("user_id, steps, active_minutes, sleep_hours, mood, stress")
    .eq("date", yDateStr);

  if (error) {
    return new Response(JSON.stringify({ ok:false, stage:"fetch health_metrics", error: error.message }), { status: 500 });
  }

  let processed = 0;
  for (const r of rows ?? []) {
    const { score, flags } = computeLifeScore({
      steps: r.steps ?? 0,
      sleepHours: r.sleep_hours ?? 0,
      mood: r.mood ?? 3,
      stress: r.stress ?? 3
    });

    const { error: e1 } = await supabase.from("lifescores").upsert({
      user_id: r.user_id,
      date: yDateStr,
      score,
      flags
    }, { onConflict: "user_id,date" });

    if (e1) continue;

    const suggestionsToOffer: string[] = [];
    if (flags.high_stress) suggestionsToOffer.push("breathing-478");
    if (flags.low_sleep)   suggestionsToOffer.push("5min-meditation");
    if (flags.low_activity) suggestionsToOffer.push("10min-walk");
    if (suggestionsToOffer.length === 0) suggestionsToOffer.push("gratitude-note");

    for (const key of suggestionsToOffer) {
      const { data: s, error: es } = await supabase
        .from("suggestions")
        .select("id, key")
        .eq("key", key)
        .maybeSingle();
      if (es || !s) continue;

      await supabase.from("user_suggestions").insert({
        user_id: r.user_id,
        suggestion_id: s.id,
        date: yDateStr,
        reason: flags
      });
    }
    processed++;
  }

  return new Response(JSON.stringify({ ok: true, processed, date: yDateStr }), {
    headers: { "content-type": "application/json" },
  });
});
