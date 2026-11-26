import React, { useState, useMemo } from 'react';
import { RotateCcw, Trophy, Sparkles, Search } from 'lucide-react';
import { sound } from '../../../services/sound';

interface RadicalHunterGameProps {
  onAwardReward: (xp: number, gems: number) => void;
  onExit: () => void;
}

interface RadicalChallenge {
  radical: string;
  name: string;
  meaning: string;
  matches: string[];
  distractors: string[];
}

const RADICAL_ROUNDS: RadicalChallenge[] = [
  {
    radical: '氵',
    name: 'Sanzui',
    meaning: 'Agua / Líquidos',
    matches: ['海', '泳', '池', '酒', '洗', '漢'],
    distractors: ['木', '山', '火', '休', '話', '森', '男', '駅']
  },
  {
    radical: '木',
    name: 'Kihen',
    meaning: 'Árbol / Madera',
    matches: ['林', '森', '休', '本', '校', '村'],
    distractors: ['海', '言', '語', '山', '川', '見', '車', '電']
  },
  {
    radical: '口',
    name: 'Kuchihen',
    meaning: 'Boca / Abertura',
    matches: ['言', '話', '飲', '味', '右', '名'],
    distractors: ['月', '火', '水', '手', '足', '雨', '雪', '花']
  },
  {
    radical: '言 / 訁',
    name: 'Gonben',
    meaning: 'Palabra / Hablar',
    matches: ['話', '語', '読', '記', '計', '試'],
    distractors: ['飲', '飯', '海', '校', '駅', '新', '高', '買']
  },
  {
    radical: '亻 / 人',
    name: 'Ninben',
    meaning: 'Persona',
    matches: ['休', '体', '何', '作', '住', '使'],
    distractors: ['木', '日', '月', '車', '門', '間', '聞', '書']
  },
  {
    radical: '日',
    name: 'Hihen',
    meaning: 'Sol / Día / Tiempo',
    matches: ['明', '時', '早', '春', '暑', '映'],
    distractors: ['海', '森', '話', '飲', '買', '歩', '走', '持']
  },
  {
    radical: '女',
    name: 'Onnahen',
    meaning: 'Mujer / Familia',
    matches: ['好', '妹', '姉', '安', '始', '妻'],
    distractors: ['男', '父', '兄', '弟', '犬', '猫', '鳥', '魚']
  }
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const RadicalHunterGame: React.FC<RadicalHunterGameProps> = ({ onAwardReward, onExit }) => {
  const [rounds, setRounds] = useState<RadicalChallenge[]>(() => shuffle(RADICAL_ROUNDS).slice(0, 5));
  const [idx, setIdx] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrongTapped, setWrongTapped] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = rounds[idx];

  const { grid, targetSet } = useMemo(() => {
    if (!current) return { grid: [] as string[], targetSet: new Set<string>() };
    const chosenMatches = shuffle(current.matches).slice(0, 3);
    const chosenDistractors = shuffle(current.distractors).slice(0, 6);
    return {
      grid: shuffle([...chosenMatches, ...chosenDistractors]),
      targetSet: new Set(chosenMatches)
    };
  }, [current]);

  const restart = () => {
    sound.playTap();
    setRounds(shuffle(RADICAL_ROUNDS).slice(0, 5));
    setIdx(0);
    setFound([]);
    setWrongTapped([]);
    setMistakes(0);
    setFinished(false);
  };

  const handleTapCell = (kanji: string) => {
    if (found.includes(kanji) || wrongTapped.includes(kanji)) return;
    if (targetSet.has(kanji)) {
      sound.playCorrect();
      const nextFound = [...found, kanji];
      setFound(nextFound);
      if (nextFound.length === targetSet.size) {
        window.setTimeout(() => {
          if (idx + 1 >= rounds.length) {
            setFinished(true);
            sound.playLessonComplete();
            const xp = Math.max(15, 40 - mistakes * 3);
            const gems = mistakes <= 2 ? 4 : 2;
            onAwardReward(xp, gems);
          } else {
            setIdx(i => i + 1);
            setFound([]);
            setWrongTapped([]);
          }
        }, 420);
      }
    } else {
      sound.playIncorrect();
      setMistakes(m => m + 1);
      setWrongTapped(prev => [...prev, kanji]);
    }
  };

  if (finished) {
    const xp = Math.max(15, 40 - mistakes * 3);
    const gems = mistakes <= 2 ? 4 : 2;
    return (
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/40 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black text-duo-gray-800 dark:text-white">¡Ojo de Halcón!</h3>
        <p className="text-sm font-bold text-duo-gray-500 dark:text-gray-300">
          Completaste las {rounds.length} cacerías con {mistakes} {mistakes === 1 ? 'error' : 'errores'}.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-duo-green/15 border border-duo-green/30 text-duo-green font-black text-sm">
          <Sparkles className="w-4 h-4" /> +{xp} XP · +{gems} 💎
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={restart}
            className="flex-1 py-3 rounded-2xl bg-duo-green text-white font-black border-b-4 border-duo-green-dark flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Jugar otra vez
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
          <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
            Ronda {idx + 1} / {rounds.length}
          </span>
          <h3 className="text-xl font-black text-duo-gray-800 dark:text-white">🔎 Cazador de Radicales</h3>
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
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a2930] border border-emerald-400/40 flex items-center justify-center text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {current.radical}
              </div>
              <div>
                <div className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                  {current.name} · {current.meaning}
                </div>
                <div className="text-sm font-black text-duo-gray-800 dark:text-white">
                  Encuentra los 3 kanjis con este radical
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
              <Search className="w-3.5 h-3.5" /> {found.length}/3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {grid.map(kanji => {
              const isFound = found.includes(kanji);
              const isWrong = wrongTapped.includes(kanji);
              return (
                <button
                  key={kanji}
                  disabled={isFound || isWrong}
                  onClick={() => handleTapCell(kanji)}
                  className={`py-5 rounded-2xl border-2 border-b-4 text-3xl font-black transition-all cursor-pointer ${
                    isFound
                      ? 'bg-duo-green/15 border-duo-green text-duo-green'
                      : isWrong
                        ? 'bg-red-500/15 border-red-500 text-red-500 opacity-60'
                        : 'bg-white dark:bg-[#1f313b] border-duo-gray-200 dark:border-[#2e4450] hover:border-emerald-500 text-duo-gray-800 dark:text-white active:translate-y-0.5'
                  }`}
                >
                  {kanji}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
