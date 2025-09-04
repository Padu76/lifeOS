import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

function todayISODate(){
  const d = new Date();
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return iso.toISOString().slice(0,10);
}

export default function Checkin() {
  const [steps, setSteps] = useState('0');
  const [sleep, setSleep] = useState('7.0');
  const [mood, setMood] = useState('3');
  const [stress, setStress] = useState('3');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Non sei autenticato');
      const dateStr = todayISODate();
      const { error } = await supabase.from('health_metrics').upsert({
        user_id: user.id,
        date: dateStr,
        steps: parseInt(steps||'0',10),
        sleep_hours: parseFloat(sleep||'0'),
        mood: parseInt(mood||'3',10),
        stress: parseInt(stress||'3',10),
        source: 'manual'
      }, { onConflict: 'user_id,date' });
      if (error) throw error;
      Alert.alert('Salvato', 'Check-in registrato per oggi');
    } catch (e:any) {
      Alert.alert('Errore', e.message ?? 'Salvataggio fallito');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Check-in di oggi</Text>
      <Text>Passi</Text>
      <TextInput value={steps} onChangeText={setSteps} keyboardType="numeric" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} />
      <Text>Ore di sonno</Text>
      <TextInput value={sleep} onChangeText={setSleep} keyboardType="decimal-pad" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} />
      <Text>Umore (1-5)</Text>
      <TextInput value={mood} onChangeText={setMood} keyboardType="numeric" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} />
      <Text>Stress (1-5)</Text>
      <TextInput value={stress} onChangeText={setStress} keyboardType="numeric" style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} />
      <Button title={saving ? 'Salvo...' : 'Salva check-in'} onPress={save} />
    </View>
  );
}
