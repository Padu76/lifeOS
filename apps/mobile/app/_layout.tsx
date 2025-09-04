import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="(auth)/sign-in" options={{ title: 'Accedi' }} />
      <Stack.Screen name="(main)/suggestions/index" options={{ title: 'Suggerimenti' }} />
      <Stack.Screen name="(main)/suggestions/[key]" options={{ title: 'Dettaglio' }} />
    </Stack>
  );
}
