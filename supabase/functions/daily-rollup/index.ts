// deno-lint-ignore-file no-explicit-any
// LifeOS – Edge Function: daily-rollup (Europe/Rome) + user_suggestions + per-user weights/goals
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("PROJECT_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing PROJECT_URL or SERVICE_ROLE_KEY");
}

function isValidISODate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function toISODateEuropeRome(date?: Date): string {
  const d = date ?? new Date();
  const local = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m - 1), d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const ry = dt.getUTCFullYear();
  const rm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const rd = String(dt.getUTCDate()).padStart(2, "0");
  return `${ry}-${rm}-${rd}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function json(obj: any, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}

async function pickSuggestionsForScores(supabase: any, deficits: string[]) {
  try {
    const { data, error } = await supabase
      .from("suggestions")
      .select("id, category");
    if (error) throw error;
    if (!data || data.length === 0) return {} as Record<string, any[]>;

    const byCat: Record<string, any[]> = {};
    for (const row of data) {
      const cat = (row.category || "").toLowerCase();
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(row);
    }
    const out: Record<string, any[]> = {};
    for (const k of deficits) out[k] = (byCat[k] || []).slice(0, 5);
    return out;
  } catch (_e) {
    return {} as Record<string, any[]>;
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
      },
    });
  }

  const supabase = createClient(PROJECT_URL!, SERVICE_ROLE_KEY!);

  let day: string | undefined;
  try {
    if (req.method === "POST" && req.headers.get("content-type")?.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      day = body?.day;
    } else {
      const url = new URL(req.url);
      day = url.searchParams.get("day") ?? undefined;
    }
  } catch (_e) {}
  const dayStr = (day && isValidISODate(day)) ? day : toISODateEuropeRome();
  const prevDayStr = addDaysISO(dayStr, -1);

  // 1) health_metrics del giorno
  const { data: rows, error: selErr } = await supabase
    .from("health_metrics")
    .select("user_id, steps, sleep_hours, mood, stress")
    .eq("date", dayStr);

  if (selErr) return json({ ok: false, error: selErr.message }, 500);
  if (!rows || rows.length === 0) return json({ ok: true, processed: 0, day: dayStr });

  // 2) Pesca pesi/goal per gli utenti (se la tabella esiste)
  const userIds = [...new Set(rows.map((r: any) => r.user_id))];
  let weightsMap = new Map<string, any>();
  try {
    const { data: wrows } = await supabase
      .from("lifescore_weights")
      .select("user_id, w_mood, w_sleep, w_steps, steps_goal, sleep_goal")
      .in("user_id", userIds);
    if (wrows && wrows.length > 0) {
      for (const w of wrows) weightsMap.set(w.user_id, w);
    }
  } catch (_e) {
    // tabella non esiste o schema diverso → usa defaults
  }

  // 3) preload catalogo suggerimenti
  const catalogByCat = await pickSuggestionsForScores(supabase, ["steps", "sleep", "mood"]);

  let processed = 0;
  const errors: any[] = [];

  for (const r of rows) {
    try {
      const cfg = weightsMap.get(r.user_id) || {};
      // Defaults
      let STEPS_GOAL = 8000;
      let SLEEP_GOAL = 7.5;
      let W_MOOD = 0.30;
      let W_SLEEP = 0.30;
      let W_STEPS = 0.40;

      if (cfg) {
        STEPS_GOAL = Number(cfg.steps_goal ?? STEPS_GOAL);
        SLEEP_GOAL = Number(cfg.sleep_goal ?? SLEEP_GOAL);
        W_MOOD = Number(cfg.w_mood ?? W_MOOD);
        W_SLEEP = Number(cfg.w_sleep ?? W_SLEEP);
        W_STEPS = Number(cfg.w_steps ?? W_STEPS);
        // Normalizza pesi se non sommano a 1
        const s = W_MOOD + W_SLEEP + W_STEPS;
        if (s > 0 && Math.abs(s - 1) > 0.001) {
          W_MOOD = W_MOOD / s;
          W_SLEEP = W_SLEEP / s;
          W_STEPS = W_STEPS / s;
        }
      }

      const mood = Number(r.mood ?? 3);
      const sleep = Number(r.sleep_hours ?? 0);
      const steps = Number(r.steps ?? 0);

      const moodScore = Math.round(((clamp(mood, 1, 5) - 1) / 4) * 100);
      const sleepScore = sleep <= 0
        ? 0
        : (sleep <= SLEEP_GOAL
            ? Math.round(100 * (sleep / SLEEP_GOAL))
            : Math.round(Math.max(0, 100 - 15 * (sleep - SLEEP_GOAL))));
      const stepsScore = Math.round(Math.min(1, steps / STEPS_GOAL) * 100);

      const lifescore = Math.round(W_MOOD * moodScore + W_SLEEP * sleepScore + W_STEPS * stepsScore);

      // Trend vs ieri
      let trend: number | null = null;
      const { data: prev, error: prevErr } = await supabase
        .from("lifescores")
        .select("lifescore")
        .eq("user_id", r.user_id)
        .eq("date", prevDayStr)
        .maybeSingle();
      if (!prevErr && prev && typeof prev.lifescore === "number") {
        trend = lifescore - prev.lifescore;
      }

      // Upsert su lifescores
      const { error: upErr } = await supabase
        .from("lifescores")
        .upsert({
          user_id: r.user_id,
          date: dayStr,
          mood_score: moodScore,
          sleep_score: sleepScore,
          steps_score: stepsScore,
          lifescore,
          trend,
        }, { onConflict: "user_id,date" });
      if (upErr) throw upErr;

      // Suggerimenti del giorno (pulisci e inserisci)
      await supabase.from("user_suggestions").delete().eq("user_id", r.user_id).eq("date", dayStr);

      const deficits: string[] = [];
      if (stepsScore < 60) deficits.push("steps");
      if (sleepScore < 60) deficits.push("sleep");
      if (moodScore < 60) deficits.push("mood");

      const inserts: any[] = [];
      for (const cat of deficits) {
        const candidates = catalogByCat[cat] || [];
        if (candidates.length > 0) {
          const sug = candidates[Math.floor(Math.random() * candidates.length)];
          inserts.push({ user_id: r.user_id, date: dayStr, suggestion_id: sug.id, completed: false });
        } else {
          inserts.push({ user_id: r.user_id, date: dayStr, text: fallbackTextFor(cat), category: cat, completed: false });
        }
      }
      if (inserts.length > 0) {
        const { error: insErr } = await supabase.from("user_suggestions").insert(inserts);
        if (insErr) console.warn("user_suggestions insert warning:", insErr.message);
      }

      processed += 1;
    } catch (e: any) {
      errors.push({ user_id: r.user_id, error: String(e?.message ?? e) });
    }
  }

  return json({ ok: true, processed, day: dayStr, errors });
}

function fallbackTextFor(cat: string): string {
  switch (cat) {
    case "steps":
      return "Fai una camminata di 10 minuti oggi. Se puoi, spezza con 2–3 micro‑passeggiate.";
    case "sleep":
      return "Spegni gli schermi 60 minuti prima di dormire e fai 4 cicli di 4‑7‑8.";
    case "mood":
      return "Prendi 10 minuti di luce naturale e fai 5 respiri lenti naso‑pancia.";
    default:
      return "Fai una piccola azione semplice per il tuo benessere oggi.";
  }
}

Deno.serve(handler);
