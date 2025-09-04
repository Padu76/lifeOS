// Edge Function stub: aggrega metriche della giornata, calcola LifeScore e genera suggerimenti.
export default async function handler(req: Request) {
  return new Response(JSON.stringify({ ok: true, message: 'daily-rollup stub' }), { status: 200 });
}
