import React from 'react';
import { ExerciseOption } from '../../../types';
import { sound } from '../../../services/sound';
import { formatQuizOptionText } from '../quizFormatters';

interface MultipleChoiceExerciseProps {
  options: ExerciseOption[];
  selectedOptionId: string | null;
  correctAnswerId?: string;
  exerciseType: string;
  prompt: string;
  isIntroLesson: boolean;
  showRomaji: boolean;
  status: 'answering' | 'correct' | 'incorrect';
  onSelectOption: (id: string) => void;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  options,
  selectedOptionId,
  correctAnswerId,
  exerciseType,
  prompt,
  isIntroLesson,
  showRomaji,
  status,
  onSelectOption
}) => (
  <div className="grid grid-cols-1 gap-3">
    {options.map(option => {
      const isSelected = selectedOptionId === option.id;
      const isOptionCorrect = status !== 'answering' && option.id === correctAnswerId;
      const isOptionWrongSelected = status === 'incorrect' && isSelected && option.id !== correctAnswerId;

      return (
        <button
          key={option.id}
          disabled={status !== 'answering'}
          onClick={() => {
            sound.playTap();
            onSelectOption(option.id);
          }}
          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
            isOptionCorrect
              ? 'border-duo-green bg-duo-green-light/70 dark:bg-duo-green/20 text-duo-green-dark dark:text-green-300 shadow-[0_4px_0_0_#58cc02]'
              : isOptionWrongSelected
              ? 'border-duo-red bg-duo-red-light/70 dark:bg-duo-red/20 text-duo-red-dark dark:text-red-300 shadow-[0_4px_0_0_#ff4b4b]'
              : isSelected
              ? 'border-duo-blue bg-duo-blue-light/50 dark:bg-duo-blue/20 text-duo-blue-dark dark:text-sky-300 shadow-[0_4px_0_0_#1cb0f6]'
              : 'border-duo-gray-200 dark:border-[#283842] bg-white dark:bg-[#18272e] text-gray-800 dark:text-gray-100 shadow-duo-card dark:shadow-none hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold font-['Noto_Sans_JP']">
              {formatQuizOptionText(option.text, exerciseType, prompt, isIntroLesson, options)}
            </span>
            {option.romaji && showRomaji && (
              <span className="text-xs font-bold text-gray-400">{option.romaji}</span>
            )}
          </div>
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              isSelected ? 'border-duo-blue bg-duo-blue' : 'border-duo-gray-300 dark:border-gray-600'
            }`}
          >
            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
          </div>
        </button>
      );
    })}
  </div>
);
