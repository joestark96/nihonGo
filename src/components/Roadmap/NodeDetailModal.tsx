import React from 'react';
import {
  X, BookMarked, Headphones, Lock, Star, Sparkles, Volume2,
  FastForward, BookOpen, Compass, Play
} from 'lucide-react';
import { LessonNode } from '../../types';
import { sound } from '../../services/sound';

interface NodeDetailModalProps {
  node: LessonNode;
  unitId: number;
  unitTitle: string;
  isWorkbook: boolean;
  onClose: () => void;
  onStartLesson: () => void;
  onStartMultiJump: (unitId: number, nodeId: string) => void;
  onOpenTheory?: (unitId: number) => void;
  onScrollToLatest: () => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  node,
  unitId,
  unitTitle,
  isWorkbook,
  onClose,
  onStartLesson,
  onStartMultiJump,
  onOpenTheory,
  onScrollToLatest
}) => {
  const firstAudio = node.exercises.find(e => Boolean(e.japaneseVoiceText));
  const audioCount = node.exercises.filter(e => Boolean(e.japaneseVoiceText)).length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] rounded-3xl p-5 shadow-2xl max-w-sm w-full flex flex-col gap-4 animate-scale-up relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#20333d] transition-colors cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {isWorkbook && (
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-xs mt-1">
            <span className="flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 stroke-[2.5px]" />
              <span>Genki Workbook • Cuaderno Oficial</span>
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-black">Práctica</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 pr-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${
              isWorkbook
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-[0_4px_0_0_#4338ca]'
                : !node.unlocked
                ? 'bg-amber-500 shadow-[0_4px_0_0_#d97706]'
                : node.stars > 0
                ? 'bg-duo-yellow shadow-[0_4px_0_0_#e5b400]'
                : 'bg-duo-green shadow-[0_4px_0_0_#46a302]'
            }`}
          >
            {isWorkbook ? (
              node.icon === 'Headphones' ? (
                <Headphones className="w-7 h-7 stroke-[2.5px]" />
              ) : (
                <BookMarked className="w-7 h-7 stroke-[2.5px]" />
              )
            ) : !node.unlocked ? (
              <Lock className="w-7 h-7 stroke-[2.5px]" />
            ) : node.stars > 0 ? (
              <Star className="w-7 h-7 fill-white stroke-[2.5px]" />
            ) : (
              <Sparkles className="w-7 h-7 stroke-[2.5px]" />
            )}
          </div>

          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {unitTitle}
            </span>
            <h3 className="text-base font-black text-gray-800 dark:text-gray-100 leading-snug">
              {node.title}
            </h3>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
              {node.japaneseTitle}
            </p>
          </div>
        </div>

        {/* Status & Stars */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 dark:bg-[#131f24] border border-gray-200 dark:border-[#283842]">
          <span className="text-xs font-black text-gray-600 dark:text-gray-300">
            {!node.unlocked
              ? '🔒 Estado: Bloqueada'
              : node.stars > 0
              ? 'Estado: ¡Completada!'
              : 'Estado: Disponible'}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  node.unlocked && i < node.stars
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Workbook Audio Preview */}
        {isWorkbook && firstAudio?.japaneseVoiceText && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                Pista de Audio del Cuaderno
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                {audioCount} pistas de voz
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playTap();
                  sound.speakExerciseAudio(firstAudio.japaneseVoiceText!, 0.9, {
                    isWorkbook: true,
                    exerciseId: firstAudio.id,
                    prompt: firstAudio.prompt
                  });
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Escuchar Diálogo</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  sound.speakExerciseAudio(firstAudio.japaneseVoiceText!, 0.70, {
                    isWorkbook: true,
                    exerciseId: firstAudio.id,
                    prompt: firstAudio.prompt
                  });
                }}
                className="py-2 px-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                title="Escuchar audio a velocidad lenta (0.7x)"
              >
                <span>🐢</span>
                <span className="text-[10px]">Lento</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!node.unlocked ? (
          <div className="flex flex-col gap-2.5 mt-1">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-300">
              ⚡ Esta lección está bloqueada. Puedes saltar directamente hasta aquí aprobando un examen especial con los temas pendientes. (Máx 3 errores).
            </div>

            <button
              onClick={() => {
                onClose();
                onStartMultiJump(unitId, node.id);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-duo-orange hover:brightness-105 text-white font-black text-xs rounded-2xl shadow-[0_4px_0_0_#d97706] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <FastForward className="w-4 h-4 stroke-[2.5px]" />
              <span>Hacer Examen y Saltar hasta aquí</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                  onOpenTheory?.(unitId);
                }}
                className="py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-[0_3px_0_0_#0284c7] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ver Teoría</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                  onScrollToLatest();
                }}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Lección actual</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mt-1">
            <button
              onClick={() => {
                sound.playTap();
                onStartLesson();
              }}
              className={`w-full py-3.5 text-white font-black text-xs rounded-2xl active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                isWorkbook
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-105 shadow-[0_4px_0_0_#4338ca]'
                  : 'bg-duo-green hover:bg-duo-green-dark shadow-[0_4px_0_0_#46a302]'
              }`}
            >
              <Play className="w-4 h-4 fill-white stroke-[2px]" />
              <span>
                {isWorkbook
                  ? node.stars > 0
                    ? 'Repasar Cuaderno (Workbook)'
                    : '¡Hacer Ejercicios de Workbook!'
                  : node.stars > 0
                  ? 'Repasar Lección'
                  : 'Iniciar Lección'}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onClose();
                onOpenTheory?.(unitId);
              }}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-2xl shadow-[0_4px_0_0_#0284c7] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5px]" />
              <span>Ver Teoría y Gramática</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
