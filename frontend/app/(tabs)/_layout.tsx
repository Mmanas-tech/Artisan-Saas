import { Tabs } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { IconPackage, IconBuildingStore, IconChartBar, IconSettings, IconRefresh } from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../src/redux/store';
import { syncItems } from '../../src/redux/slices/inventory';
import { useThemeColors } from '../../src/theme/colors';

function SyncBadge() {
  const { pendingSync, isOnline } = useSelector((state: RootState) => state.inventory);
  const dispatch = useDispatch<AppDispatch>();
  const colors = useThemeColors();

  if (pendingSync === 0 && isOnline) return null;

  return (
    <View
      style={[styles.syncBadge, { backgroundColor: !isOnline ? colors.warning : colors.accent }]}
      accessibilityLabel={`${pendingSync} items pending sync`}
    >
      <IconRefresh size={12} color="#FFF" />
      <Text style={styles.syncText}>{pendingSync}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary as string,
        tabBarInactiveTintColor: colors.textMuted as string,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <View>
              <IconPackage size={size} color={color as string} />
              <SyncBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color, size }) => <IconBuildingStore size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <IconChartBar size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <IconSettings size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  syncBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 20,
    justifyContent: 'center',
  },
  syncText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
