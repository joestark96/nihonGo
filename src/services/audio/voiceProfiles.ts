export type NeuralJapaneseVoiceId =
  | 'jp_001'
  | 'jp_003'
  | 'jp_005'
  | 'jp_006'
  | 'jp_male_osada'
  | 'jp_male_shuichiro'
  | 'jp_male_matsudake'
  | 'jp_male_hikakin'
  | 'jp_female_rei';

export interface CharacterVoiceProfile {
  id: string;
  name: string;
  japaneseName: string;
  avatar: string;
  role: string;
  gender: 'female' | 'male';
  neuralVoiceId?: NeuralJapaneseVoiceId;
  detuneCents?: number;
  pitch: number;
  rate: number;
  samplePhrase: string;
}

export const CHARACTER_VOICES: CharacterVoiceProfile[] = [
  {
    id: 'mary',
    name: 'Mary',
    japaneseName: 'メアリー',
    avatar: '👱‍♀️',
    role: 'Voz femenina dulce y natural (Sakura / Mary)',
    gender: 'female',
    neuralVoiceId: 'jp_005',
    detuneCents: 0,
    pitch: 1.0,
    rate: 1.0,
    samplePhrase: 'こんにちは！メアリーです。よろしくお願いします！'
  },
  {
    id: 'takeshi',
    name: 'Takeshi',
    japaneseName: 'たけし',
    avatar: '👦',
    role: 'Voz masculina joven (Shuichiro)',
    gender: 'male',
    neuralVoiceId: 'jp_male_shuichiro',
    detuneCents: 0,
    pitch: 1.0,
    rate: 1.0,
    samplePhrase: 'やあ、ぼくはたけしです。いっしょに勉強しよう！'
  },
  {
    id: 'yamashita',
    name: 'Prof. Yamashita',
    japaneseName: '山下先生',
    avatar: '👨‍🏫',
    role: 'Voz masculina profunda (Osada)',
    gender: 'male',
    neuralVoiceId: 'jp_male_osada',
    detuneCents: 0,
    pitch: 1.0,
    rate: 1.0,
    samplePhrase: 'みなさん、こんにちは。今日も日本語をがんばりましょう。'
  },
  {
    id: 'michiko',
    name: 'Michiko',
    japaneseName: 'みちこ',
    avatar: '👩',
    role: 'Voz femenina cálida (Sakura)',
    gender: 'female',
    neuralVoiceId: 'jp_001',
    detuneCents: 0,
    pitch: 1.0,
    rate: 1.0,
    samplePhrase: 'はじめまして、みちこです。いいお天気ですね。'
  },
  {
    id: 'robert',
    name: 'Robert',
    japaneseName: 'ロバート',
    avatar: '👱‍♂️',
    role: 'Voz masculina animada (Matsudake)',
    gender: 'male',
    neuralVoiceId: 'jp_male_matsudake',
    detuneCents: 0,
    pitch: 1.0,
    rate: 1.0,
    samplePhrase: 'こんにちは、ロバートです。日本語がおもしろいです！'
  },
  {
    id: 'sora',
    name: 'Sora',
    japaneseName: 'ソラ',
    avatar: '👧',
    role: 'Voz femenina juvenil (Rei)',
    gender: 'female',
    neuralVoiceId: 'jp_female_rei',
    detuneCents: 0,
    pitch: 1.0,
    rate: 1.0,
    samplePhrase: 'こんにちは！ソラといっしょに楽しく練習しましょう！'
  },
  {
    id: 'ken',
    name: 'Ken',
    japaneseName: 'けん',
    avatar: '🧑',
    role: 'Voz masculina serena (Ichiro)',
    gender: 'male',
    neuralVoiceId: 'jp_006',
    detuneCents: 0,
    pitch: 1.0,
    rate: 1.0,
    samplePhrase: 'こんにちは、けんです。ゆっくり話しましょう。'
  },
  {
    id: 'sue',
    name: 'Sue',
    japaneseName: 'スー',
    avatar: '👩‍🦱',
    role: 'Voz femenina tranquila (Miho)',
    gender: 'female',
    neuralVoiceId: 'jp_001',
    detuneCents: 0,
    pitch: 1.0,
    rate: 1.0,
    samplePhrase: 'こんにちは、スーです。毎日少しずつ練習しています。'
  }
];

export function resolveCharacterProfile(
  speakerOrVoiceId: string | undefined,
  defaultVoiceId: string
): CharacterVoiceProfile {
  if (!speakerOrVoiceId) {
    return CHARACTER_VOICES.find(v => v.id === defaultVoiceId) || CHARACTER_VOICES[0];
  }

  const direct = CHARACTER_VOICES.find(v => v.id === speakerOrVoiceId.toLowerCase());
  if (direct) return direct;

  const s = speakerOrVoiceId.toLowerCase();
  if (s.includes('メアリー') || s.includes('mary')) return CHARACTER_VOICES.find(v => v.id === 'mary')!;
  if (s.includes('たけし') || s.includes('takeshi') || s.includes('きむら')) {
    return CHARACTER_VOICES.find(v => v.id === 'takeshi')!;
  }
  if (
    s.includes('やました') ||
    s.includes('先生') ||
    s.includes('profesor') ||
    s.includes('ぶちょう') ||
    s.includes('しゃちょう') ||
    s.includes('jefe') ||
    s.includes('いしゃ') ||
    s.includes('doctor')
  ) {
    return CHARACTER_VOICES.find(v => v.id === 'yamashita')!;
  }
  if (
    s.includes('みちこ') ||
    s.includes('michiko') ||
    s.includes('おかあさん') ||
    s.includes('ホストマザー') ||
    s.includes('madre') ||
    s.includes('ウェイトレス')
  ) {
    return CHARACTER_VOICES.find(v => v.id === 'michiko')!;
  }
  if (s.includes('ロバート') || s.includes('robert') || s.includes('ジョン') || s.includes('john')) {
    return CHARACTER_VOICES.find(v => v.id === 'robert')!;
  }
  if (s.includes('ソラ') || s.includes('sora')) return CHARACTER_VOICES.find(v => v.id === 'sora')!;
  if (
    s.includes('けん') ||
    s.includes('ken') ||
    s.includes('てんいん') ||
    s.includes('えきいん') ||
    s.includes('どろぼう')
  ) {
    return CHARACTER_VOICES.find(v => v.id === 'ken')!;
  }
  if (s.includes('スー') || s.includes('sue')) return CHARACTER_VOICES.find(v => v.id === 'sue')!;

  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) % CHARACTER_VOICES.length;
  }
  return CHARACTER_VOICES[Math.abs(hash) % CHARACTER_VOICES.length];
}

export function detectCharacterFromText(raw: string): string | undefined {
  const t = (raw || '').toLowerCase();
  if (!t) return undefined;
  if (t.includes('メアリー') || t.includes('mary')) return 'mary';
  if (t.includes('たけし') || t.includes('takeshi')) return 'takeshi';
  if (t.includes('やました') || t.includes('山下') || t.includes('yamashita') || t.includes('先生')) return 'yamashita';
  if (t.includes('みちこ') || t.includes('michiko')) return 'michiko';
  if (t.includes('ロバート') || t.includes('robert')) return 'robert';
  if (t.includes('けん') || t.includes('ken')) return 'ken';
  if (t.includes('スー') || /\bsue\b/.test(t)) return 'sue';
  if (t.includes('ソラ') || t.includes('sora')) return 'sora';
  return undefined;
}
