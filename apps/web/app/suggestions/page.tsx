// apps/web/app/suggestions/page.tsx
export default function SuggestionsPage() {
  return (
    <main style={{maxWidth:720, margin:"60px auto", padding:"0 20px", fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, sans-serif"}}>
      <h1>Suggerimenti</h1>
      <p>Versione web minima. Per ora la lista completa vive nella mobile app.</p>
      <p>Se vuoi, portiamo qui la query a Supabase (user_suggestions + suggestions) come fatto su mobile.</p>
    </main>
  );
}
