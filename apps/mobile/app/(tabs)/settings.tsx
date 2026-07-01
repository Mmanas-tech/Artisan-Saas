import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, touchTarget } from '../../src/theme/colors';

const SETTINGS_ITEMS = [
  { key: 'language', icon: 'translate', color: colors.accent.indigo },
  { key: 'darkMode', icon: 'theme-light-dark', color: colors.primaryDark },
  { key: 'syncFrequency', icon: 'sync', color: colors.accent.sage },
  { key: 'notifications', icon: 'bell', color: colors.accent.marigold },
  { key: 'profile', icon: 'account', color: colors.primary },
  { key: 'security', icon: 'shield-lock', color: colors.semantic.error },
  { key: 'ledger', icon: 'book-open-variant', color: colors.accent.clay },
  { key: 'exportData', icon: 'export', color: colors.text.secondary },
  { key: 'support', icon: 'help-circle', color: colors.accent.sage },
  { key: 'about', icon: 'information', color: colors.text.muted },
];

export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>

      <View style={styles.list}>
        {SETTINGS_ITEMS.map((item) => (
          <TouchableOpacity key={item.key} style={styles.item} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={styles.itemText}>{t(`settings.${item.key}`)}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  header: { backgroundColor: colors.background.card, paddingTop: 60, paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  title: { fontSize: 24, fontWeight: '600', color: colors.text.primary },
  list: { padding: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.light },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  itemText: { flex: 1, fontSize: 16, color: colors.text.primary },
});
