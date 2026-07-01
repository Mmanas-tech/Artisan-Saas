import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import {
  IconSettings,
  IconLanguage,
  IconMoon,
  IconSun,
  IconBell,
  IconUser,
  IconChevronRight,
} from '@tabler/icons-react';
import { useThemeColors } from '../../src/theme/colors';

const SETTINGS_ITEMS = [
  { key: 'language', icon: IconLanguage, label: 'Language', value: 'English' },
  { key: 'theme', icon: null, label: 'Dark Mode', value: 'auto' },
  { key: 'notifications', icon: IconBell, label: 'Notifications', value: 'On' },
  { key: 'profile', icon: IconUser, label: 'Profile', value: '' },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.list}>
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.key === 'theme'
            ? (colorScheme === 'dark' ? IconMoon : IconSun)
            : item.icon;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                {Icon && <Icon size={20} color={colors.primary} />}
              </View>
              <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.itemValue, { color: colors.textMuted }]}>{item.value}</Text>
              <IconChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Artisan v0.1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '700' },
  list: { padding: 16, gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  itemValue: { fontSize: 14, marginRight: 8 },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { fontSize: 12 },
});
