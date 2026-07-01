import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width, height = 16, borderRadius = 4, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
}

export function InventoryCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Skeleton width={120} height={14} />
        <Skeleton width={60} height={12} borderRadius={6} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Skeleton width="45%" height={12} />
          <Skeleton width="30%" height={12} />
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <Skeleton width="35%" height={12} />
        </View>
      </View>
      <View style={styles.cardActions}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <Skeleton width={36} height={36} borderRadius={18} />
        <Skeleton width={36} height={36} borderRadius={18} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border.light,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 12,
  },
});
