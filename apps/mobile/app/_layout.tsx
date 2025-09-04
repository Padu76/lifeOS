import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // session iniziale
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthed(!!data.session);
      setReady(true);
    });

    // ascolta cambi sessione
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });

    return () => { sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!ready || isAuthed === null) return;

    const inAuth = segments[0] === '(auth)';
    const inMain = segments[0] === '(main)';

    if (!isAuthed && inMain) {
      router.replace('/(auth)/sign-in');
    } else if (isAuthed && inAuth) {
      router.replace('/(main)/suggestions');
    }
  }, [ready, isAuthed, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="(auth)/sign-in" options={{ title: 'Accedi' }} />
      <Stack.Screen name="(main)/suggestions/index" options={{ title: 'Suggerimenti' }} />
      <Stack.Screen name="(main)/suggestions/[key]" options={{ title: 'Dettaglio' }} />
    </Stack>
  );
}
