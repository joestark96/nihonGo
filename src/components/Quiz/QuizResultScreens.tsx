import React from 'react';
import { Trophy, Sparkles, ShieldAlert, RotateCcw, Dumbbell, Heart } from 'lucide-react';
import { LessonNode } from '../../types';
import { sound } from '../../services/sound';

interface JumpPassedScreenProps {
  lesson: LessonNode;
  jumpChancesLeft: number;
  onConfirm: () => void;
}

export const JumpPassedScreen: React.FC<JumpPassedScreenProps> = ({
  lesson,
  jumpChancesLeft,
  onConfirm
}) => {
  const multi = lesson as LessonNode & { skippedNodeIds?: string[]; isMultiUnit?: boolean };
  const skippedCount = multi.skippedNodeIds ? multi.skippedNodeIds.length : 1;
  const isMultiUnit = Boolean(multi.isMultiUnit) || skippedCount > 1;
  const earnedXp = isMultiUnit ? Math.min(300, skippedCount * 25 + 50) : 100;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#131f24] dark:text-gray-100 flex flex-col justify-between p-6 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        <div className="w-24 h-24 bg-duo-green rounded-full flex items-center justify-center mb-6 shadow-duo-btn border-4 border-duo-green-dark animate-bounce">
          <Trophy className="w-12 h-12 text-white stroke-[2.5px]" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-1">
          {isMultiUnit ? '¡Salto Multilección Superado!' : '¡Prueba de Salto Superada!'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-6">
          Has demostrado tu dominio con solo {3 - jumpChancesLeft} error(es).
          {isMultiUnit
            ? ` ¡Completaste ${skippedCount} lecciones pendientes y desbloqueaste tu objetivo!`
            : ' ¡Unidad saltada y siguiente nivel desbloqueado!'}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-duo-yellow-light/60 dark:bg-duo-yellow/10 border-2 border-duo-yellow rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-black text-duo-yellow-dark dark:text-duo-yellow uppercase">EXP Ganada</span>
            <span className="text-2xl font-black text-duo-yellow-dark dark:text-duo-yellow flex items-center gap-1">
              <Sparkles className="w-5 h-5" /> +{earnedXp} XP
            </span>
          </div>
          <div className="bg-duo-green-light/60 dark:bg-duo-green/10 border-2 border-duo-green rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-black text-duo-green-dark dark:text-duo-green uppercase">Resultado</span>
            <span className="text-xl font-black text-duo-green">¡Aprobado!</span>
          </div>
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full max-w-sm mx-auto py-3.5 bg-duo-green hover:bg-duo-green-dark text-white font-black text-lg rounded-2xl shadow-[0_5px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
      >
        {isMultiUnit ? 'Ir a las Nuevas Lecciones' : 'Desbloquear Siguiente Unidad'}
      </button>
    </div>
  );
};

interface JumpFailedScreenProps {
  lesson: LessonNode;
  onClose: () => void;
}

export const JumpFailedScreen: React.FC<JumpFailedScreenProps> = ({ lesson, onClose }) => {
  const multi = lesson as LessonNode & { skippedNodeIds?: string[]; isMultiUnit?: boolean };
  const isMultiUnit = Boolean(multi.isMultiUnit) || Boolean(multi.skippedNodeIds && multi.skippedNodeIds.length > 1);

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#131f24] dark:text-gray-100 flex flex-col justify-between p-6 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-duo-red-light dark:bg-duo-red/20 rounded-full flex items-center justify-center mb-6 border-4 border-duo-red shadow-md">
          <ShieldAlert className="w-10 h-10 text-duo-red" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">Prueba de Salto No Superada</h2>
        <p className="text-gray-600 dark:text-gray-400 font-bold text-sm mb-4">
          Cometiste 3 errores en el examen. {isMultiUnit ? 'Para saltarte múltiples lecciones debes demostrar un dominio sólido de todos los temas previos.' : 'Para saltarte una unidad completa debes demostrar un dominio de los temas.'}
        </p>
        <div className="p-4 bg-gray-50 dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] rounded-2xl text-xs font-bold text-gray-500 dark:text-gray-400 mb-6">
          💡 Consejo: Te recomendamos completar las lecciones guiadas del roadmap para dominar el vocabulario y la gramática.
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full max-w-sm mx-auto py-3.5 bg-duo-blue text-white font-black text-lg rounded-2xl shadow-[0_5px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw className="w-5 h-5" /> Volver al Roadmap
      </button>
    </div>
  );
};

interface LessonCompletedScreenProps {
  lessonTitle: string;
  totalCount: number;
  wrongAttempts: number;
  isPractice: boolean;
  isReviewingMistakes: boolean;
  mistakenCount: number;
  onReviewMistakes: () => void;
  onClose: () => void;
}

export const LessonCompletedScreen: React.FC<LessonCompletedScreenProps> = ({
  lessonTitle,
  totalCount,
  wrongAttempts,
  isPractice,
  isReviewingMistakes,
  mistakenCount,
  onReviewMistakes,
  onClose
}) => (
  <div className="fixed inset-0 z-[100] bg-white dark:bg-[#131f24] dark:text-gray-100 flex flex-col justify-between p-6 animate-fade-in">
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-duo-btn border-4 animate-bounce ${
        isPractice ? 'bg-duo-blue border-duo-blue-dark' : 'bg-duo-yellow border-duo-yellow-dark'
      }`}>
        {isPractice ? (
          <Dumbbell className="w-12 h-12 text-white stroke-[2.5px]" />
        ) : (
          <Trophy className="w-12 h-12 text-white stroke-[2.5px]" />
        )}
      </div>
      <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-1">
        {isReviewingMistakes
          ? '¡Errores repasados!'
          : isPractice
          ? '¡Entrenamiento completado!'
          : '¡Lección completada!'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-6">
        {isReviewingMistakes
          ? `Has reforzado los ${totalCount} ejercicio(s) pendientes.`
          : isPractice
          ? `Has repasado ${totalCount} ejercicios de tus lecciones cursadas.`
          : `Has dominado: ${lessonTitle}`}
      </p>

      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div className="bg-duo-yellow-light/60 dark:bg-duo-yellow/10 border-2 border-duo-yellow rounded-2xl p-4 flex flex-col items-center">
          <span className="text-xs font-black text-duo-yellow-dark dark:text-duo-yellow uppercase">EXP Ganada</span>
          <span className="text-2xl font-black text-duo-yellow-dark dark:text-duo-yellow flex items-center gap-1">
            <Sparkles className="w-5 h-5" /> {isReviewingMistakes ? 'Repaso' : isPractice ? '+25 XP' : '+20 XP'}
          </span>
        </div>
        <div className="bg-duo-green-light/60 dark:bg-duo-green/10 border-2 border-duo-green rounded-2xl p-4 flex flex-col items-center">
          <span className="text-xs font-black text-duo-green-dark dark:text-duo-green uppercase">Precisión</span>
          <span className="text-2xl font-black text-duo-green">
            {wrongAttempts === 0 ? '100%' : `${Math.max(60, Math.round(((totalCount - wrongAttempts) / totalCount) * 100))}%`}
          </span>
        </div>
      </div>
    </div>

    <div className="w-full max-w-sm mx-auto flex flex-col gap-2.5">
      {!isReviewingMistakes && mistakenCount > 0 && (
        <button
          onClick={() => {
            sound.playTap();
            onReviewMistakes();
          }}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_0_#b45309] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Repasar mis {mistakenCount} error{mistakenCount > 1 ? 'es' : ''}</span>
        </button>
      )}
      <button
        onClick={onClose}
        className="w-full py-3.5 bg-duo-green hover:bg-duo-green-dark text-white font-black text-lg rounded-2xl shadow-[0_5px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
      >
        Continuar
      </button>
    </div>
  </div>
);

export const GameOverScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] bg-white dark:bg-[#131f24] dark:text-gray-100 flex flex-col justify-between p-6">
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
      <div className="w-20 h-20 bg-duo-red-light dark:bg-duo-red/20 rounded-full flex items-center justify-center mb-6 border-4 border-duo-red">
        <Heart className="w-10 h-10 text-duo-red" />
      </div>
      <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">¡Te has quedado sin vidas!</h2>
      <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-6">
        Repasa en la sección de Flashcards o recarga tus energías para volver a intentar.
      </p>
    </div>

    <button
      onClick={onClose}
      className="w-full max-w-sm mx-auto py-3.5 bg-duo-blue text-white font-black text-lg rounded-2xl shadow-[0_5px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
    >
      <RotateCcw className="w-5 h-5" /> Entendido
    </button>
  </div>
);
