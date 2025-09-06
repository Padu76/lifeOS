// =====================================================
// LifeOS - Advice Card Component (Complete)
// File: AdviceCard.tsx
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ViewStyle,
} from 'react-native';

const { width } = Dimensions.get('window');

interface MicroAdvice {
  session_id: string;
  advice_text: string;
  advice_type: 'immediate' | 'scheduled' | 'contextual';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimated_duration_minutes: number;
  expires_at: string;
  created_at: string;
  personalization_factors: {
    chronotype_optimized: boolean;
    stress_level_considered: boolean;
    energy_level_considered: boolean;
    context_aware: boolean;
  };
  effectiveness_tracking: {
    expected_stress_impact: number;
    expected_energy_impact: number;
    confidence_score: number;
  };
}

interface AdviceCardProps {
  advice: MicroAdvice;
  isResponding?: boolean;
  onComplete: (sessionId: string, rating?: number, feedback?: string, duration?: number) => Promise<void>;
  onDismiss: (sessionId: string, feedback?: string) => Promise<void>;
  onSnooze: (sessionId: string, duration?: number) => Promise<void>;
  style?: ViewStyle;
  showAnimation?: boolean;
  compact?: boolean;
}

export const AdviceCard: React.FC<AdviceCardProps> = ({
  advice,
  isResponding = false,
  onComplete,
  onDismiss,
  onSnooze,
  style,
  showAnimation = true,
  compact = false,
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'complete' | 'dismiss'>('complete');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [startTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    if (showAnimation) {
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
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [showAnimation, fadeAnim, slideAnim]);

  // Pulse animation for high priority advice
  useEffect(() => {
    if (advice.priority === 'high' || advice.priority === 'urgent') {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulse).start();
    }
  }, [advice.priority, pulseAnim]);

  // Glow animation for urgent advice
  useEffect(() => {
    if (advice.priority === 'urgent') {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      glow.start();

      return () => glow.stop();
    }
  }, [advice.priority, glowAnim]);

  // Calculate actual duration
  const calculateDuration = (): number => {
    return Math.round((Date.now() - startTime.getTime()) / (1000 * 60)); // minutes
  };

  // Handle complete button press
  const handleCompletePress = () => {
    setFeedbackType('complete');
    setDuration(calculateDuration());
    setShowFeedbackModal(true);
  };

  // Handle dismiss button press
  const handleDismissPress = () => {
    setFeedbackType('dismiss');
    setShowFeedbackModal(true);
  };

  // Handle snooze button press
  const handleSnoozePress = () => {
    Alert.alert(
      'Posticipa Consiglio',
      'Tra quanto tempo vuoi ricevere di nuovo questo consiglio?',
      [
        { text: '15 minuti', onPress: () => onSnooze(advice.session_id, 15) },
        { text: '30 minuti', onPress: () => onSnooze(advice.session_id, 30) },
        { text: '1 ora', onPress: () => onSnooze(advice.session_id, 60) },
        { text: '2 ore', onPress: () => onSnooze(advice.session_id, 120) },
        { text: 'Annulla', style: 'cancel' },
      ]
    );
  };

  // Submit feedback
  const submitFeedback = async () => {
    try {
      if (feedbackType === 'complete') {
        await onComplete(advice.session_id, rating, feedback, duration);
      } else {
        await onDismiss(advice.session_id, feedback);
      }
      
      setShowFeedbackModal(false);
      setFeedback('');
      setRating(5);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile inviare il feedback. Riprova.');
    }
  };

  // Get priority color
  const getPriorityColor = (): string => {
    switch (advice.priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6366f1';
    }
  };

  // Get category icon
  const getCategoryIcon = (): string => {
    const categoryIcons: Record<string, string> = {
      stress: '🧘',
      energy: '⚡',
      sleep: '😴',
      focus: '🎯',
      movement: '🏃',
      nutrition: '🥗',
      social: '👥',
      mindfulness: '🌸',
      productivity: '💼',
      recovery: '🛋️',
      breathing: '🫁',
      meditation: '🧘‍♀️',
      exercise: '💪',
      hydration: '💧',
      reading: '📚',
      creativity: '🎨',
    };
    
    return categoryIcons[advice.category.toLowerCase()] || '💡';
  };

  // Format estimated duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Check if advice is expired
  const isExpired = (): boolean => {
    return new Date(advice.expires_at) < new Date();
  };

  // Get time until expiry
  const getTimeUntilExpiry = (): string => {
    const now = new Date();
    const expiry = new Date(advice.expires_at);
    const diffMs = expiry.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes <= 0) return 'Scaduto';
    if (diffMinutes < 60) return `${diffMinutes}min rimanenti`;
    
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h rimanenti`;
  };

  // Compact version
  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
            borderLeftColor: getPriorityColor(),
          },
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.compactCard}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.compactHeader}>
            <Text style={styles.compactIcon}>{getCategoryIcon()}</Text>
            <View style={styles.compactContent}>
              <Text style={styles.compactTitle} numberOfLines={1}>
                {advice.category}
              </Text>
              <Text style={styles.compactText} numberOfLines={2}>
                {advice.advice_text}
              </Text>
            </View>
            <View style={[styles.compactPriority, { backgroundColor: getPriorityColor() }]}>
              <Text style={styles.compactPriorityText}>
                {advice.priority[0].toUpperCase()}
              </Text>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.compactActions}>
              <TouchableOpacity
                style={[styles.compactButton, styles.compactCompleteButton]}
                onPress={handleCompletePress}
                disabled={isResponding}
              >
                <Text style={styles.compactButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.compactButton, styles.compactSnoozeButton]}
                onPress={handleSnoozePress}
                disabled={isResponding}
              >
                <Text style={styles.compactButtonText}>⏰</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.compactButton, styles.compactDismissButton]}
                onPress={handleDismissPress}
                disabled={isResponding}
              >
                <Text style={styles.compactButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Check if advice is expired
  if (isExpired()) {
    return (
      <Animated.View
        style={[
          styles.expiredContainer,
          { opacity: fadeAnim },
          style,
        ]}
      >
        <View style={styles.expiredCard}>
          <Text style={styles.expiredIcon}>⏰</Text>
          <Text style={styles.expiredText}>Questo consiglio è scaduto</Text>
          <TouchableOpacity
            style={styles.expiredButton}
            onPress={() => onDismiss(advice.session_id)}
          >
            <Text style={styles.expiredButtonText}>Rimuovi</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: pulseAnim },
            ],
            borderLeftColor: getPriorityColor(),
            shadowColor: advice.priority === 'urgent' ? getPriorityColor() : '#000',
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }),
          },
          style,
        ]}
      >
        {/* Urgent glow overlay */}
        {advice.priority === 'urgent' && (
          <Animated.View
            style={[
              styles.glowOverlay,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.2],
                }),
              },
            ]}
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
            <View>
              <Text style={styles.categoryText}>{advice.category}</Text>
              <Text style={styles.adviceType}>{advice.advice_type}</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={[styles.priorityContainer, { backgroundColor: getPriorityColor() }]}>
              <Text style={styles.priorityText}>{advice.priority}</Text>
            </View>
            <Text style={styles.expiryText}>{getTimeUntilExpiry()}</Text>
          </View>
        </View>

        {/* Advice Text */}
        <Text style={styles.adviceText}>{advice.advice_text}</Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Durata stimata:</Text>
            <Text style={styles.metadataValue}>
              {formatDuration(advice.estimated_duration_minutes)}
            </Text>
          </View>
          
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Fiducia:</Text>
            <Text style={styles.metadataValue}>
              {(advice.effectiveness_tracking.confidence_score * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Personalization Factors */}
        {Object.values(advice.personalization_factors).some(Boolean) && (
          <View style={styles.personalizationContainer}>
            <Text style={styles.personalizationTitle}>🎯 Personalizzato per te:</Text>
            <View style={styles.personalizationFactors}>
              {advice.personalization_factors.chronotype_optimized && (
                <View style={styles.factorBadge}>
                  <Text style={styles.factorText}>⏰ Timing ottimale</Text>
                </View>
              )}
              {advice.personalization_factors.stress_level_considered && (
                <View style={styles.factorBadge}>
                  <Text style={styles.factorText}>🧘 Livello stress</Text>
                </View>
              )}
              {advice.personalization_factors.energy_level_considered && (
                <View style={styles.factorBadge}>
                  <Text style={styles.factorText}>⚡ Livello energia</Text>
                </View>
              )}
              {advice.personalization_factors.context_aware && (
                <View style={styles.factorBadge}>
                  <Text style={styles.factorText}>📍 Contesto attuale</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Expected Impact */}
        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>📈 Impatto previsto:</Text>
          <View style={styles.impactMetrics}>
            <View style={styles.impactItem}>
              <Text style={styles.impactLabel}>Stress</Text>
              <Text style={[
                styles.impactValue,
                { color: advice.effectiveness_tracking.expected_stress_impact > 0 ? '#10b981' : '#ef4444' }
              ]}>
                {advice.effectiveness_tracking.expected_stress_impact > 0 ? '-' : '+'}
                {Math.abs(advice.effectiveness_tracking.expected_stress_impact).toFixed(1)}
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactLabel}>Energia</Text>
              <Text style={[
                styles.impactValue,
                { color: advice.effectiveness_tracking.expected_energy_impact > 0 ? '#10b981' : '#ef4444' }
              ]}>
                {advice.effectiveness_tracking.expected_energy_impact > 0 ? '+' : ''}
                {advice.effectiveness_tracking.expected_energy_impact.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={handleCompletePress}
            disabled={isResponding}
          >
            {isResponding && feedbackType === 'complete' ? (
              <Animated.View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>⟳</Text>
              </Animated.View>
            ) : (
              <>
                <Text style={styles.completeButtonIcon}>✓</Text>
                <Text style={styles.completeButtonText}>Completato</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.snoozeButton]}
            onPress={handleSnoozePress}
            disabled={isResponding}
          >
            <Text style={styles.snoozeButtonIcon}>⏰</Text>
            <Text style={styles.snoozeButtonText}>Posticipa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dismissButton]}
            onPress={handleDismissPress}
            disabled={isResponding}
          >
            {isResponding && feedbackType === 'dismiss' ? (
              <Animated.View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>⟳</Text>
              </Animated.View>
            ) : (
              <>
                <Text style={styles.dismissButtonIcon}>✕</Text>
                <Text style={styles.dismissButtonText}>Non ora</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {feedbackType === 'complete' ? '🎉 Consiglio Completato!' : '💭 Feedback'}
            </Text>

            {feedbackType === 'complete' && (
              <>
                <Text style={styles.modalSubtitle}>Come è andata?</Text>
                
                {/* Rating */}
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingLabel}>Valutazione:</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                      >
                        <Text style={[
                          styles.starText,
                          { color: star <= rating ? '#fbbf24' : '#4b5563' }
                        ]}>
                          ⭐
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Duration Display */}
                <View style={styles.durationContainer}>
                  <Text style={styles.durationLabel}>
                    Tempo impiegato: {formatDuration(duration)}
                  </Text>
                  <Text style={styles.durationComparison}>
                    (stimato: {formatDuration(advice.estimated_duration_minutes)})
                  </Text>
                </View>
              </>
            )}

            {/* Feedback Input */}
            <TextInput
              style={styles.feedbackInput}
              placeholder={
                feedbackType === 'complete' 
                  ? 'Condividi la tua esperienza (opzionale)'
                  : 'Perché non ora? (opzionale)'
              }
              placeholderTextColor="#6b7280"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              maxLength={500}
            />

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitFeedback}
              >
                <Text style={styles.submitButtonText}>
                  {feedbackType === 'complete' ? 'Invia Feedback' : 'Conferma'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ef4444',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  adviceType: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  priorityContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  expiryText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  adviceText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#ffffff',
    marginBottom: 16,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  metadataValue: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  personalizationContainer: {
    marginBottom: 16,
  },
  personalizationTitle: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '600',
    marginBottom: 8,
  },
  personalizationFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  factorBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  factorText: {
    fontSize: 11,
    color: '#d1d5db',
  },
  impactContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  impactTitle: {
    fontSize: 12,
    color: '#e5e7eb',
    fontWeight: '600',
    marginBottom: 8,
  },
  impactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactItem: {
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 2,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: '#22c55e',
  },
  completeButtonIcon: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 6,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  snoozeButton: {
    backgroundColor: '#3b82f6',
  },
  snoozeButtonIcon: {
    fontSize: 14,
    color: '#ffffff',
    marginRight: 6,
  },
  snoozeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#6b7280',
  },
  dismissButtonIcon: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 6,
  },
  dismissButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 8,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    paddingHorizontal: 4,
  },
  starText: {
    fontSize: 28,
  },
  durationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '600',
  },
  durationComparison: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  feedbackInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#7c3aed',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  expiredContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  expiredCard: {
    alignItems: 'center',
  },
  expiredIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  expiredText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
    textAlign: 'center',
  },
  expiredButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  expiredButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  compactContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderLeftWidth: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  compactCard: {
    padding: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  compactText: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 16,
  },
  compactPriority: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactPriorityText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  compactActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  compactButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  compactCompleteButton: {
    backgroundColor: '#22c55e',
  },
  compactSnoozeButton: {
    backgroundColor: '#3b82f6',
  },
  compactDismissButton: {
    backgroundColor: '#6b7280',
  },
  compactButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
