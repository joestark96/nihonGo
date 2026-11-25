import React from 'react';
import { Volume2 } from 'lucide-react';
import { sound } from '../../../services/sound';
import { SpeechPracticeButton } from '../../SpeechPracticeButton';

interface SpeakingExerciseProps {
  targetText: string;
  voiceText: string;
  onPlayVoice: (rate?: number) => void;
  onSuccess: () => void;
}

export const SpeakingExercise: React.FC<SpeakingExerciseProps> = ({
  targetText,
  voiceText,
  onPlayVoice,
  onSuccess
}) => (
  <div className="flex flex-col items-center gap-4 my-2">
    <div className="w-full p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30 border-2 border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center text-center gap-3">
      <p className="text-2xl font-black text-gray-800 dark:text-gray-100 font-['Noto_Sans_JP']">
        {targetText}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onPlayVoice(0.9);
          }}
          className="px-4 py-2 rounded-xl bg-duo-blue hover:bg-duo-blue-dark text-white font-black text-xs flex items-center gap-1.5 shadow-duo-btn-sm active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>Escuchar ejemplo</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onPlayVoice(0.7);
          }}
          className="px-3 py-2 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200 font-black text-xs cursor-pointer"
          title="Escuchar lento"
        >
          🐢
        </button>
      </div>
    </div>

    <div className="w-full">
      <SpeechPracticeButton
        targetJapanese={targetText}
        targetFurigana={voiceText}
        onSuccess={onSuccess}
      />
    </div>
  </div>
);
