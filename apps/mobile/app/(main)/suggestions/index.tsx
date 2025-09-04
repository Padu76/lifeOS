// apps/mobile/app/(main)/suggestions/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Button } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { supabase } from '../../../lib/supabase';

type SuggestionRow = {
  id: number;
  date: string;
  suggestion_id: number;
  completed: boolean | null;
  suggestion?: {
    key: string;
    title: string;
    short_copy: string | null;
    duration_sec: number | null;
  } | null;
};

function todayISODate() {
  const d = new Date();
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return iso.toISOString().slice(0, 10);
}

export default function Suggestions() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SuggestionRow[]>([]);
  const router = useRouter();
  const nav = useNavigation();

  // aggiunge pulsante logout nell'header
  useEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <Text
          onPress={async () => {
            await supabase.auth.signOut();
          }}
          style={{ paddingHorizontal: 8, color: 'red' }}
        >
          Logout
        </Text>
      ),
    });
  }, [nav]);

  // carica i suggerimenti del giorno
  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Non sei autenticato');

      const date = todayISODate();
      let { data, error } = await supabase
        .from('user_suggestions')
        .select('id,date,suggestion_id,completed')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('id', { ascending: false });

      if (error) throw error;

      const ids = Array.from(new Set((data ?? []).map(r => r.suggestion_id)));
      let map = new Map<number, SuggestionRow['suggestion']>();
      if (ids.length > 0) {
        const { data: cats, error: e2 } = await supabase
          .from('suggestions')
          .select('id,key,title,short_copy,duration_sec')
          .in('id', ids);
        if (e2) throw e2;
        (cats ?? []).forEach((s: any) =>
          map.set(s.id, {
            key: s.key,
            title: s.title,
            short_copy: s.short_copy,
            duration_sec: s.duration_sec,
          }),
        );
      }

      const rows: SuggestionRow[] = (data ?? []).map(r => ({
        ...r,
        suggestion: map.get(r.suggestion_id) ?? null,
      }));

      setRows(rows);
    } catch (e: any) {
      Alert.alert('Errore', e.message ?? 'Impossibile caricare i suggerimenti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const markCompleted = async (row: SuggestionRow) => {
    try {
      const { error } = await supabase
        .from('user_suggestions')
        .update({ completed: true })
        .eq('id', row.id);
      if (error) throw error;
      Alert.alert('OK', 'Segnato come completato ✅');
      loadSuggestions();
    } catch (e: any) {
      Alert.alert('Errore', e.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Carico i suggerimenti…</Text>
      </View>
    );
  }

  if (!rows.length) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Suggerimenti del giorno
        </Text>
        <Text style={{ marginTop: 8 }}>
          Nessun suggerimento. Fai un check-in o riprova più tardi.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
        Suggerimenti del giorno
      </Text>
      <FlatList
        data={rows}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => {
          const s = item.suggestion;
          if (!s) return null;
          return (
            <View
              style={{
                padding: 14,
                borderWidth: 1,
                borderColor: '#eee',
                borderRadius: 12,
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/(main)/suggestions/[key]',
                    params: { key: s.key },
                  })
                }
              >
                <Text style={{ fontWeight: '700' }}>{s.title}</Text>
                <Text style={{ marginTop: 4 }}>{s.short_copy ?? ''}</Text>
                {s.duration_sec ? (
                  <Text style={{ marginTop: 4, opacity: 0.7 }}>
                    {Math.round(s.duration_sec / 60)} min
                  </Text>
                ) : null}
              </TouchableOpacity>

              {item.completed ? (
                <Text style={{ marginTop: 6, color: 'green' }}>✅ Completato</Text>
              ) : (
                <Button title="Segna come completato" onPress={() => markCompleted(item)} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
