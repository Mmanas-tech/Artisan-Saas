import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconRefresh, IconWifiOff, IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import {
  getPendingCount,
  isOnline,
  onStatusChange,
  syncAll,
  getSyncStats,
} from '../services/syncEngine';
import { useThemeColors } from '../theme/colors';

type BadgeStatus = 'synced' | 'pending' | 'offline' | 'syncing' | 'failed';

interface SyncBadgeProps {
  onSync?: () => void;
  showDetails?: boolean;
}

export default function SyncBadge({ onSync, showDetails = false }: SyncBadgeProps) {
  const colors = useThemeColors();
  const [pendingCount, setPendingCount] = useState(0);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, syncing: 0, synced: 0, failed: 0 });

  const refreshState = useCallback(() => {
    setPendingCount(getPendingCount());
    setOnline(isOnline());
    setStats(getSyncStats());
  }, []);

  useEffect(() => {
    refreshState();

    const interval = setInterval(refreshState, 5000);

    const unsubscribe = onStatusChange((isOnline) => {
      setOnline(isOnline);
      if (isOnline) {
        refreshState();
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [refreshState]);

  const handleSync = useCallback(async () => {
    if (syncing || !online || pendingCount === 0) return;

    setSyncing(true);
    try {
      await syncAll();
      refreshState();
      onSync?.();
    } finally {
      setSyncing(false);
    }
  }, [syncing, online, pendingCount, refreshState, onSync]);

  const getStatus = (): BadgeStatus => {
    if (!online) return 'offline';
    if (syncing) return 'syncing';
    if (stats.failed > 0) return 'failed';
    if (pendingCount > 0) return 'pending';
    return 'synced';
  };

  const status = getStatus();

  const statusConfig = {
    synced: {
      icon: IconCheck,
      color: colors.success,
      bg: colors.success + '20',
      text: 'All synced',
    },
    pending: {
      icon: IconRefresh,
      color: colors.accent || '#FFB700',
      bg: (colors.accent || '#FFB700') + '20',
      text: `${pendingCount} pending`,
    },
    offline: {
      icon: IconWifiOff,
      color: colors.warning,
      bg: colors.warning + '20',
      text: "Offline",
    },
    syncing: {
      icon: IconRefresh,
      color: colors.primary,
      bg: colors.primary + '20',
      text: 'Syncing...',
    },
    failed: {
      icon: IconAlertTriangle,
      color: colors.error,
      bg: colors.error + '20',
      text: `${stats.failed} failed`,
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.badge, { backgroundColor: statusConfig.bg }]}
        onPress={handleSync}
        disabled={syncing || !online || pendingCount === 0}
        activeOpacity={0.7}
      >
        <Icon
          size={14}
          color={statusConfig.color}
        />
        <Text style={[styles.text, { color: statusConfig.color }]}>
          {statusConfig.text}
        </Text>
      </TouchableOpacity>

      {showDetails && stats.total > 0 && (
        <View style={[styles.details, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Total</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{stats.total}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Pending</Text>
            <Text style={[styles.detailValue, { color: colors.warning }]}>{stats.pending}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Synced</Text>
            <Text style={[styles.detailValue, { color: colors.success }]}>{stats.synced}</Text>
          </View>
          {stats.failed > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Failed</Text>
              <Text style={[styles.detailValue, { color: colors.error }]}>{stats.failed}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  details: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 140,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
