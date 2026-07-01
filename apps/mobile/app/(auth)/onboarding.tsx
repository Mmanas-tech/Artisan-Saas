import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  { key: 'welcome', illustration: '🏺' },
  { key: 'craft', illustration: '🧵' },
  { key: 'voice', illustration: '🎤' },
  { key: 'offline', illustration: '📱' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const currentStep = ONBOARDING_STEPS[step];

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>{currentStep.illustration}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {t(`onboarding.${currentStep.key === 'craft' ? 'craftTitle' : currentStep.key === 'voice' ? 'voiceTitle' : currentStep.key === 'offline' ? 'offlineTitle' : 'welcome'}`)}
        </Text>
        <Text style={styles.subtitle}>
          {currentStep.key === 'welcome'
            ? t('onboarding.subtitle')
            : currentStep.key === 'voice'
            ? t('onboarding.voiceDemo')
            : currentStep.key === 'offline'
            ? t('onboarding.offlineDesc')
            : ''}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONBOARDING_STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.activeDot]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {step < ONBOARDING_STEPS.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
            <Text style={styles.nextText}>
              {step === ONBOARDING_STEPS.length - 1
                ? t('onboarding.getStarted')
                : t('onboarding.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    fontSize: 80,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.light,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    padding: spacing.md,
  },
  skipText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.onPrimary,
  },
});
