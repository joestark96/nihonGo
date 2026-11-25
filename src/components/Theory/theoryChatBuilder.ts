import { UnitTheory, TheoryExample, unitTheories } from '../../data/theoryData';

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
  kind: 'greeting' | 'lesson-card' | 'quiz' | 'listen-pick' | 'word-build' | 'speak' | 'summary';
  text: string;
  subText?: string;
  bullets?: string[];
  tip?: string;
  example?: TheoryExample;
  extraExamples?: TheoryExample[];
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

  unitTheory.sections.forEach((sec, sIdx) => {
    const bullets = sec.content.map(c => c.replace(/\*\*/g, '')).slice(0, 4);
    const firstEx = sec.examples?.[0];
    const extraExamples = sec.examples?.slice(1) || [];

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
      userAckText: sec.examples?.length ? '¡Entendido! Ponme a prueba 💪' : 'Siguiente tema 👉'
    });

    if (sec.examples && sec.examples.length > 0) {
      const challengeEx = sec.examples[sec.examples.length > 1 ? 1 : 0];
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
        const otherSpanish = Array.from(
          new Set(globalExamples.map(e => e.spanish).filter(sp => sp && sp !== challengeEx.spanish))
        ).slice(0, 8);
        const distractors = deterministicShuffle(otherSpanish, sIdx * 17 + unitTheory.unitId).slice(0, 2);
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
        const otherJapanese = Array.from(
          new Set(globalExamples.map(e => e.japanese).filter(jp => jp && jp !== challengeEx.japanese))
        ).slice(0, 8);
        const distractors = deterministicShuffle(otherJapanese, sIdx * 23 + unitTheory.unitId).slice(0, 2);
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
