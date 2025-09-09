// =====================================================
// LifeOS - Settings Screen Component
// File: SettingsScreen.tsx
// =====================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserPreferences } from '../hooks';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

interface SettingsScreenProps {
  navigation: any;
}

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  time: string;
  onTimeSelect: (time: string) => void;
  onClose: () => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  title,
  time,
  onTimeSelect,
  onClose,
}) => {
  const [selectedHour, setSelectedHour] = useState(time.split(':')[0]);
  const [selectedMinute, setSelectedMinute] = useState(time.split(':')[1]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleConfirm = () => {
    onTimeSelect(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.timePickerModal}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>
              Intervallo minimo tra consigli: {preferences?.min_intervention_gap_minutes ?? 90} min
            </Text>
            <View style={styles.sliderContainer}>
              {[30, 60, 90, 120, 180, 240].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderOption,
                    preferences?.min_intervention_gap_minutes === value && styles.selectedSliderOption
                  ]}
                  onPress={() => updateInterventionLimits(undefined, value)}
                >
                  <Text style={[
                    styles.sliderOptionText,
                    preferences?.min_intervention_gap_minutes === value && styles.selectedSliderOptionText
                  ]}>
                    {value}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerVisible}
        title={timePickerType === 'start' ? 'Ora di inizio' : 'Ora di fine'}
        time={
          timePickerType === 'start'
            ? preferences?.quiet_hours?.start_time ?? '22:00'
            : preferences?.quiet_hours?.end_time ?? '07:00'
        }
        onTimeSelect={handleQuietHoursTimeChange}
        onClose={() => setTimePickerVisible(false)}
      />

      {/* Focus Area Modal */}
      <Modal
        visible={showFocusAreaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFocusAreaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.focusAreaModal}>
            <Text style={styles.modalTitle}>Aggiungi Area di Focus</Text>
            
            <TextInput
              style={styles.focusAreaInput}
              placeholder="Es. Meditazione, Esercizio fisico..."
              placeholderTextColor="#6b7280"
              value={focusAreaInput}
              onChangeText={setFocusAreaInput}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowFocusAreaModal(false);
                  setFocusAreaInput('');
                }}
              >
                <Text style={styles.modalCancelText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  !focusAreaInput.trim() && styles.disabledButton
                ]}
                onPress={handleAddFocusArea}
                disabled={!focusAreaInput.trim()}
              >
                <Text style={[
                  styles.modalConfirmText,
                  !focusAreaInput.trim() && styles.disabledButtonText
                ]}>
                  Aggiungi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  unsavedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97316',
  },
  saveStatus: {
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  saveStatusText: {
    fontSize: 12,
    color: '#f97316',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  setting: {
    marginBottom: 24,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  selectedOption: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  optionText: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusAreaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  focusAreaText: {
    fontSize: 14,
    color: '#e5e7eb',
    marginRight: 8,
  },
  removeChipButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeChipText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  timeSettings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeSetting: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sliderOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  selectedSliderOption: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  sliderOptionText: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  selectedSliderOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerModal: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeScroll: {
    height: 120,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  timeOption: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: '#7c3aed',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  selectedTimeOptionText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  focusAreaModal: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  focusAreaInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalConfirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#4b5563',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
});styles.timePickerContainer}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Ore</Text>
              <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeOption,
                      selectedHour === hour && styles.selectedTimeOption
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      selectedHour === hour && styles.selectedTimeOptionText
                    ]}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Minuti</Text>
              <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.timeOption,
                      selectedMinute === minute && styles.selectedTimeOption
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      selectedMinute === minute && styles.selectedTimeOptionText
                    ]}>
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelText}>Annulla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirm}>
              <Text style={styles.modalConfirmText}>Conferma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'start' | 'end'>('start');
  const [focusAreaInput, setFocusAreaInput] = useState('');
  const [showFocusAreaModal, setShowFocusAreaModal] = useState(false);

  const {
    preferences,
    loading,
    error,
    updateChronotype,
    updateSensitivityLevel,
    updateTonePreference,
    updateFocusAreas,
    updateQuietHours,
    toggleQuietHours,
    toggleNotification,
    updateInterventionLimits,
    hasPendingChanges,
    getTimeSinceLastSave,
  } = useUserPreferences();

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (hasPendingChanges()) {
      Alert.alert(
        'Modifiche non salvate',
        'Hai delle modifiche non salvate. Vuoi salvare prima di uscire?',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Esci senza salvare', onPress: () => navigation.goBack() },
          { text: 'Salva ed esci', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasPendingChanges, navigation]);

  // Handle quiet hours time change
  const handleQuietHoursTimeChange = useCallback((time: string) => {
    if (timePickerType === 'start') {
      updateQuietHours({ start_time: time });
    } else {
      updateQuietHours({ end_time: time });
    }
  }, [timePickerType, updateQuietHours]);

  // Handle focus area addition
  const handleAddFocusArea = useCallback(() => {
    if (focusAreaInput.trim()) {
      const currentAreas = preferences?.focus_areas || [];
      const newAreas = [...currentAreas, focusAreaInput.trim()];
      updateFocusAreas(newAreas);
      setFocusAreaInput('');
      setShowFocusAreaModal(false);
    }
  }, [focusAreaInput, preferences, updateFocusAreas]);

  // Handle focus area removal
  const handleRemoveFocusArea = useCallback((index: number) => {
    const currentAreas = preferences?.focus_areas || [];
    const newAreas = currentAreas.filter((_, i) => i !== index);
    updateFocusAreas(newAreas);
  }, [preferences, updateFocusAreas]);

  if (loading && !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <LoadingSpinner message="Caricamento preferenze..." />
      </SafeAreaView>
    );
  }

  if (error && !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <ErrorBanner message="Impossibile caricare le preferenze" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impostazioni</Text>
        <View style={styles.headerRight}>
          {hasPendingChanges() && <View style={styles.unsavedDot} />}
        </View>
      </View>

      {/* Save Status */}
      {hasPendingChanges() && (
        <View style={styles.saveStatus}>
          <Text style={styles.saveStatusText}>
            Modifiche non salvate • {getTimeSinceLastSave()}
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profilo</Text>

          {/* Chronotype */}
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Cronotipo</Text>
            <Text style={styles.settingDescription}>
              Quando ti senti più produttivo?
            </Text>
            <View style={styles.optionGroup}>
              {[
                { key: 'early_bird', label: 'Mattiniero' },
                { key: 'intermediate', label: 'Intermedio' },
                { key: 'night_owl', label: 'Nottambulo' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    preferences?.chronotype === option.key && styles.selectedOption
                  ]}
                  onPress={() => updateChronotype(option.key as any)}
                >
                  <Text style={[
                    styles.optionText,
                    preferences?.chronotype === option.key && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sensitivity Level */}
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Livello di sensibilità</Text>
            <Text style={styles.settingDescription}>
              Quanto intensi vuoi che siano i consigli?
            </Text>
            <View style={styles.optionGroup}>
              {[
                { key: 'gentle', label: 'Delicato' },
                { key: 'moderate', label: 'Moderato' },
                { key: 'enthusiastic', label: 'Entusiasta' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    preferences?.sensitivity_level === option.key && styles.selectedOption
                  ]}
                  onPress={() => updateSensitivityLevel(option.key as any)}
                >
                  <Text style={[
                    styles.optionText,
                    preferences?.sensitivity_level === option.key && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preferred Tone */}
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Tono preferito</Text>
            <Text style={styles.settingDescription}>
              Come preferisci che ti parli l'assistente?
            </Text>
            <View style={styles.optionGroup}>
              {[
                { key: 'professional', label: 'Professionale' },
                { key: 'friendly', label: 'Amichevole' },
                { key: 'casual', label: 'Informale' },
                { key: 'motivational', label: 'Motivazionale' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    preferences?.preferred_tone === option.key && styles.selectedOption
                  ]}
                  onPress={() => updateTonePreference(option.key as any)}
                >
                  <Text style={[
                    styles.optionText,
                    preferences?.preferred_tone === option.key && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Focus Areas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aree di Focus</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowFocusAreaModal(true)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.focusAreas}>
            {preferences?.focus_areas?.map((area, index) => (
              <View key={index} style={styles.focusAreaChip}>
                <Text style={styles.focusAreaText}>{area}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFocusArea(index)}
                  style={styles.removeChipButton}
                >
                  <Text style={styles.removeChipText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifiche</Text>

          {/* Quiet Hours */}
          <View style={styles.setting}>
            <View style={styles.settingHeader}>
              <View>
                <Text style={styles.settingLabel}>Ore di silenzio</Text>
                <Text style={styles.settingDescription}>
                  Non ricevere consigli durante queste ore
                </Text>
              </View>
              <Switch
                value={preferences?.quiet_hours?.enabled ?? true}
                onValueChange={toggleQuietHours}
                trackColor={{ false: '#374151', true: '#7c3aed' }}
                thumbColor="#ffffff"
              />
            </View>

            {preferences?.quiet_hours?.enabled && (
              <View style={styles.timeSettings}>
                <TouchableOpacity
                  style={styles.timeSetting}
                  onPress={() => {
                    setTimePickerType('start');
                    setTimePickerVisible(true);
                  }}
                >
                  <Text style={styles.timeLabel}>Inizio</Text>
                  <Text style={styles.timeValue}>
                    {preferences.quiet_hours.start_time}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeSetting}
                  onPress={() => {
                    setTimePickerType('end');
                    setTimePickerVisible(true);
                  }}
                >
                  <Text style={styles.timeLabel}>Fine</Text>
                  <Text style={styles.timeValue}>
                    {preferences.quiet_hours.end_time}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Notification Types */}
          {Object.entries({
            push_enabled: 'Notifiche push',
            advice_notifications: 'Consigli',
            achievement_notifications: 'Achievements',
            weekly_report_notifications: 'Report settimanali',
            reminder_notifications: 'Promemoria',
          }).map(([key, label]) => (
            <View key={key} style={styles.setting}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingLabel}>{label}</Text>
                <Switch
                  value={preferences?.notification_settings?.[key as keyof typeof preferences.notification_settings] ?? true}
                  onValueChange={() => toggleNotification(key as any)}
                  trackColor={{ false: '#374151', true: '#7c3aed' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Intervention Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consigli</Text>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>
              Massimo consigli giornalieri: {preferences?.max_daily_interventions ?? 5}
            </Text>
            <View style={styles.sliderContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderOption,
                    preferences?.max_daily_interventions === value && styles.selectedSliderOption
                  ]}
                  onPress={() => updateInterventionLimits(value)}
                >
                  <Text style={[
                    styles.sliderOptionText,
                    preferences?.max_daily_interventions === value && styles.selectedSliderOptionText
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={
