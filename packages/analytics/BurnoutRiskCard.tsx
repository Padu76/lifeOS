// =====================================================
// LifeOS - Burnout Risk Card Component
// File: BurnoutRiskCard.tsx
// =====================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Alert,
} from 'react-native';

interface BurnoutRiskCardProps {
  riskLevel?: 'low' | 'medium' | 'high' | null;
  riskFactors?: string[];
  recommendedActions?: string[];
  onActionPress?: (action: string) => void;
  onDismiss?: () => void;
  style?: ViewStyle;
  showAnimation?: boolean;
  compact?: boolean;
}

export const BurnoutRiskCard: React.FC<BurnoutRiskCardProps> = ({
  riskLevel = 'low',
  riskFactors = [],
  recommendedActions = [],
  onActionPress,
  onDismiss,
  style,
  showAnimation = true,
  compact = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const warningAnim = useRef(new Animated.Value(0)).current;

  // Get risk styling
  const getRiskStyle = () => {
    switch (riskLevel) {
      case 'high':
        return {
          backgroundColor: '#7f1d1d',
          borderColor: '#ef4444',
          iconColor: '#ef4444',
          textColor: '#fecaca',
          titleColor: '#ffffff',
          icon: '🚨',
          title: 'Rischio Alto',
          description: 'Attenzione! Segni di burnout rilevati',
          urgency: 'Azione immediata necessaria',
        };
      case 'medium':
        return {
          backgroundColor: '#92400e',
          borderColor: '#f59e0b',
          iconColor: '#f59e0b',
          textColor: '#fed7aa',
          titleColor: '#ffffff',
          icon: '⚠️',
          title: 'Rischio Medio',
          description: 'Alcuni segnali di stress elevato',
          urgency: 'Considera misure preventive',
        };
      case 'low':
        return {
          backgroundColor: '#065f46',
          borderColor: '#10b981',
          iconColor: '#10b981',
          textColor: '#a7f3d0',
          titleColor: '#ffffff',
          icon: '✅',
          title: 'Rischio Basso',
          description: 'Benessere mentale stabile',
          urgency: 'Mantieni le buone abitudini',
        };
      default:
        return {
          backgroundColor: '#374151',
          borderColor: '#6b7280',
          iconColor: '#6b7280',
          textColor: '#d1d5db',
          titleColor: '#ffffff',
          icon: '❓',
          title: 'Dati Insufficienti',
          description: 'Raccogli più dati per una valutazione',
          urgency: 'Continua a monitorare',
        };
    }
  };

  const riskStyle = getRiskStyle();

  // Entry animation
  useEffect(() => {
    if (showAnimation) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(warningAnim, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      warningAnim.setValue(1);
    }
  }, [showAnimation, fadeAnim, scaleAnim, warningAnim]);

  // Pulse animation for high risk
  useEffect(() => {
    if (riskLevel === 'high') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();

      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [riskLevel, pulseAnim]);

  // Handle action press
  const handleActionPress = (action: string) => {
    if (onActionPress) {
      onActionPress(action);
    } else {
      // Default behavior - show alert with action details
      Alert.alert(
        'Azione Consigliata',
        action,
        [{ text: 'OK' }]
      );
    }
  };

  // Get priority actions (max 3)
  const getPriorityActions = (): string[] => {
    if (riskLevel === 'high') {
      return [
        'Prendi una pausa immediata di 15-30 minuti',
        'Pratica respirazione profonda per 5 minuti',
        'Contatta un professionista se i sintomi persistono',
        ...recommendedActions,
      ].slice(0, 3);
    } else if (riskLevel === 'medium') {
      return [
        'Pianifica pause regolari durante la giornata',
        'Riduci il carico di lavoro se possibile',
        'Dedica tempo ad attività rilassanti',
        ...recommendedActions,
      ].slice(0, 3);
    } else {
      return [
        'Mantieni routine di benessere attuali',
        'Continua monitoraggio regolare',
        'Celebra i progressi fatti',
        ...recommendedActions,
      ].slice(0, 3);
    }
  };

  const priorityActions = getPriorityActions();

  // Compact version
  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          {
            backgroundColor: riskStyle.backgroundColor,
            borderColor: riskStyle.borderColor,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactIcon}>{riskStyle.icon}</Text>
          <View style={styles.compactInfo}>
            <Text style={[styles.compactTitle, { color: riskStyle.titleColor }]}>
              {riskStyle.title}
            </Text>
            <Text style={[styles.compactDescription, { color: riskStyle.textColor }]}>
              {riskStyle.description}
            </Text>
          </View>
          {riskLevel === 'high' && (
            <TouchableOpacity
              style={styles.compactActionButton}
              onPress={() => handleActionPress(priorityActions[0])}
            >
              <Text style={styles.compactActionText}>Azione</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  }

  // Don't show card if no risk level
  if (!riskLevel) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
        style,
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: riskStyle.backgroundColor,
            borderColor: riskStyle.borderColor,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Animated.Text
              style={[
                styles.riskIcon,
                {
                  color: riskStyle.iconColor,
                  transform: [
                    {
                      scale: warningAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {riskStyle.icon}
            </Animated.Text>
            <View>
              <Text style={[styles.riskTitle, { color: riskStyle.titleColor }]}>
                Valutazione Burnout
              </Text>
              <Text style={[styles.riskLevel, { color: riskStyle.iconColor }]}>
                {riskStyle.title}
              </Text>
            </View>
          </View>
          
          {onDismiss && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: riskStyle.textColor }]}>
          {riskStyle.description}
        </Text>

        {/* Urgency Level */}
        <View style={styles.urgencyContainer}>
          <Text style={[styles.urgencyText, { color: riskStyle.iconColor }]}>
            {riskStyle.urgency}
          </Text>
        </View>

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <View style={styles.factorsContainer}>
            <Text style={[styles.factorsTitle, { color: riskStyle.titleColor }]}>
              🔍 Fattori di Rischio Identificati
            </Text>
            {riskFactors.slice(0, 3).map((factor, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.factorItem,
                  {
                    opacity: warningAnim,
                    transform: [
                      {
                        translateX: warningAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.factorBullet}>•</Text>
                <Text style={[styles.factorText, { color: riskStyle.textColor }]}>
                  {factor}
                </Text>
              </Animated.View>
            ))}
            {riskFactors.length > 3 && (
              <Text style={[styles.moreFactors, { color: riskStyle.textColor }]}>
                +{riskFactors.length - 3} altri fattori
              </Text>
            )}
          </View>
        )}

        {/* Recommended Actions */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.actionsTitle, { color: riskStyle.titleColor }]}>
            💡 Azioni Consigliate
          </Text>
          
          {priorityActions.map((action, index) => (
            <Animated.View
              key={index}
              style={[
                {
                  opacity: warningAnim,
                  transform: [
                    {
                      translateY: warningAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: index === 0 ? riskStyle.iconColor : 'transparent',
                    borderColor: riskStyle.iconColor,
                  },
                ]}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: index === 0 ? '#ffffff' : riskStyle.iconColor,
                      fontWeight: index === 0 ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {action}
                </Text>
                {index === 0 && riskLevel === 'high' && (
                  <Text style={styles.priorityBadge}>PRIORITÀ</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Progress Indicator for Risk Level */}
        <View style={styles.riskMeterContainer}>
          <Text style={[styles.riskMeterTitle, { color: riskStyle.titleColor }]}>
            Livello di Rischio
          </Text>
          <View style={styles.riskMeter}>
            <View style={[styles.riskSegment, styles.lowRisk]} />
            <View style={[styles.riskSegment, styles.mediumRisk]} />
            <View style={[styles.riskSegment, styles.highRisk]} />
            
            <Animated.View
              style={[
                styles.riskIndicator,
                {
                  left: getRiskIndicatorPosition(),
                  backgroundColor: riskStyle.iconColor,
                  transform: [
                    {
                      scale: warningAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          
          <View style={styles.riskLabels}>
            <Text style={styles.riskLabel}>Basso</Text>
            <Text style={styles.riskLabel}>Medio</Text>
            <Text style={styles.riskLabel}>Alto</Text>
          </View>
        </View>

        {/* Emergency Contact (for high risk) */}
        {riskLevel === 'high' && (
          <Animated.View
            style={[
              styles.emergencyContainer,
              {
                opacity: warningAnim,
              },
            ]}
          >
            <Text style={styles.emergencyTitle}>🆘 Supporto Immediato</Text>
            <Text style={styles.emergencyText}>
              Se ti senti sopraffatto, considera di contattare un professionista della salute mentale o una linea di supporto.
            </Text>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => handleActionPress('Contatta supporto professionale')}
            >
              <Text style={styles.emergencyButtonText}>Trova Supporto</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );

  // Helper function to get risk indicator position
  function getRiskIndicatorPosition(): string {
    switch (riskLevel) {
      case 'low': return '16.67%'; // 1/6 of the way
      case 'medium': return '50%'; // Middle
      case 'high': return '83.33%'; // 5/6 of the way
      default: return '0%';
    }
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  riskIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  riskLevel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dismissButton: {
    padding: 8,
  },
  dismissText: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  urgencyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  factorsContainer: {
    marginBottom: 20,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  factorBullet: {
    fontSize: 16,
    color: '#ef4444',
    marginRight: 8,
    lineHeight: 20,
  },
  factorText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  moreFactors: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    position: 'relative',
  },
  actionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  priorityBadge: {
    position: 'absolute',
    top: -6,
    right: 8,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskMeterContainer: {
    marginBottom: 16,
  },
  riskMeterTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  riskMeter: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  riskSegment: {
    flex: 1,
  },
  lowRisk: {
    backgroundColor: '#10b981',
  },
  mediumRisk: {
    backgroundColor: '#f59e0b',
  },
  highRisk: {
    backgroundColor: '#ef4444',
  },
  riskIndicator: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  riskLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  emergencyContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 12,
    color: '#fecaca',
    lineHeight: 18,
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  compactContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  compactDescription: {
    fontSize: 11,
  },
  compactActionButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  compactActionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
