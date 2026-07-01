import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { IconMicrophone, IconCheck, IconAlertTriangle, IconLoader } from '@tabler/icons-react';
import { recordAndTranscribe, loadWhisperModel, isWhisperLoaded } from '../services/whisper';
import { parseVoiceCommand, formatIntentSummary, type ParsedIntent } from '../services/voiceParser';
import { useThemeColors } from '../theme/colors';

type MicState = 'idle' | 'loading' | 'listening' | 'processing' | 'success' | 'error';

interface VoiceInputProps {
  onResult?: (intent: ParsedIntent) => void;
  onError?: (error: string) => void;
}

export default function VoiceInput({ onResult, onError }: VoiceInputProps) {
  const colors = useThemeColors();
  const [state, setState] = useState<MicState>('idle');
  const [transcript, setTranscript] = useState('');
  const [intent, setIntent] = useState<ParsedIntent | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'listening') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  const handlePress = useCallback(async () => {
    if (state === 'listening' || state === 'processing') return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (!isWhisperLoaded()) {
      setState('loading');
      try {
        await loadWhisperModel();
      } catch {
        setState('error');
        setErrorMsg('Failed to load voice model');
        onError?.('Failed to load voice model');
        setTimeout(() => setState('idle'), 3000);
        return;
      }
    }

    setState('listening');
    setTranscript('');
    setIntent(null);
    setErrorMsg('');

    try {
      const text = await recordAndTranscribe(8000, (partial) => {
        setTranscript(partial);
      });

      setState('processing');
      setTranscript(text);

      await new Promise(resolve => setTimeout(resolve, 500));

      const parsed = parseVoiceCommand(text);
      setIntent(parsed);
      setState('success');
      onResult?.(parsed);

      setTimeout(() => setState('idle'), 4000);
    } catch (error) {
      setState('error');
      setErrorMsg(error instanceof Error ? error.message : 'Recording failed');
      onError?.(error instanceof Error ? error.message : 'Recording failed');
      setTimeout(() => setState('idle'), 3000);
    }
  }, [state, scaleAnim, onResult, onError]);

  const getIcon = () => {
    switch (state) {
      case 'loading':
      case 'processing':
        return <IconLoader size={32} color={colors.primary} />;
      case 'success':
        return <IconCheck size={32} color="#FFF" />;
      case 'error':
        return <IconAlertTriangle size={32} color="#FFF" />;
      default:
        return <IconMicrophone size={32} color="#FFF" />;
    }
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'loading':
        return colors.primaryLight;
      default:
        return colors.primary;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'loading':
        return 'Loading voice model...';
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'success':
        return transcript ? `"${transcript}"` : 'Done!';
      case 'error':
        return errorMsg || 'Try again';
      default:
        return 'Tap to speak';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getBackgroundColor() }]} />
        <Text style={[styles.statusText, { color: colors.textSecondary }]} numberOfLines={1}>
          {getStatusText()}
        </Text>
      </View>

      {state === 'listening' && (
        <View style={styles.pulseContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: colors.primary + '20',
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.micButton, { backgroundColor: getBackgroundColor() }]}
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={state === 'listening' || state === 'processing'}
          accessibilityLabel="Voice input"
          accessibilityRole="button"
        >
          {(state === 'loading' || state === 'processing') ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            getIcon()
          )}
        </TouchableOpacity>
      </Animated.View>

      {state === 'listening' && (
        <View style={styles.waveform}>
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  backgroundColor: colors.primary,
                  transform: [
                    {
                      scaleY: pulseAnim.interpolate({
                        inputRange: [1, 1.3],
                        outputRange: [0.5, 1.5 + i * 0.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}

      {intent && state === 'success' && (
        <View style={[styles.intentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.intentTitle, { color: colors.text }]}>Parsed Command</Text>
          <Text style={[styles.intentText, { color: colors.textSecondary }]}>
            {formatIntentSummary(intent)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 200,
  },
  pulseContainer: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  waveform: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 16,
    height: 32,
    alignItems: 'center',
  },
  waveBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  intentCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  intentTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  intentText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
