import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, Animated, Easing } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

/**
 * MVP: supporto 3 tutorial
 * - breathing-478: animazione cerchio e cues
 * - 5min-meditation: timer 5 minuti
 * - 10min-walk: timer 10 minuti
 */

function formatMMSS(total: number){
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function Breath478() {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<'inhale'|'hold'|'exhale'>('inhale');
  const [remaining, setRemaining] = useState(4);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let t: NodeJS.Timeout;
    const runPhase = () => {
      if (phase === 'inhale') {
        Animated.timing(scale, { toValue: 1.3, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }).start();
        setRemaining(4);
      } else if (phase === 'hold') {
        setRemaining(7);
      } else {
        Animated.timing(scale, { toValue: 0.9, duration: 8000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }).start();
        setRemaining(8);
      }
      let seconds = phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8;
      t = setInterval(() => {
        seconds -= 1;
        setRemaining(seconds);
        if (seconds <= 0) {
          clearInterval(t);
          if (phase === 'inhale') setPhase('hold');
          else if (phase === 'hold') setPhase('exhale');
          else { // exhale finita
            setCycle(c => c + 1);
            setPhase('inhale');
          }
        }
      }, 1000);
    };
    runPhase();
    return () => { if (t) clearInterval(t); };
  }, [phase]);

  return (
    <View style={{ alignItems:'center', gap: 10 }}>
      <Animated.View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: '#E6F4EA', transform: [{ scale }] }} />
      <Text style={{ fontSize: 24, fontWeight: '700' }}>
        {phase === 'inhale' ? 'Inspira (4)' : phase === 'hold' ? 'Trattieni (7)' : 'Espira (8)'}
      </Text>
      <Text style={{ fontSize: 18, opacity: 0.7 }}>Secondi: {remaining >= 0 ? remaining : 0}</Text>
      <Text style={{ marginTop: 6 }}>Cicli completati: {cycle} / 5</Text>
    </View>
  );
}

function Countdown({ seconds: initial }: { seconds: number }) {
  const [sec, setSec] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => setSec(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return <Text style={{ fontSize: 38, fontWeight: '700', textAlign:'center' }}>{formatMMSS(sec)}</Text>;
}

export default function SuggestionDetail() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const k = String(key || '');

  let title = 'Tutorial';
  let description = '';
  let body: JSX.Element = <Text>Coming soon</Text>;

  if (k === 'breathing-478') {
    title = 'Respirazione 4-7-8';
    description = '5 cicli guidati: 4s inspira, 7s trattieni, 8s espira.';
    body = <Breath478 />;
  } else if (k === '5min-meditation') {
    title = 'Meditazione 5 minuti';
    description = 'Siediti comodo, chiudi gli occhi e segui il respiro.';
    body = <Countdown seconds={300} />;
  } else if (k === '10min-walk') {
    title = 'Camminata 10 minuti';
    description = 'Esci e cammina a passo svelto. Torna qui a fine timer.';
    body = <Countdown seconds={600} />;
  }

  return (
    <View style={{ flex:1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>{title}</Text>
      <Text style={{ opacity: 0.8 }}>{description}</Text>
      <View style={{ marginTop: 16 }}>
        {body}
      </View>
    </View>
  );
}
