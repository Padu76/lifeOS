// =====================================================
// LifeOS - Error Banner Component
// File: ErrorBanner.tsx
// =====================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ErrorBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  retryText?: string;
  dismissText?: string;
  style?: ViewStyle;
  messageStyle?: TextStyle;
  showIcon?: boolean;
  persistent?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  type = 'error',
  onRetry,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
  retryText = 'Riprova',
  dismissText = '✕',
  style,
  messageStyle,
  showIcon = true,
  persistent = false,
}) => {
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Get type-specific styling
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          icon: '⚠️',
        };
      case 'info':
        return {
          backgroundColor: '#3b82f6',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          icon: 'ℹ️',
        };
      default: // error
        return {
          backgroundColor: '#ef4444',
          iconColor: '#ffffff',
          textColor: '#ffffff',
          icon: '❌',
        };
    }
  };

  const typeStyles = getTypeStyles();

  // Entry animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Shake animation for errors
      if (type === 'error') {
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [visible, fadeAnim, slideAnim, shakeAnim, type]);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && !persistent && visible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, persistent, visible]);

  // Handle dismiss
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  // Handle retry
  const handleRetry = () => {
    onRetry?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: typeStyles.backgroundColor,
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { translateX: shakeAnim },
          ],
        },
        style,
      ]}
    >
      {/* Icon */}
      {showIcon && (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{typeStyles.icon}</Text>
        </View>
      )}

      {/* Message */}
      <View style={styles.messageContainer}>
        <Text
          style={[
            styles.message,
            { color: typeStyles.textColor },
            messageStyle,
          ]}
          numberOfLines={3}
        >
          {message}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {/* Retry Button */}
        {onRetry && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.retryButton,
              { borderColor: typeStyles.textColor },
            ]}
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: typeStyles.textColor },
              ]}
            >
              {retryText}
            </Text>
          </TouchableOpacity>
        )}

        {/* Dismiss Button */}
        {(onDismiss || !persistent) && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.dismissButton,
            ]}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dismissButtonText,
                { color: typeStyles.textColor },
              ]}
            >
              {dismissText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Preset Error Messages
export const ErrorMessages = {
  network: 'Errore di connessione. Controlla la tua connessione internet.',
  server: 'Errore del server. Riprova più tardi.',
  auth: 'Sessione scaduta. Effettua nuovamente il login.',
  validation: 'Dati non validi. Controlla i campi inseriti.',
  generic: 'Si è verificato un errore imprevisto.',
  timeout: 'Richiesta scaduta. Riprova.',
  notFound: 'Risorsa non trovata.',
  permission: 'Non hai i permessi per questa operazione.',
  offline: 'Modalità offline. Alcune funzionalità potrebbero non essere disponibili.',
};

// Preset Warning Messages
export const WarningMessages = {
  unsavedChanges: 'Hai modifiche non salvate.',
  lowBattery: 'Batteria in esaurimento.',
  slowConnection: 'Connessione lenta rilevata.',
  cacheCleared: 'Cache cancellata.',
  outdatedVersion: 'È disponibile una nuova versione dell\'app.',
};

// Preset Info Messages
export const InfoMessages = {
  synced: 'Dati sincronizzati con successo.',
  saved: 'Modifiche salvate automaticamente.',
  backup: 'Backup completato.',
  welcome: 'Benvenuto in LifeOS!',
  maintenance: 'Manutenzione programmata questa notte.',
};

// Quick Access Components
export const NetworkErrorBanner: React.FC<{
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({ onRetry, style }) => (
  <ErrorBanner
    message={ErrorMessages.network}
    type="error"
    onRetry={onRetry}
    style={style}
  />
);

export const AuthErrorBanner: React.FC<{
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({ onRetry, style }) => (
  <ErrorBanner
    message={ErrorMessages.auth}
    type="error"
    onRetry={onRetry}
    persistent
    style={style}
  />
);

export const UnsavedChangesBanner: React.FC<{
  onDismiss?: () => void;
  style?: ViewStyle;
}> = ({ onDismiss, style }) => (
  <ErrorBanner
    message={WarningMessages.unsavedChanges}
    type="warning"
    onDismiss={onDismiss}
    autoHide
    style={style}
  />
);

export const SuccessBanner: React.FC<{
  message: string;
  style?: ViewStyle;
}> = ({ message, style }) => (
  <ErrorBanner
    message={message}
    type="info"
    autoHide
    autoHideDelay={3000}
    style={style}
  />
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  messageContainer: {
    flex: 1,
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
