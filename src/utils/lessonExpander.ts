import { LessonNode, Unit, Exercise, ExerciseOption, MatchPair } from '../types';
import { genkiVocabulary } from '../data/vocabularyData';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Expands a lesson node's exercises from 3-4 exercises up to a rich,
 * engaging 8-exercise lesson (similar to Duolingo sessions) using:
 * 1. The node's original curated exercises.
 * 2. Pedagogical listening & reverse-comprehension questions generated from match-pairs.
 * 3. Listening variants of multiple-choice exercises.
 * 4. Authentic Genki vocabulary exercises for the lesson.
 * 5. Sister node reinforcement exercises from the same unit.
 */
export function expandLessonExercises(node: LessonNode, unit?: Unit, targetCount: number = 8): LessonNode {
  // Las lecciones de "Lectura Inicial", diálogos de lectura y ejercicios del Workbook oficial se mantienen 100% en su formato original
  const isDedicatedOriginal =
    node.title.toLowerCase().includes('lectura inicial') ||
    node.title.toLowerCase().includes('workbook') ||
    node.id.includes('wb') ||
    node.exercises.some(ex => ex.type === 'dialogue-reading');

  if (isDedicatedOriginal) {
    return {
      ...node,
      totalSteps: node.exercises.length,
      exercises: [...node.exercises]
    };
  }

  // If the node already has 8 or more exercises, keep them all
  if (node.exercises.length >= targetCount) {
    const randomized = node.exercises.map((ex) => {
      if ((ex.type === 'multiple-choice' || ex.type === 'listening') && ex.options && ex.options.length > 1) {
        return { ...ex, options: shuffle(ex.options) };
      }
      return { ...ex };
    });
    return {
      ...node,
      totalSteps: randomized.length,
      exercises: randomized
    };
  }

  const generatedExercises: Exercise[] = [];
  const baseExercises = node.exercises.map(ex => ({ ...ex }));

  // Collect pairs and vocabulary from the node
  const allNodePairs: MatchPair[] = [];
  baseExercises.forEach(ex => {
    if (ex.type === 'match-pairs' && ex.pairs) {
      allNodePairs.push(...ex.pairs);
    }
  });

  // Collect sibling pairs from other nodes in the same unit
  const siblingPairs: MatchPair[] = [];
  if (unit && unit.nodes) {
    unit.nodes.forEach(n => {
      if (n.id !== node.id) {
        n.exercises.forEach(ex => {
          if (ex.type === 'match-pairs' && ex.pairs) {
            siblingPairs.push(...ex.pairs);
          }
        });
      }
    });
  }

  // Helpers to distinguish vocabulary translations (JP -> Spanish) from grammar pairs (JP -> JP)
  const isSpanishTranslation = (str: string) => Boolean(str) && !/[\u3040-\u30ff\u4e00-\u9faf]/.test(str);
  const isJapaneseText = (str: string) => Boolean(str) && /[\u3040-\u30ff\u4e00-\u9faf]/.test(str);

  const getCategory = (pos?: string): string => {
    if (!pos) return 'other';
    if (pos.startsWith('adj')) return 'adjective';
    if (pos.startsWith('verb')) return 'verb';
    if (pos === 'noun') return 'noun';
    if (pos === 'adverb') return 'adverb';
    if (pos === 'expression') return 'expression';
    return 'other';
  };

  // Clean parenthesized translations from Japanese words (e.g. "学生 (estudiante)" -> "学生")
  const cleanJapanese = (str: string) => {
    return str
      .replace(/\s*\([a-zA-ZáéíóúñÁÉÍÓÚÑ\s~/-]+\)/g, '')
      .replace(/\s*（[a-zA-ZáéíóúñÁÉÍÓÚÑ\s~/-]+）/g, '')
      .trim();
  };

  const detectCategory = (jp: string, sp: string): string => {
    const cJp = cleanJapanese(jp);
    const cSp = sp.replace(/\s*\([^\)]*\)/g, '').toLowerCase().trim();
    if (cJp && cJp.length <= 2 && cSp && /^[a-z]+$/.test(cSp) && cSp.length <= 4) {
      return 'kana';
    }
    if (!cJp && cSp && /^[a-z]+$/.test(cSp) && cSp.length <= 4) {
      return 'kana';
    }
    const direct = genkiVocabulary.find(v =>
      (cJp && (v.japanese === cJp || v.furigana === cJp || cleanJapanese(v.japanese) === cJp)) ||
      (cSp && v.spanish.toLowerCase().trim() === cSp)
    );
    if (direct) return getCategory(direct.pos);

    // Multi-word phrases / polite sentences (e.g. にほんにいきます, だいがくにきます) must NOT be mixed with single dictionary verbs
    if (
      /(ます|ません|ました|でした|です)[。．]?$/.test(cJp) ||
      (cJp.length >= 6 && /[はがをにでへともの]/.test(cJp) && cSp.split(/\s+/).length >= 2)
    ) {
      return 'phrase';
    }

    // Heuristics
    const famWords = ['madre', 'padre', 'hermano', 'hermana', 'familia', 'esposo', 'esposa', 'hijo', 'hija', 'amigo', 'profesor', 'estudiante'];
    if (famWords.some(w => cSp.includes(w))) return 'noun';
    if (cSp.startsWith('mi ') || cSp.includes('el ') || cSp.includes('la ') || cSp.includes('los ') || cSp.includes('las ')) return 'noun';
    if (cSp.endsWith('ar') || cSp.endsWith('er') || cSp.endsWith('ir')) return 'verb';
    if (/[い]$/.test(cJp)) return 'adjective';
    if (/[うくぐすつぬぶむる]$/.test(cJp)) return 'verb';
    return 'other';
  };

  // Only consider pairs that are actual Japanese -> Spanish vocabulary translations
  const nodeVocabPairs = allNodePairs.filter(p => isJapaneseText(p.left) && isSpanishTranslation(p.right));
  const siblingVocabPairs = siblingPairs.filter(p => isJapaneseText(p.left) && isSpanishTranslation(p.right));

  // Pool of all distractor rights (translations) and lefts (japanese)
  const allRightOptions = Array.from(new Set([
    ...nodeVocabPairs.map(p => p.right.trim()),
    ...siblingVocabPairs.map(p => p.right.trim()),
    ...genkiVocabulary.filter(v => v.lesson === node.lessonNumber).map(v => v.spanish.trim())
  ])).filter(Boolean);

  const allLeftOptions = Array.from(new Set([
    ...nodeVocabPairs.map(p => cleanJapanese(p.left)),
    ...siblingVocabPairs.map(p => cleanJapanese(p.left)),
    ...genkiVocabulary.filter(v => v.lesson === node.lessonNumber).map(v => v.japanese.trim())
  ])).filter(Boolean);

  // Helper to build 4 unique options (1 correct + 3 distractors) matching category whenever possible
  const getCategoryPool = (
    category: string,
    targetText: string,
    mode: 'spanish' | 'japanese',
    localOptions: string[]
  ): string[] => {
    if (category === 'kana') {
      const isKanaValue = (val: string) =>
        mode === 'spanish' ? /^[a-z]{1,4}$/i.test(val.trim()) : val.trim().length <= 2;
      const siblingKanaPool = siblingVocabPairs
        .filter(p => cleanJapanese(p.left).length <= 2 && /^[a-z]{1,4}$/i.test(p.right.replace(/\s*\([^\)]*\)/g, '').trim()))
        .map(p => mode === 'spanish' ? p.right.replace(/\s*\([^\)]*\)/g, '').trim() : cleanJapanese(p.left))
        .filter(Boolean);
      const localKana = localOptions.filter(isKanaValue);
      return Array.from(new Set([...localKana, ...siblingKanaPool])).filter(t => t !== targetText);
    }

    if (category === 'phrase') {
      const isPhraseText = (val: string) =>
        mode === 'spanish'
          ? val.trim().split(/\s+/).length >= 2 || val.trim().length >= 8
          : /(ます|ません|ました|でした|です)[。．]?$/.test(val.trim()) || val.trim().length >= 5;
      const localPhrases = localOptions.filter(t => t !== targetText && isPhraseText(t));
      if (localPhrases.length >= 3) return localPhrases;

      const siblingPhrases = siblingVocabPairs
        .map(p => (mode === 'spanish' ? p.right.replace(/\s*\([^\)]*\)/g, '').trim() : cleanJapanese(p.left)))
        .filter(t => t !== targetText && isPhraseText(t));
      const mergedPhrases = Array.from(new Set([...localPhrases, ...siblingPhrases]));
      if (mergedPhrases.length >= 3) return mergedPhrases;

      const fallbackPool = (mode === 'spanish' ? allRightOptions : allLeftOptions).filter(
        t => t !== targetText && isPhraseText(t)
      );
      const mergedFallback = Array.from(new Set([...mergedPhrases, ...fallbackPool]));
      if (mergedFallback.length >= 3) return mergedFallback;
      return (mode === 'spanish' ? allRightOptions : allLeftOptions).filter(t => t !== targetText);
    }

    if (category === 'other') {
      const filtered = localOptions.filter(t => t !== targetText);
      return filtered.length >= 3 ? filtered : (mode === 'spanish' ? allRightOptions : allLeftOptions).filter(t => t !== targetText);
    }

    const targetHasKanji = mode === 'japanese' && /[\u4e00-\u9faf]/.test(targetText);
    const formatVocabOption = (v: typeof genkiVocabulary[number]) =>
      mode === 'spanish'
        ? v.spanish.trim()
        : targetHasKanji
        ? cleanJapanese(v.japanese)
        : cleanJapanese(v.furigana || v.japanese);

    // 1. First preference: local options of the exact same category
    const localSameCat = localOptions.filter(t => {
      if (t === targetText) return false;
      const cat = mode === 'spanish' ? detectCategory('', t) : detectCategory(t, '');
      return cat === category;
    });

    if (localSameCat.length >= 3) return localSameCat;

    // 2. Second preference: vocabulary of the same category up to current lesson
    const lessonScopedSameCat = genkiVocabulary
      .filter(v => v.lesson <= Math.max(1, node.lessonNumber) && getCategory(v.pos) === category)
      .map(formatVocabOption)
      .filter(t => t !== targetText);

    const mergedScoped = Array.from(new Set([...localSameCat, ...lessonScopedSameCat]));
    if (mergedScoped.length >= 3) return mergedScoped;

    // 3. Third preference: vocabulary of the same category across all lessons
    const vocabSameCat = genkiVocabulary
      .filter(v => getCategory(v.pos) === category)
      .map(formatVocabOption)
      .filter(t => t !== targetText);

    const merged = Array.from(new Set([...localSameCat, ...vocabSameCat]));
    if (merged.length >= 3) return merged;

    // Fallback: general options
    return (mode === 'spanish' ? allRightOptions : allLeftOptions).filter(t => t !== targetText);
  };

  // Helper to build 4 unique options (1 correct + 3 distractors)
  const buildOptions = (correctText: string, pool: string[]): ExerciseOption[] => {
    const distractors = shuffle(pool.filter(t => t !== correctText)).slice(0, 3);
    const rawList = [
      { id: `opt-corr-${Math.random().toString(36).substring(2, 6)}`, text: correctText, isCorrect: true },
      ...distractors.map((d, i) => ({
        id: `opt-dist-${i}-${Math.random().toString(36).substring(2, 6)}`,
        text: d,
        isCorrect: false
      }))
    ];
    return shuffle(rawList);
  };

  // 1. Generate complementary questions ONLY from genuine vocabulary translation pairs (JP -> Spanish)
  nodeVocabPairs.forEach((pair, idx) => {
    const cleanLeft = cleanJapanese(pair.left);
    const cleanRight = pair.right.replace(/\s*\([^\)]*\)/g, '').trim();

    if (cleanLeft && cleanRight) {
      const cat = detectCategory(cleanLeft, cleanRight);
      const rightPool = getCategoryPool(cat, cleanRight, 'spanish', nodeVocabPairs.map(p => p.right.replace(/\s*\([^\)]*\)/g, '').trim()));

      // A) Listening exercise for pair: Hear Japanese, pick translation
      const options = buildOptions(cleanRight, rightPool);
      const correctOpt = options.find(o => o.isCorrect)!;
      generatedExercises.push({
        id: `gen-listen-${node.id}-${idx}-${pair.id}`,
        type: 'listening',
        prompt: 'Escucha el audio y selecciona la opción correcta:',
        promptSub: pair.leftSub,
        japaneseVoiceText: cleanLeft,
        options,
        correctAnswerId: correctOpt.id,
        explanation: `「${cleanLeft}」 corresponde a "${cleanRight}".`
      });

      // B) Reverse question: "Cómo se dice en japonés: [Español]"
      const leftPool = getCategoryPool(cat, cleanLeft, 'japanese', nodeVocabPairs.map(p => cleanJapanese(p.left)));
      const leftOptions = buildOptions(cleanLeft, leftPool);
      const correctLeftOpt = leftOptions.find(o => o.isCorrect)!;
      generatedExercises.push({
        id: `gen-mc-rev-${node.id}-${idx}-${pair.id}`,
        type: 'multiple-choice',
        prompt: `¿Cómo se dice "${cleanRight}" en japonés?`,
        japaneseVoiceText: cleanLeft,
        options: leftOptions,
        correctAnswerId: correctLeftOpt.id,
        explanation: `"${cleanRight}" en japonés se dice 「${cleanLeft}」.`
      });
    }
  });

  // 2. Generate listening versions of multiple-choice exercises if they have dedicated Japanese voice audio
  // (Never use promptSub as TTS, since it often contains Spanish explanations/arrows, and skip conceptual grammar-rule questions)
  baseExercises.forEach((ex, idx) => {
    const isConceptualRule = /convierte|regla|gramática|diferencia entre|por qué/i.test(ex.prompt || '');
    if (ex.type === 'multiple-choice' && ex.japaneseVoiceText && !isConceptualRule && ex.options) {
      const voiceText = ex.japaneseVoiceText;
      const correctOpt = ex.options.find(o => o.isCorrect || o.id === ex.correctAnswerId);
      if (voiceText && correctOpt) {
        generatedExercises.push({
          id: `gen-listen-ex-${node.id}-${idx}`,
          type: 'listening',
          prompt: 'Escucha el audio y selecciona la respuesta adecuada:',
          japaneseVoiceText: voiceText,
          options: shuffle(ex.options.map(o => ({ ...o }))),
          correctAnswerId: correctOpt.id,
          explanation: ex.explanation || `La respuesta correcta es "${correctOpt.text}".`
        });
      }
    }
  });

  // 3. Generate vocabulary exercises from genkiVocabulary for this lesson
  // (Skip injecting L0 greetings into pure Kana alphabet lessons)
  const isPureKanaNode =
    node.lessonNumber === 0 &&
    nodeVocabPairs.length > 0 &&
    nodeVocabPairs.every(p => detectCategory(p.left, p.right) === 'kana');
  const lessonVocab = isPureKanaNode ? [] : genkiVocabulary.filter(v => v.lesson === node.lessonNumber);
  if (lessonVocab.length > 0) {
    const shuffledVocab = shuffle(lessonVocab);
    shuffledVocab.slice(0, 4).forEach((v, idx) => {
      const vCat = getCategory(v.pos);
      const rightPool = getCategoryPool(vCat, v.spanish.trim(), 'spanish', lessonVocab.map(w => w.spanish.trim()));

      // Direct vocabulary meaning
      const options = buildOptions(v.spanish, rightPool);
      const correctOpt = options.find(o => o.isCorrect)!;
      generatedExercises.push({
        id: `gen-vocab-${node.id}-${idx}-${v.id}`,
        type: idx % 2 === 0 ? 'listening' : 'multiple-choice',
        prompt: idx % 2 === 0 ? 'Escucha la palabra y selecciona su significado:' : `¿Qué significa la palabra 「${v.japanese}」?`,
        promptSub: v.furigana !== v.japanese ? v.furigana : undefined,
        japaneseVoiceText: v.japanese,
        options,
        correctAnswerId: correctOpt.id,
        explanation: `「${v.japanese}」 (${v.romaji}) significa "${v.spanish}".`
      });
    });
  }

  // 4. If still under target, pull exercises from sibling nodes in the unit
  if (unit && unit.nodes) {
    const siblingExercises: Exercise[] = [];
    unit.nodes.forEach(n => {
      if (n.id !== node.id) {
        n.exercises.forEach(ex => siblingExercises.push(ex));
      }
    });
    const shuffledSiblings = shuffle(siblingExercises);
    for (const sib of shuffledSiblings) {
      if (baseExercises.length + generatedExercises.length >= targetCount + 4) break;
      generatedExercises.push({
        ...sib,
        id: `gen-sibling-${sib.id}-${Math.random().toString(36).substring(2, 6)}`
      });
    }
  }

  // 4.5 Inject 1 dedicated speaking practice exercise per non-pure-kana lesson
  const speakingList: Exercise[] = [];
  if (!isPureKanaNode && !baseExercises.some(e => e.type === 'speaking')) {
    const speakCandidate = [...baseExercises, ...generatedExercises].find(
      ex =>
        ex.japaneseVoiceText &&
        ex.japaneseVoiceText.trim().length >= 2 &&
        !/[➔a-zA-Z]/.test(ex.japaneseVoiceText)
    );
    if (speakCandidate?.japaneseVoiceText) {
      speakingList.push({
        id: `gen-speak-${node.id}`,
        type: 'speaking',
        prompt: 'Pronuncia esta frase en japonés en voz alta:',
        promptSub: speakCandidate.japaneseVoiceText,
        japaneseVoiceText: speakCandidate.japaneseVoiceText,
        explanation: speakCandidate.explanation || '¡Excelente pronunciación!'
      });
    }
  }

  // 5. Combine and balance types
  // Interleave original base exercises with complementary generated ones
  const finalExercises: Exercise[] = [];
  const neededFromGenerated = Math.max(0, targetCount - baseExercises.length - speakingList.length);
  const selectedGenerated = shuffle(generatedExercises).slice(0, neededFromGenerated);

  // Combine
  const combined = [...baseExercises, ...selectedGenerated];

  // Interleave so exercise types alternate nicely
  // Preferred type sequence: multiple-choice, match-pairs, listening, word-order, dialogue, speaking...
  const mcList = combined.filter(e => e.type === 'multiple-choice');
  const matchPairsList = combined.filter(e => e.type === 'match-pairs');
  const listeningList = combined.filter(e => e.type === 'listening');
  const wordOrderList = combined.filter(e => e.type === 'word-order');
  const dialogueList = combined.filter(e => e.type === 'dialogue-reading');

  // Push in pleasant pedagogy rhythm
  const queues = [mcList, matchPairsList, listeningList, wordOrderList, dialogueList, speakingList];
  while (finalExercises.length < targetCount && queues.some(q => q.length > 0)) {
    for (const queue of queues) {
      if (queue.length > 0 && finalExercises.length < targetCount) {
        finalExercises.push(queue.shift()!);
      }
    }
  }

  // If still fewer than target, duplicate remaining from combined with fresh shuffle
  if (finalExercises.length < targetCount && combined.length > 0) {
    const filler = shuffle(combined);
    while (finalExercises.length < targetCount && filler.length > 0) {
      const ex = filler.shift()!;
      finalExercises.push({
        ...ex,
        id: `fill-${ex.id}-${Math.random().toString(36).substring(2, 6)}`
      });
    }
  }

  // Shuffle options in multiple-choice / listening so answers aren't fixed
  const finalRandomized = finalExercises.map(ex => {
    if ((ex.type === 'multiple-choice' || ex.type === 'listening') && ex.options && ex.options.length > 1) {
      return {
        ...ex,
        options: shuffle(ex.options)
      };
    }
    return ex;
  });

  return {
    ...node,
    totalSteps: finalRandomized.length,
    exercises: finalRandomized
  };
}

