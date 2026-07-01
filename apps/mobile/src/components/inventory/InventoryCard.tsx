import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { InventoryItem } from '@artisan/shared';
import { colors, spacing } from '../../theme/colors';

interface InventoryCardProps {
  item: InventoryItem;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSell: () => void;
}

export function InventoryCard({ item, onPress, onEdit, onDelete, onSell }: InventoryCardProps) {
  const isLow = item.quantity <= item.reorderLevel;
  const isOut = item.quantity === 0;

  const syncBadgeColor = {
    pending: colors.semantic.warning,
    synced: colors.semantic.success,
    conflict: colors.semantic.error,
  }[item.syncStatus];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.statusDot, { backgroundColor: isOut ? colors.semantic.error : isLow ? colors.semantic.warning : colors.semantic.success }]} />
          <View style={styles.titleText}>
            <View style={styles.nameRow}>
              <View style={styles.nameContainer}>
                <View style={[styles.nameBar, { backgroundColor: colors.primary }]} />
                <View style={styles.nameTextContainer}>
                  <View style={[styles.namePlaceholder, { width: 120, height: 14 }]} />
                  <View style={[styles.namePlaceholder, { width: 80, height: 10, marginTop: 4 }]} />
                </View>
              </View>
            </View>
            <View style={[styles.syncBadge, { backgroundColor: syncBadgeColor + '20' }]}>
              <View style={[styles.syncDot, { backgroundColor: syncBadgeColor }]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={[styles.detailLabel, { width: 60, height: 10 }]} />
            <View style={[styles.detailValue, { width: 50, height: 16, marginTop: 4 }]} />
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.detailLabel, { width: 50, height: 10 }]} />
            <View style={[styles.detailValue, { width: 40, height: 16, marginTop: 4 }]} />
          </View>
        </View>
        <View style={[styles.priceRow, { marginTop: spacing.sm }]}>
          <View style={[styles.priceLabel, { width: 40, height: 10 }]} />
          <View style={[styles.priceValue, { width: 60, height: 16, marginLeft: 4 }]} />
        </View>
        <View style={[styles.metaRow, { marginTop: spacing.sm }]}>
          <View style={[styles.metaPlaceholder, { width: 100, height: 10 }]} />
          <View style={[styles.metaPlaceholder, { width: 80, height: 10 }]} />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryLight + '20' }]} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.semantic.error + '20' }]} onPress={onDelete}>
          <MaterialCommunityIcons name="delete" size={18} color={colors.semantic.error} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent.marigold + '20' }]} onPress={onSell}>
          <MaterialCommunityIcons name="cash" size={18} color={colors.accent.marigold} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  titleText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  nameTextContainer: {
    flex: 1,
  },
  namePlaceholder: {
    backgroundColor: colors.border.light,
    borderRadius: 4,
  },
  syncBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  details: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    backgroundColor: colors.border.light,
    borderRadius: 4,
  },
  detailValue: {
    backgroundColor: colors.border.light,
    borderRadius: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    backgroundColor: colors.border.light,
    borderRadius: 4,
  },
  priceValue: {
    backgroundColor: colors.border.light,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaPlaceholder: {
    backgroundColor: colors.border.light,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
