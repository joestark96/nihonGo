import React, { useState, useEffect } from 'react';
import {
  X, Heart, Volume2, CheckCircle2, AlertCircle, ArrowRight,
  FastForward, Dumbbell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exercise, ExerciseOption, LessonNode, MatchPair, UserProfile } from '../../types';
import { sound } from '../../services/sound';
import { shuffleArray, getCorrectAnswerDisplay } from './quizFormatters';
import {
  JumpPassedScreen,
  JumpFailedScreen,
  LessonCompletedScreen,
  GameOverScreen
} from './QuizResultScreens';
import { DialogueBox } from './exercises/DialogueBox';
import { SpeakingExercise } from './exercises/SpeakingExercise';
import { WordOrderExercise } from './exercises/WordOrderExercise';
import { MatchPairsExercise } from './exercises/MatchPairsExercise';
import { MultipleChoiceExercise } from './exercises/MultipleChoiceExercise';

interface QuizModalProps {
  lesson: LessonNode;
  userProfile: UserProfile;
  isJumpAhead?: boolean;
  isPractice?: boolean;
  onClose: () => void;
  onCompleteLesson: (nodeId: string, earnedXp: number, stars: number) => void;
  onDeductHeart: () => void;
  onPassJumpAhead?: (targetUnitId: number, targetNodeId?: string, skippedNodeIds?: string[]) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  lesson,
  userProfile,
  isJumpAhead = false,
  isPractice = false,
  onClose,
  onCompleteLesson,
  onDeductHeart,
  onPassJumpAhead
}) => {
  const [activeExercises, setActiveExercises] = useState<Exercise[]>(lesson.exercises);
  const exercises = activeExercises;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakenIds, setMistakenIds] = useState<string[]>([]);
  const [isReviewingMistakes, setIsReviewingMistakes] = useState(false);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<ExerciseOption[]>([]);
  const [wordChips, setWordChips] = useState<{ id: string; word: string }[]>([]);
  const [selectedChipIds, setSelectedChipIds] = useState<string[]>([]);

  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [mismatchedPair, setMismatchedPair] = useState<{ left: string; right: string } | null>(null);
  const [shuffledLeftPairs, setShuffledLeftPairs] = useState<MatchPair[]>([]);
  const [shuffledRightPairs, setShuffledRightPairs] = useState<MatchPair[]>([]);

  const [status, setStatus] = useState<
    'answering' | 'correct' | 'incorrect' | 'completed' | 'game-over' | 'jump-failed' | 'jump-passed'
  >(!isJumpAhead && !isPractice && userProfile.hearts <= 0 ? 'game-over' : 'answering');

  const [heartsLeft, setHeartsLeft] = useState(userProfile.hearts);
  const [jumpChancesLeft, setJumpChancesLeft] = useState(3);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showDialogueTranslation, setShowDialogueTranslation] = useState(true);
  const [activeDialogueLineIdx, setActiveDialogueLineIdx] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentExercise: Exercise | undefined = exercises[currentIndex];
  const progressPercent = Math.round((currentIndex / exercises.length) * 100);
  const isWorkbookLesson = lesson.title.toLowerCase().includes('workbook') || lesson.id.includes('wb');
  const isIntroLesson = lesson.lessonNumber === 0 && !isJumpAhead;

  const playCurrentExerciseVoice = (rate: number = 0.9) => {
    if (!currentExercise?.japaneseVoiceText) return;
    sound.speakExerciseAudio(currentExercise.japaneseVoiceText, rate, {
      isWorkbook: isWorkbookLesson || currentExercise.id.includes('wb'),
      exerciseId: currentExercise.id,
      prompt: currentExercise.prompt
    });
  };

  const handleClose = () => {
    sound.stopSpeech();
    onClose();
  };

  const handleRequestExit = () => {
    sound.playTap();
    sound.stopSpeech();
    setShowExitConfirm(true);
  };

  useEffect(() => {
    const onBack = (e: Event) => {
      e.preventDefault();
      if (showExitConfirm) {
        setShowExitConfirm(false);
      } else if (
        status === 'completed' ||
        status === 'game-over' ||
        status === 'jump-passed' ||
        status === 'jump-failed'
      ) {
        handleClose();
      } else {
        handleRequestExit();
      }
    };
    window.addEventListener('nihongo-back', onBack);
    return () => window.removeEventListener('nihongo-back', onBack);
  }, [showExitConfirm, status]);

  useEffect(() => {
    sound.stopSpeech();
    if (!isJumpAhead && !isPractice && heartsLeft <= 0) {
      setStatus('game-over');
      return;
    }
    if (!currentExercise) return;

    setSelectedOptionId(null);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMismatchedPair(null);
    setActiveDialogueLineIdx(null);
    setShowTranscript(false);
    setStatus('answering');

    setShuffledOptions(currentExercise.options ? shuffleArray(currentExercise.options) : []);

    if (currentExercise.type === 'word-order' && currentExercise.wordBank) {
      setWordChips(shuffleArray(currentExercise.wordBank).map((w, idx) => ({ id: `chip-${idx}-${w}`, word: w })));
      setSelectedChipIds([]);
    }

    if (currentExercise.type === 'match-pairs' && currentExercise.pairs) {
      setMatchedPairs([]);
      const lefts = shuffleArray(currentExercise.pairs);
      setShuffledLeftPairs(lefts);

      let rights = shuffleArray(currentExercise.pairs);
      if (currentExercise.pairs.length > 1) {
        let attempts = 0;
        while (attempts < 25 && rights.some((r, i) => r.id === lefts[i]?.id)) {
          rights = shuffleArray(currentExercise.pairs);
          attempts++;
        }
      }
      setShuffledRightPairs(rights);
    }

    if (currentExercise.japaneseVoiceText) {
      sound.preloadAudio(currentExercise.japaneseVoiceText);
    }
    const nextExercise = exercises[currentIndex + 1];
    if (nextExercise?.japaneseVoiceText) {
      sound.preloadAudio(nextExercise.japaneseVoiceText);
    }

    if (currentExercise.japaneseVoiceText && currentExercise.type === 'listening') {
      setTimeout(() => playCurrentExerciseVoice(0.9), 150);
    }

    return () => {
      sound.stopSpeech();
    };
  }, [currentIndex, currentExercise]);

  if (!currentExercise && status !== 'completed' && status !== 'game-over' && status !== 'jump-failed' && status !== 'jump-passed') {
    return null;
  }

  const recordMistake = () => {
    setWrongAttempts(prev => prev + 1);
    if (currentExercise) {
      setMistakenIds(prev => (prev.includes(currentExercise.id) ? prev : [...prev, currentExercise.id]));
    }
    if (isJumpAhead) {
      const remaining = jumpChancesLeft - 1;
      setJumpChancesLeft(remaining);
      if (remaining <= 0) {
        setStatus('jump-failed');
        return 'jump-failed';
      }
      return 'incorrect';
    }
    const newHearts = Math.max(0, heartsLeft - 1);
    setHeartsLeft(newHearts);
    onDeductHeart();
    if (newHearts === 0) {
      setStatus('game-over');
      return 'game-over';
    }
    return 'incorrect';
  };

  const handleCheck = () => {
    if (!currentExercise) return;
    let isCorrect = false;

    if (currentExercise.type === 'multiple-choice' || currentExercise.type === 'listening' || currentExercise.type === 'dialogue-reading') {
      isCorrect = currentExercise.options ? selectedOptionId === currentExercise.correctAnswerId : true;
    } else if (currentExercise.type === 'word-order') {
      const selectedWords = selectedChipIds
        .map(id => wordChips.find(c => c.id === id)?.word)
        .filter((w): w is string => Boolean(w));
      isCorrect =
        selectedWords.length === currentExercise.correctSentence?.length &&
        selectedWords.every((word, idx) => word === currentExercise.correctSentence![idx]);
    } else if (currentExercise.type === 'match-pairs') {
      isCorrect = matchedPairs.length === (currentExercise.pairs?.length || 0);
    }

    setShowTranscript(true);
    if (isCorrect) {
      sound.playCorrect();
      if (currentExercise.japaneseVoiceText) playCurrentExerciseVoice(0.9);
      setStatus('correct');
    } else {
      sound.playIncorrect();
      const nextState = recordMistake();
      setStatus(nextState);
    }
  };

  const handleContinue = () => {
    sound.stopSpeech();
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return;
    }

    sound.playLessonComplete();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

    if (isJumpAhead) {
      setStatus('jump-passed');
    } else if (isReviewingMistakes) {
      setStatus('completed');
    } else if (isPractice) {
      setStatus('completed');
      onCompleteLesson(lesson.id, 25, 3);
    } else {
      setStatus('completed');
      const stars = wrongAttempts === 0 ? 3 : wrongAttempts <= 2 ? 2 : 1;
      onCompleteLesson(lesson.id, 20, stars);
    }
  };

  const handleMatchSelect = (type: 'left' | 'right', id: string) => {
    if (type === 'left') {
      const pair = shuffledLeftPairs.find(p => p.id === id);
      if (pair?.left) {
        const cleanSpoken = pair.left.replace(/\[.*?\]|\(.*?\)|（.*?）/g, '').trim();
        sound.speakJapanese(cleanSpoken);
      } else {
        sound.playTap();
      }
      setSelectedLeft(id);
      if (selectedRight) checkPairMatch(id, selectedRight);
    } else {
      sound.playTap();
      setSelectedRight(id);
      if (selectedLeft) checkPairMatch(selectedLeft, id);
    }
  };

  const checkPairMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      sound.playTap();
      const newMatched = [...matchedPairs, leftId];
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      setMismatchedPair(null);
      if (newMatched.length === (currentExercise?.pairs?.length || 0)) {
        sound.playCorrect();
        setStatus('correct');
      }
    } else {
      sound.playIncorrect();
      setMismatchedPair({ left: leftId, right: rightId });
      const nextState = recordMistake();
      if (nextState !== 'incorrect') setStatus(nextState);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setMismatchedPair(null);
      }, 500);
    }
  };

  const canCheck = () => {
    if (status !== 'answering' || !currentExercise) return false;
    if (currentExercise.type === 'multiple-choice' || currentExercise.type === 'listening') {
      return selectedOptionId !== null;
    }
    if (currentExercise.type === 'dialogue-reading') {
      return currentExercise.options ? selectedOptionId !== null : true;
    }
    if (currentExercise.type === 'word-order') return selectedChipIds.length > 0;
    if (currentExercise.type === 'match-pairs') return matchedPairs.length === currentExercise.pairs?.length;
    return false;
  };

  if (status === 'jump-passed') {
    const multi = lesson as LessonNode & { targetUnitId?: number; targetNodeId?: string; skippedNodeIds?: string[] };
    return (
      <JumpPassedScreen
        lesson={lesson}
        jumpChancesLeft={jumpChancesLeft}
        onConfirm={() => {
          onPassJumpAhead?.(multi.targetUnitId ?? lesson.unitId, multi.targetNodeId, multi.skippedNodeIds);
          handleClose();
        }}
      />
    );
  }
  if (status === 'jump-failed') return <JumpFailedScreen lesson={lesson} onClose={handleClose} />;
  if (status === 'completed') {
    return (
      <LessonCompletedScreen
        lessonTitle={lesson.title}
        totalCount={exercises.length}
        wrongAttempts={wrongAttempts}
        isPractice={isPractice}
        isReviewingMistakes={isReviewingMistakes}
        mistakenCount={mistakenIds.length}
        onReviewMistakes={() => {
          const missed = lesson.exercises.filter(e => mistakenIds.includes(e.id));
          if (missed.length > 0) {
            setActiveExercises(missed);
            setIsReviewingMistakes(true);
            setMistakenIds([]);
            setCurrentIndex(0);
            setWrongAttempts(0);
            setStatus('answering');
          }
        }}
        onClose={handleClose}
      />
    );
  }
  if (status === 'game-over') return <GameOverScreen onClose={handleClose} />;

  const showAudioButtons =
    currentExercise.type === 'listening' ||
    (currentExercise.type === 'word-order' &&
      Boolean(currentExercise.japaneseVoiceText) &&
      /auditiva|audio|escucha|escuchó|dictado|ejercicio escrito|ordena la oración/i.test(currentExercise.prompt));

  // For Workbook "ejercicio escrito" word-order prompts that lack a Spanish sentence in the prompt,
  // extract the Spanish meaning from explanation's parenthetical (e.g. "(Practicar todos los días es importante)").
  const wordOrderSpanishHint =
    currentExercise.type === 'word-order' &&
    /ejercicio escrito|ordena la oración/i.test(currentExercise.prompt) &&
    currentExercise.explanation
      ? currentExercise.explanation.match(/\(([^()]+)\)\.?$/)?.[1]?.trim() || null
      : null;

  const correctAnswerDisplay = getCorrectAnswerDisplay(currentExercise, isIntroLesson);

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#131f24] dark:text-gray-100 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="px-4 py-3 flex items-center gap-4 max-w-2xl mx-auto w-full bg-white dark:bg-[#18272e] border-b border-gray-200 dark:border-[#283842] shadow-xs">
        <button
          onClick={handleRequestExit}
          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
          title="Salir de la lección"
        >
          <X className="w-6 h-6 stroke-[2.5px]" />
        </button>

        <div className="flex-1 h-3.5 bg-gray-200 dark:bg-[#10171a] border border-gray-300 dark:border-gray-700/80 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isJumpAhead ? 'bg-gradient-to-r from-amber-400 to-duo-orange' : isPractice ? 'bg-duo-blue' : 'bg-duo-green'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isJumpAhead ? (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map(strikeIdx => (
              <Heart
                key={strikeIdx}
                className={`w-5 h-5 transition-all ${
                  strikeIdx > jumpChancesLeft
                    ? 'text-gray-400 dark:text-gray-600 fill-gray-200 dark:fill-gray-800 opacity-40'
                    : 'text-duo-red fill-duo-red animate-pulse'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isPractice && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-duo-blue/15 dark:bg-duo-blue/20 rounded-xl border border-duo-blue/40 text-duo-blue dark:text-sky-300 font-black text-[11px]">
                <Dumbbell className="w-3.5 h-3.5 stroke-[2.5px]" />
                <span>Práctica</span>
              </div>
            )}
            <div className="flex items-center gap-1 font-black text-duo-red">
              <Heart className="w-5 h-5 fill-duo-red animate-pulse" />
              <span>{heartsLeft}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mode Banners */}
      {isJumpAhead && (
        <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-2 px-4 text-center shadow-md border-b border-amber-600">
          <span className="text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 drop-shadow-xs">
            <FastForward className="w-4 h-4 stroke-[2.5px]" />
            <span>Prueba de Salto • Máximo 3 Errores ({jumpChancesLeft} {jumpChancesLeft === 1 ? 'vida restante' : 'vidas restantes'})</span>
          </span>
        </div>
      )}
      {isPractice && (
        <div className="w-full bg-gradient-to-r from-sky-500 to-duo-blue text-white py-2 px-4 text-center shadow-md border-b border-sky-600">
          <span className="text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 drop-shadow-xs">
            <Dumbbell className="w-4 h-4 stroke-[2.5px]" />
            <span>Entrenamiento de Repaso • Ejercicios aleatorios de tus lecciones</span>
          </span>
        </div>
      )}

      {/* Main Exercise Area */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4 flex flex-col justify-start md:justify-center overflow-y-auto">
        {currentExercise.dialogueLines && currentExercise.dialogueLines.length > 0 && (
          <DialogueBox
            title={currentExercise.dialogueTitle}
            context={currentExercise.dialogueContext}
            lines={currentExercise.dialogueLines}
            showRomaji={userProfile.showRomaji}
            showTranslation={showDialogueTranslation}
            onToggleTranslation={() => setShowDialogueTranslation(p => !p)}
            activeLineIdx={activeDialogueLineIdx}
            onSetActiveLineIdx={setActiveDialogueLineIdx}
          />
        )}

        {/* Prompt */}
        <div className="mb-4">
          <h2 className="text-lg md:text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">
            {currentExercise.prompt}
          </h2>

          {wordOrderSpanishHint && (
            <div className="inline-flex items-center gap-1.5 mt-1 mb-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs md:text-sm font-black text-indigo-800 dark:text-indigo-200">
              <span>🇪🇸 «{wordOrderSpanishHint}»</span>
            </div>
          )}

          {currentExercise.promptSub && currentExercise.type !== 'word-order' && currentExercise.type !== 'listening' && currentExercise.type !== 'speaking' && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold font-['Noto_Sans_JP'] text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                {currentExercise.promptSub}
              </span>
              {currentExercise.japaneseVoiceText && currentExercise.type !== 'multiple-choice' && (
                <button
                  onClick={() => playCurrentExerciseVoice(0.9)}
                  className="p-2.5 bg-duo-blue text-white rounded-xl shadow-duo-btn-sm active:translate-y-0.5 hover:bg-duo-blue-dark transition-all"
                  title="Escuchar pronunciación"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {showAudioButtons && (
            <div className="flex items-center justify-center gap-4 my-6">
              <button
                onClick={() => {
                  sound.playTap();
                  playCurrentExerciseVoice(0.9);
                }}
                className="w-24 h-24 bg-duo-blue rounded-3xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#1899d6] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all relative group cursor-pointer"
                title="Escuchar audio"
              >
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-pulse pointer-events-none" />
                <Volume2 className="w-10 h-10 stroke-[2.5px]" />
                <span className="text-[11px] font-black uppercase mt-1 tracking-wider">Escuchar</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  playCurrentExerciseVoice(0.70);
                }}
                className="w-16 h-16 bg-duo-blue-light/80 dark:bg-duo-blue/20 border-2 border-duo-blue rounded-2xl flex flex-col items-center justify-center text-duo-blue-dark dark:text-duo-blue shadow-[0_4px_0_0_#1cb0f6] active:translate-y-1 active:shadow-none hover:bg-duo-blue-light transition-all cursor-pointer"
                title="Escuchar lento (velocidad tortuga)"
              >
                <span className="text-2xl leading-none">🐢</span>
                <span className="text-[9px] font-black uppercase mt-0.5">Lento</span>
              </button>
            </div>
          )}

          {(status === 'correct' || status === 'incorrect') && (currentExercise.type === 'listening' || currentExercise.japaneseVoiceText) && (
            <div className="my-3 p-4 rounded-2xl bg-indigo-50/90 dark:bg-[#15232d] border-2 border-indigo-200 dark:border-indigo-800/70 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📝</span>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    Transcripción del Audio
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playTap();
                    setShowTranscript(prev => !prev);
                  }}
                  className="text-xs font-black text-duo-blue hover:underline cursor-pointer"
                >
                  {showTranscript ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {showTranscript && (
                <div className="mt-2 pt-2 border-t border-indigo-200/70 dark:border-indigo-800/50 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-black font-['Noto_Sans_JP'] text-indigo-950 dark:text-white">
                      {currentExercise.japaneseVoiceText}
                    </p>
                    {currentExercise.japaneseVoiceText && (
                      <button
                        onClick={() => {
                          sound.playTap();
                          playCurrentExerciseVoice(0.9);
                        }}
                        className="p-2 rounded-xl bg-duo-blue text-white shadow-sm hover:brightness-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                        title="Volver a escuchar"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {currentExercise.explanation && (
                    <p className="text-xs font-semibold text-indigo-800/80 dark:text-indigo-300/90 mt-1 bg-white/60 dark:bg-black/20 p-2 rounded-xl">
                      💡 {currentExercise.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Exercise Renderers */}
        {(currentExercise.type === 'multiple-choice' || currentExercise.type === 'listening' || currentExercise.type === 'dialogue-reading') && (
          <MultipleChoiceExercise
            options={shuffledOptions.length > 0 ? shuffledOptions : currentExercise.options || []}
            selectedOptionId={selectedOptionId}
            correctAnswerId={currentExercise.correctAnswerId}
            exerciseType={currentExercise.type}
            prompt={currentExercise.prompt}
            isIntroLesson={isIntroLesson}
            showRomaji={userProfile.showRomaji}
            status={status === 'correct' ? 'correct' : status === 'incorrect' ? 'incorrect' : 'answering'}
            onSelectOption={setSelectedOptionId}
          />
        )}

        {currentExercise.type === 'speaking' && currentExercise.japaneseVoiceText && (
          <SpeakingExercise
            targetText={currentExercise.promptSub || currentExercise.japaneseVoiceText}
            voiceText={currentExercise.japaneseVoiceText}
            onPlayVoice={playCurrentExerciseVoice}
            onSuccess={() => setStatus('correct')}
          />
        )}

        {currentExercise.type === 'word-order' && (
          <WordOrderExercise
            wordChips={wordChips}
            selectedChipIds={selectedChipIds}
            disabled={status !== 'answering'}
            onSelectChip={id => {
              if (status !== 'answering') return;
              sound.playTap();
              setSelectedChipIds(prev => [...prev, id]);
            }}
            onDeselectChip={id => {
              if (status !== 'answering') return;
              sound.playTap();
              setSelectedChipIds(prev => prev.filter(c => c !== id));
            }}
          />
        )}

        {currentExercise.type === 'match-pairs' && (
          <MatchPairsExercise
            leftPairs={shuffledLeftPairs}
            rightPairs={shuffledRightPairs}
            matchedPairs={matchedPairs}
            selectedLeft={selectedLeft}
            selectedRight={selectedRight}
            mismatchedPair={mismatchedPair}
            showRomaji={userProfile.showRomaji}
            onSelect={handleMatchSelect}
          />
        )}
      </div>

      {/* Footer / Feedback Panel */}
      <div
        className={`p-4 border-t-2 transition-all duration-200 ${
          status === 'correct'
            ? 'bg-duo-green-light dark:bg-duo-green/20 border-duo-green'
            : status === 'incorrect'
            ? 'bg-duo-red-light dark:bg-duo-red/20 border-duo-red'
            : 'bg-white dark:bg-[#18272e] border-duo-gray-200 dark:border-[#283842]'
        }`}
      >
        <div className="max-w-lg mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {status === 'answering' && currentExercise.type === 'speaking' && (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                handleContinue();
              }}
              className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-black text-xs rounded-2xl transition-all uppercase tracking-wider cursor-pointer"
            >
              No puedo hablar ahora (Continuar)
            </button>
          )}

          {status === 'answering' && currentExercise.type !== 'speaking' && (
            <button
              onClick={handleCheck}
              disabled={!canCheck()}
              className={`w-full py-3.5 font-black text-lg rounded-2xl transition-all uppercase tracking-wider ${
                canCheck()
                  ? 'bg-duo-green hover:bg-duo-green-dark text-white shadow-[0_5px_0_0_#46a302] active:translate-y-1 active:shadow-none cursor-pointer'
                  : 'bg-duo-gray-200 text-duo-gray-400 cursor-not-allowed'
              }`}
            >
              Comprobar
            </button>
          )}

          {status === 'correct' && (
            <div className="w-full flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-duo-green flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-black text-duo-green-dark">¡Excelente!</h4>
                  {currentExercise.type === 'listening' && currentExercise.japaneseVoiceText && (
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-xs font-black text-emerald-800 dark:text-emerald-200 font-['Noto_Sans_JP']">
                        🔊 {currentExercise.japaneseVoiceText}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          playCurrentExerciseVoice(0.9);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-200 font-black text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Repetir</span>
                      </button>
                    </div>
                  )}
                  <p className="text-xs font-bold text-duo-green-dark/80">{currentExercise.explanation}</p>
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="py-3 px-6 bg-duo-green hover:bg-duo-green-dark text-white font-black text-base rounded-2xl shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all uppercase flex-shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === 'incorrect' && (
            <div className="w-full flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-duo-red flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-base md:text-lg font-black text-duo-red-dark">Respuesta incorrecta</h4>
                  {correctAnswerDisplay && (
                    <p className="text-xs md:text-sm font-bold text-red-950 dark:text-red-200">
                      <span className="font-black text-duo-red-dark underline">Solución:</span>{' '}
                      <span className="font-['Noto_Sans_JP']">{correctAnswerDisplay}</span>
                    </p>
                  )}
                  {currentExercise.type === 'listening' && currentExercise.japaneseVoiceText && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-black text-red-900 dark:text-red-200 font-['Noto_Sans_JP']">
                        🔊 Audio: {currentExercise.japaneseVoiceText}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          playCurrentExerciseVoice(0.9);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-900 dark:text-red-200 font-black text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Repetir</span>
                      </button>
                    </div>
                  )}
                  {currentExercise.explanation && (
                    <p className="text-[11px] md:text-xs font-semibold text-duo-red-dark/90 mt-0.5">{currentExercise.explanation}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="py-3 px-6 bg-duo-red hover:bg-duo-red-dark text-white font-black text-base rounded-2xl shadow-[0_4px_0_0_#ea2b2b] active:translate-y-1 active:shadow-none transition-all uppercase flex-shrink-0 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] rounded-3xl p-6 shadow-2xl text-center flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-700/60 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 dark:text-gray-100">¿Seguro que quieres salir?</h3>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1.5">
                {isJumpAhead
                  ? 'Perderás tu avance en este examen de salto si sales ahora.'
                  : 'Perderás tu avance en esta lección si sales ahora.'}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 mt-1">
              <button
                onClick={() => {
                  sound.playTap();
                  setShowExitConfirm(false);
                }}
                className="w-full py-3 bg-duo-blue hover:bg-duo-blue-dark text-white font-black text-sm rounded-2xl shadow-[0_4px_0_0_#1899d6] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
              >
                Seguir estudiando
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  handleClose();
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-duo-red border-2 border-red-200 dark:border-red-900/60 font-black text-sm rounded-2xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Salir de la lección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
