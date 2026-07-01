import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing, touchTarget } from '../../src/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      router.push('/(auth)/verify');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('auth.loginTitle')}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder={t('auth.phonePlaceholder')}
          placeholderTextColor={colors.text.muted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={15}
        />

        <TouchableOpacity
          style={[styles.button, phone.length < 10 && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={phone.length < 10}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t('auth.sendOtp')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 18,
    minHeight: touchTarget.minimum,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: touchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.onPrimary,
  },
});
