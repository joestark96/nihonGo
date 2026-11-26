import React, { useState } from 'react';
import { RotateCcw, Trophy, Sparkles, Eye, EyeOff, Volume2 } from 'lucide-react';
import { kanjiList, KanjiItem } from '../../../data/kanjiData';
import { getKanjiVgPathsForCharacter } from '../../../data/strokePathsData';
import { StrokePracticeCanvas } from '../../Kana/StrokePracticeCanvas';
import { sound } from '../../../services/sound';
import { recordMinigameScore } from '../../../utils/gameRecords';

interface KanjiBlindDrawGameProps {
  onAwardReward: (xp: number, gems: number) => void;
  onExit: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDrawableKanjis(): KanjiItem[] {
  const pool = kanjiList.filter(
    k =>
      k.jlptLevel === 'N5' &&
      k.strokeCount <= 6 &&
      Boolean(getKanjiVgPathsForCharacter(k.kanji))
  );
  return shuffle(pool).slice(0, 5);
}

export const KanjiBlindDrawGame: React.FC<KanjiBlindDrawGameProps> = ({ onAwardReward, onExit }) => {
  const [rounds, setRounds] = useState<KanjiItem[]>(() => pickDrawableKanjis());
  const [idx, setIdx] = useState(0);
  const [revealKanji, setRevealKanji] = useState(false);
  const [passedCurrent, setPassedCurrent] = useState(false);
  const [passedCount, setPassedCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = rounds[idx];

  const restart = () => {
    sound.playTap();
    setRounds(pickDrawableKanjis());
    setIdx(0);
    setRevealKanji(false);
    setPassedCurrent(false);
    setPassedCount(0);
    setFinished(false);
  };

  const handleEvaluated = (_score: number, passed: boolean) => {
    if (passed && !passedCurrent) {
      setPassedCurrent(true);
      setPassedCount(c => c + 1);
      setRevealKanji(true);
      sound.speakJapanese(current.compounds?.[0]?.furigana || current.kanji, 0.9);
    }
  };

  const handleNext = () => {
    sound.playTap();
    if (idx + 1 >= rounds.length) {
      setFinished(true);
      sound.playLessonComplete();
      if (passedCount > 0) {
        recordMinigameScore('kanji-draw', passedCount);
        onAwardReward(passedCount * 8 + 10, passedCount >= 4 ? 5 : 2);
      }
    } else {
      setIdx(i => i + 1);
      setRevealKanji(false);
      setPassedCurrent(false);
    }
  };

  if (finished) {
    return (
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/15 border-2 border-sky-400/40 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-sky-500" />
        </div>
        <h3 className="text-2xl font-black text-duo-gray-800 dark:text-white">¡Caligrafía Completada!</h3>
        <p className="text-sm font-bold text-duo-gray-500 dark:text-gray-300">
          Dibujaste correctamente {passedCount} de {rounds.length} kanjis de memoria.
        </p>
        {passedCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-duo-green/15 border border-duo-green/30 text-duo-green font-black text-sm">
            <Sparkles className="w-4 h-4" /> +{passedCount * 8 + 10} XP · +{passedCount >= 4 ? 5 : 2} 💎
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button
            onClick={restart}
            className="flex-1 py-3 rounded-2xl bg-duo-green text-white font-black border-b-4 border-duo-green-dark flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Otra ronda
          </button>
          <button
            onClick={onExit}
            className="px-5 py-3 rounded-2xl bg-duo-gray-100 dark:bg-[#23343d] text-duo-gray-700 dark:text-gray-200 font-black cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-sky-500">
            Kanji {idx + 1} / {rounds.length}
          </span>
          <h3 className="text-xl font-black text-duo-gray-800 dark:text-white">✍️ Dibuja a Ciegas</h3>
        </div>
        <button
          onClick={onExit}
          className="text-xs font-extrabold text-duo-gray-400 px-3 py-1.5 rounded-xl border border-duo-gray-200 dark:border-[#2c3f49] cursor-pointer"
        >
          Volver
        </button>
      </div>

      {current && (
        <>
          <div className="p-4 rounded-2xl bg-duo-gray-100/80 dark:bg-[#131f24] border border-duo-gray-200 dark:border-[#2c3f49] flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase text-duo-gray-400">
                Dibuja el kanji ({current.strokeCount} trazos)
              </div>
              <div className="text-lg font-black text-duo-gray-800 dark:text-white">
                {current.spanish}
              </div>
              <div className="text-xs font-bold text-duo-blue">
                {current.kunyomi !== '—' ? current.kunyomi : ''} {current.onyomi ? `· ${current.onyomi}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {revealKanji && (
                <span className="text-3xl font-black px-2.5 py-1 rounded-xl bg-white dark:bg-[#1a2930] border border-duo-gray-200 dark:border-[#2c3f49]">
                  {current.kanji}
                </span>
              )}
              <button
                onClick={() => setRevealKanji(r => !r)}
                className="p-2 rounded-xl bg-white dark:bg-[#1e2f38] border border-duo-gray-200 dark:border-[#2c3f49] text-xs font-bold text-duo-gray-500 cursor-pointer"
                title="Mostrar / ocultar pista"
              >
                {revealKanji ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => sound.speakJapanese(current.compounds?.[0]?.furigana || current.kanji, 0.9)}
                className="p-2 rounded-xl bg-duo-blue/10 text-duo-blue border border-duo-blue/30 cursor-pointer"
                title="Escuchar"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <StrokePracticeCanvas
            key={current.id}
            character={current.kanji}
            expectedStrokes={current.strokeCount}
            initialShowGuide={false}
            onEvaluated={handleEvaluated}
          />

          <button
            onClick={handleNext}
            className="w-full py-3 rounded-2xl bg-duo-blue text-white font-black text-sm border-b-4 border-duo-blue-dark cursor-pointer"
          >
            {idx + 1 >= rounds.length
              ? 'Finalizar'
              : passedCurrent
                ? 'Siguiente Kanji 👉'
                : 'Saltar este Kanji 👉'}
          </button>
        </>
      )}
    </div>
  );
};
