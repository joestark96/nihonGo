import React, { useState, useMemo, useCallback } from 'react';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { genkiVocabulary, VocabWord } from '../../../data/vocabularyData';
import { sound } from '../../../services/sound';
import { recordMinigameScore } from '../../../utils/gameRecords';

interface MemoryMatchGameProps {
  onAwardReward: (xp: number, gems: number) => void;
  onExit: () => void;
}

interface MatchTile {
  uid: string;
  pairId: string;
  label: string;
  subLabel?: string;
  side: 'jp' | 'es';
  audioText?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRoundTiles(lessonFilter: 'all' | 'basic'): MatchTile[] {
  const pool = (lessonFilter === 'basic'
    ? genkiVocabulary.filter(v => v.lesson <= 4)
    : genkiVocabulary
  ).filter(v => v.japanese.length <= 8 && v.spanish.length <= 28);

  const picked: VocabWord[] = shuffle(pool).slice(0, 6);
  const tiles: MatchTile[] = [];
  for (const w of picked) {
    tiles.push({
      uid: `jp-${w.id}`,
      pairId: w.id,
      label: w.japanese,
      subLabel: w.furigana !== w.japanese ? w.furigana : undefined,
      side: 'jp',
      audioText: w.audioText || w.furigana || w.japanese
    });
    tiles.push({
      uid: `es-${w.id}`,
      pairId: w.id,
      label: w.spanish.split('/')[0].trim(),
      side: 'es'
    });
  }
  return shuffle(tiles);
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onAwardReward, onExit }) => {
  const [difficulty, setDifficulty] = useState<'basic' | 'all'>('basic');
  const [tiles, setTiles] = useState<MatchTile[]>(() => buildRoundTiles('basic'));
  const [selected, setSelected] = useState<MatchTile | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [rewarded, setRewarded] = useState(false);

  const isComplete = matchedIds.length === 6;

  const restart = useCallback((diff: 'basic' | 'all' = difficulty) => {
    sound.playTap();
    setDifficulty(diff);
    setTiles(buildRoundTiles(diff));
    setSelected(null);
    setMatchedIds([]);
    setWrongPair([]);
    setAttempts(0);
    setRewarded(false);
  }, [difficulty]);

  const earnedXp = useMemo(() => (attempts <= 8 ? 35 : attempts <= 12 ? 25 : 15), [attempts]);

  const handleTileClick = (tile: MatchTile) => {
    if (matchedIds.includes(tile.pairId) || wrongPair.length > 0) return;
    if (tile.side === 'jp' && tile.audioText) {
      sound.speakJapanese(tile.audioText, 0.9);
    } else {
      sound.playTap();
    }

    if (!selected) {
      setSelected(tile);
      return;
    }

    if (selected.uid === tile.uid) {
      setSelected(null);
      return;
    }

    if (selected.side === tile.side) {
      setSelected(tile);
      return;
    }

    setAttempts(a => a + 1);
    if (selected.pairId === tile.pairId) {
      sound.playCorrect();
      const nextMatched = [...matchedIds, tile.pairId];
      setMatchedIds(nextMatched);
      setSelected(null);
      if (nextMatched.length === 6 && !rewarded) {
        setRewarded(true);
        sound.playLessonComplete();
        recordMinigameScore('memory', attempts + 1, true);
        onAwardReward(attempts + 1 <= 8 ? 35 : attempts + 1 <= 12 ? 25 : 15, 3);
      }
    } else {
      sound.playIncorrect();
      const ids = [selected.uid, tile.uid];
      setWrongPair(ids);
      setSelected(null);
      window.setTimeout(() => setWrongPair([]), 450);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-duo-purple">Vocabulario Genki</span>
          <h3 className="text-xl font-black text-duo-gray-800 dark:text-white">🃏 Parejas Rápidas</h3>
        </div>
        <button
          onClick={onExit}
          className="text-xs font-extrabold text-duo-gray-400 hover:text-duo-gray-600 dark:hover:text-gray-200 px-3 py-1.5 rounded-xl border border-duo-gray-200 dark:border-[#2c3f49] cursor-pointer"
        >
          Volver
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {([
            { id: 'basic', label: 'Básico (L0-4)' },
            { id: 'all', label: 'Todo Genki' }
          ] as const).map(opt => (
            <button
              key={opt.id}
              onClick={() => restart(opt.id)}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold border cursor-pointer ${
                difficulty === opt.id
                  ? 'border-duo-purple bg-duo-purple/15 text-duo-purple'
                  : 'border-duo-gray-200 dark:border-[#2c3f49] text-duo-gray-500 dark:text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-black text-duo-gray-500 dark:text-gray-400">
          {matchedIds.length}/6 parejas · {attempts} intentos
        </span>
      </div>

      {isComplete ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-duo-green/15 border-2 border-duo-green/40 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-duo-green" />
          </div>
          <h4 className="text-2xl font-black text-duo-gray-800 dark:text-white">¡Tablero completado!</h4>
          <p className="text-sm font-bold text-duo-gray-500 dark:text-gray-300">
            Completado en {attempts} intentos.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-duo-green/15 border border-duo-green/30 text-duo-green font-black text-sm">
            <Sparkles className="w-4 h-4" /> +{earnedXp} XP · +3 💎
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => restart(difficulty)}
              className="flex-1 py-3 rounded-2xl bg-duo-green text-white font-black border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
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
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {tiles.map(tile => {
            const isMatched = matchedIds.includes(tile.pairId);
            const isSelected = selected?.uid === tile.uid;
            const isWrong = wrongPair.includes(tile.uid);

            return (
              <button
                key={tile.uid}
                disabled={isMatched}
                onClick={() => handleTileClick(tile)}
                className={`p-3 min-h-[68px] rounded-2xl border-2 border-b-4 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isMatched
                    ? 'bg-duo-green/10 border-duo-green/40 text-duo-green opacity-50'
                    : isWrong
                      ? 'bg-red-500/15 border-red-500 text-red-500'
                      : isSelected
                        ? 'bg-duo-blue/15 border-duo-blue text-duo-blue -translate-y-0.5'
                        : 'bg-white dark:bg-[#1f313b] border-duo-gray-200 dark:border-[#2e4450] text-duo-gray-800 dark:text-white'
                }`}
              >
                <span className={`font-black leading-tight ${tile.side === 'jp' ? 'text-base' : 'text-xs'}`}>
                  {tile.label}
                </span>
                {tile.subLabel && (
                  <span className="text-[10px] font-bold text-duo-gray-400 mt-0.5">{tile.subLabel}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
