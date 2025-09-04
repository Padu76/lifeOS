import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMagicLink = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'lifeos://callback' } });
      if (error) throw error;
      Alert.alert('Controlla la mail', 'Ti abbiamo inviato un link per accedere.');
    } catch (e:any) {
      Alert.alert('Errore', e.message ?? 'Impossibile inviare link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Accedi</Text>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="tuo@email.it"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 }}
      />
      <Button title={loading ? 'Invio...' : 'Invia magic link'} onPress={sendMagicLink} disabled={loading || !email} />
    </View>
  );
}
