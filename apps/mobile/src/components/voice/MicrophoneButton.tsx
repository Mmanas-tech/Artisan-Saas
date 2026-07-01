import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, touchTarget } from '../../theme/colors';

type MicState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

interface MicrophoneButtonProps {
  state: MicState;
  onPress: () => void;
  label?: string;
}

export function MicrophoneButton({ state, onPress, label }: MicrophoneButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'listening') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [state, scaleAnim]);

  const iconName = {
    idle: 'microphone',
    listening: 'microphone',
    processing: 'loading',
    success: 'check-circle',
    error: 'alert-circle',
  }[state] as string;

  const iconColor = {
    idle: colors.text.onPrimary,
    listening: colors.text.onPrimary,
    processing: colors.text.onPrimary,
    success: colors.semantic.success,
    error: colors.semantic.error,
  }[state];

  const backgroundColor = {
    idle: colors.primary,
    listening: colors.primary,
    processing: colors.primaryLight,
    success: colors.semantic.success,
    error: colors.semantic.error,
  }[state];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], backgroundColor: backgroundColor + '30' }]} />
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor }]}
          onPress={onPress}
          activeOpacity={0.8}
          accessibilityLabel={label || 'Voice input'}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name={iconName as any} size={32} color={iconColor} />
        </TouchableOpacity>
      </Animated.View>
      {label ? (
        <Animated.Text style={styles.label}>{label}</Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: touchTarget.hero + 20,
    height: touchTarget.hero + 20,
    borderRadius: (touchTarget.hero + 20) / 2,
  },
  buttonWrapper: {
    borderRadius: touchTarget.hero / 2,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: touchTarget.hero,
    height: touchTarget.hero,
    borderRadius: touchTarget.hero / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
  },
});
