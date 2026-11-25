import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  ArrowRight,
  SkipForward,
  MessageCircle
} from 'lucide-react';
import { UnitTheory } from '../../data/theoryData';
import { sound } from '../../services/sound';
import {
  ChatMessage,
  ChatQuiz,
  ChatStep,
  ChatWordBuild,
  buildTheoryChatSteps
} from './theoryChatBuilder';
import { TheoryChatBubble } from './TheoryChatBubble';

interface TheoryChatModeProps {
  unitTheory: UnitTheory;
  preferredVoiceId?: string;
  showRomaji?: boolean;
  onGoToRoadmap?: () => void;
}

export const TheoryChatMode: React.FC<TheoryChatModeProps> = ({
  unitTheory,
  preferredVoiceId = 'mary',
  showRomaji = true,
  onGoToRoadmap
}) => {
  const charProfile = sound.getCharacterProfile(preferredVoiceId);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const steps: ChatStep[] = useMemo(
    () => buildTheoryChatSteps(unitTheory, charProfile.name, charProfile.japaneseName),
    [unitTheory, charProfile.name, charProfile.japaneseName]
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

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

  useEffect(() => {
    try {
      localStorage.setItem(`nihongo_theory_chat_step_${unitTheory.unitId}`, String(stepIndex));
    } catch {
      // ignore
    }
  }, [unitTheory.unitId, stepIndex]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const currentStep = steps[stepIndex];
  const isFinished = stepIndex >= steps.length - 1;
  const progressPct = Math.round(((stepIndex + 1) / Math.max(1, steps.length)) * 100);

  const activeChallengeMsg =
    currentStep?.kind === 'quiz' || currentStep?.kind === 'listen-pick' || currentStep?.kind === 'word-build'
      ? [...messages].reverse().find(m => m.kind === 'quiz' || m.kind === 'listen-pick' || m.kind === 'word-build')
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
      setMessages(prev => [...prev, { id: `user-${Date.now()}-${nextIdx}`, sender: 'user', text: userReplyText }]);
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
    if (isCorrect) sound.playCorrect();
    else sound.playIncorrect();

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
      return curr.includes(chipId)
        ? { ...prev, [msgId]: curr.filter(id => id !== chipId) }
        : { ...prev, [msgId]: [...curr, chipId] };
    });
  };

  const handleCheckWordBuild = (msgId: string, wb: ChatWordBuild) => {
    if (wordBuilderSubmitted[msgId] || isTyping) return;
    const selectedIds = wordBuilderSelection[msgId] || [];
    const builtStr = selectedIds.map(id => wb.bankChips.find(c => c.id === id)?.word || '').join('');
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
        id: `extra-${Date.now()}`,
        sender: 'sensei',
        text: `💡 Aquí tienes otro ejemplo útil de este tema:`,
        example: extra
      }
    ]);
    sound.speakJapanese(extra.audioText || extra.japanese, 0.9, charProfile.id);
  };

  const handleNext = () => {
    if (!isFinished && !isWaitingForChallenge) {
      advanceToStep(stepIndex + 1, currentStep?.userAckText || 'Continuar');
    }
  };

  const handleJumpNextTopic = () => {
    if (isFinished || isTyping) return;
    const currentSec = currentStep?.sectionIndex ?? 0;
    const nextTopicIdx = steps.findIndex((s, i) => i > stepIndex && s.sectionIndex > currentSec);
    if (nextTopicIdx !== -1) {
      advanceToStep(nextTopicIdx, 'Pasar al siguiente tema 👉');
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
        ? [{ id: `msg-restart-${first.id}`, sender: 'sensei', kind: first.kind, text: first.text, subText: first.subText }]
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
              <span className="text-sm font-black text-gray-800 dark:text-gray-100">{charProfile.name}</span>
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
        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Topic Quick-Jump Bar */}
      {unitTheory.sections.length > 1 && (
        <div className="px-3 py-2 bg-white dark:bg-[#18272e] border-b border-duo-gray-200 dark:border-[#283842] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex-shrink-0 mr-0.5">
            Temas:
          </span>
          {unitTheory.sections.map((sec, sIdx) => {
            const targetIdx = steps.findIndex(st => st.sectionIndex === sIdx && st.kind === 'lesson-card');
            const isCurrent = (steps[stepIndex]?.sectionIndex ?? -1) === sIdx;
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
                    sound.speakJapanese(targetStep.example.audioText || targetStep.example.japanese, 0.9, charProfile.id);
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
        {messages.map(msg => (
          <TheoryChatBubble
            key={msg.id}
            msg={msg}
            senseiAvatar={charProfile.avatar}
            senseiName={charProfile.name}
            senseiVoiceId={charProfile.id}
            showRomaji={showRomaji}
            quizAnswer={quizAnswers[msg.id]}
            wordBuilderSelected={wordBuilderSelection[msg.id] || []}
            wordBuilderSubmitted={Boolean(wordBuilderSubmitted[msg.id])}
            onSelectQuizOption={handleSelectQuizOption}
            onRetryQuiz={msgId => {
              sound.playTap();
              setQuizAnswers(prev => {
                const copy = { ...prev };
                delete copy[msgId];
                return copy;
              });
            }}
            onToggleChip={handleToggleChip}
            onCheckWordBuild={handleCheckWordBuild}
            onRetryWordBuild={msgId => {
              sound.playTap();
              setWordBuilderSubmitted(prev => ({ ...prev, [msgId]: false }));
              setWordBuilderSelection(prev => ({ ...prev, [msgId]: [] }));
            }}
          />
        ))}

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
                {isWaitingForChallenge ? 'Completa el reto arriba 👆' : currentStep?.userAckText || 'Continuar 👉'}
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
