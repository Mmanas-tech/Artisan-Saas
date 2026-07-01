import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LedgerProof from '../LedgerProof';
import type { TransactionProof } from '../../services/ceramic';

jest.mock('../../theme/colors', () => ({
  useThemeColors: () => ({
    primary: '#A0522D',
    primaryLight: '#D4A574',
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    surface: '#FFFFFF',
    border: '#E8E0D8',
    background: '#FBF7F3',
  }),
}));

const mockVerifiedProof: TransactionProof = {
  transactionId: 'tx-001',
  signatureHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
  ceramicStreamId: 'kjzl6cwe1jw14b2ci8n3j8n3k8n3',
  verified: true,
  timestamp: '2026-06-15T10:30:00.000Z',
  status: 'confirmed',
};

const mockUnverifiedProof: TransactionProof = {
  transactionId: 'tx-002',
  signatureHash: null,
  ceramicStreamId: null,
  verified: false,
  timestamp: '2026-06-15T11:00:00.000Z',
  status: 'pending',
};

describe('LedgerProof', () => {
  it('renders loading state', async () => {
    const { getByText } = await render(<LedgerProof proof={null} loading={true} />);
    expect(getByText('Loading proof...')).toBeTruthy();
  });

  it('renders no proof state', async () => {
    const { getByText } = await render(<LedgerProof proof={null} />);
    expect(getByText('No blockchain proof yet')).toBeTruthy();
  });

  it('shows Record on Chain button when onVerify provided', async () => {
    const onVerify = jest.fn();
    const { getByText } = await render(
      <LedgerProof proof={null} onVerify={onVerify} />
    );

    const button = getByText('Record on Chain');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it('renders verified proof with hash', async () => {
    const { getByText } = await render(<LedgerProof proof={mockVerifiedProof} />);

    expect(getByText('Verified')).toBeTruthy();
    expect(getByText(/a1b2c3d4/)).toBeTruthy();
    expect(getByText('Confirmed on ledger')).toBeTruthy();
  });

  it('renders unverified proof', async () => {
    const { getByText } = await render(<LedgerProof proof={mockUnverifiedProof} />);

    expect(getByText('Pending Verification')).toBeTruthy();
    expect(getByText('pending')).toBeTruthy();
  });

  it('shows ceramic stream ID when present', async () => {
    const { getByText } = await render(<LedgerProof proof={mockVerifiedProof} />);

    expect(getByText(/kjzl6cwe1j/)).toBeTruthy();
  });

  it('calls onPress when provided', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <LedgerProof proof={mockVerifiedProof} onPress={onPress} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Verified'));
    });

    expect(onPress).toHaveBeenCalled();
  });
});
