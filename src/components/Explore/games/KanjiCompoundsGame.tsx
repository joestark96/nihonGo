import React, { useState, useMemo } from 'react';
import { RotateCcw, Trophy, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../../../services/sound';

interface KanjiCompoundsGameProps {
  onAwardReward: (xp: number, gems: number) => void;
  onExit: () => void;
}

interface JukugoItem {
  word: string;
  parts: [string, string];
  furigana: string;
  meaning: string;
}

const JUKUGO_POOL: JukugoItem[] = [
  { word: '日本', parts: ['日', '本'], furigana: 'にほん', meaning: 'Japón' },
  { word: '学生', parts: ['学', '生'], furigana: 'がくせい', meaning: 'Estudiante' },
  { word: '先生', parts: ['先', '生'], furigana: 'せんせい', meaning: 'Profesor / Maestro' },
  { word: '大学', parts: ['大', '学'], furigana: 'だいがく', meaning: 'Universidad' },
  { word: '電車', parts: ['電', '車'], furigana: 'でんしゃ', meaning: 'Tren eléctrico' },
  { word: '電話', parts: ['電', '話'], furigana: 'でんわ', meaning: 'Teléfono' },
  { word: '毎日', parts: ['毎', '日'], furigana: 'まいにち', meaning: 'Todos los días' },
  { word: '今日', parts: ['今', '日'], furigana: 'きょう', meaning: 'Hoy' },
  { word: '時間', parts: ['時', '間'], furigana: 'じかん', meaning: 'Tiempo / Hora' },
  { word: '友達', parts: ['友', '達'], furigana: 'ともだち', meaning: 'Amigo' },
  { word: '天気', parts: ['天', '気'], furigana: 'てんき', meaning: 'Clima' },
  { word: '元気', parts: ['元', '気'], furigana: 'げんき', meaning: 'Con energía / Saludable' },
  { word: '外国', parts: ['外', '国'], furigana: 'がいこく', meaning: 'País extranjero' },
  { word: '会社', parts: ['会', '社'], furigana: 'かいしゃ', meaning: 'Empresa' },
  { word: '病院', parts: ['病', '院'], furigana: 'びょういん', meaning: 'Hospital' },
  { word: '音楽', parts: ['音', '楽'], furigana: 'おんがく', meaning: 'Música' }
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const KanjiCompoundsGame: React.FC<KanjiCompoundsGameProps> = ({ onAwardReward, onExit }) => {
  const [rounds, setRounds] = useState<JukugoItem[]>(() => shuffle(JUKUGO_POOL).slice(0, 6));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = rounds[idx];

  const tileOptions = useMemo(() => {
    if (!current) return [];
    const extras = shuffle(
      Array.from(new Set(JUKUGO_POOL.flatMap(j => j.parts))).filter(
        k => !current.parts.includes(k)
      )
    ).slice(0, 6);
    return shuffle([...current.parts, ...extras]);
  }, [current]);

  const restart = () => {
    sound.playTap();
    setRounds(shuffle(JUKUGO_POOL).slice(0, 6));
    setIdx(0);
    setPicked([]);
    setStatus('idle');
    setScore(0);
    setFinished(false);
  };

  const handleSelectKanji = (kanji: string) => {
    if (!current || status !== 'idle' || picked.length >= 2) return;
    sound.playTap();
    const next = [...picked, kanji];
    setPicked(next);

    if (next.length === 2) {
      const formed = next.join('');
      if (formed === current.word) {
        sound.playCorrect();
        sound.speakJapanese(current.furigana, 0.9);
        setStatus('correct');
        setScore(s => s + 1);
      } else {
        sound.playIncorrect();
        setStatus('wrong');
      }
    }
  };

  const handleNext = () => {
    sound.playTap();
    if (idx + 1 >= rounds.length) {
      setFinished(true);
      sound.playLessonComplete();
      if (score > 0) {
        onAwardReward(score * 6 + 10, score >= 5 ? 4 : 2);
      }
    } else {
      setIdx(i => i + 1);
      setPicked([]);
      setStatus('idle');
    }
  };

  if (finished) {
    return (
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/15 border-2 border-indigo-400/40 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-2xl font-black text-duo-gray-800 dark:text-white">¡Fábrica Completada!</h3>
        <p className="text-sm font-bold text-duo-gray-500 dark:text-gray-300">
          Formaste {score} de {rounds.length} palabras compuestas.
        </p>
        {score > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-duo-green/15 border border-duo-green/30 text-duo-green font-black text-sm">
            <Sparkles className="w-4 h-4" /> +{score * 6 + 10} XP · +{score >= 5 ? 4 : 2} 💎
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
          <span className="text-xs font-black uppercase tracking-wider text-indigo-500">
            Compuesto {idx + 1} / {rounds.length}
          </span>
          <h3 className="text-xl font-black text-duo-gray-800 dark:text-white">🏭 Fábrica de Compuestos</h3>
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
          <div className="p-4 rounded-2xl bg-duo-gray-100/80 dark:bg-[#131f24] border border-duo-gray-200 dark:border-[#2c3f49] text-center space-y-2">
            <div className="text-[11px] font-black uppercase text-duo-gray-400">Combina 2 kanjis para formar:</div>
            <div className="text-xl font-black text-duo-gray-800 dark:text-white">{current.meaning}</div>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[0, 1].map(slot => (
                <div
                  key={slot}
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-black ${
                    status === 'correct'
                      ? 'border-duo-green bg-duo-green/15 text-duo-green'
                      : status === 'wrong'
                        ? 'border-red-500 bg-red-500/15 text-red-500'
                        : 'border-dashed border-duo-gray-300 dark:border-[#3b5260] bg-white dark:bg-[#1a2930] text-duo-gray-800 dark:text-white'
                  }`}
                >
                  {picked[slot] || '?'}
                </div>
              ))}
            </div>
            {status !== 'idle' && (
              <div className="pt-1 flex items-center justify-center gap-2 text-xs font-black">
                <span className={status === 'correct' ? 'text-duo-green' : 'text-red-500'}>
                  {current.word} ({current.furigana})
                </span>
                <button
                  onClick={() => sound.speakJapanese(current.furigana, 0.9)}
                  className="p-1 rounded-lg bg-duo-blue/15 text-duo-blue cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {tileOptions.map((kanji, tIdx) => (
              <button
                key={`${kanji}-${tIdx}`}
                disabled={status !== 'idle'}
                onClick={() => handleSelectKanji(kanji)}
                className="py-3.5 rounded-2xl bg-white dark:bg-[#1f313b] border-2 border-b-4 border-duo-gray-200 dark:border-[#2e4450] hover:border-indigo-500 text-2xl font-black text-duo-gray-800 dark:text-white active:translate-y-0.5 cursor-pointer"
              >
                {kanji}
              </button>
            ))}
          </div>

          {status !== 'idle' && (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-duo-blue text-white font-black text-sm border-b-4 border-duo-blue-dark cursor-pointer"
            >
              {idx + 1 >= rounds.length ? 'Ver Resultado' : 'Siguiente Palabra 👉'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
