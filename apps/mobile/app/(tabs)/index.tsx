import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../src/store';
import { InventoryCard } from '../../src/components/inventory/InventoryCard';
import { MicrophoneButton } from '../../src/components/voice/MicrophoneButton';
import { SyncBadge } from '../../src/components/sync/SyncBadge';
import { EmptyState } from '../../src/components/common/EmptyState';
import { InventoryCardSkeleton } from '../../src/components/common/Skeleton';
import { Toast } from '../../src/components/common/Toast';
import { colors, spacing } from '../../src/theme/colors';
import type { InventoryItem } from '@artisan/shared';

type MicState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export default function InventoryScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalValue, lowStockCount, loading } = useSelector((state: RootState) => state.inventory);
  const { pendingCount, isOnline, isSyncing } = useSelector((state: RootState) => state.sync);
  const [micState, setMicState] = useState<MicState>('idle');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleMicPress = useCallback(() => {
    if (micState === 'idle') {
      setMicState('listening');
    } else if (micState === 'listening') {
      setMicState('processing');
      setTimeout(() => {
        setMicState('success');
        setToast({ message: t('voice.success', { quantity: '10', unit: 'kg', item: 'clay' }), type: 'success' });
        setTimeout(() => setMicState('idle'), 2000);
      }, 1500);
    }
  }, [micState, t]);

  const syncStatus = !isOnline ? 'offline' : isSyncing ? 'syncing' : pendingCount > 0 ? 'pending' : 'synced';

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => (
    <InventoryCard
      item={item}
      onPress={() => {}}
      onEdit={() => {}}
      onDelete={() => setToast({ message: 'Item deleted', type: 'error' })}
      onSell={() => setToast({ message: 'Sold!', type: 'success' })}
    />
  ), []);

  const keyExtractor = useCallback((item: InventoryItem) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{t('inventory.title')}</Text>
          <SyncBadge status={syncStatus} pendingCount={pendingCount} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('inventory.totalValue')}</Text>
            <Text style={styles.statValue}>₹{totalValue.toLocaleString()}</Text>
          </View>
          <View style={[styles.statCard, lowStockCount > 0 && styles.statAlert]}>
            <Text style={styles.statLabel}>Low Stock</Text>
            <Text style={[styles.statValue, lowStockCount > 0 && styles.statValueAlert]}>
              {lowStockCount}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>{t('inventory.addStock')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextOutline]}>
              {t('inventory.viewReport')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3].map(i => <InventoryCardSkeleton key={i} />)}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('inventory.empty')}
          description={t('inventory.emptyCta')}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.fab}>
        <MicrophoneButton
          state={micState}
          onPress={handleMicPress}
          label={micState === 'idle' ? t('voice.tapToSpeak') : micState === 'listening' ? t('voice.listening') : micState === 'processing' ? t('voice.processing') : undefined}
        />
      </View>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    backgroundColor: colors.background.card,
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.light,
    borderRadius: 12,
    padding: spacing.md,
  },
  statAlert: {
    backgroundColor: colors.semantic.error + '10',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statValueAlert: {
    color: colors.semantic.error,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.onPrimary,
  },
  actionBtnTextOutline: {
    color: colors.primary,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
});
