import React, { useState, useMemo } from 'react';
import { Trophy, RotateCcw, Sparkles, Volume2, Flame } from 'lucide-react';
import { kanjiList, KanjiItem } from '../../../data/kanjiData';
import { sound } from '../../../services/sound';
import { recordMinigameScore } from '../../../utils/gameRecords';

interface KanjiDojoGameProps {
  onAwardReward: (xp: number, gems: number) => void;
  onExit: () => void;
}

type DojoLevel = 'N5' | 'N4' | 'N3';
type DojoMode = 'meaning' | 'reading' | 'compound';

interface DojoQuestion {
  promptLabel: string;
  displayMain: string;
  audioText: string;
  correct: string;
  options: string[];
  explanation: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatReading(item: KanjiItem): string {
  const parts = [item.kunyomi, item.onyomi].filter(v => v && v !== '—' && v !== '-');
  return parts.join(' · ') || item.onyomi || item.kunyomi;
}

function buildDojoRound(level: DojoLevel, mode: DojoMode): DojoQuestion[] {
  const pool = kanjiList.filter(k => k.jlptLevel === level);
  const picked = shuffle(pool).slice(0, 10);

  return picked.map(item => {
    if (mode === 'reading') {
      const correct = formatReading(item);
      const distractors = shuffle(pool.filter(k => k.id !== item.id))
        .map(formatReading)
        .filter(r => r && r !== correct)
        .slice(0, 3);
      return {
        promptLabel: '¿Cuál es la lectura de este kanji?',
        displayMain: item.kanji,
        audioText: item.compounds?.[0]?.furigana || item.kunyomi.split('、')[0] || item.kanji,
        correct,
        options: shuffle([correct, ...distractors]),
        explanation: `${item.kanji} = ${item.spanish} (${correct})`
      };
    }

    if (mode === 'compound') {
      const comp = item.compounds?.[0];
      if (comp) {
        const correct = `${comp.furigana} (${comp.meaning})`;
        const otherComps = shuffle(
          pool
            .filter(k => k.id !== item.id && k.compounds && k.compounds.length > 0)
            .map(k => {
              const c = k.compounds![0];
              return `${c.furigana} (${c.meaning})`;
            })
        )
          .filter(v => v !== correct)
          .slice(0, 3);
        return {
          promptLabel: '¿Qué significa y cómo se lee este compuesto?',
          displayMain: comp.word,
          audioText: comp.furigana,
          correct,
          options: shuffle([correct, ...otherComps]),
          explanation: `${comp.word} (${comp.furigana}) = ${comp.meaning}`
        };
      }
    }

    const correct = item.spanish;
    const distractors = shuffle(pool.filter(k => k.id !== item.id))
      .map(k => k.spanish)
      .filter(s => s && s !== correct)
      .slice(0, 3);

    return {
      promptLabel: '¿Qué significa este kanji?',
      displayMain: item.kanji,
      audioText: item.compounds?.[0]?.furigana || item.kanji,
      correct,
      options: shuffle([correct, ...distractors]),
      explanation: `${item.kanji} = ${item.spanish} (${formatReading(item)})`
    };
  });
}

export const KanjiDojoGame: React.FC<KanjiDojoGameProps> = ({ onAwardReward, onExit }) => {
  const [level, setLevel] = useState<DojoLevel>('N5');
  const [mode, setMode] = useState<DojoMode>('meaning');
  const [phase, setPhase] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [questions, setQuestions] = useState<DojoQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<DojoQuestion[]>([]);

  const current = questions[idx];

  const start = () => {
    sound.playTap();
    setQuestions(buildDojoRound(level, mode));
    setIdx(0);
    setSelected(null);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setMissedQuestions([]);
    setPhase('playing');
  };

  const startMistakeReview = () => {
    if (missedQuestions.length === 0) return;
    sound.playTap();
    setQuestions(shuffle(missedQuestions));
    setIdx(0);
    setSelected(null);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setMissedQuestions([]);
    setPhase('playing');
  };

  const earnedXp = useMemo(() => correctCount * 4 + bestStreak * 2, [correctCount, bestStreak]);
  const earnedGems = useMemo(() => (correctCount >= 8 ? 5 : correctCount >= 5 ? 2 : 0), [correctCount]);

  const handlePick = (opt: string) => {
    if (!current || selected) return;
    setSelected(opt);
    const ok = opt === current.correct;
    if (ok) {
      sound.playCorrect();
      sound.speakJapanese(current.audioText, 0.9);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak(b => Math.max(b, nextStreak));
      setCorrectCount(c => c + 1);
    } else {
      sound.playIncorrect();
      setStreak(0);
      setMissedQuestions(prev => [...prev, current]);
    }
  };

  const handleNext = () => {
    sound.playTap();
    if (idx + 1 >= questions.length) {
      setPhase('finished');
      sound.playLessonComplete();
      if (correctCount > 0) {
        recordMinigameScore('kanji-dojo', correctCount);
        onAwardReward(earnedXp, earnedGems);
      }
    } else {
      setIdx(i => i + 1);
      setSelected(null);
    }
  };

  if (phase === 'ready') {
    return (
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-500">10 Kanjis · Racha</span>
            <h3 className="text-2xl font-black text-duo-gray-800 dark:text-white">⛩️ Kanji Dojo</h3>
          </div>
          <button
            onClick={onExit}
            className="text-xs font-extrabold text-duo-gray-400 px-3 py-1.5 rounded-xl border border-duo-gray-200 dark:border-[#2c3f49] cursor-pointer"
          >
            Volver
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-black uppercase text-duo-gray-400">Nivel JLPT</div>
          <div className="grid grid-cols-3 gap-2">
            {(['N5', 'N4', 'N3'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => { sound.playTap(); setLevel(lvl); }}
                className={`py-2.5 rounded-2xl border-2 font-black text-sm cursor-pointer ${
                  level === lvl
                    ? 'border-rose-500 bg-rose-500/15 text-rose-500'
                    : 'border-duo-gray-200 dark:border-[#2c3f49] text-duo-gray-600 dark:text-gray-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-black uppercase text-duo-gray-400">Modo de reto</div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'meaning', label: 'Significado', sample: '木 → Árbol' },
              { id: 'reading', label: 'Lectura', sample: '木 → き' },
              { id: 'compound', label: 'Compuestos', sample: '日本' }
            ] as const).map(m => (
              <button
                key={m.id}
                onClick={() => { sound.playTap(); setMode(m.id); }}
                className={`p-2.5 rounded-2xl border-2 text-center cursor-pointer ${
                  mode === m.id
                    ? 'border-duo-blue bg-duo-blue/10 text-duo-blue'
                    : 'border-duo-gray-200 dark:border-[#2c3f49] text-duo-gray-600 dark:text-gray-300'
                }`}
              >
                <div className="text-xs font-black">{m.label}</div>
                <div className="text-[10px] font-bold opacity-75 mt-0.5">{m.sample}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={start}
          className="w-full py-3.5 rounded-2xl bg-duo-green text-white font-black text-base border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-1 cursor-pointer"
        >
          ¡Entrar al Dojo!
        </button>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border-2 border-rose-400/40 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-2xl font-black text-duo-gray-800 dark:text-white">¡Duelo Terminado!</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-duo-gray-100 dark:bg-[#131f24]">
            <div className="text-lg font-black text-duo-green">{correctCount}/{questions.length}</div>
            <div className="text-[11px] font-bold text-duo-gray-400">Aciertos</div>
          </div>
          <div className="p-3 rounded-2xl bg-duo-gray-100 dark:bg-[#131f24]">
            <div className="text-lg font-black text-amber-500">{bestStreak}</div>
            <div className="text-[11px] font-bold text-duo-gray-400">Mejor Racha</div>
          </div>
        </div>
        {correctCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-duo-green/15 border border-duo-green/30 text-duo-green font-black text-sm">
            <Sparkles className="w-4 h-4" /> +{earnedXp} XP {earnedGems > 0 ? `· +${earnedGems} 💎` : ''}
          </div>
        )}
        {missedQuestions.length > 0 && (
          <button
            onClick={startMistakeReview}
            className="w-full py-2.5 rounded-2xl bg-amber-500/15 border-2 border-amber-400/40 text-amber-600 dark:text-amber-300 font-black text-sm cursor-pointer"
          >
            🔁 Repasar {missedQuestions.length} {missedQuestions.length === 1 ? 'fallado' : 'fallados'}
          </button>
        )}
        <div className="flex gap-2 pt-2">
          <button
            onClick={start}
            className="flex-1 py-3 rounded-2xl bg-duo-green text-white font-black border-b-4 border-duo-green-dark flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Repetir
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
        <span className="text-xs font-black text-rose-500 uppercase">
          {level} · {idx + 1}/10
        </span>
        {streak >= 2 && (
          <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-500">
            <Flame className="w-3.5 h-3.5" /> Racha {streak}
          </span>
        )}
      </div>

      {current && (
        <>
          <div className="text-center py-6 rounded-3xl bg-duo-gray-100/70 dark:bg-[#131f24] border border-duo-gray-200 dark:border-[#2c3f49]">
            <div className="text-xs font-bold text-duo-gray-400 mb-2">{current.promptLabel}</div>
            <div className="text-6xl font-black text-duo-gray-800 dark:text-white">{current.displayMain}</div>
            <button
              onClick={() => sound.speakJapanese(current.audioText, 0.9)}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-[#1e2f38] border border-duo-gray-200 dark:border-[#2c3f49] text-xs font-bold text-duo-blue cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" /> Escuchar
            </button>
          </div>

          <div className="space-y-2">
            {current.options.map(opt => {
              const isSelected = selected === opt;
              const isCorrect = opt === current.correct;
              let cls =
                'border-duo-gray-200 dark:border-[#2e4450] bg-white dark:bg-[#1f313b] text-duo-gray-800 dark:text-white';
              if (selected) {
                if (isCorrect) cls = 'border-duo-green bg-duo-green/15 text-duo-green';
                else if (isSelected) cls = 'border-red-500 bg-red-500/15 text-red-500';
              }
              return (
                <button
                  key={opt}
                  disabled={Boolean(selected)}
                  onClick={() => handlePick(opt)}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left text-sm font-black transition-all cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 text-center">
                {current.explanation}
              </div>
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-2xl bg-duo-blue text-white font-black text-sm border-b-4 border-duo-blue-dark cursor-pointer"
              >
                {idx + 1 >= questions.length ? 'Ver Resultado' : 'Siguiente 👉'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
