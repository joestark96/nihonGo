import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Compass,
  Lock,
  CheckCircle2,
  Play,
  Volume2,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  JLPT_FLOORS,
  JlptFloorInfo,
  JlptQuestion,
  JlptSection,
  buildFloorExamQuestions,
  buildPlacementTestQuestions
} from '../data/jlptTowerData';
import { sound } from '../services/sound';

export interface JlptTowerProgress {
  unlockedFloor: number;
  conqueredFloors: Record<number, { bestScore: number; passedAt: string; attempts: number }>;
  placementResult?: {
    levelLabel: string;
    estimatedFloor: number;
    score: number;
    testedAt: string;
  };
}

export const JLPT_TOWER_STORAGE_KEY = 'nihongo_jlpt_tower_v1';

export function loadJlptTowerProgress(): JlptTowerProgress {
  try {
    const raw = localStorage.getItem(JLPT_TOWER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        unlockedFloor: Math.max(1, Math.min(6, parsed.unlockedFloor || 1)),
        conqueredFloors: parsed.conqueredFloors || {},
        placementResult: parsed.placementResult
      };
    }
  } catch {
    // ignore
  }
  return { unlockedFloor: 1, conqueredFloors: {} };
}

export function getHighestJlptRank(progress: JlptTowerProgress): string {
  const conqueredNums = Object.keys(progress.conqueredFloors).map(Number);
  const maxConquered = conqueredNums.length > 0 ? Math.max(...conqueredNums) : 0;
  if (maxConquered > 0) {
    const floorInfo = JLPT_FLOORS.find(f => f.floor === maxConquered);
    if (floorInfo) return floorInfo.jlptBadge;
  }
  if (progress.placementResult?.levelLabel) {
    return progress.placementResult.levelLabel;
  }
  return 'Aspirante';
}

interface JlptTowerPageProps {
  onAwardReward?: (xp: number, gems: number) => void;
}

