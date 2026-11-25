import { Exercise, ExerciseOption } from '../../types';

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getSpeakerAvatar(speaker: string, speakerIdx: number): string {
  const s = speaker.toLowerCase();
  if (s.includes('メアリー') || s.includes('mary')) return '👱‍♀️';
  if (s.includes('たけし') || s.includes('takeshi') || s.includes('きむら')) return '👦';
  if (s.includes('ロバート') || s.includes('robert')) return '👱‍♂️';
  if (s.includes('やました') || s.includes('先生') || s.includes('profesor')) return '👨‍🏫';
  if (s.includes('みちこ') || s.includes('michiko')) return '👩';
  if (s.includes('けん') || s.includes('ken')) return '🧑';
  if (s.includes('スー') || s.includes('sue')) return '👩‍🦱';
  if (s.includes('ジョン') || s.includes('john')) return '🧔';
  if (s.includes('ソラ') || s.includes('sora')) return '👧';
  if (s.includes('ホストマザー') || s.includes('おかあさん') || s.includes('madre')) return '👩‍🍳';
  if (s.includes('ぶちょう') || s.includes('しゃちょう') || s.includes('jefe')) return '👔';
  if (s.includes('いしゃ') || s.includes('doctor')) return '🩺';
  if (s.includes('どろぼう') || s.includes('ladrón')) return '🥷';
  if (
    s.includes('てんいん') ||
    s.includes('ウェイトレス') ||
    s.includes('えきいん') ||
    s.includes('不動産屋') ||
    s.includes('agente') ||
    s.includes('emplead') ||
    s.includes('camarer')
  ) {
    return '🧑‍💼';
  }
  return ['🗣️', '💬', '🙋', '💁'][speakerIdx % 4];
}

export function getSpeakerChatTheme(speakerIdx: number) {
  const isRight = speakerIdx % 2 === 1;
  const themes = [
    {
      avatarBg: 'bg-sky-500 border-sky-600 text-white',
      badge: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700',
      bubble: 'bg-white dark:bg-[#15232b] border-sky-200 dark:border-sky-800/80 rounded-2xl rounded-tl-sm',
      activeBubble: 'bg-sky-50 dark:bg-sky-900/35 border-sky-500 ring-2 ring-sky-400/40 rounded-2xl rounded-tl-sm',
      romaji: 'text-sky-600 dark:text-sky-400',
      audioBtn: 'bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-300 hover:text-white'
    },
    {
      avatarBg: 'bg-emerald-500 border-emerald-600 text-white',
      badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
      bubble: 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-300 dark:border-emerald-800/80 rounded-2xl rounded-tr-sm',
      activeBubble: 'bg-emerald-100/90 dark:bg-emerald-900/45 border-emerald-500 ring-2 ring-emerald-400/40 rounded-2xl rounded-tr-sm',
      romaji: 'text-emerald-700 dark:text-emerald-400',
      audioBtn: 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white'
    },
    {
      avatarBg: 'bg-purple-500 border-purple-600 text-white',
      badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700',
      bubble: 'bg-purple-50/85 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/80 rounded-2xl rounded-tl-sm',
      activeBubble: 'bg-purple-100/90 dark:bg-purple-900/40 border-purple-500 ring-2 ring-purple-400/40 rounded-2xl rounded-tl-sm',
      romaji: 'text-purple-600 dark:text-purple-400',
      audioBtn: 'bg-purple-500/10 hover:bg-purple-500 text-purple-600 dark:text-purple-300 hover:text-white'
    },
    {
      avatarBg: 'bg-amber-500 border-amber-600 text-white',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
      bubble: 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 rounded-2xl rounded-tr-sm',
      activeBubble: 'bg-amber-100/90 dark:bg-amber-900/40 border-amber-500 ring-2 ring-amber-400/40 rounded-2xl rounded-tr-sm',
      romaji: 'text-amber-700 dark:text-amber-400',
      audioBtn: 'bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white'
    }
  ];
  return {
    isRight,
    ...themes[speakerIdx % themes.length]
  };
}

export function formatQuizOptionText(
  text: string,
  exerciseType: string,
  prompt: string,
  isIntroLesson: boolean,
  allOptions?: ExerciseOption[]
): string {
  let cleaned = text;

  // 1. Strip '(Correcta)' or '(Incorrecta)' or '(Uso incorrecto...)' markers
  cleaned = cleaned.replace(/\s*\((?:Correcta|Incorrecta|Uso incorrecto[^)]*)\)/gi, '');

  // 2. In listening exercises or questions asking to listen to audio,
  // strip Japanese readings in parentheses from options
  const isListeningOrAudio = exerciseType === 'listening' || /escucha|escuchó|audio/i.test(prompt);
  if (isListeningOrAudio && /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(cleaned)) {
    cleaned = cleaned
      .replace(/\s*\([^)]*[\u3040-\u30ff\u4e00-\u9faf][^)]*\)/g, '')
      .replace(/\s*（[^）]*[\u3040-\u30ff\u4e00-\u9faf][^）]*）/g, '');
  }

  // 3. For non-intro lessons: strip trailing romaji while keeping kana readings in parentheses
  if (!isIntroLesson) {
    const isRomajiQuestion = /romaji|lectura|pronuncia|cómo se lee|como se lee/i.test(prompt);
    if (!isRomajiQuestion && /[\u3040-\u30ff\u4e00-\u9faf]/.test(cleaned)) {
      cleaned = cleaned
        .replace(/(\([\u3040-\u30ff\s・]+)\s*\/\s*[a-zA-Z\s'-]+\)/g, '$1)')
        .replace(/(（[\u3040-\u30ff\s・]+)\s*\/\s*[a-zA-Z\s'-]+）/g, '$1）')
        .replace(/\s*\([^)]*[a-zA-ZáéíóúñÁÉÍÓÚÑ¡¿/][^)]*\)\.?$/g, '')
        .replace(/\s*（[^）]*[a-zA-ZáéíóúñÁÉÍÓÚÑ¡¿/][^）]*）\.?$/g, '');
    }
  }

  // 4. Universal anti-giveaway rule
  if (allOptions && allOptions.length >= 2) {
    const parenCount = allOptions.filter(o => /\([^)]+\)|（[^）]+）/.test(o.text)).length;
    if (parenCount > 0 && parenCount < allOptions.length && /\([^)]+\)|（[^）]+）/.test(cleaned)) {
      const candidate = cleaned
        .replace(/\s*\([^)]+\)/g, '')
        .replace(/\s*（[^）]+）/g, '')
        .replace(/\s+\./g, '.')
        .trim();
      if (candidate.length >= 2) {
        cleaned = candidate;
      }
    }
  }

  return cleaned.trim();
}

export function getCorrectAnswerDisplay(
  exercise: Exercise | undefined,
  isIntroLesson: boolean
): string | null {
  if (!exercise) return null;
  if (exercise.type === 'word-order' && exercise.correctSentence) {
    return exercise.correctSentence.join(' ');
  }
  if (
    exercise.type === 'multiple-choice' ||
    exercise.type === 'listening' ||
    exercise.type === 'dialogue-reading'
  ) {
    const correctOpt = exercise.options?.find(
      o => o.isCorrect || o.id === exercise.correctAnswerId
    );
    if (correctOpt) {
      return formatQuizOptionText(
        correctOpt.text,
        exercise.type,
        exercise.prompt,
        isIntroLesson,
        exercise.options
      );
    }
  }
  return null;
}
