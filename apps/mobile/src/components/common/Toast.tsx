import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme/colors';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss?: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onDismiss, duration = 3000 }: ToastProps) {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, { toValue: 100, duration: 200, useNativeDriver: true }).start(() => {
        onDismiss?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss, translateY]);

  const config = {
    success: { icon: 'check-circle', color: colors.semantic.success },
    error: { icon: 'alert-circle', color: colors.semantic.error },
    info: { icon: 'information', color: colors.primary },
  }[type];

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={[styles.toast, { borderLeftColor: config.color }]}>
        <MaterialCommunityIcons name={config.icon as any} size={20} color={config.color} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
  },
  toast: {
    backgroundColor: colors.background.card,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
});
