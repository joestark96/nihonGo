import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  ArrowRight,
  SkipForward,
  MessageCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Puzzle,
  Headphones,
  Mic
} from 'lucide-react';
import { UnitTheory, TheoryExample, unitTheories } from '../../data/theoryData';
import { sound } from '../../services/sound';
import { SpeechPracticeButton } from '../SpeechPracticeButton';

interface TheoryChatModeProps {
  unitTheory: UnitTheory;
  preferredVoiceId?: string;
  showRomaji?: boolean;
  onGoToRoadmap?: () => void;
}

interface ChatQuiz {
  prompt: string;
  audioText?: string;
  hideJapanesePrompt?: boolean;
  revealJapanese?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ChatWordBuild {
  spanishPrompt: string;
  targetSentence: string;
  targetTokens: string[];
  bankChips: { id: string; word: string }[];
  audioText: string;
  explanation: string;
}

interface ChatStep {
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

interface ChatMessage {
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

function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed + 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Splits a Japanese sentence into 3..6 clean interactive word/particle tokens
 * whose concatenation exactly equals the cleaned sentence.
 */
function tokenizeJapaneseForBuilder(sentence: string): string[] {
  const clean = sentence
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/（.*?）/g, '')
    .replace(/[。．！!？?\s]/g, '')
    .trim();

  if (clean.length < 4) return [clean];

  // Split nicely around particles and endings while keeping tokens intact
  const rawParts = clean
    .split(/(は|が|を|に|で|へ|と|も|の|から|まで|です|ます|ません|ました|でした)/g)
    .filter(Boolean);

  // Merge tiny 1-char non-particle fragments so there aren't too many tiny chips
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

export const TheoryChatMode: React.FC<TheoryChatModeProps> = ({
  unitTheory,
  preferredVoiceId = 'mary',
  showRomaji = true,
  onGoToRoadmap
}) => {
  const charProfile = sound.getCharacterProfile(preferredVoiceId);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Build didactic, action-packed micro-lesson script with varied interactive challenges
  const steps: ChatStep[] = useMemo(() => {
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
      text: `¡Hola! Soy ${charProfile.name} (${charProfile.japaneseName}). Vamos a dominar "${unitTheory.title}" con explicaciones breves y retos prácticos (armar frases, oído y voz).`,
      subText: unitTheory.description,
      sectionIndex: 0,
      sectionTitle: 'Bienvenida',
      userAckText: '¡Sí, empecemos! 🚀'
    });

    unitTheory.sections.forEach((sec, sIdx) => {
      // 1. Compact, rich Lesson Card (Topic + Key bullets + 1st Example + Tip) -> ZERO "siguiente, siguiente" bloat!
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

      // 2. Interactive Challenge(s) for this topic!
      if (sec.examples && sec.examples.length > 0) {
        const challengeEx = sec.examples[sec.examples.length > 1 ? 1 : 0];
        const tokens = tokenizeJapaneseForBuilder(challengeEx.japanese);

        // Alternate between Word-Builder, Blind Listening Challenge, Multiple Choice, and Speech Practice!
        const pattern = sIdx % 3;

        if (pattern === 0 && tokens.length >= 2 && tokens.length <= 7) {
          // WORD BUILDER CHALLENGE 🧩
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
          // BLIND LISTENING CHALLENGE 🎧
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
          // TRANSLATION / GRAMMAR QUIZ 📝
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

        // Every 2nd topic, add a quick Speaking Practice prompt 🎤
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
  }, [unitTheory, charProfile.name, charProfile.japaneseName]);

  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Interactive Quiz & Word Builder state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [wordBuilderSelection, setWordBuilderSelection] = useState<Record<string, string[]>>({});
  const [wordBuilderSubmitted, setWordBuilderSubmitted] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [shownExtras, setShownExtras] = useState<Record<string, boolean>>({});
  const [autoAudio, setAutoAudio] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nihongo_chat_auto_audio');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const toggleAutoAudio = () => {
    sound.playTap();
    setAutoAudio(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nihongo_chat_auto_audio', String(next));
      } catch {
        // ignore
      }
      if (!next) sound.stopSpeech();
      return next;
    });
  };

