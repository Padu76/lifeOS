// =====================================================
// LifeOS - Onboarding Screen Component
// File: OnboardingScreen.tsx
// =====================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserInitialization } from '../hooks';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LifeScoreInput } from '../components/LifeScoreInput';
import { ProgressBar } from '../components/ProgressBar';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

interface StepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  canProceed?: boolean;
  isLastStep?: boolean;
}

const StepContainer: React.FC<StepProps> = ({
  title,
  subtitle,
  children,
  onNext,
  onPrevious,
  canProceed = true,
  isLastStep = false,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{title}</Text>
        {subtitle && <Text style={styles.stepSubtitle}>{subtitle}</Text>}
      </View>

      <ScrollView 
        style={styles.stepContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.stepContentContainer}
      >
        {children}
      </ScrollView>

      <View style={styles.stepFooter}>
        {onPrevious && (
          <TouchableOpacity style={styles.previousButton} onPress={onPrevious}>
            <Text style={styles.previousButtonText}>Indietro</Text>
          </TouchableOpacity>
        )}
        
        {onNext && (
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed && styles.disabledButton,
              !onPrevious && styles.fullWidthButton,
            ]}
            onPress={onNext}
            disabled={!canProceed}
          >
            <Text style={[
              styles.nextButtonText,
              !canProceed && styles.disabledButtonText,
            ]}>
              {isLastStep ? 'Completa Setup' : 'Avanti'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [customGoal, setCustomGoal] = useState('');

  const {
    progress,
    answers,
    result,
    isCompleted,
    loading,
    error,
    nextStep,
    previousStep,
    setChronotype,
    setSensitivityLevel,
    setPreferredTone,
    setFocusAreas,
    setCurrentLevels,
    setMainGoals,
    setTimeAvailability,
    setNotificationPreferences,
    setQuietHours,
    completeOnboarding,
    getCompletionPercentage,
    canProceed,
  } = useUserInitialization();

  // Handle completion
  useEffect(() => {
    if (isCompleted && result) {
      Alert.alert(
        'Benvenuto in LifeOS!',
        'Il tuo profilo è stato configurato con successo. Iniziamo il tuo percorso di benessere!',
        [
          {
            text: 'Inizia',
            onPress: () => navigation.replace('Dashboard'),
          },
        ]
      );
    }
  }, [isCompleted, result, navigation]);

  // Handle goal selection
  const handleGoalToggle = useCallback((goal: string) => {
    const currentGoals = answers.main_goals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    setMainGoals(newGoals);
  }, [answers.main_goals, setMainGoals]);

  // Handle custom goal addition
  const handleAddCustomGoal = useCallback(() => {
    if (customGoal.trim()) {
      const currentGoals = answers.main_goals || [];
      setMainGoals([...currentGoals, customGoal.trim()]);
      setCustomGoal('');
    }
  }, [customGoal, answers.main_goals, setMainGoals]);

  // Handle focus area selection
  const handleFocusAreaToggle = useCallback((area: string) => {
    const currentAreas = answers.focus_areas || [];
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    setFocusAreas(newAreas);
  }, [answers.focus_areas, setFocusAreas]);

  // Handle final completion
  const handleComplete = useCallback(async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      Alert.alert('Errore', 'Impossibile completare la configurazione. Riprova.');
    }
  }, [completeOnboarding]);

  const renderCurrentStep = () => {
    switch (progress.currentSection) {
      case 'profile':
        return (
          <StepContainer
            title="Raccontaci di te"
            subtitle="Queste informazioni ci aiutano a personalizzare la tua esperienza"
            onNext={() => nextStep()}
            canProceed={canProceed()}
          >
            {/* Chronotype */}
            <View style={styles.questionGroup}>
              <Text style={styles.questionTitle}>Quando ti senti più produttivo?</Text>
              <View style={styles.optionGrid}>
                {[
                  { key: 'early_bird', label: '🌅 Mattiniero', desc: 'Al meglio la mattina presto' },
                  { key: 'intermediate', label: '☀️ Intermedio', desc: 'Costante durante il giorno' },
                  { key: 'night_owl', label: '🌙 Nottambulo', desc: 'Più attivo la sera/notte' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionCard,
                      answers.chronotype === option.key && styles.selectedOptionCard,
                    ]}
                    onPress={() => setChronotype(option.key as any)}
                  >
                    <Text style={[
                      styles.optionLabel,
                      answers.chronotype === option.key && styles.selectedOptionLabel,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      answers.chronotype === option.key && styles.selectedOptionDescription,
                    ]}>
                      {option.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sensitivity Level */}
            <View style={styles.questionGroup}>
              <Text style={styles.questionTitle}>Quanto intensi vuoi che siano i nostri consigli?</Text>
              <View style={styles.optionGrid}>
                {[
                  { key: 'gentle', label: '🌸 Delicato', desc: 'Suggerimenti leggeri e graduali' },
                  { key: 'moderate', label: '⚖️ Moderato', desc: 'Bilanciato tra gentile e motivante' },
                  { key: 'enthusiastic', label: '🚀 Entusiasta', desc: 'Consigli energici e sfidanti' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionCard,
                      answers.sensitivity_level === option.key && styles.selectedOptionCard,
                    ]}
                    onPress={() => setSensitivityLevel(option.key as any)}
                  >
                    <Text style={[
                      styles.optionLabel,
                      answers.sensitivity_level === option.key && styles.selectedOptionLabel,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      answers.sensitivity_level === option.key && styles.selectedOptionDescription,
                    ]}>
                      {option.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preferred Tone */}
            <View style={styles.questionGroup}>
              <Text style={styles.questionTitle}>Come preferisci che ti parli?</Text>
              <View style={styles.optionGrid}>
                {[
                  { key: 'professional', label: '💼 Professionale', desc: 'Formale e diretto' },
                  { key: 'friendly', label: '😊 Amichevole', desc: 'Caloroso e comprensivo' },
                  { key: 'casual', label: '🤝 Informale', desc: 'Rilassato e spontaneo' },
                  { key: 'motivational', label: '💪 Motivazionale', desc: 'Energico e ispirante' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionCard,
                      answers.preferred_tone === option.key && styles.selectedOptionCard,
                    ]}
                    onPress={() => setPreferredTone(option.key as any)}
                  >
                    <Text style={[
                      styles.optionLabel,
                      answers.preferred_tone === option.key && styles.selectedOptionLabel,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      answers.preferred_tone === option.key && styles.selectedOptionDescription,
                    ]}>
                      {option.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </StepContainer>
        );

      case 'assessment':
        return (
          <StepContainer
            title="Valutazione iniziale"
            subtitle="Come ti senti oggi? Questo ci aiuta a creare il tuo Life Score di partenza"
            onNext={() => nextStep()}
            onPrevious={() => previousStep()}
            canProceed={canProceed()}
          >
            <LifeScoreInput
              stressLevel={answers.current_stress_level}
              energyLevel={answers.current_energy_level}
              sleepQuality={answers.current_sleep_quality}
              onStressChange={(value) => setCurrentLevels(value, answers.current_energy_level || 5, answers.current_sleep_quality || 5)}
              onEnergyChange={(value) => setCurrentLevels(answers.current_stress_level || 5, value, answers.current_sleep_quality || 5)}
              onSleepChange={(value) => setCurrentLevels(answers.current_stress_level || 5, answers.current_energy_level || 5, value)}
            />
          </StepContainer>
        );

      case 'preferences':
        return (
          <StepContainer
            title="Aree di interesse"
            subtitle="Seleziona le aree su cui vuoi concentrarti"
            onNext={() => nextStep()}
            onPrevious={() => previousStep()}
            canProceed={canProceed()}
          >
            <View style={styles.questionGroup}>
              <Text style={styles.questionTitle}>Su cosa vuoi lavorare? (Seleziona 2-5 aree)</Text>
              <View style={styles.chipGrid}>
                {[
                  '🧘 Gestione stress',
                  '⚡ Energia e vitalità',
                  '😴 Qualità del sonno',
                  '🎯 Focus e concentrazione',
                  '🏃 Attività fisica',
                  '🥗 Alimentazione',
                  '👥 Relazioni sociali',
                  '🌸 Mindfulness',
                  '💼 Produttività',
                  '🛋️ Recovery e riposo',
                  '📚 Apprendimento',
                  '🎨 Creatività',
                ].map((area) => (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.chip,
                      answers.focus_areas?.includes(area) && styles.selectedChip,
                    ]}
                    onPress={() => handleFocusAreaToggle(area)}
                  >
                    <Text style={[
                      styles.chipText,
                      answers.focus_areas?.includes(area) && styles.selectedChipText,
                    ]}>
                      {area}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </StepContainer>
        );

      case 'goals':
        return (
          <StepContainer
            title="I tuoi obiettivi"
            subtitle="Cosa vuoi raggiungere con LifeOS?"
            onNext={() => nextStep()}
            onPrevious={() => previousStep()}
            canProceed={canProceed()}
          >
            <View style={styles.questionGroup}>
              <Text style={styles.questionTitle}>Seleziona i tuoi obiettivi principali</Text>
              <View style={styles.chipGrid}>
                {[
                  'Ridurre lo stress',
                  'Aumentare l\'energia',
                  'Migliorare il sonno',
                  'Essere più produttivo',
                  'Creare abitudini sane',
                  'Trovare equilibrio vita-lavoro',
                  'Migliorare l\'umore',
                  'Aumentare la concentrazione',
                ].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.chip,
                      answers.main_goals?.includes(goal) && styles.selectedChip,
                    ]}
                    onPress={() => handleGoalToggle(goal)}
                  >
                    <Text style={[
                      styles.chipText,
                      answers.main_goals?.includes(goal) && styles.selectedChipText,
                    ]}>
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Goal Input */}
              <View style={styles.customGoalContainer}>
                <TextInput
                  style={styles.customGoalInput}
                  placeholder="Aggiungi un obiettivo personalizzato..."
                  placeholderTextColor="#6b7280"
                  value={customGoal}
                  onChangeText={setCustomGoal}
                  onSubmitEditing={handleAddCustomGoal}
                />
                {customGoal.trim() && (
                  <TouchableOpacity
                    style={styles.addGoalButton}
                    onPress={handleAddCustomGoal}
                  >
                    <Text style={styles.addGoalButtonText}>Aggiungi</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Time Availability */}
            <View style={styles.questionGroup}>
              <Text style={styles.questionTitle}>Quanto tempo puoi dedicare ai micro-consigli?</Text>
              <View style={styles.optionGrid}>
                {[
                  { key: 'low', label: '⏱️ Poco tempo', desc: '2-5 minuti per consiglio' },
                  { key: 'medium', label: '⏰ Tempo moderato', desc: '5-15 minuti per consiglio' },
                  { key: 'high', label: '🕐 Molto tempo', desc: '15+ minuti per consiglio' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionCard,
                      answers.time_availability === option.key && styles.selectedOptionCard,
                    ]}
                    onPress={() => setTimeAvailability(option.key as any)}
                  >
                    <Text style={[
                      styles.optionLabel,
                      answers.time_availability === option.key && styles.selectedOptionLabel,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      answers.time_availability === option.key && styles.selectedOptionDescription,
                    ]}>
                      {option.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </StepContainer>
        );

      case 'finalization':
        return (
          <StepContainer
            title="Configurazione finale"
            subtitle="Ultimi dettagli per personalizzare la tua esperienza"
            onNext={handleComplete}
            onPrevious={() => previousStep()}
            canProceed={true}
            isLastStep={true}
          >
            {/* Notification Settings */}
            <View style={styles.questionGroup}>
              <Text style={styles.questionTitle}>Preferenze notifiche</Text>
              <View style={styles.notificationSettings}>
                <TouchableOpacity
                  style={[
                    styles.notificationOption,
                    answers.notification_preferences?.push_enabled && styles.selectedNotificationOption,
                  ]}
                  onPress={() => setNotificationPreferences(!answers.notification_preferences?.push_enabled, answers.notification_preferences?.optimal_times || [])}
                >
                  <Text style={[
                    styles.notificationOptionText,
                    answers.notification_preferences?.push_enabled && styles.selectedNotificationOptionText,
                  ]}>
                    📱 Abilita notifiche push
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quiet Hours */}
            <View style={styles.questionGroup}>
              <Text style={styles.questionTitle}>Ore di silenzio (opzionale)</Text>
              <Text style={styles.questionDescription}>
                Quando preferisci non ricevere consigli?
              </Text>
              <View style={styles.timeInputContainer}>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setQuietHours('22:00', answers.quiet_hours?.end_time || '07:00')}
                >
                  <Text style={styles.timeInputLabel}>Dalle</Text>
                  <Text style={styles.timeInputValue}>
                    {answers.quiet_hours?.start_time || '22:00'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setQuietHours(answers.quiet_hours?.start_time || '22:00', '07:00')}
                >
                  <Text style={styles.timeInputLabel}>Alle</Text>
                  <Text style={styles.timeInputValue}>
                    {answers.quiet_hours?.end_time || '07:00'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Riepilogo del tuo profilo:</Text>
              <Text style={styles.summaryText}>
                • Cronotipo: {answers.chronotype === 'early_bird' ? 'Mattiniero' : answers.chronotype === 'night_owl' ? 'Nottambulo' : 'Intermedio'}
              </Text>
              <Text style={styles.summaryText}>
                • Sensibilità: {answers.sensitivity_level === 'gentle' ? 'Delicato' : answers.sensitivity_level === 'moderate' ? 'Moderato' : 'Entusiasta'}
              </Text>
              <Text style={styles.summaryText}>
                • Aree di focus: {answers.focus_areas?.length || 0} selezionate
              </Text>
              <Text style={styles.summaryText}>
                • Obiettivi: {answers.main_goals?.length || 0} selezionati
              </Text>
            </View>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <LoadingSpinner message="Configurazione del tuo profilo..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurazione LifeOS</Text>
        <Text style={styles.headerSubtitle}>
          Passo {progress.step} di {progress.totalSteps}
        </Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar progress={getCompletionPercentage()} style={styles.progressBar} />

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Current Step */}
      {renderCurrentStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  progressBar: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#ef4444',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepContentContainer: {
    paddingBottom: 20,
  },
  stepFooter: {
    flexDirection: 'row',
    paddingVertical: 20,
    gap: 12,
  },
  previousButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  previousButtonText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidthButton: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#4b5563',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  questionGroup: {
    marginBottom: 32,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  questionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
  },
  selectedOptionCard: {
    borderColor: '#7c3aed',
    backgroundColor: '#1e1b4b',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  selectedOptionLabel: {
    color: '#ffffff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  selectedOptionDescription: {
    color: '#c4b5fd',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  selectedChip: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  chipText: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  selectedChipText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  customGoalContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  customGoalInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  addGoalButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  addGoalButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationSettings: {
    gap: 8,
  },
  notificationOption: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  selectedNotificationOption: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  notificationOptionText: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  selectedNotificationOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeInputLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  timeInputValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 4,
    lineHeight: 20,
  },
});
