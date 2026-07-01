import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VoiceInput from '../VoiceInput';
import { parseVoiceCommand } from '../../services/voiceParser';

jest.mock('../../services/whisper', () => ({
  loadWhisperModel: jest.fn().mockResolvedValue(undefined),
  isWhisperLoaded: jest.fn().mockReturnValue(true),
  recordAndTranscribe: jest.fn().mockResolvedValue('Add 10 kg clay'),
}));

jest.mock('../../theme/colors', () => ({
  useThemeColors: () => ({
    primary: '#A0522D',
    primaryLight: '#D4A574',
    success: '#66BB6A',
    error: '#EF5350',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    surface: '#FFFFFF',
    border: '#E8E0D8',
    background: '#FBF7F3',
  }),
}));

describe('VoiceInput', () => {
  it('renders idle state with mic button', async () => {
    const { getByLabelText, getByText } = await render(<VoiceInput />);
    expect(getByLabelText('Voice input')).toBeTruthy();
    expect(getByText('Tap to speak')).toBeTruthy();
  });

  it('calls onResult with parsed intent after recording', async () => {
    const onResult = jest.fn();
    const { getByLabelText } = await render(<VoiceInput onResult={onResult} />);

    fireEvent.press(getByLabelText('Voice input'));

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'add',
          quantity: 10,
          unit: 'kg',
          item: 'clay',
        })
      );
    });
  });

  it('shows parsed intent card after successful recognition', async () => {
    const { getByLabelText, getByText } = await render(<VoiceInput />);

    fireEvent.press(getByLabelText('Voice input'));

    await waitFor(() => {
      expect(getByText('Parsed Command')).toBeTruthy();
      expect(getByText(/ADD/)).toBeTruthy();
    });
  });

  it('calls onError when recording fails', async () => {
    const { recordAndTranscribe } = require('../../services/whisper');
    recordAndTranscribe.mockRejectedValueOnce(new Error('Mic access denied'));

    const onError = jest.fn();
    const { getByLabelText } = await render(<VoiceInput onError={onError} />);

    fireEvent.press(getByLabelText('Voice input'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Mic access denied');
    });
  });

  it('disables button while listening', async () => {
    const { recordAndTranscribe } = require('../../services/whisper');
    let resolveRecording: (value: string) => void;
    recordAndTranscribe.mockImplementation(
      () => new Promise((resolve) => { resolveRecording = resolve; })
    );

    const { getByLabelText } = await render(<VoiceInput />);

    fireEvent.press(getByLabelText('Voice input'));

    await waitFor(() => {
      expect(getByLabelText('Voice input').props.disabled).toBeTruthy();
    });

    resolveRecording!('Add 5 kg clay');
  });
});

describe('parseVoiceCommand integration', () => {
  it('parses "Add 10 kg clay" correctly', () => {
    const result = parseVoiceCommand('Add 10 kg clay');
    expect(result.action).toBe('add');
    expect(result.quantity).toBe(10);
    expect(result.unit).toBe('kg');
    expect(result.item).toBe('clay');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('parses "Sell 5 pieces pottery for 500 rupees"', () => {
    const result = parseVoiceCommand('Sell 5 pieces pottery for 500 rupees');
    expect(result.action).toBe('sale');
    expect(result.quantity).toBe(5);
    expect(result.unit).toBe('pieces');
    expect(result.item).toBe('clay');
    expect(result.amount).toBe(500);
  });

  it('parses "How much rice do I have"', () => {
    const result = parseVoiceCommand('How much rice do I have');
    expect(result.action).toBe('check');
    expect(result.item).toBe('rice');
  });

  it('parses "Remove 2 kilograms glaze"', () => {
    const result = parseVoiceCommand('Remove 2 kilograms glaze');
    expect(result.action).toBe('remove');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('kg');
    expect(result.item).toBe('glaze');
  });

  it('parses "Set reorder at 20 kg"', () => {
    const result = parseVoiceCommand('Set reorder at 20 kg');
    expect(result.action).toBe('set_reorder');
    expect(result.quantity).toBe(20);
    expect(result.unit).toBe('kg');
  });
});
