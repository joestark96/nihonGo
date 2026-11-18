import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  SkipForward,
  MessageCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { UnitTheory, TheoryExample, unitTheories } from '../../data/theoryData';
import { sound } from '../../services/sound';

interface TheoryChatModeProps {
  unitTheory: UnitTheory;
  preferredVoiceId?: string;
  showRomaji?: boolean;
  onGoToRoadmap?: () => void;
}

interface ChatQuiz {
  prompt: string;
  audioText?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ChatStep {
  id: string;
  kind: 'greeting' | 'topic-intro' | 'explanation' | 'example' | 'tip' | 'quiz' | 'summary';
  text: string;
  subText?: string;
  example?: TheoryExample;
  quiz?: ChatQuiz;
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
  example?: TheoryExample;
  quiz?: ChatQuiz;
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

export const TheoryChatMode: React.FC<TheoryChatModeProps> = ({
  unitTheory,
  preferredVoiceId = 'mary',
  showRomaji = true,
  onGoToRoadmap
}) => {
  const charProfile = sound.getCharacterProfile(preferredVoiceId);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Build ordered micro-lesson chat script + inline quizzes for the selected unit
  const steps: ChatStep[] = useMemo(() => {
    const list: ChatStep[] = [];

    // Pool of examples in this unit (and adjacent units as distractor fallback)
    const unitExamples: TheoryExample[] = unitTheory.sections.flatMap(s => s.examples || []);
    const globalExamples: TheoryExample[] = [
      ...unitExamples,
      ...(unitTheories[Math.min(unitTheories.length - 1, unitTheory.unitId + 1)]?.sections.flatMap(s => s.examples || []) || []),
      ...(unitTheories[0]?.sections.flatMap(s => s.examples || []) || [])
    ];

    list.push({
      id: `greet-${unitTheory.unitId}`,
      kind: 'greeting',
      text: `¡Hola! Soy ${charProfile.name} (${charProfile.japaneseName}). Hoy te explicaré "${unitTheory.title}" poco a poco, con ejemplos y mini-quizes para practicar.`,
      subText: unitTheory.description,
      sectionIndex: 0,
      sectionTitle: 'Bienvenida',
      userAckText: '¡Sí, empecemos! 🚀'
    });

    unitTheory.sections.forEach((sec, sIdx) => {
      list.push({
        id: `intro-${sec.id}`,
        kind: 'topic-intro',
        text: `📌 Tema ${sIdx + 1}: ${sec.title}${sec.japaneseTitle ? ` (${sec.japaneseTitle})` : ''}`,
        subText: sec.summary,
        sectionIndex: sIdx,
        sectionTitle: sec.title,
        userAckText: '¡Entendido! Cuéntame más'
      });

      sec.content.forEach((line, lIdx) => {
        const cleanLine = line.replace(/\*\*/g, '');
        list.push({
          id: `exp-${sec.id}-${lIdx}`,
          kind: 'explanation',
          text: cleanLine,
          sectionIndex: sIdx,
          sectionTitle: sec.title,
          userAckText:
            lIdx === sec.content.length - 1 && sec.examples?.length
              ? '¡Claro! Muéstrame un ejemplo 👀'
              : 'Siguiente 👉'
        });
      });

      if (sec.examples && sec.examples.length > 0) {
        sec.examples.forEach((ex, eIdx) => {
          list.push({
            id: `ex-${sec.id}-${eIdx}`,
            kind: 'example',
            text: `Mira este ejemplo en japonés:`,
            example: ex,
            sectionIndex: sIdx,
            sectionTitle: sec.title,
            userAckText: '¡Buen ejemplo! Continuar 👍'
          });
        });
      }

      if (sec.tip) {
        list.push({
          id: `tip-${sec.id}`,
          kind: 'tip',
          text: sec.tip,
          sectionIndex: sIdx,
          sectionTitle: sec.title,
          userAckText: sec.examples?.length ? '¡Anotado! Hazme una pregunta 📝' : '¡Anotado! 💡'
        });
      }

      // Generate an inline Practice Mini-Quiz at the end of each topic with examples
      if (sec.examples && sec.examples.length > 0) {
        const targetEx = sec.examples[0];
        const askMeaning = sIdx % 2 === 0;

        if (askMeaning) {
          const otherSpanish = Array.from(
            new Set(
              globalExamples
                .map(e => e.spanish)
                .filter(sp => sp && sp !== targetEx.spanish)
            )
          ).slice(0, 8);
          const distractors = deterministicShuffle(otherSpanish, sIdx * 17 + unitTheory.unitId).slice(0, 2);
          const rawOpts = deterministicShuffle(
            [
              { text: targetEx.spanish, isCorrect: true },
              ...distractors.map(d => ({ text: d, isCorrect: false }))
            ],
            sIdx * 31 + 5
          );
          if (rawOpts.length >= 2) {
            list.push({
              id: `quiz-${sec.id}`,
              kind: 'quiz',
              text: `Practica lo que acabamos de ver (${sec.title}):`,
              quiz: {
                prompt: `¿Qué significa 「${targetEx.japanese}」?`,
                audioText: targetEx.audioText || targetEx.japanese,
                options: rawOpts.map(o => o.text),
                correctIndex: rawOpts.findIndex(o => o.isCorrect),
                explanation: `「${targetEx.japanese}」 significa "${targetEx.spanish}".`
              },
              sectionIndex: sIdx,
              sectionTitle: sec.title,
              userAckText: 'Siguiente tema 👉'
            });
          }
        } else {
          const otherJapanese = Array.from(
            new Set(
              globalExamples
                .map(e => e.japanese)
                .filter(jp => jp && jp !== targetEx.japanese)
            )
          ).slice(0, 8);
          const distractors = deterministicShuffle(otherJapanese, sIdx * 23 + unitTheory.unitId).slice(0, 2);
          const rawOpts = deterministicShuffle(
            [
              { text: targetEx.japanese, isCorrect: true },
              ...distractors.map(d => ({ text: d, isCorrect: false }))
            ],
            sIdx * 41 + 9
          );
          if (rawOpts.length >= 2) {
            list.push({
              id: `quiz-${sec.id}`,
              kind: 'quiz',
              text: `Pongamos a prueba lo visto en "${sec.title}":`,
              quiz: {
                prompt: `¿Cómo se dice "${targetEx.spanish}" en japonés?`,
                options: rawOpts.map(o => o.text),
                correctIndex: rawOpts.findIndex(o => o.isCorrect),
                explanation: `La forma correcta es 「${targetEx.japanese}」${targetEx.romaji ? ` (${targetEx.romaji})` : ''}.`
              },
              sectionIndex: sIdx,
              sectionTitle: sec.title,
              userAckText: 'Siguiente tema 👉'
            });
          }
        }
      }
    });

    list.push({
      id: `done-${unitTheory.unitId}`,
      kind: 'summary',
      text: `🎉 ¡Excelente trabajo! Ya vimos toda la teoría y los quizes de "${unitTheory.title}". ¿Listo para el Roadmap?`,
      sectionIndex: unitTheory.sections.length - 1,
      sectionTitle: 'Completado',
      userAckText: '¡A practicar!'
    });

    return list;
  }, [unitTheory, charProfile.name, charProfile.japaneseName]);

  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  // Reset chat when unit changes
  useEffect(() => {
    setStepIndex(0);
    setQuizAnswers({});
    setQuizScore({ correct: 0, total: 0 });
    const first = steps[0];
    setMessages(
      first
        ? [
            {
              id: `msg-0-${first.id}`,
              sender: 'sensei',
              kind: first.kind,
              text: first.text,
              subText: first.subText,
              example: first.example,
              quiz: first.quiz
            }
          ]
        : []
    );
    setIsTyping(false);
  }, [unitTheory.unitId, steps]);

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

  // Check if current step is a quiz that hasn't been answered yet
  const activeQuizMsg = currentStep?.kind === 'quiz'
    ? [...messages].reverse().find(m => m.kind === 'quiz' && m.quiz)
    : undefined;
  const isWaitingForQuizAnswer = Boolean(activeQuizMsg && quizAnswers[activeQuizMsg.id] === undefined);

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
          example: nextStep.example,
          quiz: nextStep.quiz
        }
      ]);

      if (nextStep.example) {
        const toSpeak = nextStep.example.audioText || nextStep.example.japanese;
        sound.speakJapanese(toSpeak, 0.9, charProfile.id);
      } else if (nextStep.quiz?.audioText) {
        sound.speakJapanese(nextStep.quiz.audioText, 0.9, charProfile.id);
      }
    }, 260);
  };

  const handleSelectQuizOption = (msgId: string, quiz: ChatQuiz, optIdx: number) => {
    if (quizAnswers[msgId] !== undefined || isTyping) return;
    const isCorrect = optIdx === quiz.correctIndex;

    setQuizAnswers(prev => ({ ...prev, [msgId]: optIdx }));
    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }

    // Add Sensei feedback message after short delay
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
            ? `🎉 ¡Exacto! Muy bien dicho.`
            : `😅 Casi... La respuesta correcta era: "${quiz.options[quiz.correctIndex]}"`,
          subText: quiz.explanation
        }
      ]);
    }, 240);
  };

  const handleNext = () => {
    if (!currentStep || isFinished || isWaitingForQuizAnswer) return;
    advanceToStep(stepIndex + 1, currentStep.userAckText);
  };

  const handleJumpNextTopic = () => {
    if (!currentStep || isFinished) return;
    const currentSecIdx = currentStep.sectionIndex;
    const nextTopicIdx = steps.findIndex(
      (s, idx) => idx > stepIndex && s.kind === 'topic-intro' && s.sectionIndex > currentSecIdx
    );
    if (nextTopicIdx !== -1) {
      advanceToStep(nextTopicIdx, 'Pasemos al siguiente tema ⏭');
    } else {
      advanceToStep(steps.length - 1, 'Ir al resumen');
    }
  };

  const handleRestart = () => {
    sound.playTap();
    setStepIndex(0);
    setQuizAnswers({});
    setQuizScore({ correct: 0, total: 0 });
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
              {quizScore.total > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[9px] font-black">
                  📝 {quizScore.correct}/{quizScore.total}
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              {charProfile.role} • Paso {stepIndex + 1}/{steps.length}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="p-2 rounded-xl bg-white dark:bg-[#131f24] border border-gray-200 dark:border-[#283842] text-gray-500 hover:text-indigo-500 transition-colors cursor-pointer"
          title="Reiniciar conversación"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Thin Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Chat Messages Feed (Inner scroll only) */}
      <div
        ref={chatContainerRef}
        className="h-[400px] overflow-y-auto p-3.5 flex flex-col gap-3 bg-slate-50/70 dark:bg-[#111b20]"
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

              <div className="max-w-[86%] flex flex-col gap-1.5">
                <div
                  className={`p-3 rounded-2xl rounded-tl-sm border shadow-2xs text-xs leading-relaxed ${
                    msg.isFeedbackSuccess === true
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-bold'
                      : msg.isFeedbackSuccess === false
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100 font-bold'
                      : msg.kind === 'topic-intro'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100 font-bold'
                      : msg.kind === 'tip'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 font-semibold'
                      : msg.kind === 'quiz'
                      ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-gray-800 dark:text-gray-100 font-bold'
                      : 'bg-white dark:bg-[#18272e] border-gray-200 dark:border-[#283842] text-gray-800 dark:text-gray-100 font-semibold'
                  }`}
                >
                  {msg.kind === 'tip' && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 mb-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Tip de {charProfile.name}</span>
                    </div>
                  )}

                  {msg.kind === 'quiz' && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 mb-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Mini-Quiz de Práctica</span>
                    </div>
                  )}

                  <p>{msg.text}</p>

                  {msg.subText && (
                    <p className="mt-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-300 opacity-90">
                      {msg.subText}
                    </p>
                  )}

                  {/* Interactive Japanese Example inside Chat Bubble */}
                  {msg.example && (
                    <div className="mt-2 p-2.5 rounded-xl bg-sky-50/80 dark:bg-[#131f24] border border-sky-200 dark:border-sky-800/60">
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
                            onClick={() => {
                              sound.speakJapanese(
                                msg.example!.audioText || msg.example!.japanese,
                                0.9,
                                charProfile.id
                              );
                            }}
                            className="p-2 rounded-xl bg-duo-blue hover:bg-duo-blue-dark text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
                            title={`Escuchar con la voz de ${charProfile.name}`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              sound.speakJapanese(
                                msg.example!.audioText || msg.example!.japanese,
                                0.7,
                                charProfile.id
                              );
                            }}
                            className="px-1.5 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-[10px] font-black text-sky-700 dark:text-sky-300 cursor-pointer"
                            title="Escuchar lento"
                          >
                            🐢
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline Interactive Quiz inside Chat Bubble */}
                  {msg.quiz && (
                    <div className="mt-2.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-purple-950 dark:text-purple-100 font-['Noto_Sans_JP']">
                          {msg.quiz.prompt}
                        </p>
                        {msg.quiz.audioText && (
                          <button
                            type="button"
                            onClick={() => sound.speakJapanese(msg.quiz!.audioText!, 0.9, charProfile.id)}
                            className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0 cursor-pointer"
                            title="Escuchar"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

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
                    </div>
                  )}
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
              disabled={isTyping || isWaitingForQuizAnswer}
              className={`flex-1 py-2.5 px-4 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
                isWaitingForQuizAnswer
                  ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow-[0_3px_0_0_#4338ca] active:translate-y-0.5 active:shadow-none cursor-pointer'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {isWaitingForQuizAnswer
                  ? 'Responde el Mini-Quiz arriba 👆'
                  : currentStep?.userAckText || 'Siguiente 👉'}
              </span>
            </button>

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
              <span>Repasar Chat</span>
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
