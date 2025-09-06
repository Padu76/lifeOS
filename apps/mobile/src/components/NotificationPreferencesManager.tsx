// =====================================================
// LifeOS Granular Notification Preferences System
// File: apps/mobile/src/components/NotificationPreferencesManager.tsx
// =====================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

interface NotificationPreferences {
  // Main categories
  micro_advice_enabled: boolean;
  reminders_enabled: boolean;
  celebrations_enabled: boolean;
  urgent_enabled: boolean;
  
  // Granular controls
  micro_advice_settings: {
    frequency: 'minimal' | 'balanced' | 'frequent';
    stress_threshold: number; // 1-10, below this sends stress advice
    energy_threshold: number; // 1-10, below this sends energy advice
    categories: {
      breathing: boolean;
      meditation: boolean;
      movement: boolean;
      rest: boolean;
      nutrition: boolean;
    };
  };
  
  // Timing preferences
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:mm
    end_time: string;   // HH:mm
  };
  
  optimal_times: {
    morning_enabled: boolean;
    morning_time: string;     // HH:mm
    afternoon_enabled: boolean;
    afternoon_time: string;   // HH:mm
    evening_enabled: boolean;
    evening_time: string;     // HH:mm
  };
  
  // Daily limits
  max_daily_notifications: number; // 1-10
  min_interval_minutes: number;    // 30-480 (30min to 8h)
  
  // Context-based
  location_based: {
    enabled: boolean;
    work_notifications: boolean;
    home_notifications: boolean;
    gym_notifications: boolean;
  };
  
  // Advanced settings
  adaptive_learning: boolean;
  emergency_override: boolean; // Allow urgent notifications even in quiet hours
  weekend_different_schedule: boolean;
  weekend_quiet_hours?: {
    start_time: string;
    end_time: string;
  };
}

