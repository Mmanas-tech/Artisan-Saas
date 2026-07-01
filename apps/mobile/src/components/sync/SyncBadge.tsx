import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme/colors';

type SyncStatus = 'synced' | 'pending' | 'offline' | 'syncing';

interface SyncBadgeProps {
  status: SyncStatus;
  pendingCount?: number;
  lastSync?: string;
}

export function SyncBadge({ status, pendingCount = 0, lastSync }: SyncBadgeProps) {
  const config = {
    synced: { icon: 'check-circle', color: colors.semantic.success, bg: colors.semantic.success + '20', text: 'All synced' },
    pending: { icon: 'hourglass-empty', color: colors.semantic.warning, bg: colors.semantic.warning + '20', text: `${pendingCount} items pending` },
    offline: { icon: 'wifi-off', color: colors.semantic.offline, bg: colors.semantic.offline + '20', text: "You're offline" },
    syncing: { icon: 'sync', color: colors.primary, bg: colors.primary + '20', text: 'Syncing...' },
  }[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <MaterialCommunityIcons name={config.icon as any} size={14} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
