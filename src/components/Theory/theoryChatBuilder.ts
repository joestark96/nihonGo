import { UnitTheory, TheoryExample, unitTheories } from '../../data/theoryData';
import { genkiCurriculum } from '../../data/genkiCurriculum';
import { genkiVocabulary } from '../../data/vocabularyData';

export interface ChatVoiceNote {
  speaker: string;
  japanese: string;
  romaji?: string;
  spanish: string;
  audioText: string;
}

export interface ChatVocabNote {
  japanese: string;
  furigana: string;
  romaji: string;
  spanish: string;
}

export interface ChatQuiz {
  prompt: string;
  audioText?: string;
  hideJapanesePrompt?: boolean;
  revealJapanese?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChatWordBuild {
  spanishPrompt: string;
  targetSentence: string;
  targetTokens: string[];
  bankChips: { id: string; word: string }[];
  audioText: string;
  explanation: string;
}

export interface ChatStep {
  id: string;
  kind: 'greeting' | 'voice-intro' | 'vocab-intro' | 'lesson-card' | 'quiz' | 'listen-pick' | 'word-build' | 'speak' | 'summary';
  text: string;
  subText?: string;
  bullets?: string[];
  tip?: string;
  example?: TheoryExample;
  extraExamples?: TheoryExample[];
  voiceTitle?: string;
  voiceNotes?: ChatVoiceNote[];
  vocabNotes?: ChatVocabNote[];
  quiz?: ChatQuiz;
  wordBuild?: ChatWordBuild;
  sectionIndex: number;
  sectionTitle: string;
  userAckText: string;
}

export interface ChatMessage {
  id: string;
  sender: 'sensei' | 'user';
  kind?: ChatStep['kind'];
  text: string;
  subText?: string;
  bullets?: string[];
  tip?: string;
  example?: TheoryExample;
  voiceTitle?: string;
  voiceNotes?: ChatVoiceNote[];
  vocabNotes?: ChatVocabNote[];
  quiz?: ChatQuiz;
  wordBuild?: ChatWordBuild;
  isFeedbackSuccess?: boolean;
}

export function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed + 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function tokenizeJapaneseForBuilder(sentence: string): string[] {
  const clean = sentence
    .replace(/\[.*?\]|\(.*?\)|（.*?）/g, '')
    .replace(/[。．！!？?\s]/g, '')
    .trim();

  if (clean.length < 4) return [clean];

  const rawParts = clean
    .split(/(は|が|を|に|で|へ|と|も|の|から|まで|です|ます|ません|ました|でした)/g)
    .filter(Boolean);

  const merged: string[] = [];
  for (const part of rawParts) {
    if (
      merged.length > 0 &&
      part.length === 1 &&
      !/^(は|が|を|に|で|へ|と|も|の)$/.test(part) &&
      merged[merged.length - 1].length <= 3
    ) {
      merged[merged.length - 1] += part;
    } else {
      merged.push(part);
    }
  }

  return merged.length >= 2 ? merged : [clean];
}

function isQuestionExample(ex: TheoryExample): boolean {
  return /[？?]/.test(ex.japanese) || /[¿?]/.test(ex.spanish);
}

function isShortWordExample(ex: TheoryExample): boolean {
  const clean = ex.japanese.replace(/\[.*?\]|\(.*?\)|（.*?）|[。．！!？?\s]/g, '');
  return clean.length <= 6 && !/[。．]/.test(ex.japanese);
}

function pickChatDistractors(
  target: TheoryExample,
  unitPool: TheoryExample[],
  globalPool: TheoryExample[],
  field: 'spanish' | 'japanese',
  seed: number,
  count = 3
): string[] {
  const targetVal = target[field];
  const targetIsQ = isQuestionExample(target);
  const targetIsShort = isShortWordExample(target);

  const collectUnique = (items: TheoryExample[]) =>
    Array.from(new Set(items.map(e => e[field]).filter(v => v && v !== targetVal)));

  const sameUnitSameShape = collectUnique(
    unitPool.filter(e => isQuestionExample(e) === targetIsQ && isShortWordExample(e) === targetIsShort)
  );
  const globalSameShape = collectUnique(
    globalPool.filter(e => isQuestionExample(e) === targetIsQ && isShortWordExample(e) === targetIsShort)
  );
  const sameUnitAny = collectUnique(unitPool);
  const globalAny = collectUnique(globalPool);

  const ordered = Array.from(
    new Set([...sameUnitSameShape, ...globalSameShape, ...sameUnitAny, ...globalAny])
  ).slice(0, 12);

  return deterministicShuffle(ordered, seed).slice(0, count);
}

export function buildTheoryChatSteps(
  unitTheory: UnitTheory,
  senseiName: string,
  senseiJapaneseName: string
): ChatStep[] {
  const list: ChatStep[] = [];
  const unitExamples: TheoryExample[] = unitTheory.sections.flatMap(s => s.examples || []);
  const globalExamples: TheoryExample[] = [
    ...unitExamples,
    ...(unitTheories[Math.min(unitTheories.length - 1, unitTheory.unitId + 1)]?.sections.flatMap(s => s.examples || []) || []),
    ...(unitTheories[0]?.sections.flatMap(s => s.examples || []) || [])
  ];

  list.push({
    id: `greet-${unitTheory.unitId}`,
    kind: 'greeting',
    text: `¡Hola! Soy ${senseiName} (${senseiJapaneseName}). Vamos a dominar "${unitTheory.title}" con explicaciones breves y retos prácticos (armar frases, oído y voz).`,
    subText: unitTheory.description,
    sectionIndex: 0,
    sectionTitle: 'Bienvenida',
    userAckText: '¡Sí, empecemos! 🚀'
  });

  // Notas de voz estilo WhatsApp antes de comenzar el Tema 1
  const curriculumUnit = genkiCurriculum.find(u => u.id === unitTheory.unitId);
  const firstDialogueEx = curriculumUnit?.nodes
    .flatMap(n => n.exercises)
    .find(ex => ex.dialogueLines && ex.dialogueLines.length > 0);

  const voiceNotes: ChatVoiceNote[] = firstDialogueEx?.dialogueLines
    ? firstDialogueEx.dialogueLines.slice(0, 5).map(l => ({
        speaker: l.speaker,
        japanese: l.japanese,
        romaji: l.romaji,
        spanish: l.spanish,
        audioText: l.audioText || l.japanese
      }))
    : unitExamples.slice(0, 3).map(ex => ({
        speaker: senseiName,
        japanese: ex.japanese,
        romaji: ex.romaji,
        spanish: ex.spanish,
        audioText: ex.audioText || ex.japanese
      }));

  if (voiceNotes.length > 0) {
    list.push({
      id: `voice-intro-${unitTheory.unitId}`,
      kind: 'voice-intro',
      text: `Antes de ver la teoría, escucha estas notas de voz del diálogo de la unidad para ir afinando el oído:`,
      voiceTitle: firstDialogueEx?.dialogueTitle || `Vista previa: ${unitTheory.title}`,
      voiceNotes,
      sectionIndex: 0,
      sectionTitle: 'Audio Intro',
      userAckText: '🎧 ¡Escuchado! Ver vocabulario'
    });
  }

  const lessonVocab = genkiVocabulary
    .filter(v => v.lesson === unitTheory.unitId)
    .slice(0, 6)
    .map(v => ({
      japanese: v.japanese,
      furigana: v.furigana,
      romaji: v.romaji,
      spanish: v.spanish
    }));

  if (lessonVocab.length > 0) {
    list.push({
      id: `vocab-intro-${unitTheory.unitId}`,
      kind: 'vocab-intro',
      text: `Aquí tienes el vocabulario clave que usarás en esta lección. Toca cada palabra para escucharla:`,
      vocabNotes: lessonVocab,
      sectionIndex: 0,
      sectionTitle: 'Vocabulario Clave',
      userAckText: '📚 ¡Listo! Vamos al Tema 1'
    });
  }

  unitTheory.sections.forEach((sec, sIdx) => {
    const bullets = sec.content.map(c => c.replace(/\*\*/g, '')).slice(0, 4);
    const examples = sec.examples || [];
    const firstEx = examples[0];
    // Reservamos el último ejemplo para el reto y evitamos mostrarlo como "otro ejemplo"
    // antes de preguntar (para no regalar la respuesta en el chat).
    let challengeEx = examples.length >= 2 ? examples[examples.length - 1] : firstEx;
    const extraExamples = examples.length >= 3 ? examples.slice(1, -1) : [];

    if (examples.length === 1) {
      const altUnitExamples = unitExamples.filter(e => e.japanese !== firstEx.japanese);
      if (altUnitExamples.length > 0) {
        challengeEx = altUnitExamples[sIdx % altUnitExamples.length];
      }
    }

    list.push({
      id: `card-${sec.id}`,
      kind: 'lesson-card',
      text: `📌 Tema ${sIdx + 1}: ${sec.title}${sec.japaneseTitle ? ` (${sec.japaneseTitle})` : ''}`,
      subText: sec.summary,
      bullets,
      example: firstEx,
      extraExamples,
      tip: sec.tip,
      sectionIndex: sIdx,
      sectionTitle: sec.title,
      userAckText: examples.length ? '¡Entendido! Ponme a prueba 💪' : 'Siguiente tema 👉'
    });

    if (examples.length > 0 && challengeEx) {
      const tokens = tokenizeJapaneseForBuilder(challengeEx.japanese);
      const pattern = sIdx % 3;

      if (pattern === 0 && tokens.length >= 2 && tokens.length <= 7) {
        const distractorPool = ['を', 'に', 'は', 'が', 'で'].filter(p => !tokens.includes(p));
        const extraDistractor = distractorPool[sIdx % distractorPool.length];
        const bankRaw = extraDistractor ? [...tokens, extraDistractor] : [...tokens];
        const bankChips = deterministicShuffle(
          bankRaw.map((w, idx) => ({ id: `wb-${sec.id}-${idx}-${w}`, word: w })),
          sIdx * 19 + unitTheory.unitId
        );

        list.push({
          id: `wb-${sec.id}`,
          kind: 'word-build',
          text: `🧩 Reto de Construcción: Ordena las piezas para decir en japonés:`,
          wordBuild: {
            spanishPrompt: challengeEx.spanish,
            targetSentence: tokens.join(''),
            targetTokens: tokens,
            bankChips,
            audioText: challengeEx.audioText || challengeEx.japanese,
            explanation: `Se construye así: 「${challengeEx.japanese}」${challengeEx.romaji ? ` (${challengeEx.romaji})` : ''}.`
          },
          sectionIndex: sIdx,
          sectionTitle: sec.title,
          userAckText: '¡Siguiente reto!'
        });
      } else if (pattern === 1) {
        const distractors = pickChatDistractors(
          challengeEx,
          unitExamples,
          globalExamples,
          'spanish',
          sIdx * 17 + unitTheory.unitId,
          3
        );
        const rawOpts = deterministicShuffle(
          [
            { text: challengeEx.spanish, isCorrect: true },
            ...distractors.map(d => ({ text: d, isCorrect: false }))
          ],
          sIdx * 29 + 3
        );

        if (rawOpts.length >= 2) {
          list.push({
            id: `listen-${sec.id}`,
            kind: 'listen-pick',
            text: `🎧 Reto de Oído: Escucha lo que te digo (sin leer) y elige qué significa:`,
            quiz: {
              prompt: 'Toca el botón azul para escuchar la frase:',
              audioText: challengeEx.audioText || challengeEx.japanese,
              hideJapanesePrompt: true,
              revealJapanese: challengeEx.japanese,
              options: rawOpts.map(o => o.text),
              correctIndex: rawOpts.findIndex(o => o.isCorrect),
              explanation: `Dije: 「${challengeEx.japanese}」 = "${challengeEx.spanish}".`
            },
            sectionIndex: sIdx,
            sectionTitle: sec.title,
            userAckText: '¡Siguiente tema!'
          });
        }
      } else {
        const distractors = pickChatDistractors(
          challengeEx,
          unitExamples,
          globalExamples,
          'japanese',
          sIdx * 23 + unitTheory.unitId,
          3
        );
        const rawOpts = deterministicShuffle(
          [
            { text: challengeEx.japanese, isCorrect: true },
            ...distractors.map(d => ({ text: d, isCorrect: false }))
          ],
          sIdx * 41 + 9
        );

        if (rawOpts.length >= 2) {
          list.push({
            id: `quiz-${sec.id}`,
            kind: 'quiz',
            text: `📝 Reto de Traducción:`,
            quiz: {
              prompt: `¿Cómo se dice "${challengeEx.spanish}" en japonés?`,
              options: rawOpts.map(o => o.text),
              correctIndex: rawOpts.findIndex(o => o.isCorrect),
              explanation: `La forma correcta es 「${challengeEx.japanese}」${challengeEx.romaji ? ` (${challengeEx.romaji})` : ''}.`
            },
            sectionIndex: sIdx,
            sectionTitle: sec.title,
            userAckText: '¡Siguiente tema!'
          });
        }
      }

      if (sIdx % 2 === 1) {
        list.push({
          id: `speak-${sec.id}`,
          kind: 'speak',
          text: `🗣️ Tu turno de hablar: intenta pronunciar en voz alta esta frase del tema:`,
          example: firstEx || challengeEx,
          sectionIndex: sIdx,
          sectionTitle: sec.title,
          userAckText: '¡Ya la practiqué! Siguiente 👉'
        });
      }
    }
  });

  list.push({
    id: `done-${unitTheory.unitId}`,
    kind: 'summary',
    text: `🎉 ¡Increíble! Completaste toda la clase interactiva de "${unitTheory.title}". ¡Ya dominas la teoría para arrasar en el Roadmap!`,
    sectionIndex: unitTheory.sections.length - 1,
    sectionTitle: 'Completado',
    userAckText: '¡A practicar!'
  });

  return list;
}