  // Restore saved step for this unit (or start at 0)
  useEffect(() => {
    let savedIdx = 0;
    try {
      const raw = localStorage.getItem(`nihongo_theory_chat_step_${unitTheory.unitId}`);
      const parsed = raw ? parseInt(raw, 10) : 0;
      if (!Number.isNaN(parsed) && parsed > 0 && parsed < steps.length) {
        savedIdx = parsed;
      }
    } catch {
      savedIdx = 0;
    }

    setStepIndex(savedIdx);
    setQuizAnswers({});
    setWordBuilderSelection({});
    setWordBuilderSubmitted({});
    setShownExtras({});
    setScore({ correct: 0, total: 0 });
    const target = steps[savedIdx] || steps[0];
    setMessages(
      target
        ? [
            {
              id: `msg-${savedIdx}-${target.id}`,
              sender: 'sensei',
              kind: target.kind,
              text: savedIdx > 0 ? `📌 Retomando donde te quedaste:\n${target.text}` : target.text,
              subText: target.subText,
              bullets: target.bullets,
              tip: target.tip,
              example: target.example,
              quiz: target.quiz,
              wordBuild: target.wordBuild
            }
          ]
        : []
    );
    setIsTyping(false);
  }, [unitTheory.unitId, steps]);

  // Persist current step per unit
  useEffect(() => {
    try {
      localStorage.setItem(`nihongo_theory_chat_step_${unitTheory.unitId}`, String(stepIndex));
    } catch {
      // ignore
    }
  }, [unitTheory.unitId, stepIndex]);

  // Smoothly scroll ONLY the inner chat box (never the outer IonContent page!)
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const currentStep = steps[stepIndex];
  const isFinished = stepIndex >= steps.length - 1;
  const progressPct = Math.round(((stepIndex + 1) / Math.max(1, steps.length)) * 100);

  // Check if current step has an unfinished interactive challenge
  const activeChallengeMsg =
    currentStep?.kind === 'quiz' || currentStep?.kind === 'listen-pick' || currentStep?.kind === 'word-build'
      ? [...messages]
          .reverse()
          .find(m => (m.kind === 'quiz' || m.kind === 'listen-pick' || m.kind === 'word-build'))
      : undefined;

  const isWaitingForChallenge = Boolean(
    activeChallengeMsg &&
      ((activeChallengeMsg.quiz && quizAnswers[activeChallengeMsg.id] === undefined) ||
        (activeChallengeMsg.wordBuild && !wordBuilderSubmitted[activeChallengeMsg.id]))
  );

  const advanceToStep = (nextIdx: number, userReplyText?: string) => {
    if (nextIdx >= steps.length || isTyping) return;
    sound.playTap();

    if (userReplyText) {
      setMessages(prev => [
        ...prev,
        {
          id: `user-${Date.now()}-${nextIdx}`,
          sender: 'user',
          text: userReplyText
        }
      ]);
    }

    setIsTyping(true);
    setTimeout(() => {
      const nextStep = steps[nextIdx];
      setIsTyping(false);
      setStepIndex(nextIdx);
      setMessages(prev => [
        ...prev,
        {
          id: `sensei-${Date.now()}-${nextStep.id}`,
          sender: 'sensei',
          kind: nextStep.kind,
          text: nextStep.text,
          subText: nextStep.subText,
          bullets: nextStep.bullets,
          tip: nextStep.tip,
          example: nextStep.example,
          quiz: nextStep.quiz,
          wordBuild: nextStep.wordBuild
        }
      ]);

      if (autoAudio) {
        if (nextStep.quiz?.audioText) {
          sound.speakJapanese(nextStep.quiz.audioText, 0.9, charProfile.id);
        } else if (nextStep.example && nextStep.kind === 'speak') {
          sound.speakJapanese(nextStep.example.audioText || nextStep.example.japanese, 0.9, charProfile.id);
        }
      }
    }, 240);
  };

