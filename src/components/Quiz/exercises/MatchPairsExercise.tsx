import React from 'react';
import { MatchPair } from '../../../types';

interface MatchPairsExerciseProps {
  leftPairs: MatchPair[];
  rightPairs: MatchPair[];
  matchedPairs: string[];
  selectedLeft: string | null;
  selectedRight: string | null;
  mismatchedPair: { left: string; right: string } | null;
  showRomaji: boolean;
  onSelect: (type: 'left' | 'right', id: string) => void;
}

export const MatchPairsExercise: React.FC<MatchPairsExerciseProps> = ({
  leftPairs,
  rightPairs,
  matchedPairs,
  selectedLeft,
  selectedRight,
  mismatchedPair,
  showRomaji,
  onSelect
}) => (
  <div className="grid grid-cols-2 gap-3">
    <div className="flex flex-col gap-2.5">
      {leftPairs.map(p => {
        const isMatched = matchedPairs.includes(p.id);
        const isSelected = selectedLeft === p.id;
        const isMismatched = mismatchedPair?.left === p.id;
        return (
          <button
            key={`left-${p.id}`}
            disabled={isMatched}
            onClick={() => onSelect('left', p.id)}
            className={`p-3.5 rounded-2xl border-2 font-bold text-center transition-all ${
              isMatched
                ? 'opacity-30 border-duo-green bg-duo-green-light/40 dark:bg-duo-green/20 text-duo-green-dark dark:text-duo-green cursor-default'
                : isMismatched
                ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600 shadow-[0_4px_0_0_#ef4444] animate-shake'
                : isSelected
                ? 'border-duo-blue bg-duo-blue-light/50 dark:bg-duo-blue/20 shadow-[0_4px_0_0_#1cb0f6]'
                : 'border-duo-gray-200 dark:border-[#283842] bg-white dark:bg-[#18272e] text-gray-800 dark:text-gray-100 shadow-duo-card dark:shadow-none hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="text-base font-['Noto_Sans_JP']">{p.left}</div>
            {p.leftSub && showRomaji && <div className="text-xs text-gray-400 font-semibold">{p.leftSub}</div>}
          </button>
        );
      })}
    </div>

    <div className="flex flex-col gap-2.5">
      {rightPairs.map(p => {
        const isMatched = matchedPairs.includes(p.id);
        const isSelected = selectedRight === p.id;
        const isMismatched = mismatchedPair?.right === p.id;
        return (
          <button
            key={`right-${p.id}`}
            disabled={isMatched}
            onClick={() => onSelect('right', p.id)}
            className={`p-3.5 rounded-2xl border-2 font-bold text-center transition-all flex items-center justify-center min-h-[56px] ${
              isMatched
                ? 'opacity-30 border-duo-green bg-duo-green-light/40 dark:bg-duo-green/20 text-duo-green-dark dark:text-duo-green cursor-default'
                : isMismatched
                ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-600 shadow-[0_4px_0_0_#ef4444] animate-shake'
                : isSelected
                ? 'border-duo-blue bg-duo-blue-light/50 dark:bg-duo-blue/20 shadow-[0_4px_0_0_#1cb0f6]'
                : 'border-duo-gray-200 dark:border-[#283842] bg-white dark:bg-[#18272e] text-gray-800 dark:text-gray-100 shadow-duo-card dark:shadow-none hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-sm">{p.right}</span>
          </button>
        );
      })}
    </div>
  </div>
);
