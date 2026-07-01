import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../src/theme/colors';

export default function AnalyticsScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.analytics')}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Analytics coming in Phase 2</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  header: { backgroundColor: colors.background.card, paddingTop: 60, paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  title: { fontSize: 24, fontWeight: '600', color: colors.text.primary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { fontSize: 16, color: colors.text.secondary },
});