  const handleSelectQuizOption = (msgId: string, quiz: ChatQuiz, optIdx: number) => {
    if (quizAnswers[msgId] !== undefined || isTyping) return;
    const isCorrect = optIdx === quiz.correctIndex;

    setQuizAnswers(prev => ({ ...prev, [msgId]: optIdx }));
    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `feedback-${Date.now()}`,
          sender: 'sensei',
          isFeedbackSuccess: isCorrect,
          text: isCorrect
            ? `🎉 ¡Exacto! Muy bien.`
            : `😅 Casi... La respuesta correcta era: "${quiz.options[quiz.correctIndex]}"`,
          subText: quiz.explanation
        }
      ]);
    }, 220);
  };

  const handleToggleChip = (msgId: string, chipId: string) => {
    if (wordBuilderSubmitted[msgId]) return;
    sound.playTap();
    setWordBuilderSelection(prev => {
      const curr = prev[msgId] || [];
      if (curr.includes(chipId)) {
        return { ...prev, [msgId]: curr.filter(id => id !== chipId) };
      }
      return { ...prev, [msgId]: [...curr, chipId] };
    });
  };

  const handleCheckWordBuild = (msgId: string, wb: ChatWordBuild) => {
    if (wordBuilderSubmitted[msgId] || isTyping) return;
    const selectedIds = wordBuilderSelection[msgId] || [];
    const builtStr = selectedIds
      .map(id => wb.bankChips.find(c => c.id === id)?.word || '')
      .join('');

    const isCorrect = builtStr === wb.targetSentence;
    setWordBuilderSubmitted(prev => ({ ...prev, [msgId]: true }));
    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));

    if (isCorrect) {
      sound.playCorrect();
      sound.speakJapanese(wb.audioText, 0.9, charProfile.id);
    } else {
      sound.playIncorrect();
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `wb-fb-${Date.now()}`,
          sender: 'sensei',
          isFeedbackSuccess: isCorrect,
          text: isCorrect
            ? `🎉 ¡Perfecto! Armaste la oración correctamente.`
            : `😅 Casi... El orden correcto era: 「${wb.targetSentence}」`,
          subText: wb.explanation
        }
      ]);
    }, 220);
  };

  const handleShowMoreExamples = () => {
    if (!currentStep?.extraExamples?.length || shownExtras[currentStep.id] || isTyping) return;
    sound.playTap();
    setShownExtras(prev => ({ ...prev, [currentStep.id]: true }));
    const extra = currentStep.extraExamples[0];

    setMessages(prev => [
      ...prev,
      {
        id: `user-ex-${Date.now()}`,
        sender: 'user',
        text: 'Dame otro ejemplo 💡'
      }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `sensei-ex-${Date.now()}`,
          sender: 'sensei',
          text: 'Aquí tienes otro ejemplo práctico:',
          example: extra
        }
      ]);
      sound.speakJapanese(extra.audioText || extra.japanese, 0.9, charProfile.id);
    }, 240);
  };

  const handleNext = () => {
    if (!currentStep || isFinished || isWaitingForChallenge) return;
    advanceToStep(stepIndex + 1, currentStep.userAckText);
  };

  const handleJumpNextTopic = () => {
    if (!currentStep || isFinished) return;
    const currentSecIdx = currentStep.sectionIndex;
    const nextTopicIdx = steps.findIndex(
      (s, idx) => idx > stepIndex && s.kind === 'lesson-card' && s.sectionIndex > currentSecIdx
    );
    if (nextTopicIdx !== -1) {
      advanceToStep(nextTopicIdx, 'Pasemos al siguiente tema ⏭');
    } else {
      advanceToStep(steps.length - 1, 'Ir al resumen');
    }
  };

  const handleRestart = () => {
    sound.playTap();
    try {
      localStorage.removeItem(`nihongo_theory_chat_step_${unitTheory.unitId}`);
    } catch {
      // ignore
    }
    setStepIndex(0);
    setQuizAnswers({});
    setWordBuilderSelection({});
    setWordBuilderSubmitted({});
    setShownExtras({});
    setScore({ correct: 0, total: 0 });
    const first = steps[0];
    setMessages(
      first
        ? [
            {
              id: `msg-restart-${first.id}`,
              sender: 'sensei',
              kind: first.kind,
              text: first.text,
              subText: first.subText
            }
          ]
        : []
    );
  };

  return (
    <div className="w-full flex flex-col bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] rounded-3xl shadow-duo-card dark:shadow-none overflow-hidden">
      {/* Sensei Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-sky-500/10 border-b border-duo-gray-200 dark:border-[#283842] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#131f24] border-2 border-indigo-400/60 flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
            {charProfile.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-gray-800 dark:text-gray-100">
                {charProfile.name}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase">
                Sensei
              </span>
              {score.total > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[9px] font-black">
                  🏆 {score.correct}/{score.total}
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              {charProfile.role} • Paso {stepIndex + 1}/{steps.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleAutoAudio}
            className={`px-2 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer ${
              autoAudio
                ? 'bg-indigo-500/15 border-indigo-400/50 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-[#131f24] border-gray-200 dark:border-[#283842] text-gray-400'
            }`}
            title={autoAudio ? 'Auto-audio activado' : 'Auto-audio silenciado'}
          >
            {autoAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{autoAudio ? 'Auto' : 'Mudo'}</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl bg-white dark:bg-[#131f24] border border-gray-200 dark:border-[#283842] text-gray-500 hover:text-indigo-500 transition-colors cursor-pointer"
            title="Reiniciar clase"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thin Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Topic Quick-Jump Bar */}
      {unitTheory.sections.length > 1 && (
        <div className="px-3 py-2 bg-white dark:bg-[#18272e] border-b border-duo-gray-200 dark:border-[#283842] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex-shrink-0 mr-0.5">
            Temas:
          </span>
          {unitTheory.sections.map((sec, sIdx) => {
            const targetIdx = steps.findIndex(st => st.sectionIndex === sIdx && st.kind === 'lesson-card');
            const currentSecIdx = steps[stepIndex]?.sectionIndex ?? -1;
            const isCurrent = currentSecIdx === sIdx;
            if (targetIdx === -1) return null;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  sound.playTap();
                  const targetStep = steps[targetIdx];
                  if (!targetStep) return;
                  setStepIndex(targetIdx);
                  setMessages([
                    {
                      id: `msg-jump-${targetStep.id}-${Date.now()}`,
                      sender: 'sensei',
                      kind: targetStep.kind,
                      text: targetStep.text,
                      subText: targetStep.subText,
                      bullets: targetStep.bullets,
                      example: targetStep.example,
                      tip: targetStep.tip
                    }
                  ]);
                  if (autoAudio && (targetStep.example?.audioText || targetStep.example?.japanese)) {
                    sound.speakJapanese(
                      targetStep.example.audioText || targetStep.example.japanese,
                      0.9,
                      charProfile.id
                    );
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-gray-100 dark:bg-[#131f24] text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                }`}
              >
                {sIdx + 1}. {sec.title.length > 20 ? `${sec.title.slice(0, 20)}…` : sec.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Inner Chat Feed */}
      <div
        ref={chatContainerRef}
        className="h-[420px] overflow-y-auto p-3.5 flex flex-col gap-3 bg-slate-50/70 dark:bg-[#111b20]"
      >
        {messages.map(msg => {
          const isUser = msg.sender === 'user';

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="max-w-[78%] px-3.5 py-2 rounded-2xl rounded-tr-sm bg-duo-blue text-white font-bold text-xs shadow-xs">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-start gap-2 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-white dark:bg-[#18272e] border border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-2xs">
                {charProfile.avatar}
              </div>

              <div className="max-w-[88%] flex flex-col gap-1.5">
                <div
                  className={`p-3.5 rounded-2xl rounded-tl-sm border shadow-2xs text-xs leading-relaxed ${
                    msg.isFeedbackSuccess === true
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-bold'
                      : msg.isFeedbackSuccess === false
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100 font-bold'
                      : msg.kind === 'lesson-card'
                      ? 'bg-white dark:bg-[#18272e] border-indigo-300 dark:border-indigo-700 text-gray-800 dark:text-gray-100 font-semibold'
                      : msg.kind === 'word-build' || msg.kind === 'quiz' || msg.kind === 'listen-pick'
                      ? 'bg-purple-50/90 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-gray-800 dark:text-gray-100 font-bold'
                      : msg.kind === 'speak'
                      ? 'bg-pink-50/80 dark:bg-pink-950/30 border-pink-300 dark:border-pink-700 text-gray-800 dark:text-gray-100 font-bold'
                      : 'bg-white dark:bg-[#18272e] border-gray-200 dark:border-[#283842] text-gray-800 dark:text-gray-100 font-semibold'
                  }`}
                >
                  {msg.kind === 'quiz' && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 mb-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Mini-Quiz</span>
                    </div>
                  )}
                  {msg.kind === 'listen-pick' && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 mb-1">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Reto Auditivo</span>
                    </div>
                  )}
                  {msg.kind === 'word-build' && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 mb-1">
                      <Puzzle className="w-3.5 h-3.5" />
                      <span>Construye la Frase</span>
                    </div>
                  )}
                  {msg.kind === 'speak' && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-pink-600 dark:text-pink-400 mb-1">
                      <Mic className="w-3.5 h-3.5" />
                      <span>Práctica Oral</span>
                    </div>
                  )}

                  <p className={msg.kind === 'lesson-card' ? 'text-sm font-black text-indigo-700 dark:text-indigo-300' : ''}>
                    {msg.text}
                  </p>

                  {msg.subText && (
                    <p className="mt-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                      {msg.subText}
                    </p>
                  )}

                  {/* Compact Key Points in Lesson Card */}
                  {msg.bullets && msg.bullets.length > 0 && (
                    <ul className="mt-2.5 flex flex-col gap-1.5 pl-1 border-l-2 border-indigo-300 dark:border-indigo-700">
                      {msg.bullets.map((b, bIdx) => (
                        <li key={`${msg.id}-b-${bIdx}`} className="pl-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200 leading-snug">
                          • {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Interactive Japanese Example */}
                  {msg.example && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-sky-50/80 dark:bg-[#131f24] border border-sky-200 dark:border-sky-800/60">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-black font-['Noto_Sans_JP'] text-gray-900 dark:text-white leading-snug">
                            {msg.example.japanese}
                          </p>
                          {showRomaji && msg.example.romaji && (
                            <p className="text-[11px] font-bold text-duo-blue mt-0.5">
                              {msg.example.romaji}
                            </p>
                          )}
                          <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mt-1">
                            🇪🇸 {msg.example.spanish}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              sound.speakJapanese(msg.example!.audioText || msg.example!.japanese, 0.9, charProfile.id)
                            }
                            className="p-2 rounded-xl bg-duo-blue hover:bg-duo-blue-dark text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
                            title={`Escuchar con ${charProfile.name}`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              sound.speakJapanese(msg.example!.audioText || msg.example!.japanese, 0.7, charProfile.id)
                            }
                            className="px-1.5 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-[10px] font-black text-sky-700 dark:text-sky-300 cursor-pointer"
                            title="Lento"
                          >
                            🐢
                          </button>
                        </div>
                      </div>

                      {/* Speaking Practice Mic inside Speak Card */}
                      {msg.kind === 'speak' && (
                        <div className="mt-2.5 pt-2 border-t border-sky-200/70 dark:border-sky-800/50 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-pink-600 dark:text-pink-300">
                            Pulsa el micrófono y léelo en voz alta:
                          </span>
                          <SpeechPracticeButton
                            targetJapanese={msg.example.japanese}
                            targetFurigana={msg.example.audioText || msg.example.japanese}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tip inside Lesson Card */}
                  {msg.tip && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-1.5 text-[11px] font-medium text-amber-900 dark:text-amber-100">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{msg.tip}</span>
                    </div>
                  )}

                  {/* 1. Multiple Choice / Listening Challenge inside Chat */}
                  {msg.quiz && (
                    <div className="mt-2.5 flex flex-col gap-2">
                      {msg.quiz.audioText ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => sound.speakJapanese(msg.quiz!.audioText!, 0.9, charProfile.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-duo-blue hover:bg-duo-blue-dark text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>Escuchar Frase</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => sound.speakJapanese(msg.quiz!.audioText!, 0.7, charProfile.id)}
                            className="py-2 px-3 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200 font-black text-xs cursor-pointer"
                          >
                            🐢
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs font-black text-purple-950 dark:text-purple-100 font-['Noto_Sans_JP']">
                          {msg.quiz.prompt}
                        </p>
                      )}

                      <div className="flex flex-col gap-1.5">
                        {msg.quiz.options.map((opt, optIdx) => {
                          const userPick = quizAnswers[msg.id];
                          const answered = userPick !== undefined;
                          const isPicked = userPick === optIdx;
                          const isCorrectOpt = optIdx === msg.quiz!.correctIndex;

                          let btnStyle =
                            'bg-white dark:bg-[#18272e] border-gray-200 dark:border-[#283842] text-gray-800 dark:text-gray-100 hover:border-purple-400';
                          if (answered) {
                            if (isCorrectOpt) {
                              btnStyle =
                                'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                            } else if (isPicked && !isCorrectOpt) {
                              btnStyle =
                                'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200';
                            } else {
                              btnStyle = 'bg-gray-100/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-50';
                            }
                          }

                          return (
                            <button
                              key={`${msg.id}-opt-${optIdx}`}
                              type="button"
                              disabled={answered}
                              onClick={() => handleSelectQuizOption(msg.id, msg.quiz!, optIdx)}
                              className={`w-full text-left px-3 py-2 rounded-xl border-2 text-xs font-bold font-['Noto_Sans_JP'] transition-all flex items-center justify-between gap-2 ${
                                answered ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                              } ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {answered && isCorrectOpt && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              )}
                              {answered && isPicked && !isCorrectOpt && (
                                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {quizAnswers[msg.id] !== undefined && quizAnswers[msg.id] !== msg.quiz.correctIndex && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setQuizAnswers(prev => {
                              const copy = { ...prev };
                              delete copy[msg.id];
                              return copy;
                            });
                          }}
                          className="self-start px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 font-black text-[11px] flex items-center gap-1 cursor-pointer hover:brightness-95 transition-all"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reintentar</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* 2. Word Builder Challenge inside Chat */}
                  {msg.wordBuild && (() => {
                    const wb = msg.wordBuild;
                    const selectedIds = wordBuilderSelection[msg.id] || [];
                    const submitted = Boolean(wordBuilderSubmitted[msg.id]);

                    return (
                      <div className="mt-2.5 flex flex-col gap-2.5">
                        <div className="p-2 rounded-xl bg-white dark:bg-[#131f24] border border-purple-200 dark:border-purple-800/60 text-xs font-black text-purple-900 dark:text-purple-100">
                          🇪🇸 «{wb.spanishPrompt}»
                        </div>

                        {/* Answer Assembly Tray */}
                        <div className="min-h-[44px] p-2 rounded-xl bg-white dark:bg-[#18272e] border-2 border-dashed border-purple-300 dark:border-purple-700 flex flex-wrap gap-1.5 items-center">
                          {selectedIds.length === 0 ? (
                            <span className="text-[11px] font-semibold text-gray-400 italic">
                              Toca las fichas de abajo en orden...
                            </span>
                          ) : (
                            selectedIds.map(chipId => {
                              const chip = wb.bankChips.find(c => c.id === chipId);
                              if (!chip) return null;
                              return (
                                <button
                                  key={`sel-${chipId}`}
                                  type="button"
                                  disabled={submitted}
                                  onClick={() => handleToggleChip(msg.id, chipId)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs font-['Noto_Sans_JP'] shadow-2xs cursor-pointer"
                                >
                                  {chip.word}
                                </button>
                              );
                            })
                          )}
                        </div>

                        {/* Bank Chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {wb.bankChips.map(chip => {
                            const isUsed = selectedIds.includes(chip.id);
                            return (
                              <button
                                key={chip.id}
                                type="button"
                                disabled={isUsed || submitted}
                                onClick={() => handleToggleChip(msg.id, chip.id)}
                                className={`px-2.5 py-1.5 rounded-xl border-2 text-xs font-bold font-['Noto_Sans_JP'] transition-all ${
                                  isUsed
                                    ? 'bg-gray-100 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-700 text-transparent select-none cursor-default'
                                    : 'bg-white dark:bg-[#18272e] border-gray-200 dark:border-[#283842] text-gray-800 dark:text-gray-100 hover:border-purple-400 cursor-pointer shadow-2xs'
                                }`}
                              >
                                {chip.word}
                              </button>
                            );
                          })}
                        </div>

                        {!submitted ? (
                          <button
                            type="button"
                            disabled={selectedIds.length === 0}
                            onClick={() => handleCheckWordBuild(msg.id, wb)}
                            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-black text-xs transition-all cursor-pointer"
                          >
                            Comprobar Oración ✓
                          </button>
                        ) : (
                          (() => {
                            const builtStr = selectedIds
                              .map(id => wb.bankChips.find(c => c.id === id)?.word || '')
                              .join('');
                            const targetStr = wb.targetTokens.join('');
                            if (builtStr === targetStr) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playTap();
                                  setWordBuilderSubmitted(prev => ({ ...prev, [msg.id]: false }));
                                  setWordBuilderSelection(prev => ({ ...prev, [msg.id]: [] }));
                                }}
                                className="self-start px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 font-black text-[11px] flex items-center gap-1 cursor-pointer hover:brightness-95 transition-all"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reintentar oración</span>
                              </button>
                            );
                          })()
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}

        {/* Sensei Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-white dark:bg-[#18272e] border border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-sm flex-shrink-0">
              {charProfile.avatar}
            </div>
            <div className="px-3.5 py-2 rounded-2xl rounded-tl-sm bg-white dark:bg-[#18272e] border border-gray-200 dark:border-[#283842] text-xs font-black text-gray-400 flex items-center gap-1">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce" style={{ animationDelay: '120ms' }}>•</span>
              <span className="animate-bounce" style={{ animationDelay: '240ms' }}>•</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Interactive Reply Bar */}
      <div className="p-3 bg-white dark:bg-[#18272e] border-t border-duo-gray-200 dark:border-[#283842] flex flex-col gap-2">
        {!isFinished ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNext}
              disabled={isTyping || isWaitingForChallenge}
              className={`flex-1 py-2.5 px-4 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
                isWaitingForChallenge
                  ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow-[0_3px_0_0_#4338ca] active:translate-y-0.5 active:shadow-none cursor-pointer'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {isWaitingForChallenge
                  ? 'Completa el reto arriba 👆'
                  : currentStep?.userAckText || 'Continuar 👉'}
              </span>
            </button>

            {currentStep?.kind === 'lesson-card' &&
              currentStep.extraExamples &&
              currentStep.extraExamples.length > 0 &&
              !shownExtras[currentStep.id] && (
                <button
                  type="button"
                  onClick={handleShowMoreExamples}
                  disabled={isTyping}
                  className="py-2.5 px-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-black text-xs rounded-2xl transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                  title="Ver otro ejemplo antes del reto"
                >
                  <span>+Ejemplo</span>
                </button>
              )}

            {stepIndex > 0 && (
              <button
                type="button"
                onClick={handleJumpNextTopic}
                disabled={isTyping}
                className="py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-black text-xs rounded-2xl transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                title="Saltar al siguiente tema"
              >
                <SkipForward className="w-4 h-4" />
                <span>Tema</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Repasar</span>
            </button>

            {onGoToRoadmap && (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onGoToRoadmap();
                }}
                className="flex-1 py-2.5 px-4 bg-duo-green hover:bg-duo-green-dark text-white font-black text-xs rounded-2xl shadow-[0_3px_0_0_#46a302] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>¡Ir a Practicar!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
