import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/colors';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, icon, children }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <View style={[styles.circle, { backgroundColor: colors.primaryLight + '30' }]} />
        <View style={[styles.dot, { backgroundColor: colors.primary, top: 20, left: 30 }]} />
        <View style={[styles.dot, { backgroundColor: colors.accent.marigold, top: 40, right: 25 }]} />
        <View style={[styles.dot, { backgroundColor: colors.accent.sage, bottom: 25, left: 40 }]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  illustration: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
