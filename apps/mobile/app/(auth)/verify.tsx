import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { login } from '../../src/store/authSlice';
import { colors, spacing, touchTarget } from '../../src/theme/colors';

export default function VerifyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp.length === 6) {
      dispatch(login({
        token: 'dev-token-' + Date.now(),
        user: {
          id: 'did:artisan:dev-user',
          name: 'Artisan User',
          phone: '+919876543210',
          craft: 'ceramic',
          location: { lat: 17.385, lng: 78.4867, district: 'Hyderabad', state: 'Telangana' },
          kyc: { verified: false },
          createdAt: new Date().toISOString(),
        },
      }));
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('auth.verifyTitle')}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor={colors.text.muted}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          textContentType="oneTimeCode"
        />

        <TouchableOpacity
          style={[styles.button, otp.length < 6 && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={otp.length < 6}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t('auth.verify')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendBtn}>
          <Text style={styles.resendText}>{t('auth.resend')}</Text>
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
    fontSize: 24,
    minHeight: touchTarget.minimum,
    textAlign: 'center',
    letterSpacing: 8,
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
  resendBtn: {
    alignItems: 'center',
    padding: spacing.md,
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
  },
});
