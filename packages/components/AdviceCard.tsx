// =====================================================
// LifeOS - Advice Card Component
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
import { MicroAdvice } from '../hooks';
import { LoadingSpinner } from './LoadingSpinner';

const { width } = Dimensions.get('window');

interface AdviceCardProps {
  advice: MicroAdvice;
  isResponding?: boolean;
  onComplete: (sessionId: string, rating?: number, feedback?: string, duration?: number) => Promise<void>;
  onDismiss: (sessionId: string, feedback?: string) => Promise<void>;
  onSnooze: (sessionId: string, duration?: number) => Promise<void>;
  style?: ViewStyle;
}

export const AdviceCard: React.FC<AdviceCardProps> = ({
  advice,
  isResponding = false,
  onComplete,
  onDismiss,
  onSnooze,
  style,
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'complete' | 'dismiss'>('complete');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [startTime] = useState(new Date());
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Entry animation
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
    };
    
    return categoryIcons[advice.category] || '💡';
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
          },
          style,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
            <Text style={styles.categoryText}>{advice.category}</Text>
          </View>
          <View style={styles.priorityContainer}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
            <Text style={styles.priorityText}>{advice.priority}</Text>
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
            <Text style={styles.metadataLabel}>Tipo:</Text>
            <Text style={styles.metadataValue}>{advice.advice_type}</Text>
          </View>
        </View>

        {/* Personalization Factors */}
        {Object.values(advice.personalization_factors).some(Boolean) && (
          <View style={styles.personalizationContainer}>
            <Text style={styles.personalizationTitle}>Personalizzato per te:</Text>
            <View style={styles.personalizationFactors}>
              {advice.personalization_factors.chronotype_optimized && (
                <View style={styles.factorBadge}>
                  <Text style={styles.factorText}>⏰ Timing</Text>
                </View>
              )}
              {advice.personalization_factors.stress_level_considered && (
                <View style={styles.factorBadge}>
                  <Text style={styles.factorText}>🧘 Stress</Text>
                </View>
              )}
              {advice.personalization_factors.energy_level_considered && (
                <View style={styles.factorBadge}>
                  <Text style={styles.factorText}>⚡ Energia</Text>
                </View>
              )}
              {advice.personalization_factors.context_aware && (
                <View style={styles.factorBadge}>
                  <Text style={styles.factorText}>📍 Contesto</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={handleCompletePress}
            disabled={isResponding}
          >
            {isResponding ? (
              <LoadingSpinner size="small" color="#ffffff" />
            ) : (
              <Text style={styles.completeButtonText}>Completato</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.snoozeButton]}
            onPress={handleSnoozePress}
            disabled={isResponding}
          >
            <Text style={styles.snoozeButtonText}>Posticipa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dismissButton]}
            onPress={handleDismissPress}
            disabled={isResponding}
          >
            <Text style={styles.dismissButtonText}>Non ora</Text>
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
              {feedbackType === 'complete' ? 'Consiglio Completato!' : 'Feedback'}
            </Text>

            {feedbackType === 'complete' && (
              <>
                <Text style={styles.modalSubtitle}>Come è andata?</Text>
                
                {/* Rating */}
                <View style={styles.ratingContainer}>
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
              maxLength={200}
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
                <Text style={styles.submitButtonText}>Invia</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    textTransform: 'capitalize',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
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
    marginBottom: 20,
  },
  personalizationTitle: {
    fontSize: 14,
    color: '#9ca3af',
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
    fontSize: 12,
    color: '#e5e7eb',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  completeButton: {
    backgroundColor: '#22c55e',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  snoozeButton: {
    backgroundColor: '#3b82f6',
  },
  snoozeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#374151',
  },
  dismissButtonText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    paddingHorizontal: 8,
  },
  starText: {
    fontSize: 28,
  },
  feedbackInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
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
});
