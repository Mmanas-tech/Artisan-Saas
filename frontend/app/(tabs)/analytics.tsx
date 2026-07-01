import { View, Text, StyleSheet } from 'react-native';
import { IconChartBar } from '@tabler/icons-react';
import { useThemeColors } from '../../src/theme/colors';

export default function AnalyticsScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
      </View>
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: colors.primary + '15' }]}>
          <IconChartBar size={48} color={colors.primary} />
        </View>
        <Text style={[styles.text, { color: colors.text }]}>Coming in Phase 2</Text>
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>
          Track turnover, demand, and trends
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  text: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  subtext: { fontSize: 14, textAlign: 'center' },
});
