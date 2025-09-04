export const metadata = {
  title: 'LifeOS',
  description: 'Il sistema operativo della vita quotidiana',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
