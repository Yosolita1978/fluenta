/**
 * Converts an audio Blob to a 16kHz mono 16-bit PCM WAV ArrayBuffer.
 * Uses OfflineAudioContext for decoding and resampling.
 * Browser-only (called client-side before sending to API).
 */
export async function blobToWavBuffer(blob: Blob): Promise<ArrayBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  const sampleRate = 16000;

  // Decode the audio
  const offlineCtx = new OfflineAudioContext(1, 1, sampleRate);
  const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer.slice(0));

  // Resample to 16kHz mono
  const duration = audioBuffer.duration;
  const targetLength = Math.ceil(duration * sampleRate);
  const resampleCtx = new OfflineAudioContext(1, targetLength, sampleRate);
  const source = resampleCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(resampleCtx.destination);
  source.start(0);
  const renderedBuffer = await resampleCtx.startRendering();

  const samples = renderedBuffer.getChannelData(0);
  const numberOfChannels = 1;

  const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(wavBuffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return wavBuffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