const NotificationPreferencesManager: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<{
    visible: boolean;
    type: string;
    value: Date;
  }>({ visible: false, type: '', value: new Date() });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/notification-preferences', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || getDefaultPreferences());
      } else {
        setPreferences(getDefaultPreferences());
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setPreferences(getDefaultPreferences());
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        Alert.alert('Successo', 'Preferenze salvate con successo');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Errore', 'Impossibile salvare le preferenze');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const updateNestedPreference = <T extends keyof NotificationPreferences>(
    parent: T,
    key: keyof NotificationPreferences[T],
    value: any
  ) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [parent]: {
        ...preferences[parent],
        [key]: value,
      },
    });
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker({ ...showTimePicker, visible: false });
    
    if (selectedTime && preferences) {
      const timeString = selectedTime.toTimeString().slice(0, 5); // HH:mm format
      
      switch (showTimePicker.type) {
        case 'quiet_start':
          updateNestedPreference('quiet_hours', 'start_time', timeString);
          break;
        case 'quiet_end':
          updateNestedPreference('quiet_hours', 'end_time', timeString);
          break;
        case 'morning_time':
          updateNestedPreference('optimal_times', 'morning_time', timeString);
          break;
        case 'afternoon_time':
          updateNestedPreference('optimal_times', 'afternoon_time', timeString);
          break;
        case 'evening_time':
          updateNestedPreference('optimal_times', 'evening_time', timeString);
          break;
      }
    }
  };

  const showTimePickerModal = (type: string, currentTime: string) => {
    const [hours, minutes] = currentTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    setShowTimePicker({
      visible: true,
      type,
      value: date,
    });
  };

  const getDefaultPreferences = (): NotificationPreferences => ({
    micro_advice_enabled: true,
    reminders_enabled: true,
    celebrations_enabled: true,
    urgent_enabled: true,
    micro_advice_settings: {
      frequency: 'balanced',
      stress_threshold: 7,
      energy_threshold: 4,
      categories: {
        breathing: true,
        meditation: true,
        movement: true,
        rest: true,
        nutrition: true,
      },
    },
    quiet_hours: {
      enabled: true,
      start_time: '22:00',
      end_time: '08:00',
    },
    optimal_times: {
      morning_enabled: true,
      morning_time: '09:00',
      afternoon_enabled: true,
      afternoon_time: '14:00',
      evening_enabled: true,
      evening_time: '19:00',
    },
    max_daily_notifications: 5,
    min_interval_minutes: 60,
    location_based: {
      enabled: false,
      work_notifications: true,
      home_notifications: true,
      gym_notifications: false,
    },
    adaptive_learning: true,
    emergency_override: true,
    weekend_different_schedule: false,
  });

  const getAuthToken = async (): Promise<string> => {
    // Implementation depends on your auth system
    return 'your-auth-token';
  };

  if (loading || !preferences) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Caricamento preferenze...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Preferenze Notifiche</Text>
        <Text style={styles.subtitle}>
          Personalizza quando e come ricevere i tuoi micro-consigli
        </Text>
      </View>

      {/* Main Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipologie Notifiche</Text>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Micro-consigli AI</Text>
            <Text style={styles.settingDescription}>
              Suggerimenti personalizzati per il benessere
            </Text>
          </View>
          <Switch
            value={preferences.micro_advice_enabled}
            onValueChange={(value) => updatePreference('micro_advice_enabled', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Promemoria</Text>
            <Text style={styles.settingDescription}>
              Check-in giornalieri e attività
            </Text>
          </View>
          <Switch
            value={preferences.reminders_enabled}
            onValueChange={(value) => updatePreference('reminders_enabled', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Celebrazioni</Text>
            <Text style={styles.settingDescription}>
              Achievement e traguardi raggiunti
            </Text>
          </View>
          <Switch
            value={preferences.celebrations_enabled}
            onValueChange={(value) => updatePreference('celebrations_enabled', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Notifiche Urgenti</Text>
            <Text style={styles.settingDescription}>
              Alerts importanti per il benessere
            </Text>
          </View>
          <Switch
            value={preferences.urgent_enabled}
            onValueChange={(value) => updatePreference('urgent_enabled', value)}
          />
        </View>
      </View>

      {/* Micro-advice Settings */}
      {preferences.micro_advice_enabled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impostazioni Micro-consigli</Text>
          
          <Text style={styles.settingLabel}>Frequenza</Text>
          <View style={styles.frequencyButtons}>
            {['minimal', 'balanced', 'frequent'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  preferences.micro_advice_settings.frequency === freq && styles.frequencyButtonActive
                ]}
                onPress={() => updateNestedPreference('micro_advice_settings', 'frequency', freq)}
              >
                <Text style={[
                  styles.frequencyButtonText,
                  preferences.micro_advice_settings.frequency === freq && styles.frequencyButtonTextActive
                ]}>
                  {freq === 'minimal' ? 'Minimale' : freq === 'balanced' ? 'Bilanciata' : 'Frequente'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.settingLabel}>
            Soglia Stress (invio consigli sotto: {preferences.micro_advice_settings.stress_threshold})
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={preferences.micro_advice_settings.stress_threshold}
            onValueChange={(value) => 
              updateNestedPreference('micro_advice_settings', 'stress_threshold', value)
            }
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E5E5E5"
          />

          <Text style={styles.settingLabel}>
            Soglia Energia (invio consigli sotto: {preferences.micro_advice_settings.energy_threshold})
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={preferences.micro_advice_settings.energy_threshold}
            onValueChange={(value) => 
              updateNestedPreference('micro_advice_settings', 'energy_threshold', value)
            }
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E5E5E5"
          />

          <Text style={styles.settingLabel}>Categorie Consigli</Text>
          {Object.entries(preferences.micro_advice_settings.categories).map(([category, enabled]) => (
            <View key={category} style={styles.settingRow}>
              <Text style={styles.settingLabel}>
                {category === 'breathing' ? 'Respirazione' :
                 category === 'meditation' ? 'Meditazione' :
                 category === 'movement' ? 'Movimento' :
                 category === 'rest' ? 'Riposo' : 'Nutrizione'}
              </Text>
              <Switch
                value={enabled}
                onValueChange={(value) => {
                  const newCategories = { ...preferences.micro_advice_settings.categories };
                  newCategories[category as keyof typeof newCategories] = value;
                  updateNestedPreference('micro_advice_settings', 'categories', newCategories);
                }}
              />
            </View>
          ))}
        </View>
      )}

      {/* Timing Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orari e Timing</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Orari di Silenzio</Text>
          <Switch
            value={preferences.quiet_hours.enabled}
            onValueChange={(value) => updateNestedPreference('quiet_hours', 'enabled', value)}
          />
        </View>

        {preferences.quiet_hours.enabled && (
          <>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => showTimePickerModal('quiet_start', preferences.quiet_hours.start_time)}
            >
              <Text style={styles.settingLabel}>Inizio Silenzio</Text>
              <Text style={styles.timeText}>{preferences.quiet_hours.start_time}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => showTimePickerModal('quiet_end', preferences.quiet_hours.end_time)}
            >
              <Text style={styles.settingLabel}>Fine Silenzio</Text>
              <Text style={styles.timeText}>{preferences.quiet_hours.end_time}</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.settingLabel}>Orari Ottimali</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Mattina</Text>
          <Switch
            value={preferences.optimal_times.morning_enabled}
            onValueChange={(value) => updateNestedPreference('optimal_times', 'morning_enabled', value)}
          />
        </View>
        
        {preferences.optimal_times.morning_enabled && (
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePickerModal('morning_time', preferences.optimal_times.morning_time)}
          >
            <Text style={styles.timeText}>{preferences.optimal_times.morning_time}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Pomeriggio</Text>
          <Switch
            value={preferences.optimal_times.afternoon_enabled}
            onValueChange={(value) => updateNestedPreference('optimal_times', 'afternoon_enabled', value)}
          />
        </View>
        
        {preferences.optimal_times.afternoon_enabled && (
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePickerModal('afternoon_time', preferences.optimal_times.afternoon_time)}
          >
            <Text style={styles.timeText}>{preferences.optimal_times.afternoon_time}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sera</Text>
          <Switch
            value={preferences.optimal_times.evening_enabled}
            onValueChange={(value) => updateNestedPreference('optimal_times', 'evening_enabled', value)}
          />
        </View>
        
        {preferences.optimal_times.evening_enabled && (
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePickerModal('evening_time', preferences.optimal_times.evening_time)}
          >
            <Text style={styles.timeText}>{preferences.optimal_times.evening_time}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Daily Limits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Limiti Giornalieri</Text>
        
        <Text style={styles.settingLabel}>
          Max Notifiche al Giorno: {preferences.max_daily_notifications}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={preferences.max_daily_notifications}
          onValueChange={(value) => updatePreference('max_daily_notifications', value)}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#E5E5E5"
        />

        <Text style={styles.settingLabel}>
          Intervallo Minimo: {preferences.min_interval_minutes} minuti
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={30}
          maximumValue={480}
          step={30}
          value={preferences.min_interval_minutes}
          onValueChange={(value) => updatePreference('min_interval_minutes', value)}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#E5E5E5"
        />
      </View>

      {/* Advanced Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Impostazioni Avanzate</Text>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Apprendimento Adattivo</Text>
            <Text style={styles.settingDescription}>
              L'AI impara dai tuoi pattern per ottimizzare il timing
            </Text>
          </View>
          <Switch
            value={preferences.adaptive_learning}
            onValueChange={(value) => updatePreference('adaptive_learning', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Override Emergenze</Text>
            <Text style={styles.settingDescription}>
              Consenti notifiche urgenti anche negli orari di silenzio
            </Text>
          </View>
          <Switch
            value={preferences.emergency_override}
            onValueChange={(value) => updatePreference('emergency_override', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Orari Weekend Diversi</Text>
            <Text style={styles.settingDescription}>
              Usa orari diversi per sabato e domenica
            </Text>
          </View>
          <Switch
            value={preferences.weekend_different_schedule}
            onValueChange={(value) => updatePreference('weekend_different_schedule', value)}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={savePreferences}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Salva Preferenze</Text>
        )}
      </TouchableOpacity>

      {/* Time Picker Modal */}
      {showTimePicker.visible && (
        <DateTimePicker
          value={showTimePicker.value}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 16,
    color: '#6E6E73',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 2,
  },
  frequencyButtons: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  frequencyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyButtonText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#1D1D1F',
  },
  frequencyButtonTextActive: {
    color: 'white',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 8,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationPreferencesManager;
