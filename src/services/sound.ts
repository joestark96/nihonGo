import { LOCAL_AUDIO_MANIFEST } from '../data/localAudioManifest';
import { getOfflineAudioKey } from '../utils/audioHash';
import { audioStorage } from './audioStorage';
import {
  CHARACTER_VOICES,
  CharacterVoiceProfile,
  NeuralJapaneseVoiceId,
  resolveCharacterProfile,
  detectCharacterFromText
} from './audio/voiceProfiles';
import { normalizeJapanesePhonetics, splitIntoSpeechChunks } from './audio/japanesePhonetics';
import {
  playCorrectSfx,
  playIncorrectSfx,
  playTapSfx,
  playLessonCompleteSfx
} from './audio/soundEffects';

export type { NeuralJapaneseVoiceId, CharacterVoiceProfile };
export { CHARACTER_VOICES };

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private defaultVoiceId: string = 'mary';
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private activeBufferSource: AudioBufferSourceNode | null = null;
  private sequenceTimer: number | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentSpeechId: number = 0;
  private currentSequenceId: number = 0;
  private activeAbortController: AbortController | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private neuralBufferCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    try {
      this.voices = window.speechSynthesis.getVoices() || [];
    } catch (_) {}
  }

  public setDefaultVoice(voiceId: string) {
    if (CHARACTER_VOICES.some(v => v.id === voiceId)) {
      this.defaultVoiceId = voiceId;
    }
  }

  public getDefaultVoice(): string {
    return this.defaultVoiceId;
  }

  public getCharacterProfile(speakerOrVoiceId?: string): CharacterVoiceProfile {
    return resolveCharacterProfile(speakerOrVoiceId, this.defaultVoiceId);
  }

  public getAvailableJapaneseVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
    }
    return this.voices.filter(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return l.startsWith('ja') || l.includes('jp') || n.includes('japan') || n.includes('kyoko') || n.includes('ichiro') || n.includes('ayumi');
    });
  }

  private findSystemVoiceForCharacter(jaVoices: SpeechSynthesisVoice[], profile: CharacterVoiceProfile): SpeechSynthesisVoice | null {
    if (jaVoices.length === 0) return null;
    if (profile.id === 'mary' || jaVoices.length === 1) return jaVoices[0];

    const maleHints = ['ichiro', 'otoya', 'keita', 'takumi', 'daichi', 'naoki', 'hattori', 'male', '男'];
    const femaleHints = ['haruka', 'ayumi', 'nanami', 'kyoko', 'sayaka', 'mizuki', 'female', '女'];

    if (profile.gender === 'male') {
      const foundMale = jaVoices.find(v => maleHints.some(h => v.name.toLowerCase().includes(h)));
      return foundMale || jaVoices[1] || jaVoices[0];
    }
    const foundFemale = jaVoices.find(v => femaleHints.some(h => v.name.toLowerCase().includes(h)));
    return foundFemale || jaVoices[0];
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private stopActivePlayback() {
    this.currentSpeechId++;
    if (this.activeAbortController) {
      try { this.activeAbortController.abort(); } catch (_) {}
      this.activeAbortController = null;
    }
    if (this.activeBufferSource) {
      try {
        this.activeBufferSource.stop();
        this.activeBufferSource.disconnect();
      } catch (_) {}
      this.activeBufferSource = null;
    }
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch (_) {}
      this.activeAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
  }

  public stopSpeech() {
    this.currentSequenceId++;
    if (this.sequenceTimer) {
      window.clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    this.stopActivePlayback();
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public preloadAudio(text: string) {
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    if (!cleanText || this.audioCache.has(cleanText)) return;
    try {
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=jap`;
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      this.audioCache.set(cleanText, audio);
    } catch (_) {}
  }

  private async playNeuralCharacterVoice(
    text: string,
    rate: number,
    profile: CharacterVoiceProfile,
    speechId?: number
  ): Promise<boolean> {
    if (!profile.neuralVoiceId || text.length > 120) return false;
    if (/^[\u3040-\u30ff]{1}$/.test(text.trim())) return false;
    if (speechId !== undefined && this.currentSpeechId !== speechId) return false;

    const ctx = this.getAudioContext();
    if (!ctx) return false;

    const cacheKey = `${profile.neuralVoiceId}:${text}`;
    try {
      let decodedBuffer = this.neuralBufferCache.get(cacheKey);

      if (!decodedBuffer) {
        let fetchedBase64: string | null = null;
        const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const endpoints = isLocalDev
          ? ['/api/tts', 'https://ottsy.weilbyte.dev/api/generation']
          : ['https://ottsy.weilbyte.dev/api/generation', '/api/tts'];

        const spokenPayload = normalizeJapanesePhonetics(text);

        for (const endpoint of endpoints) {
          if (speechId !== undefined && this.currentSpeechId !== speechId) return false;
          try {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 4500);
            if (this.activeAbortController) {
              this.activeAbortController.signal.addEventListener('abort', () => controller.abort());
            }

            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: spokenPayload, voice: profile.neuralVoiceId }),
              signal: controller.signal
            });
            window.clearTimeout(timeoutId);

            if (res.ok) {
              const json = await res.json();
              if (json?.success && json.data) {
                fetchedBase64 = json.data;
                break;
              }
            }
          } catch {
            // Continue to fallback endpoint
          }
        }

        if (!fetchedBase64 || (speechId !== undefined && this.currentSpeechId !== speechId)) return false;

        const offlineKey = getOfflineAudioKey(profile.id, text);
        audioStorage.saveBase64Audio(offlineKey, fetchedBase64, text, profile.id).catch(() => {});

        const binaryString = window.atob(fetchedBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        decodedBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        this.neuralBufferCache.set(cacheKey, decodedBuffer);
      }

      if (speechId !== undefined && this.currentSpeechId !== speechId) return false;
      if (ctx.state === 'suspended') await ctx.resume();

      this.stopActivePlayback();
      if (speechId !== undefined) this.currentSpeechId = speechId;

      return new Promise<boolean>(resolve => {
        try {
          if (speechId !== undefined && this.currentSpeechId !== speechId) return resolve(false);
          const source = ctx.createBufferSource();
          const gainNode = ctx.createGain();
          source.buffer = decodedBuffer!;

          const baseScale = rate < 0.85 ? 0.70 : rate / 0.9;
          source.playbackRate.value = Math.max(0.65, Math.min(1.2, profile.rate * baseScale));
          gainNode.gain.value = 0.95;

          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          this.activeBufferSource = source;

          source.onended = () => {
            if (this.activeBufferSource === source) this.activeBufferSource = null;
            resolve(true);
          };

          source.start(0);
        } catch {
          resolve(false);
        }
      });
    } catch (err) {
      console.warn('Neural voice fallback notice:', err);
      return false;
    }
  }

  private playOnlineChunk(text: string, rate: number = 0.9): Promise<boolean> {
    return new Promise(resolve => {
      try {
        const clean = normalizeJapanesePhonetics(text.replace(/\[.*?\]/g, '').trim());
        if (!clean) return resolve(true);

        this.stopActivePlayback();

        const isIsolatedKana = /^[\u3040-\u30ff]{1}$/.test(clean);
        const isShortWord = !isIsolatedKana && clean.length <= 10 && !/[\s、。！？]/.test(clean);
        const primaryUrl = isShortWord
          ? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&le=jap`
          : `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(clean)}`;

        let audio = this.audioCache.get(clean);
        if (!audio) {
          audio = new Audio(primaryUrl);
          audio.preload = 'auto';
          this.audioCache.set(clean, audio);
        } else {
          audio.currentTime = 0;
        }

        this.activeAudio = audio;
        if ('preservesPitch' in audio) audio.preservesPitch = true;
        if ('webkitPreservesPitch' in audio) (audio as unknown as { webkitPreservesPitch: boolean }).webkitPreservesPitch = true;
        if ('mozPreservesPitch' in audio) (audio as unknown as { mozPreservesPitch: boolean }).mozPreservesPitch = true;
        const effectiveRate = rate < 0.85 ? 0.70 : Math.min(1.2, rate);
        audio.defaultPlaybackRate = effectiveRate;
        audio.playbackRate = effectiveRate;
        audio.volume = 0.9;

        audio.onended = () => {
          if (this.activeAudio === audio) this.activeAudio = null;
          resolve(true);
        };

        audio.onerror = () => {
          const fallbackUrl = isShortWord
            ? `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(clean)}`
            : `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&le=jap`;
          const fbAudio = new Audio(fallbackUrl);
          this.activeAudio = fbAudio;
          if ('preservesPitch' in fbAudio) (fbAudio as unknown as { preservesPitch: boolean }).preservesPitch = true;
          const fbRate = rate < 0.85 ? 0.70 : Math.max(0.6, Math.min(1.25, rate));
          fbAudio.defaultPlaybackRate = fbRate;
          fbAudio.playbackRate = fbRate;
          fbAudio.volume = 0.9;
          fbAudio.onended = () => {
            if (this.activeAudio === fbAudio) this.activeAudio = null;
            resolve(true);
          };
          fbAudio.onerror = () => resolve(false);
          fbAudio.play().catch(() => resolve(false));
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            if (err && (err as { name?: string }).name !== 'NotSupportedError') {
              console.warn('Audio play notice:', err);
            }
            resolve(false);
          });
        }
      } catch (e) {
        console.warn('Online audio exception:', e);
        resolve(false);
      }
    });
  }

  public async playOnlineAudio(text: string, rate: number = 0.9): Promise<boolean> {
    const chunks = splitIntoSpeechChunks(text, 80);
    for (const chunk of chunks) {
      await this.playOnlineChunk(chunk, rate);
    }
    return true;
  }

  private playLocalBundledAudio(audioPath: string, rate: number = 1.0, speechId?: number): Promise<boolean> {
    return new Promise(resolve => {
      try {
        if (speechId !== undefined && this.currentSpeechId !== speechId) return resolve(false);
        this.stopActivePlayback();
        if (speechId !== undefined) this.currentSpeechId = speechId;

        const cacheBustedPath = audioPath.startsWith('blob:')
          ? audioPath
          : audioPath.includes('?') ? audioPath : `${audioPath}?v=sakura`;
        let audio = this.audioCache.get(cacheBustedPath);
        if (!audio) {
          audio = new Audio(cacheBustedPath);
          audio.preload = 'auto';
          this.audioCache.set(cacheBustedPath, audio);
        } else {
          audio.pause();
          audio.currentTime = 0;
        }

        this.activeAudio = audio;
        const targetRate = rate < 0.85 ? 0.70 : 1.0;

        if ('preservesPitch' in audio) audio.preservesPitch = true;
        if ('webkitPreservesPitch' in audio) (audio as unknown as { webkitPreservesPitch: boolean }).webkitPreservesPitch = true;
        if ('mozPreservesPitch' in audio) (audio as unknown as { mozPreservesPitch: boolean }).mozPreservesPitch = true;

        audio.defaultPlaybackRate = targetRate;
        audio.playbackRate = targetRate;
        audio.volume = 0.95;

        audio.onplay = () => { audio.playbackRate = targetRate; };
        audio.onended = () => {
          if (this.activeAudio === audio) this.activeAudio = null;
          resolve(true);
        };
        audio.onerror = () => resolve(false);

        if (speechId !== undefined && this.currentSpeechId !== speechId) return resolve(false);
        audio.play()?.catch(() => resolve(false));
      } catch {
        resolve(false);
      }
    });
  }

  public async speakJapanese(
    text: string,
    rate: number = 0.9,
    speakerOrVoiceId?: string,
    _preserveSequence: boolean = false
  ): Promise<void> {
    if (!_preserveSequence) this.currentSequenceId++;
    if (this.sequenceTimer) {
      window.clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }

    const rawClean = text.replace(/\[.*?\]|\(.*?\)|（.*?）/g, '').trim();
    if (!rawClean) return;
    const cleanText = normalizeJapanesePhonetics(rawClean);

    this.getAudioContext();
    this.stopActivePlayback();

    const speechId = ++this.currentSpeechId;
    this.activeAbortController = new AbortController();

    const charProfile = this.getCharacterProfile(speakerOrVoiceId);
    const isSlow = rate < 0.85;
    const slowRate = 0.70;

    const localFullKey = getOfflineAudioKey(charProfile.id, cleanText);
    let localFullPath = LOCAL_AUDIO_MANIFEST[localFullKey] || (await audioStorage.getAudioUrl(localFullKey)) || undefined;
    if (localFullPath) {
      const playedFullLocal = await this.playLocalBundledAudio(localFullPath, isSlow ? slowRate : 1.0, speechId);
      if (this.currentSpeechId !== speechId || playedFullLocal) return;
    }

    const chunks = splitIntoSpeechChunks(cleanText, isSlow ? 32 : 75);

    for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
      if (this.currentSpeechId !== speechId) return;
      const chunk = chunks[cIdx];
      let played = false;

      const localChunkKey = getOfflineAudioKey(charProfile.id, chunk);
      const localChunkPath = LOCAL_AUDIO_MANIFEST[localChunkKey] || (await audioStorage.getAudioUrl(localChunkKey));
      if (localChunkPath) {
        played = await this.playLocalBundledAudio(localChunkPath, isSlow ? slowRate : rate, speechId);
      }
      if (this.currentSpeechId !== speechId) return;

      if (!played && chunks.length === 1 && localFullPath) {
        played = await this.playLocalBundledAudio(localFullPath, isSlow ? slowRate : rate, speechId);
      }
      if (this.currentSpeechId !== speechId) return;

      if (!played && charProfile.neuralVoiceId) {
        played = await this.playNeuralCharacterVoice(chunk, isSlow ? slowRate : rate, charProfile, speechId);
      }
      if (this.currentSpeechId !== speechId) return;

      if (!played) {
        const jaVoices = this.getAvailableJapaneseVoices();
        const chosenVoice = this.findSystemVoiceForCharacter(jaVoices, charProfile);
        if (chosenVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          played = await new Promise<boolean>(resolve => {
            try {
              if (this.currentSpeechId !== speechId) return resolve(false);
              if (window.speechSynthesis.paused) window.speechSynthesis.resume();
              const utterance = new SpeechSynthesisUtterance(normalizeJapanesePhonetics(chunk));
              this.activeUtterance = utterance;
              utterance.voice = chosenVoice;
              utterance.lang = chosenVoice.lang || 'ja-JP';
              utterance.rate = isSlow ? slowRate : Math.max(0.7, Math.min(1.25, rate * (charProfile.rate / 0.9)));
              utterance.pitch = charProfile.pitch;
              utterance.volume = 0.85;
              utterance.onend = () => { this.activeUtterance = null; resolve(true); };
              utterance.onerror = () => { this.activeUtterance = null; resolve(false); };
              window.speechSynthesis.speak(utterance);
            } catch {
              resolve(false);
            }
          });
        }
      }
      if (this.currentSpeechId !== speechId) return;

      if (!played && charProfile.id !== 'mary') {
        const maryKey = getOfflineAudioKey('mary', chunk);
        const maryPath =
          LOCAL_AUDIO_MANIFEST[maryKey] ||
          (chunks.length === 1 ? LOCAL_AUDIO_MANIFEST[getOfflineAudioKey('mary', cleanText)] : undefined) ||
          (await audioStorage.getAudioUrl(maryKey));
        if (maryPath) {
          played = await this.playLocalBundledAudio(maryPath, isSlow ? slowRate : rate, speechId);
        }
      }
      if (this.currentSpeechId !== speechId) return;

      if (!played) {
        await this.playOnlineChunk(chunk, isSlow ? slowRate : rate);
      }
      if (this.currentSpeechId !== speechId) return;

      if (cIdx < chunks.length - 1) {
        await new Promise(r => window.setTimeout(r, isSlow ? 440 : 380));
      }
    }
  }

  public speakDialogueSequence(
    lines: { speaker: string; audioText: string }[],
    rate: number = 0.9,
    onLineStart?: (idx: number) => void,
    onComplete?: () => void
  ) {
    if (this.sequenceTimer) {
      window.clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    if (!lines || lines.length === 0) return;

    let currentIdx = 0;
    const playStep = () => {
      if (currentIdx >= lines.length) {
        onComplete?.();
        return;
      }
      const line = lines[currentIdx];
      onLineStart?.(currentIdx);
      this.speakJapanese(line.audioText, rate, line.speaker);

      const waitMs = Math.max(2800, line.audioText.length * (rate < 0.75 ? 310 : 210) + 900);
      currentIdx++;
      this.sequenceTimer = window.setTimeout(playStep, waitMs);
    };

    playStep();
  }

  public async speakExerciseAudio(
    text: string,
    rate: number = 0.9,
    options?: { isWorkbook?: boolean; exerciseId?: string; prompt?: string }
  ): Promise<void> {
    const seqId = ++this.currentSequenceId;
    const isWorkbook = Boolean(options?.isWorkbook);

    const dialogueTurns = text
      .split(/(?<=[。？！])\s*[ー—－]\s*|\s+[ー—－]\s+/)
      .map(t => t.trim())
      .filter(Boolean);

    const seed = options?.exerciseId || text;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }

    if (dialogueTurns.length > 1) {
      const maleVoices = ['takeshi', 'ken', 'yamashita', 'robert'];
      const femaleVoices = ['mary', 'michiko', 'sue', 'sora'];
      const interviewee =
        detectCharacterFromText(dialogueTurns[0]) ||
        detectCharacterFromText(options?.prompt || '');

      let speakerA: string;
      let speakerB: string;
      if (interviewee) {
        speakerB = interviewee;
        speakerA = femaleVoices.includes(interviewee)
          ? maleVoices[hash % maleVoices.length]
          : femaleVoices[hash % femaleVoices.length];
      } else {
        const startMale = hash % 2 === 0;
        speakerA = startMale ? maleVoices[hash % maleVoices.length] : femaleVoices[hash % femaleVoices.length];
        speakerB = startMale
          ? femaleVoices[(hash >> 2) % femaleVoices.length]
          : maleVoices[(hash >> 2) % maleVoices.length];
      }

      for (let i = 0; i < dialogueTurns.length; i++) {
        if (this.currentSequenceId !== seqId) return;
        await this.speakJapanese(dialogueTurns[i], rate, i % 2 === 0 ? speakerA : speakerB, true);
        if (this.currentSequenceId !== seqId) return;
        if (i < dialogueTurns.length - 1) {
          await new Promise(r => window.setTimeout(r, 280));
        }
      }
      return;
    }

    if (isWorkbook) {
      const workbookSpeaker =
        detectCharacterFromText(text) ||
        detectCharacterFromText(options?.prompt || '') ||
        CHARACTER_VOICES[hash % CHARACTER_VOICES.length].id;

      await this.speakJapanese(text, rate, workbookSpeaker, true);
      return;
    }

    await this.speakJapanese(text, rate, undefined, true);
  }

  public playCorrect() {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (ctx) playCorrectSfx(ctx);
  }

  public playIncorrect() {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (ctx) playIncorrectSfx(ctx);
  }

  public playTap() {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (ctx) playTapSfx(ctx);
  }

  public playLessonComplete() {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (ctx) playLessonCompleteSfx(ctx);
  }
}

export const sound = new SoundService();
