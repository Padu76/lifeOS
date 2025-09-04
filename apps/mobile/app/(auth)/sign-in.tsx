import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'email'|'otp'>('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (error) throw error;
      setPhase('otp');
      Alert.alert('Codice inviato', 'Controlla la tua email e inserisci il codice di 6 cifre.');
    } catch (e: any) {
      Alert.alert('Errore', e.message ?? 'Impossibile inviare il codice');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: 'email',
      });
      if (error) throw error;
      if (!data.session) throw new Error('Sessione non creata. Riprova.');
      router.replace('/(main)/suggestions');
    } catch (e: any) {
      Alert.alert('OTP non valido', e.message ?? 'Codice errato o scaduto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Accedi</Text>

      {phase === 'email' ? (
        <>
          <Text>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tuo@email.it"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 }}
          />
          <Button title={loading ? 'Invio...' : 'Invia codice'} onPress={requestOtp} disabled={loading || !email} />
        </>
      ) : (
        <>
          <Text>Codice OTP (6 cifre)</Text>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            style={{ letterSpacing: 4, fontSize: 20, textAlign:'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 }}
          />
          <Button title={loading ? 'Verifico...' : 'Verifica e accedi'} onPress={verifyOtp} disabled={loading || otp.length !== 6} />
          <Text style={{ opacity: 0.7, marginTop: 8 }} onPress={() => setPhase('email')}>Torna indietro</Text>
        </>
      )}
    </View>
  );
}