export const JlptTowerPage: React.FC<JlptTowerPageProps> = ({ onAwardReward }) => {
  const [progress, setProgress] = useState<JlptTowerProgress>(() => loadJlptTowerProgress());

  // Exam state
  const [examMode, setExamMode] = useState<'idle' | 'running' | 'results'>('idle');
  const [examType, setExamType] = useState<'floor' | 'placement'>('floor');
  const [activeFloor, setActiveFloor] = useState<JlptFloorInfo | null>(null);
  const [questions, setQuestions] = useState<JlptQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showReview, setShowReview] = useState(false);
  const [lastAwarded, setLastAwarded] = useState<{ xp: number; gems: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(JLPT_TOWER_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const startFloorExam = (floorInfo: JlptFloorInfo) => {
    sound.playTap();
    const qs = buildFloorExamQuestions(floorInfo.floor);
    setExamType('floor');
    setActiveFloor(floorInfo);
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers({});
    setShowReview(false);
    setLastAwarded(null);
    setExamMode('running');
  };

  const startPlacementTest = () => {
    sound.playTap();
    const qs = buildPlacementTestQuestions();
    setExamType('placement');
    setActiveFloor(null);
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers({});
    setShowReview(false);
    setLastAwarded(null);
    setExamMode('running');
  };

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (examMode === 'running' && currentQ?.audioText) {
      const timer = setTimeout(() => {
        sound.speakJapanese(currentQ.audioText!, 0.9);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [examMode, currentIdx, currentQ]);

  const handleSelectOption = (optIdx: number) => {
    if (!currentQ) return;
    sound.playTap();
    setAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const handleNextOrFinish = () => {
    sound.stopSpeech();
    if (currentIdx < questions.length - 1) {
      sound.playTap();
      setCurrentIdx(prev => prev + 1);
    } else {
      finishExam();
    }
  };

  const finishExam = () => {
    const total = questions.length;
    const correctCount = questions.filter(q => answers[q.id] === q.correctIndex).length;
    const percent = Math.round((correctCount / Math.max(1, total)) * 100);

    if (examType === 'floor' && activeFloor) {
      const passed = percent >= activeFloor.passingPercent;
      const prevFloorData = progress.conqueredFloors[activeFloor.floor];
      const isFirstConquest = passed && !prevFloorData;

      if (passed) {
        sound.playLessonComplete();
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });

        const newConquered = {
          ...progress.conqueredFloors,
          [activeFloor.floor]: {
            bestScore: Math.max(prevFloorData?.bestScore || 0, percent),
            passedAt: prevFloorData?.passedAt || new Date().toISOString(),
            attempts: (prevFloorData?.attempts || 0) + 1
          }
        };

        setProgress(prev => ({
          ...prev,
          unlockedFloor: Math.max(prev.unlockedFloor, Math.min(6, activeFloor.floor + 1)),
          conqueredFloors: newConquered
        }));

        if (isFirstConquest) {
          setLastAwarded({ xp: activeFloor.xpReward, gems: activeFloor.gemReward });
          onAwardReward?.(activeFloor.xpReward, activeFloor.gemReward);
        }
      } else {
        sound.playIncorrect();
      }
    } else if (examType === 'placement') {
      // Evaluate highest floor where user demonstrated competence
      // Each floor has 2 questions in placement test.
      // Determine highest contiguous or strong floor:
      let estimatedFloor = 1;
      for (let f = 1; f <= 6; f++) {
        const fQs = questions.filter(q => q.floor === f);
        const fCorrect = fQs.filter(q => answers[q.id] === q.correctIndex).length;
        if (fCorrect === 2 || (fCorrect >= 1 && percent >= f * 14)) {
          estimatedFloor = f;
        } else {
          break;
        }
      }
      if (percent < 25) estimatedFloor = 1;

      const floorInfo = JLPT_FLOORS.find(f => f.floor === estimatedFloor) || JLPT_FLOORS[0];
      sound.playLessonComplete();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      const newConquered = { ...progress.conqueredFloors };
      // Mark floors strictly below estimatedFloor as conquered by placement if not already conquered
      for (let f = 1; f < estimatedFloor; f++) {
        if (!newConquered[f]) {
          newConquered[f] = {
            bestScore: percent,
            passedAt: new Date().toISOString(),
            attempts: 1
          };
        }
      }

      setProgress(prev => ({
        ...prev,
        unlockedFloor: Math.max(prev.unlockedFloor, estimatedFloor),
        conqueredFloors: newConquered,
        placementResult: {
          levelLabel: floorInfo.jlptBadge,
          estimatedFloor,
          score: percent,
          testedAt: new Date().toISOString()
        }
      }));

      const xp = 30;
      const gems = 5;
      setLastAwarded({ xp, gems });
      onAwardReward?.(xp, gems);
    }

    setExamMode('results');
  };

  const getSectionLabel = (sec: JlptSection) => {
    switch (sec) {
      case 'kanji-vocab':
        return '文字・語彙 (Kanji y Vocabulario)';
      case 'grammar':
        return '文法 (Gramática)';
      case 'reading-listening':
        return '読解・聴解 (Lectura y Audio)';
    }
  };

  // --- EXAM RUNNING MODAL ---
  if (examMode === 'running' && currentQ) {
    const selectedOpt = answers[currentQ.id];
    const pct = Math.round(((currentIdx + 1) / questions.length) * 100);

    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-[#131f24] flex flex-col justify-between">
        {/* Top Bar */}
        <div className="px-4 py-3 border-b-2 border-duo-gray-200 dark:border-[#283842] flex items-center gap-3 max-w-2xl mx-auto w-full">
          <button
            onClick={() => {
              sound.stopSpeech();
              setExamMode('idle');
            }}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-black text-gray-500 dark:text-gray-400 mb-1">
              <span>
                {examType === 'placement'
                  ? '🧭 Test de Ubicación JLPT'
                  : `${activeFloor?.kanjiFloor} • ${activeFloor?.title}`}
              </span>
              <span>
                {currentIdx + 1} / {questions.length}
              </span>
            </div>
            <div className="w-full h-3 bg-duo-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 max-w-xl mx-auto w-full flex flex-col justify-center">
          <div className="mb-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-black uppercase tracking-wider">
              {getSectionLabel(currentQ.section)}
            </span>
            {examType === 'placement' && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black">
                Nivel Piso {currentQ.floor}
              </span>
            )}
          </div>

          <h2 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-100 mb-4 leading-snug">
            {currentQ.prompt}
          </h2>

          {currentQ.audioText && (
            <div className="flex items-center justify-center gap-3 my-4">
              <button
                onClick={() => {
                  sound.playTap();
                  sound.speakJapanese(currentQ.audioText!, 0.9);
                }}
                className="px-6 py-4 bg-duo-blue hover:brightness-105 text-white rounded-2xl shadow-[0_4px_0_0_#1899d6] active:translate-y-0.5 active:shadow-none flex items-center gap-2 font-black text-sm cursor-pointer transition-all"
              >
                <Volume2 className="w-5 h-5" />
                <span>Escuchar Audio</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  sound.speakJapanese(currentQ.audioText!, 0.7);
                }}
                className="px-4 py-4 bg-duo-blue-light/80 dark:bg-duo-blue/20 border-2 border-duo-blue text-duo-blue-dark dark:text-duo-blue rounded-2xl font-black text-xs cursor-pointer hover:bg-duo-blue-light transition-all"
              >
                🐢 Lento
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 mt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              return (
                <button
                  key={`jlpt-opt-${currentQ.id}-${idx}`}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-indigo-100 shadow-[0_4px_0_0_#6366f1]'
                      : 'bg-white dark:bg-[#18272e] border-duo-gray-200 dark:border-[#283842] text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-sm md:text-base font-['Noto_Sans_JP']">{opt}</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-duo-gray-200 dark:border-[#283842] bg-white dark:bg-[#18272e]">
          <div className="max-w-xl mx-auto">
            <button
              onClick={handleNextOrFinish}
              disabled={selectedOpt === undefined}
              className={`w-full py-3.5 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                selectedOpt !== undefined
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_0_0_#4338ca] active:translate-y-0.5 active:shadow-none cursor-pointer'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{currentIdx < questions.length - 1 ? 'Siguiente' : 'Finalizar y Calificar'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- EXAM RESULTS SCREEN ---
  if (examMode === 'results') {
    const total = questions.length;
    const correctCount = questions.filter(q => answers[q.id] === q.correctIndex).length;
    const percent = Math.round((correctCount / Math.max(1, total)) * 100);
    const passed = examType === 'floor' && activeFloor ? percent >= activeFloor.passingPercent : true;

    const sections: JlptSection[] = ['kanji-vocab', 'grammar', 'reading-listening'];

    return (
      <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-[#131f24] overflow-y-auto p-4 pb-12">
        <div className="max-w-lg mx-auto w-full pt-4 animate-fade-in">
          {/* Result Card */}
          <div className="bg-white dark:bg-[#18272e] rounded-3xl p-6 border-2 border-duo-gray-200 dark:border-[#283842] shadow-lg text-center mb-4">
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md ${
                passed
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white'
                  : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
              }`}
            >
              {passed ? <Trophy className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
            </div>

            {examType === 'placement' ? (
              <>
                <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-xs font-black uppercase">
                  Diagnóstico Completado
                </span>
                <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mt-2">
                  Tu nivel estimado: {progress.placementResult?.levelLabel || 'Pre-N5'}
                </h2>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                  Obtuviste {correctCount} de {total} aciertos ({percent}%). ¡Hemos desbloqueado hasta el Piso{' '}
                  {progress.placementResult?.estimatedFloor || 1} de la Torre!
                </p>
              </>
            ) : (
              <>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    passed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/15 text-red-600 dark:text-red-400'
                  }`}
                >
                  {passed ? '🏅 ¡Piso Conquistado!' : 'Casi lo logras'}
                </span>
                <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mt-2">
                  {activeFloor?.kanjiFloor} • {activeFloor?.title}
                </h2>
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  Puntuación: {percent}% ({correctCount} / {total} aciertos)
                </p>
                {!passed && (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                    Necesitas al menos {activeFloor?.passingPercent}% para conquistar este piso y desbloquear el siguiente.
                  </p>
                )}
              </>
            )}

            {lastAwarded && (
              <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700">
                <span className="text-xs font-black text-amber-700 dark:text-amber-300">
                  +{lastAwarded.xp} EXP
                </span>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400">
                  +{lastAwarded.gems} 💎
                </span>
              </div>
            )}

            {/* Section Breakdown */}
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-[#283842] flex flex-col gap-2.5 text-left">
              <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                Desglose por Sección JLPT
              </div>
              {sections.map(sec => {
                const secQs = questions.filter(q => q.section === sec);
                if (secQs.length === 0) return null;
                const secOk = secQs.filter(q => answers[q.id] === q.correctIndex).length;
                const secPct = Math.round((secOk / secQs.length) * 100);
                return (
                  <div key={sec}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-700 dark:text-gray-200">{getSectionLabel(sec)}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {secOk}/{secQs.length} ({secPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${secPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setExamMode('idle')}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_0_#4338ca] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                Volver a la Torre
              </button>
              {examType === 'floor' && activeFloor && !passed && (
                <button
                  onClick={() => startFloorExam(activeFloor)}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl cursor-pointer transition-all"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>

          {/* Expandable Answer Review */}
          <button
            onClick={() => setShowReview(r => !r)}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] font-black text-xs text-gray-700 dark:text-gray-200 flex items-center justify-between cursor-pointer mb-3"
          >
            <span>📝 Revisar Respuestas y Explicaciones ({questions.length})</span>
            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showReview && (
            <div className="flex flex-col gap-3">
              {questions.map((q, idx) => {
                const userAns = answers[q.id];
                const isRight = userAns === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border-2 bg-white dark:bg-[#18272e] ${
                      isRight ? 'border-emerald-300 dark:border-emerald-800' : 'border-red-300 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-black text-gray-400">#{idx + 1}</span>
                      {isRight ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs font-black text-gray-800 dark:text-gray-100 mb-2">{q.prompt}</p>
                    {q.audioText && (
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300 mb-2 font-['Noto_Sans_JP']">
                        🔊 {q.audioText}
                      </p>
                    )}
                    {!isRight && userAns !== undefined && (
                      <p className="text-xs font-bold text-red-500 mb-1">
                        Tu respuesta: {q.options[userAns]}
                      </p>
                    )}
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
                      Correcta: {q.options[q.correctIndex]}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#131f24] p-2 rounded-xl">
                      💡 {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MAIN TOWER VIEW ---
  const conqueredCount = Object.keys(progress.conqueredFloors).length;
  const currentRank = getHighestJlptRank(progress);
  const floorsTopDown = [...JLPT_FLOORS].reverse();

  return (
    <div className="max-w-md mx-auto w-full px-4 pt-4 pb-28 animate-fade-in">
      {/* Pagoda Tower Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-600 p-5 text-white shadow-lg mb-5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
              日本語能力試験 • Certificación
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-gray-900 text-[10px] font-black">
              Rango: {currentRank}
            </span>
          </div>

          <h1 className="text-2xl font-black flex items-center gap-2">
            <span>🏯 Torre de Niveles JLPT</span>
          </h1>
          <p className="text-xs font-semibold text-white/90 mt-1 leading-relaxed">
            Escala los 6 pisos desde Pre-N5 hasta JLPT N3 superando exámenes reales de Kanji, Vocabulario, Gramática y Audio.
          </p>

          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-black mb-1">
              <span>Progreso de la Torre</span>
              <span>{conqueredCount} / 6 Pisos Conquistados</span>
            </div>
            <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((conqueredCount / 6) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Placement Test Card */}
      <div className="bg-white dark:bg-[#18272e] border-2 border-indigo-300 dark:border-indigo-700/70 rounded-2xl p-4 shadow-duo-card dark:shadow-none mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-gray-800 dark:text-gray-100">
              ¿No sabes en qué nivel estás?
            </h3>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              Haz el <strong>Test Rápido de Ubicación</strong> (12 preguntas progresivas). Evaluará tu nivel JLPT real y desbloqueará tus pisos correspondientes.
            </p>
            {progress.placementResult && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-black text-indigo-700 dark:text-indigo-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  Último diagnóstico: {progress.placementResult.levelLabel} ({progress.placementResult.score}%)
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={startPlacementTest}
          className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_3px_0_0_#4338ca] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{progress.placementResult ? 'Repetir Test de Ubicación' : 'Iniciar Test de Ubicación'}</span>
        </button>
      </div>

      {/* Tower Floors (6 down to 1) */}
      <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
        <Award className="w-4 h-4 text-amber-500" />
        <span>Escala la Torre (Piso 1 ➔ Piso 6)</span>
      </h3>

      <div className="relative flex flex-col gap-3">
        {/* Vertical Tower Spine */}
        <div className="absolute left-7 top-6 bottom-6 w-1 bg-gradient-to-b from-rose-400 via-indigo-400 to-emerald-400 opacity-30 rounded-full pointer-events-none" />

        {floorsTopDown.map(floorInfo => {
          const conquered = progress.conqueredFloors[floorInfo.floor];
          const isUnlocked = floorInfo.floor <= progress.unlockedFloor || Boolean(conquered);

          return (
            <div
              key={floorInfo.floor}
              className={`relative z-10 rounded-2xl border-2 p-4 transition-all ${
                conquered
                  ? 'bg-white dark:bg-[#18272e] border-emerald-400 dark:border-emerald-700 shadow-sm'
                  : isUnlocked
                  ? 'bg-white dark:bg-[#18272e] border-indigo-400 dark:border-indigo-700 shadow-duo-card dark:shadow-none'
                  : 'bg-gray-100/80 dark:bg-[#152026] border-gray-200 dark:border-[#24323b] opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Floor Number Badge */}
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-xs ${
                    isUnlocked
                      ? `bg-gradient-to-br ${floorInfo.colorGradient} text-white`
                      : 'bg-gray-300 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  <span className="text-xs leading-none">{floorInfo.kanjiFloor}</span>
                  <span className="text-[9px] opacity-90 mt-0.5">P{floorInfo.floor}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${floorInfo.badgeColor}`}>
                      {floorInfo.jlptBadge}
                    </span>
                    {conquered ? (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mejor: {conquered.bestScore}%
                      </span>
                    ) : !isUnlocked ? (
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Bloqueado
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-indigo-500">
                        +{floorInfo.xpReward} EXP / +{floorInfo.gemReward} 💎
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-gray-800 dark:text-gray-100 mt-1">
                    {floorInfo.title}
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    {floorInfo.subtitle}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold text-gray-400">{floorInfo.genkiRange}</span>

                    {isUnlocked ? (
                      <button
                        onClick={() => startFloorExam(floorInfo)}
                        className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 ${
                          conquered
                            ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{conquered ? 'Repetir Examen' : 'Desafiar Piso'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400">
                        Supera Piso {floorInfo.floor - 1}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
