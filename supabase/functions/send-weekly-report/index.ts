export default async function handler(req: Request) {
  return new Response(JSON.stringify({ ok: true, message: 'send-weekly-report stub' }), { status: 200 });
}
