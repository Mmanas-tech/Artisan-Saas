import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false;

let transcriber: any = null;
let isLoading = false;

export async function loadWhisperModel(): Promise<void> {
  if (transcriber || isLoading) return;

  isLoading = true;
  try {
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      progress_callback: (progress: any) => {
        if (progress.status === 'progress') {
          console.log(`Whisper loading: ${Math.round(progress.progress)}%`);
        }
      },
    });
  } catch (error) {
    console.error('Failed to load Whisper model:', error);
    throw error;
  } finally {
    isLoading = false;
  }
}

export function isWhisperLoaded(): boolean {
  return transcriber !== null;
}

export function isWhisperLoading(): boolean {
  return isLoading;
}

export async function transcribeAudio(audioData: Float32Array): Promise<string> {
  if (!transcriber) {
    await loadWhisperModel();
  }

  const result = await transcriber(audioData, {
    language: 'english',
    task: 'transcribe',
  });

  return result.text || '';
}

export async function transcribeFromBlob(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const rawData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  const targetSampleRate = 16000;
  const ratio = sampleRate / targetSampleRate;
  const newLength = Math.round(rawData.length / ratio);
  const resampled = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = Math.floor(i * ratio);
    resampled[i] = rawData[srcIndex];
  }

  return transcribeAudio(resampled);
}

export async function recordAndTranscribe(
  maxDurationMs = 10000,
  onPartialResult?: (text: string) => void
): Promise<string> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  const chunks: Blob[] = [];

  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      mediaRecorder.stop();
    }, maxDurationMs);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      clearTimeout(timeout);
      stream.getTracks().forEach(track => track.stop());

      const blob = new Blob(chunks, { type: 'audio/webm' });

      try {
        const text = await transcribeFromBlob(blob);
        onPartialResult?.(text);
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    mediaRecorder.onerror = (event) => {
      clearTimeout(timeout);
      stream.getTracks().forEach(track => track.stop());
      reject(event.error);
    };

    mediaRecorder.start(100);
  });
}
