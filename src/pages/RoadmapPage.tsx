import React, { useState, useEffect } from 'react';
import { Unit, LessonNode, UserProfile } from '../types';
import { RoadmapNode } from '../components/Roadmap/RoadmapNode';
import { NodeDetailModal } from '../components/Roadmap/NodeDetailModal';
import { QuizModal } from '../components/Quiz/QuizModal';
import { BookOpen, Sparkles, CheckCircle2, FastForward, ShieldAlert, Award, Dumbbell, Compass, X, Star, Play, RotateCcw, Lock, BookMarked, Volume2, Headphones } from 'lucide-react';
import { sound } from '../services/sound';
import { createJumpAheadLesson, createMultiUnitJumpAheadLesson } from '../utils/jumpAhead';
import { createPracticeLesson, createUnitReviewLesson } from '../utils/practiceLesson';
import { expandLessonExercises } from '../utils/lessonExpander';
import { isDevUnlockAllEnabled } from '../utils/devMode';

interface RoadmapPageProps {
  units: Unit[];
  userProfile: UserProfile;
  onCompleteLesson: (nodeId: string, earnedXp: number, stars: number) => void;
  onSkipUnit: (unitId: number, targetNodeId?: string, skippedNodeIds?: string[]) => void;
  onDeductHeart: () => void;
  onOpenTheory?: (unitId: number) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  units,
  userProfile,
  onCompleteLesson,
  onSkipUnit,
  onDeductHeart,
  onOpenTheory
}) => {
  const [activeQuizLesson, setActiveQuizLesson] = useState<LessonNode | null>(null);
  const [selectedNodeForPopover, setSelectedNodeForPopover] = useState<{
    node: LessonNode;
    unitId: number;
    unitTitle: string;
  } | null>(null);
  const [isJumpAheadActive, setIsJumpAheadActive] = useState(false);
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [showImprovableList, setShowImprovableList] = useState(false);
  const [devUnlockAll, setDevUnlockAll] = useState<boolean>(() => isDevUnlockAllEnabled());
  const [passedUnitExams, setPassedUnitExams] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('nihongo_unit_exams_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const onDevChange = () => setDevUnlockAll(isDevUnlockAllEnabled());
    window.addEventListener('nihongo-dev-mode-changed', onDevChange);
    return () => window.removeEventListener('nihongo-dev-mode-changed', onDevChange);
  }, []);

  // Close open lesson popover / improvable list on Android back gesture
  useEffect(() => {
    const onBack = (e: Event) => {
      if (activeQuizLesson) return; // QuizModal handles its own back event
      if (selectedNodeForPopover) {
        e.preventDefault();
        setSelectedNodeForPopover(null);
      } else if (showImprovableList) {
        e.preventDefault();
        setShowImprovableList(false);
      }
    };
    window.addEventListener('nihongo-back', onBack);
    return () => window.removeEventListener('nihongo-back', onBack);
  }, [activeQuizLesson, selectedNodeForPopover, showImprovableList]);
  const [roadmapMode, setRoadmapMode] = useState<'textbook' | 'workbook'>(() => {
    const saved = localStorage.getItem('nihongo_roadmap_mode');
    return saved === 'workbook' ? 'workbook' : 'textbook';
  });

  const handleModeChange = (mode: 'textbook' | 'workbook') => {
    sound.playTap();
    setRoadmapMode(mode);
    localStorage.setItem('nihongo_roadmap_mode', mode);
  };

  // Helper to determine if a node belongs to the Workbook
  const isWorkbookNode = (n: LessonNode) =>
    n.title.toLowerCase().includes('workbook') || n.id.includes('wb');

  // Determine which node is currently active (first unlocked but uncompleted in current mode)
  const getActiveNodeId = (): string => {
    const isTarget = (n: LessonNode) =>
      roadmapMode === 'workbook' ? isWorkbookNode(n) : !isWorkbookNode(n);

    for (const unit of units) {
      for (const node of unit.nodes) {
        if (!isTarget(node)) continue;
        if (node.unlocked && node.stars === 0) {
          return node.id;
        }
      }
    }
    // If all unlocked nodes are completed, find the last unlocked node of current mode
    let lastUnlockedId = '';
    for (const unit of units) {
      for (const node of unit.nodes) {
        if (!isTarget(node)) continue;
        if (node.unlocked) {
          lastUnlockedId = node.id;
        }
      }
    }
    return lastUnlockedId;
  };

  const activeNodeId = getActiveNodeId();

  // Enfocar automáticamente la lección disponible al entrar o cambiar a la pestaña de Roadmap
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;

    const scrollToAvailableLesson = (behavior: ScrollBehavior = 'smooth') => {
      if (!activeNodeId) return false;
      const element = document.getElementById(`roadmap-node-${activeNodeId}`);
      if (element) {
        element.scrollIntoView({ behavior, block: 'center' });
        element.classList.add('scale-105');
        setTimeout(() => {
          element.classList.remove('scale-105');
        }, 700);
        return true;
      }
      return false;
    };

    // Primer intento tras montar/pintar
    timer1 = setTimeout(() => {
      const ok = scrollToAvailableLesson('smooth');
      if (!ok) {
        // Segundo intento en caso de que el layout o fuentes tarden unos ms más
        timer2 = setTimeout(() => {
          scrollToAvailableLesson('smooth');
        }, 220);
      }
    }, 120);

    const handleFocusEvent = () => {
      scrollToAvailableLesson('smooth');
    };

    window.addEventListener('focus-roadmap-active-node', handleFocusEvent);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('focus-roadmap-active-node', handleFocusEvent);
    };
  }, [activeNodeId, roadmapMode]);

  const handleStartJumpAhead = (unit: Unit) => {
    sound.playTap();
    const challengeLesson = createMultiUnitJumpAheadLesson({
      units,
      targetUnitId: unit.id,
      mode: roadmapMode
    });
    if (challengeLesson) {
      setIsPracticeActive(false);
      setIsJumpAheadActive(true);
      setActiveQuizLesson(challengeLesson);
    }
  };

  const handleStartMultiJump = (targetUnitId: number, targetNodeId?: string) => {
    sound.playTap();
    const challengeLesson = createMultiUnitJumpAheadLesson({
      units,
      targetUnitId,
      targetNodeId,
      mode: roadmapMode
    });
    if (challengeLesson) {
      setIsPracticeActive(false);
      setIsJumpAheadActive(true);
      setActiveQuizLesson(challengeLesson);
    }
  };

  // Scroll to the most recent available lesson node
  const handleScrollToLatest = () => {
    sound.playTap();
    const targetId = getActiveNodeId();
    if (!targetId) return;

    const element = document.getElementById(`roadmap-node-${targetId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('scale-105');
      setTimeout(() => {
        element.classList.remove('scale-105');
      }, 600);
    }
  };

  // Start a practice session with 10-20 random exercises from studied lessons
  const handleStartPractice = () => {
    sound.playTap();
    const practiceLesson = createPracticeLesson(units);
    if (practiceLesson) {
      setIsJumpAheadActive(false);
      setIsPracticeActive(true);
      setActiveQuizLesson(practiceLesson);
    }
  };

  // Start a review session specifically for a completed unit
  const handleStartUnitReview = (unit: Unit) => {
    sound.playTap();
    const reviewLesson = createUnitReviewLesson(unit);
    if (reviewLesson) {
      setIsJumpAheadActive(false);
      setIsPracticeActive(true);
      setActiveQuizLesson(reviewLesson);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 pt-4 pb-28 flex flex-col items-center relative">
      {/* Floating Mode Switcher Pill (Libro <-> Workbook) */}
      <div className="fixed bottom-20 left-4 z-20 p-1 rounded-2xl bg-white/95 dark:bg-[#18272e]/95 backdrop-blur-md border-2 border-duo-gray-200 dark:border-[#2c3f49] shadow-lg flex items-center gap-1">
        <button
          onClick={() => handleModeChange('textbook')}
          title="Cambiar a Libro de Texto"
          className={`py-2 px-2.5 rounded-xl font-black text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
            roadmapMode === 'textbook'
              ? 'bg-duo-green text-white shadow-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 stroke-[2.5px]" />
          <span>Libro</span>
        </button>
        <button
          onClick={() => handleModeChange('workbook')}
          title="Cambiar a Workbook"
          className={`py-2 px-2.5 rounded-xl font-black text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
            roadmapMode === 'workbook'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5 stroke-[2.5px]" />
          <span>Workbook</span>
        </button>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 z-20 flex flex-col items-end gap-3 pointer-events-none">
        {/* Practice Dumbbell Floating Button */}
        <button
          onClick={handleStartPractice}
          title="Entrenamiento de repaso (10 a 20 ejercicios aleatorios)"
          aria-label="Entrenamiento de repaso"
          className="pointer-events-auto w-12 h-12 rounded-full bg-duo-blue hover:bg-duo-blue-dark active:translate-y-1 active:shadow-none text-white flex items-center justify-center shadow-[0_4px_0_0_#1899d6] border-2 border-white/30 transition-all cursor-pointer group"
        >
          <Dumbbell className="w-5 h-5 stroke-[2.5px] group-hover:rotate-12 transition-transform" />
        </button>

        {/* Scroll to Latest Available Lesson Floating Button */}
        <button
          onClick={handleScrollToLatest}
          title="Deslizar hasta la lección más reciente disponible"
          aria-label="Ir a la lección actual"
          className="pointer-events-auto w-12 h-12 rounded-full bg-duo-green hover:bg-duo-green-dark active:translate-y-1 active:shadow-none text-white flex items-center justify-center shadow-[0_4px_0_0_#46a302] border-2 border-white/30 transition-all cursor-pointer group"
        >
          <Compass className="w-5 h-5 stroke-[2.5px] group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Selector de Modo del Roadmap: Libro de Texto vs Cuaderno (Workbook) */}
      <div className="w-full max-w-sm mx-auto mb-6 p-1.5 bg-gray-200/90 dark:bg-[#18272e] rounded-2xl border-2 border-duo-gray-200 dark:border-[#283842] flex items-center gap-1.5 shadow-sm relative z-10">
        <button
          onClick={() => handleModeChange('textbook')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            roadmapMode === 'textbook'
              ? 'bg-white dark:bg-[#20323c] text-duo-green dark:text-green-400 shadow-md border border-gray-200/80 dark:border-gray-700 scale-[1.02]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[2.5px]" />
          <span>Libro de Texto</span>
        </button>

        <button
          onClick={() => handleModeChange('workbook')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            roadmapMode === 'workbook'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md scale-[1.02]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <BookMarked className="w-4 h-4 stroke-[2.5px]" />
          <span>Cuaderno (Workbook)</span>
        </button>
      </div>

      {/* Quick shortcut & selectable list to perfect Bronze/Silver nodes to 3★ Gold */}
      {(() => {
        const isWb = roadmapMode === 'workbook';
        const improvableNodes = units.flatMap(u =>
          u.nodes
            .filter(n => (isWb ? isWorkbookNode(n) : !isWorkbookNode(n)) && n.unlocked && n.stars > 0 && n.stars < 3)
            .map(n => ({ unitId: u.id, unitTitle: u.title, node: n }))
        );
        if (improvableNodes.length === 0) return null;
        return (
          <div className="w-full max-w-sm mx-auto mb-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                if (improvableNodes.length === 1) {
                  const firstTarget = improvableNodes[0];
                  const el = document.getElementById(`roadmap-node-${firstTarget.node.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setSelectedNodeForPopover(firstTarget);
                } else {
                  setShowImprovableList(prev => !prev);
                }
              }}
              className="w-full py-2 px-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 font-black text-xs flex items-center justify-between gap-2 shadow-2xs hover:brightness-95 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 flex-shrink-0" />
                <span>Subir a 3★ Oro ({improvableNodes.length} pendiente{improvableNodes.length > 1 ? 's' : ''})</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg bg-amber-400/20">
                {improvableNodes.length === 1 ? 'Ir →' : showImprovableList ? 'Ocultar ▲' : 'Elegir ▼'}
              </span>
            </button>

            {showImprovableList && improvableNodes.length > 1 && (
              <div className="p-2 rounded-2xl bg-white dark:bg-[#18272e] border border-amber-200 dark:border-amber-800/60 shadow-sm flex flex-col gap-1.5 max-h-48 overflow-y-auto animate-fade-in">
                {improvableNodes.map(item => (
                  <button
                    key={item.node.id}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setShowImprovableList(false);
                      const el = document.getElementById(`roadmap-node-${item.node.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setSelectedNodeForPopover(item);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-gray-800 dark:text-gray-100 truncate">
                        {item.node.title}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 truncate">
                        {item.unitTitle}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex-shrink-0 ${
                      item.node.stars === 2
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                        : 'bg-amber-200 text-amber-900 dark:bg-amber-800/60 dark:text-amber-200'
                    }`}>
                      {item.node.stars}★ {item.node.stars === 2 ? 'Plata' : 'Bronce'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Banner de Modo Cuaderno de Trabajo */}
      {roadmapMode === 'workbook' && (
        <div className="w-full mb-6 p-4 rounded-3xl bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-indigo-700/90 text-white shadow-md border border-indigo-400/30 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <BookMarked className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                Modo Cuaderno Oficial
              </span>
              <h3 className="text-sm font-black mt-0.5">Ejercicios de Workbook Genki I & II</h3>
            </div>
          </div>
          <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl">
            23 Lecciones
          </span>
        </div>
      )}

      {/* Units List */}
      {units.map((unit) => {
        const isWorkbook = roadmapMode === 'workbook';
        const currentNodes = isWorkbook
          ? unit.nodes.filter(isWorkbookNode)
          : unit.nodes.filter(n => !isWorkbookNode(n));

        // En modo workbook, si la unidad no tiene ejercicios de workbook (ej. Unidad 0 - Alfabetos Kana), se omite
        if (isWorkbook && currentNodes.length === 0) {
          return null;
        }

        // Si la unidad está desbloqueada en libro de texto, asegurar que el primer ejercicio de workbook esté disponible
        const isUnitUnlockedInTextbook = devUnlockAll || unit.nodes.some(n => !isWorkbookNode(n) && n.unlocked);
        const displayNodes = currentNodes.map((n, idx) => {
          if (devUnlockAll && !n.unlocked) {
            return { ...n, unlocked: true };
          }
          if (isWorkbook && idx === 0 && isUnitUnlockedInTextbook && !n.unlocked) {
            return { ...n, unlocked: true };
          }
          return n;
        });

        const isUnitUnlocked = devUnlockAll || displayNodes.some(n => n.unlocked);
        const isUnitCompleted = displayNodes.length > 0 && displayNodes.every(n => n.stars > 0);

        return (
          <div key={unit.id} className="w-full mb-8">
            {/* Unit Header Card */}
            <div
              className={`w-full p-4 rounded-3xl text-white shadow-md mb-6 relative overflow-hidden transition-all ${
                !isUnitUnlocked ? 'opacity-60 saturate-50' : ''
              }`}
              style={{
                backgroundColor: isWorkbook ? '#4f46e5' : unit.themeColor,
                backgroundImage: isWorkbook ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%)' : undefined
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="px-2.5 py-0.5 bg-black/20 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  {isWorkbook ? <BookMarked className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                  {isWorkbook ? `${unit.genkiBook} • Cuaderno Oficial` : unit.genkiBook}
                </span>
                <span className="text-xs font-black opacity-90">
                  {isWorkbook ? `Workbook Lección ${unit.id}` : `Unidad ${unit.id + 1}`}
                </span>
              </div>

              <h3 className="text-lg font-black tracking-tight">
                {isWorkbook ? `Cuaderno: ${unit.title.replace(/^Genki\s+Lección\s+\d+:\s*/i, '')}` : unit.title}
              </h3>
              <p className="text-xs font-bold opacity-90 mt-0.5">
                {isWorkbook ? `Ejercicios del cuaderno oficial de trabajo (${displayNodes.length} módulos)` : unit.subtitle}
              </p>

              {/* Theory Guide Pill Button */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/20">
                <button
                  disabled={!isUnitUnlocked}
                  onClick={() => {
                    if (!isUnitUnlocked) return;
                    sound.playTap();
                    if (onOpenTheory) onOpenTheory(unit.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs text-white flex items-center gap-1.5 transition-all shadow-sm backdrop-blur-sm ${
                    isUnitUnlocked
                      ? 'bg-white/20 hover:bg-white/30 active:translate-y-0.5 cursor-pointer'
                      : 'bg-black/25 opacity-70 cursor-not-allowed'
                  }`}
                >
                  {isUnitUnlocked ? <BookOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {isUnitUnlocked ? 'Ver Guía de Teoría' : 'Teoría Bloqueada'}
                </button>

                {isWorkbook ? (
                  <span className="px-2.5 py-1 bg-white/20 rounded-xl text-[11px] font-black flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Audios Incluidos</span>
                  </span>
                ) : (
                  !isUnitUnlocked && (
                    <button
                      onClick={() => handleStartMultiJump(unit.id)}
                      className="px-3 py-1.5 bg-duo-orange hover:bg-duo-orange-dark active:translate-y-0.5 rounded-xl font-black text-xs text-white flex items-center gap-1.5 transition-all shadow-sm border border-white/20 cursor-pointer"
                      title={`Saltar hasta ${unit.title}`}
                    >
                      <FastForward className="w-3.5 h-3.5 stroke-[2.5px]" />
                      <span>Saltar a esta unidad</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Serpentine Roadmap Nodes */}
            <div className="flex flex-col items-center relative">
              {displayNodes.map((node, nodeIdx) => {
                const pattern = ['center', 'left', 'center', 'right'] as const;
                const position = pattern[nodeIdx % pattern.length];
                const isActive = node.id === activeNodeId;

                return (
                  <RoadmapNode
                    key={node.id}
                    node={node}
                    position={position}
                    isActive={isActive}
                    onSelectNode={(selected) => {
                      setSelectedNodeForPopover({
                        node: selected,
                        unitId: unit.id,
                        unitTitle: isWorkbook
                          ? `Cuaderno ${unit.title}`
                          : `${unit.title} — ${unit.subtitle}`
                      });
                    }}
                  />
                );
              })}
            </div>

            {/* Examen Final al término del camino de cada unidad */}
            {(() => {
              const examKey = `${unit.id}-${roadmapMode}`;
              const isExamUnlocked = isUnitCompleted || devUnlockAll;
              const isExamPassed = Boolean(passedUnitExams[examKey]);
              return (
                <div className="w-full mt-4 mb-2 px-1">
                  <div
                    className={`rounded-3xl p-4 border-2 flex items-center justify-between gap-3 transition-all ${
                      isExamPassed
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-duo-green'
                        : isExamUnlocked
                          ? 'bg-amber-50/90 dark:bg-[#242014] border-amber-400 shadow-sm'
                          : 'bg-gray-100/80 dark:bg-[#142026] border-duo-gray-200 dark:border-[#283842] opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                          isExamPassed
                            ? 'bg-duo-green/15 border-duo-green text-duo-green'
                            : isExamUnlocked
                              ? 'bg-amber-500/15 border-amber-400 text-amber-500'
                              : 'bg-gray-200 dark:bg-[#1e2d35] border-gray-300 dark:border-[#2c3f49] text-gray-400'
                        }`}
                      >
                        {isExamPassed ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : isExamUnlocked ? (
                          <Award className="w-6 h-6" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {isExamPassed ? '✅ Examen Aprobado' : isExamUnlocked ? '🏆 Examen Final' : '🔒 Examen Final'}
                        </div>
                        <h4 className="text-sm font-black text-gray-800 dark:text-white truncate">
                          Evaluación de {unit.title.split(':')[0]}
                        </h4>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate">
                          {isExamUnlocked
                            ? isExamPassed
                              ? 'Repasa toda la unidad (+20 XP)'
                              : 'Demuestra lo aprendido (+50 XP)'
                            : 'Completa las lecciones de la unidad para abrir'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!isExamUnlocked}
                      onClick={() => {
                        if (!isExamUnlocked) return;
                        sound.playTap();
                        const baseReview = createUnitReviewLesson(unit);
                        if (!baseReview) return;
                        setIsJumpAheadActive(false);
                        setIsPracticeActive(false);
                        setActiveQuizLesson({
                          ...baseReview,
                          id: `unit-exam-${examKey}`,
                          title: `Examen Final: ${unit.title.split(':')[0]}`
                        });
                      }}
                      className={`px-3.5 py-2 rounded-2xl font-black text-xs shrink-0 transition-all ${
                        !isExamUnlocked
                          ? 'bg-gray-200 dark:bg-[#23343d] text-gray-400 cursor-not-allowed'
                          : isExamPassed
                            ? 'bg-duo-green text-white border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-0.5 cursor-pointer'
                            : 'bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700 active:border-b-0 active:translate-y-0.5 cursor-pointer'
                      }`}
                    >
                      {isExamPassed ? 'Repetir' : isExamUnlocked ? 'Iniciar' : 'Bloqueado'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Jump Ahead Challenge Card (Only if unit is unlocked and not fully completed) */}
            {isUnitUnlocked && !isUnitCompleted && (
              <div className="w-full mt-6 mb-2 px-1">
                <div className="bg-white dark:bg-[#18272e] border-2 border-duo-orange/40 dark:border-duo-orange/50 rounded-3xl p-4 shadow-duo-card dark:shadow-none flex flex-col items-center text-center transition-colors">
                  <div className="w-12 h-12 bg-duo-orange-light dark:bg-duo-orange/20 rounded-2xl flex items-center justify-center text-duo-orange-dark dark:text-duo-orange mb-2 border-2 border-duo-orange/30">
                    <FastForward className="w-6 h-6 stroke-[2.5px]" />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                    Prueba de Salto de Nivel
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 mb-3 max-w-[280px]">
                    ¿Ya sabes este tema? Demuestra tu nivel en este examen especial. <strong>Si cometes 3 errores, no podrás saltar la unidad.</strong>
                  </p>

                  <button
                    onClick={() => handleStartMultiJump(unit.id)}
                    className="w-full py-3 bg-duo-orange hover:bg-duo-orange-dark text-white font-black text-xs rounded-2xl shadow-[0_4px_0_0_#e08500] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>Saltar esta unidad ({unit.title.split(':')[0]})</span>
                  </button>

                  {/* Selector rápido para saltar varias unidades hacia adelante */}
                  {units.some(u => u.id > unit.id && !u.nodes.some(n => n.unlocked)) && (
                    <div className="w-full mt-3.5 pt-3 border-t border-gray-100 dark:border-[#283842] flex flex-col items-center">
                      <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 mb-2">
                        ⚡ O salta varias lecciones hasta otra unidad:
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
                        {units
                          .filter(u => u.id > unit.id && !u.nodes.some(n => n.unlocked))
                          .slice(0, 6)
                          .map(targetU => (
                            <button
                              key={targetU.id}
                              onClick={() => handleStartMultiJump(targetU.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-duo-orange/10 hover:bg-duo-orange hover:text-white dark:bg-duo-orange/20 text-duo-orange-dark dark:text-duo-orange font-black text-[11px] border border-duo-orange/30 transition-all cursor-pointer active:scale-95"
                              title={`Hacer examen para saltar hasta ${targetU.title}`}
                            >
                              Hasta {targetU.title.split(':')[0]}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tarjeta de Salto en Unidades Bloqueadas */}
            {!isUnitUnlocked && (
              <div className="w-full mt-4 mb-2 px-1">
                <div className="bg-white dark:bg-[#18272e] border-2 border-gray-200 dark:border-[#283842] hover:border-duo-orange/40 rounded-3xl p-4 shadow-sm flex flex-col items-center text-center transition-colors">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 border border-amber-200 dark:border-amber-800/40">
                    <FastForward className="w-5 h-5 stroke-[2.5px]" />
                  </div>
                  <h4 className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                    ¿Quieres saltarte hasta aquí?
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 mb-2.5 max-w-[280px]">
                    Desbloquea directamente la <strong>{unit.title}</strong> con una prueba que evalúa los temas pendientes desde donde estás. (Máximo 3 errores).
                  </p>

                  <button
                    onClick={() => handleStartMultiJump(unit.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-duo-orange hover:brightness-105 text-white font-black text-xs rounded-2xl shadow-[0_3px_0_0_#d97706] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>Hacer Examen de Salto hasta {unit.title.split(':')[0]}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Botón de Repaso de la Unidad (reemplaza 'Unidad Dominada') */}
            {isUnitCompleted && (
              <div className="w-full mt-5 mb-2 px-1">
                <button
                  onClick={() => handleStartUnitReview(unit)}
                  className="w-full py-3.5 px-4 bg-duo-yellow hover:bg-duo-yellow-dark text-white font-black text-xs rounded-2xl shadow-[0_4px_0_0_#e5b400] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5px] group-hover:-rotate-45 transition-transform" />
                  <span>Repasar {unit.title}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-black/15 text-[10px] lowercase font-black tracking-normal">
                    +20 XP
                  </span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Popover de Lección al tocar un nodo del Roadmap */}
      {selectedNodeForPopover && (
        <NodeDetailModal
          node={selectedNodeForPopover.node}
          unitId={selectedNodeForPopover.unitId}
          unitTitle={selectedNodeForPopover.unitTitle}
          isWorkbook={isWorkbookNode(selectedNodeForPopover.node)}
          onClose={() => setSelectedNodeForPopover(null)}
          onStartLesson={() => {
            const parentUnit = units.find(u => u.id === selectedNodeForPopover.unitId);
            const targetLesson = expandLessonExercises(selectedNodeForPopover.node, parentUnit);
            setSelectedNodeForPopover(null);
            setIsJumpAheadActive(false);
            setIsPracticeActive(false);
            setActiveQuizLesson(targetLesson);
          }}
          onStartMultiJump={handleStartMultiJump}
          onOpenTheory={onOpenTheory}
          onScrollToLatest={handleScrollToLatest}
        />
      )}

      {/* Quiz Modal (Supports standard lesson, Jump Ahead exam, and Practice mode) */}
      {activeQuizLesson && (
        <QuizModal
          lesson={activeQuizLesson}
          userProfile={userProfile}
          isJumpAhead={isJumpAheadActive}
          isPractice={isPracticeActive}
          onClose={() => {
            setActiveQuizLesson(null);
            setIsJumpAheadActive(false);
            setIsPracticeActive(false);
          }}
          onCompleteLesson={(nodeId, xp, stars) => {
            if (nodeId.startsWith('unit-exam-')) {
              const examKey = nodeId.replace('unit-exam-', '');
              const firstPass = !passedUnitExams[examKey];
              setPassedUnitExams(prev => {
                const next = { ...prev, [examKey]: true };
                try {
                  localStorage.setItem('nihongo_unit_exams_v1', JSON.stringify(next));
                } catch {}
                return next;
              });
              onCompleteLesson(nodeId, firstPass ? Math.max(xp, 50) : Math.max(xp, 20), stars);
            } else {
              onCompleteLesson(nodeId, xp, stars);
            }
            setActiveQuizLesson(null);
            setIsJumpAheadActive(false);
            setIsPracticeActive(false);
          }}
          onPassJumpAhead={(unitId, targetNodeId, skippedNodeIds) => {
            onSkipUnit(unitId, targetNodeId, skippedNodeIds);
            setActiveQuizLesson(null);
            setIsJumpAheadActive(false);
            setIsPracticeActive(false);
          }}
          onDeductHeart={onDeductHeart}
        />
      )}
    </div>
  );
};
