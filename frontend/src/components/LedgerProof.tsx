import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import {
  IconLink,
  IconCheck,
  IconAlertTriangle,
  IconCopy,
  IconExternalLink,
} from '@tabler/icons-react';
import { useThemeColors } from '../theme/colors';
import {
  truncateHash,
  formatTimestamp,
  type TransactionProof,
} from '../services/ceramic';

interface LedgerProofProps {
  proof: TransactionProof | null;
  loading?: boolean;
  onVerify?: () => void;
  onPress?: () => void;
}

export default function LedgerProof({
  proof,
  loading = false,
  onVerify,
  onPress,
}: LedgerProofProps) {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  const handleCopyHash = useCallback(() => {
    if (!proof?.signatureHash) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(proof.signatureHash);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [proof?.signatureHash]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading proof...</Text>
      </View>
    );
  }

  if (!proof) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <IconLink size={16} color={colors.textMuted} />
          <Text style={[styles.noProof, { color: colors.textMuted }]}>No blockchain proof yet</Text>
        </View>
        {onVerify && (
          <TouchableOpacity onPress={onVerify} style={[styles.verifyButton, { borderColor: colors.primary }]}>
            <Text style={[styles.verifyButtonText, { color: colors.primary }]}>Record on Chain</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const isVerified = proof.verified;
  const hasHash = !!proof.signatureHash;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.row}>
          {isVerified ? (
            <IconCheck size={14} color={colors.success} />
          ) : (
            <IconAlertTriangle size={14} color={colors.warning} />
          )}
          <Text style={[styles.statusLabel, { color: isVerified ? colors.success : colors.warning }]}>
            {isVerified ? 'Verified' : 'Pending Verification'}
          </Text>
        </View>
        {proof.timestamp && (
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            {formatTimestamp(proof.timestamp)}
          </Text>
        )}
      </View>

      {hasHash && (
        <View style={[styles.hashRow, { backgroundColor: colors.background }]}>
          <Text style={[styles.hashLabel, { color: colors.textMuted }]}>Hash</Text>
          <View style={styles.hashValueRow}>
            <Text style={[styles.hashValue, { color: colors.text }]} numberOfLines={1}>
              {truncateHash(proof.signatureHash!, 10)}
            </Text>
            <TouchableOpacity onPress={handleCopyHash} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <IconCopy size={14} color={copied ? colors.success : colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {proof.ceramicStreamId && (
        <View style={[styles.streamRow, { backgroundColor: colors.background }]}>
          <Text style={[styles.hashLabel, { color: colors.textMuted }]}>Ceramic</Text>
          <View style={styles.hashValueRow}>
            <Text style={[styles.hashValue, { color: colors.text }]} numberOfLines={1}>
              {truncateHash(proof.ceramicStreamId, 10)}
            </Text>
            <IconExternalLink size={12} color={colors.primary} />
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={[styles.statusDot, { backgroundColor: isVerified ? colors.success : colors.warning }]} />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {proof.status === 'confirmed' ? 'Confirmed on ledger' : proof.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
  },
  hashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
  },
  streamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
  },
  hashLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hashValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  hashValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
  },
  loadingText: {
    fontSize: 13,
    marginLeft: 8,
  },
  noProof: {
    fontSize: 13,
    marginLeft: 4,
  },
  verifyButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  verifyButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
