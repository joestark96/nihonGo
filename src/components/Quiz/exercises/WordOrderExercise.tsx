import React from 'react';

interface WordChip {
  id: string;
  word: string;
}

interface WordOrderExerciseProps {
  wordChips: WordChip[];
  selectedChipIds: string[];
  disabled: boolean;
  onSelectChip: (chipId: string) => void;
  onDeselectChip: (chipId: string) => void;
}

export const WordOrderExercise: React.FC<WordOrderExerciseProps> = ({
  wordChips,
  selectedChipIds,
  disabled,
  onSelectChip,
  onDeselectChip
}) => (
  <div className="flex flex-col gap-6">
    <div className="min-h-[70px] p-3 bg-gray-50 dark:bg-[#18272e] border-b-2 border-duo-gray-300 dark:border-[#283842] rounded-2xl flex flex-wrap gap-2 items-center">
      {selectedChipIds.length === 0 ? (
        <span className="text-gray-400 dark:text-gray-500 text-sm font-bold italic">
          Toca las palabras para formar la frase...
        </span>
      ) : (
        selectedChipIds.map(chipId => {
          const chip = wordChips.find(c => c.id === chipId);
          if (!chip) return null;
          return (
            <button
              key={`sel-${chip.id}`}
              disabled={disabled}
              onClick={() => onDeselectChip(chip.id)}
              className="px-3.5 py-2 bg-white dark:bg-[#283842] border-2 border-duo-gray-300 dark:border-[#3a4d59] rounded-xl font-bold text-gray-800 dark:text-gray-100 shadow-duo-btn-sm active:translate-y-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-['Noto_Sans_JP'] cursor-pointer"
            >
              {chip.word}
            </button>
          );
        })
      )}
    </div>

    <div className="flex flex-wrap gap-2.5 justify-center py-4">
      {wordChips.map(chip => {
        const isSelected = selectedChipIds.includes(chip.id);
        return (
          <button
            key={chip.id}
            disabled={isSelected || disabled}
            onClick={() => onSelectChip(chip.id)}
            className={`px-4 py-2.5 rounded-xl font-bold font-['Noto_Sans_JP'] transition-all ${
              isSelected
                ? 'bg-gray-100 dark:bg-[#18272e]/60 border-2 border-dashed border-gray-300 dark:border-[#283842] text-gray-300 dark:text-gray-600 shadow-none cursor-default select-none'
                : 'bg-white dark:bg-[#283842] border-2 border-duo-gray-300 dark:border-[#3a4d59] text-gray-800 dark:text-gray-100 shadow-[0_3px_0_0_#e5e5e5] dark:shadow-none active:translate-y-0.5 hover:border-duo-blue cursor-pointer'
            }`}
          >
            {chip.word}
          </button>
        );
      })}
    </div>
  </div>
);
