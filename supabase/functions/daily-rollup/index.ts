// deno-lint-ignore-file no-explicit-any
// LifeOS – Edge Function: daily-rollup (Europe/Rome) + user_suggestions
// - Parametro ?day=YYYY-MM-DD (o body { day })
// - Default: oggi Europe/Rome
// - Calcola LifeScore e trend, scrive su public.lifescores
// - (Nuovo) Genera user_suggestions per il giorno in base ai punteggi
//
// ENV richieste (come nel tuo repo):
//   PROJECT_URL         -> https://<PROJECT_REF>.supabase.co
//   SERVICE_ROLE_KEY    -> service role key
//
// Strategia user_suggestions:
// - Prima rimuove eventuali suggerimenti già presenti per (user_id, day)
// - Poi inserisce 1-3 suggerimenti mirati in base ai punteggi bassi (steps/sleep/mood).
// - Se la tabella "suggestions" non è allineata (es. manca colonna category), la function
//   salta la generazione e continua senza bloccare il rollup.
//
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
  // Prova a leggere da catalogo "suggestions" se disponibile
  // Si aspetta che esista almeno: id, category (steps|sleep|mood)
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
    for (const k of deficits) {
      out[k] = (byCat[k] || []).slice(0, 5); // primi 5 candidati per categoria
    }
    return out;
  } catch (_e) {
    // Nessun catalogo o schema non compatibile → ritorna vuoto
    return {} as Record<string, any[]>;
  }
}

export default async function handler(req: Request): Promise<Response> {
  // CORS
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

  // Leggi giorno
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

  // 1) Carica health_metrics del giorno
  const { data: rows, error: selErr } = await supabase
    .from("health_metrics")
    .select("user_id, steps, sleep_hours, mood, stress")
    .eq("date", dayStr);

  if (selErr) return json({ ok: false, error: selErr.message }, 500);
  if (!rows || rows.length === 0) return json({ ok: true, processed: 0, day: dayStr });

  const STEPS_GOAL = 8000;
  const SLEEP_GOAL = 7.5;
  const W_MOOD = 0.30;
  const W_SLEEP = 0.30;
  const W_STEPS = 0.40;

  // Pre-carica catalogo suggerimenti (se esiste) per categorie
  const catalogByCat = await pickSuggestionsForScores(supabase, ["steps", "sleep", "mood"]);

  let processed = 0;
  const errors: any[] = [];

  for (const r of rows) {
    try {
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

      // (Nuovo) Generazione user_suggestions
      // - Cancella quelle del giorno corrente per evitare duplicati
      await supabase.from("user_suggestions").delete().eq("user_id", r.user_id).eq("date", dayStr);

      const deficits: string[] = [];
      if (stepsScore < 60) deficits.push("steps");
      if (sleepScore < 60) deficits.push("sleep");
      if (moodScore < 60) deficits.push("mood");

      const inserts: any[] = [];
      for (const cat of deficits) {
        const candidates = catalogByCat[cat] || [];
        if (candidates.length > 0) {
          // prendi il primo candidato (puoi randomizzare se vuoi)
          const sug = candidates[Math.floor(Math.random() * candidates.length)];
          inserts.push({
            user_id: r.user_id,
            date: dayStr,
            suggestion_id: sug.id,
            completed: false,
          });
        } else {
          // fallback: suggerimenti generati al volo senza catalogo
          // richiede che user_suggestions abbia colonne (user_id, date, text, category, completed)
          inserts.push({
            user_id: r.user_id,
            date: dayStr,
            text: fallbackTextFor(cat),
            category: cat,
            completed: false,
          });
        }
      }

      if (inserts.length > 0) {
        // Tenta bulk insert; se alcune colonne non esistono (fallback), ignora l'errore e prosegui
        const { error: insErr } = await supabase.from("user_suggestions").insert(inserts);
        if (insErr) {
          // Non bloccare il rollup se la tabella ha schema diverso
          console.warn("user_suggestions insert warning:", insErr.message);
        }
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
      return "Fai una camminata di 10 minuti oggi. Se puoi, spezza la giornata con 2–3 micro‑passeggiate.";
    case "sleep":
      return "Stasera spegni gli schermi 60 minuti prima di dormire e prova 4‑7‑8 per 4 cicli.";
    case "mood":
      return "Fai 5 respiri lenti naso‑pancia e prendi 10 minuti di luce naturale all’aperto.";
    default:
      return "Fai una piccola azione semplice che ti avvicini al benessere oggi.";
  }
}

Deno.serve(handler);
