const MAX_AUDIO_BYTES = 16 * 1024 * 1024;
const MAX_DURATION_SECONDS = 30;
const SUPPORTED_MIME_TYPES = new Set(["audio/wav", "audio/mpeg", "audio/ogg", "audio/flac", "audio/aac", "audio/mp4", "audio/x-m4a"]);

export function validateGnaniAudio(audioBase64: string, mimeType: string) {
  if (!SUPPORTED_MIME_TYPES.has(mimeType)) throw new Error("Use WAV, MP3, OGG, FLAC, AAC, or M4A audio for voice input.");
  const audio = Buffer.from(audioBase64, "base64");
  if (!audio.length) throw new Error("The recording was empty. Please try again.");
  if (audio.length > MAX_AUDIO_BYTES) throw new Error("The recording is too large. Keep voice messages under 16 MB.");
  if (mimeType === "audio/wav" && audio.length >= 44) {
    const sampleRate = audio.readUInt32LE(24);
    const channels = audio.readUInt16LE(22);
    const bitsPerSample = audio.readUInt16LE(34);
    const byteRate = audio.readUInt32LE(28);
    if (!sampleRate || !channels || !bitsPerSample || !byteRate) throw new Error("The WAV recording header is invalid.");
    const duration = Math.max(0, (audio.length - 44) / byteRate);
    if (duration > MAX_DURATION_SECONDS) throw new Error("Voice recordings must be 30 seconds or shorter.");
  }
  return audio;
}
