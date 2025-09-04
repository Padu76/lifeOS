export default async function handler(req: Request) {
  return new Response(JSON.stringify({ ok: true, message: 'verify-receipts stub' }), { status: 200 });
}
