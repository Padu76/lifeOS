// apps/mobile/app/(main)/suggestions/[key].tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Button, Alert, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

function MMSS(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function useTick(seconds: number) {
  const [sec, setSec] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return sec;
}
function todayISODate() {
  const d = new Date();
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return iso.toISOString().slice(0, 10);
}

/** Animazione + cue per respirazione 4-7-8 (5 cicli) */
function Breath478() {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [remaining, setRemaining] = useState(4);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let seconds = phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8;

    if (phase === 'inhale') {
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }
    if (phase === 'exhale') {
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 8000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }

    setRemaining(seconds);
    const t = setInterval(() => {
      seconds -= 1;
      setRemaining(seconds);
      if (seconds <= 0) {
        clearInterval(t);
        if (phase === 'inhale') setPhase('hold');
        else if (phase === 'hold') setPhase('exhale');
        else {
          setCycle((c) => c + 1);
          setPhase('inhale');
        }
      }
    }, 1000);

    return () => clearInterval(t);
  }, [phase, scale]);

  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <Animated.View
        style={{
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: '#E6F4EA',
          transform: [{ scale }],
        }}
      />
      <Text style={{ fontSize: 22, fontWeight: '700' }}>
        {phase === 'inhale' ? 'Inspira (4)' : phase === 'hold' ? 'Trattieni (7)' : 'Espira (8)'}
      </Text>
      <Text style={{ fontSize: 18, opacity: 0.7 }}>Secondi: {remaining >= 0 ? remaining : 0}</Text>
      <Text style={{ marginTop: 6 }}>Cicli completati: {cycle} / 5</Text>
    </View>
  );
}

export default function SuggestionDetail() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const k = String(key || '');

  // stato completamento (letto all'avvio)
  const [completed, setCompleted] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  // corpo tutorial + meta
  const tutorial = useMemo(() => {
    if (k === 'breathing-478') {
      return {
        title: 'Respirazione 4-7-8',
        desc: '5 cicli guidati: 4s inspira, 7s trattieni, 8s espira.',
        body: <Breath478 />,
      };
    }
    if (k === '5min-meditation') {
      return {
        title: 'Meditazione 5 minuti',
        desc: 'Siediti comodo, chiudi gli occhi e segui il respiro.',
        body: <Text style={{ fontSize: 36, fontWeight: '700', textAlign: 'center' }}>{MMSS(useTick(300))}</Text>,
      };
    }
    if (k === '10min-walk') {
      return {
        title: 'Camminata 10 minuti',
        desc: 'Esci e cammina a passo svelto. Torna qui a fine timer.',
        body: <Text style={{ fontSize: 36, fontWeight: '700', textAlign: 'center' }}>{MMSS(useTick(600))}</Text>,
      };
    }
    return { title: 'Suggerimento', desc: 'Dettaglio attività', body: <Text>Coming soon…</Text> };
  }, [k]);

  // lettura stato completed per la riga di OGGI
  useEffect(() => {
    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes.user;
        if (!user) throw new Error('Non sei autenticato');

        const { data: s, error: e1 } = await supabase
          .from('suggestions')
          .select('id')
          .eq('key', k)
          .maybeSingle();
        if (e1) throw e1;
        if (!s) return setChecking(false);

        const date = todayISODate();
        const { data: us, error: e2 } = await supabase
          .from('user_suggestions')
          .select('id, completed')
          .eq('user_id', user.id)
          .eq('suggestion_id', s.id)
          .eq('date', date)
          .maybeSingle();
        if (e2) throw e2;
        setCompleted(!!us?.completed);
      } catch (err) {
        // nessun alert qui per non disturbare il tutorial
      } finally {
        setChecking(false);
      }
    })();
  }, [k]);

  const markCompleted = async () => {
    try {
      setSaving(true);
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) throw new Error('Non sei autenticato');

      const { data: s, error: e1 } = await supabase
        .from('suggestions')
        .select('id')
        .eq('key', k)
        .maybeSingle();
      if (e1) throw e1;
      if (!s) throw new Error('Suggerimento non trovato');

      const date = todayISODate();
      const { data: us, error: e2 } = await supabase
        .from('user_suggestions')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('suggestion_id', s.id)
        .eq('date', date)
        .maybeSingle();
      if (e2) throw e2;
      if (!us) throw new Error('Nessuna assegnazione per oggi');

      if (us.completed) {
        setCompleted(true);
        Alert.alert('Già completato', 'Hai già completato questa attività oggi.');
        return;
      }

      const { error: e3 } = await supabase
        .from('user_suggestions')
        .update({ completed: true })
        .eq('id', us.id);
      if (e3) throw e3;

      setCompleted(true);
      Alert.alert('Fatto', 'Segnato come completato ✅');
      setTimeout(() => router.replace('/(main)/suggestions'), 600);
    } catch (e: any) {
      Alert.alert('Errore', e.message ?? 'Impossibile aggiornare');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>{tutorial.title}</Text>
      <Text style={{ opacity: 0.8 }}>{tutorial.desc}</Text>

      <View style={{ marginTop: 16 }}>{tutorial.body}</View>

      <View style={{ marginTop: 16, gap: 8 }}>
        {checking ? (
          <Text style={{ opacity: 0.7 }}>Verifico stato…</Text>
        ) : completed ? (
          <Text style={{ color: 'green', fontWeight: '600' }}>✅ Già completato oggi</Text>
        ) : (
          <Button title={saving ? 'Salvo…' : 'Segna come completato'} onPress={markCompleted} disabled={saving} />
        )}
      </View>
    </View>
  );
}
