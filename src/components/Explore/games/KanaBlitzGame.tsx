import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Timer, Zap, RotateCcw, Volume2, Trophy, Sparkles } from 'lucide-react';
import { gojuonKanaList } from '../../../data/kanaTableData';
import { sound } from '../../../services/sound';
import { recordMinigameScore } from '../../../utils/gameRecords';

interface KanaBlitzGameProps {
  onAwardReward: (xp: number, gems: number) => void;
  onExit: () => void;
}

type KanaScriptMode = 'hiragana' | 'katakana' | 'mixed';

interface BlitzQuestion {
  kana: string;
  romaji: string;
  options: string[];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const KanaBlitzGame: React.FC<KanaBlitzGameProps> = ({ onAwardReward, onExit }) => {
  const [mode, setMode] = useState<KanaScriptMode>('hiragana');
  const [phase, setPhase] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [question, setQuestion] = useState<BlitzQuestion | null>(null);
  const [rewarded, setRewarded] = useState(false);

  const buildQuestion = useCallback((scriptMode: KanaScriptMode): BlitzQuestion => {
    const item = pickRandom(gojuonKanaList);
    const useKata = scriptMode === 'katakana' || (scriptMode === 'mixed' && Math.random() > 0.5);
    const kana = useKata ? item.kata : item.hira;
    const distractors: string[] = [];
    while (distractors.length < 3) {
      const cand = pickRandom(gojuonKanaList).romaji;
      if (cand !== item.romaji && !distractors.includes(cand)) {
        distractors.push(cand);
      }
    }
    return {
      kana,
      romaji: item.romaji,
      options: shuffle([item.romaji, ...distractors])
    };
  }, []);

  const startGame = () => {
    sound.playTap();
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setTimeLeft(45);
    setFeedback(null);
    setRewarded(false);
    setQuestion(buildQuestion(mode));
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setPhase('finished');
      sound.playLessonComplete();
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, timeLeft]);

  const earnedXp = useMemo(() => Math.min(60, Math.max(5, Math.round(score / 10))), [score]);
  const earnedGems = useMemo(() => (correctCount >= 10 ? 5 : correctCount >= 5 ? 2 : 0), [correctCount]);

  useEffect(() => {
    if (phase === 'finished' && !rewarded && correctCount > 0) {
      setRewarded(true);
      recordMinigameScore('kana-blitz', score);
      onAwardReward(earnedXp, earnedGems);
    }
  }, [phase, rewarded, correctCount, score, earnedXp, earnedGems, onAwardReward]);

  const handleAnswer = (choice: string) => {
    if (!question || phase !== 'playing') return;
    if (choice === question.romaji) {
      sound.playCorrect();
      const nextCombo = combo + 1;
      const multiplier = Math.min(4, 1 + Math.floor(nextCombo / 4));
      setCombo(nextCombo);
      setBestCombo(b => Math.max(b, nextCombo));
      setCorrectCount(c => c + 1);
      setScore(s => s + 10 * multiplier);
      setFeedback('correct');
    } else {
      sound.playIncorrect();
      setCombo(0);
      setFeedback('wrong');
    }

    window.setTimeout(() => {
      setFeedback(null);
      setQuestion(buildQuestion(mode));
    }, 180);
  };

  if (phase === 'ready') {
    return (
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-duo-blue">Contrarreloj 45s</span>
            <h3 className="text-2xl font-black text-duo-gray-800 dark:text-white">⚡ Kana Blitz</h3>
          </div>
          <button
            onClick={onExit}
            className="text-xs font-extrabold text-duo-gray-400 hover:text-duo-gray-600 dark:hover:text-gray-200 px-3 py-1.5 rounded-xl border border-duo-gray-200 dark:border-[#2c3f49] cursor-pointer"
          >
            Volver
          </button>
        </div>

        <p className="text-sm font-bold text-duo-gray-600 dark:text-gray-300">
          Identifica la lectura correcta antes de que acabe el tiempo. ¡Los combos multiplican tus puntos y te dan XP y gemas!
        </p>

        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'hiragana', label: 'Hiragana', sample: 'あ' },
            { id: 'katakana', label: 'Katakana', sample: 'ア' },
            { id: 'mixed', label: 'Mixto', sample: 'あア' }
          ] as const).map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                sound.playTap();
                setMode(opt.id);
              }}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                mode === opt.id
                  ? 'border-duo-blue bg-duo-blue/10 text-duo-blue'
                  : 'border-duo-gray-200 dark:border-[#2c3f49] text-duo-gray-600 dark:text-gray-300'
              }`}
            >
              <div className="text-xl font-black mb-0.5">{opt.sample}</div>
              <div className="text-xs font-extrabold">{opt.label}</div>
            </button>
          ))}
        </div>

        <button
          onClick={startGame}
          className="w-full py-3.5 rounded-2xl bg-duo-green text-white font-black text-base border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
        >
          ¡Empezar Reto!
        </button>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 border-2 border-amber-400/40 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-2xl font-black text-duo-gray-800 dark:text-white">¡Tiempo agotado!</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-duo-gray-100 dark:bg-[#131f24]">
            <div className="text-lg font-black text-duo-blue">{score}</div>
            <div className="text-[11px] font-bold text-duo-gray-400">Puntos</div>
          </div>
          <div className="p-3 rounded-2xl bg-duo-gray-100 dark:bg-[#131f24]">
            <div className="text-lg font-black text-duo-green">{correctCount}</div>
            <div className="text-[11px] font-bold text-duo-gray-400">Aciertos</div>
          </div>
          <div className="p-3 rounded-2xl bg-duo-gray-100 dark:bg-[#131f24]">
            <div className="text-lg font-black text-amber-500">{bestCombo}x</div>
            <div className="text-[11px] font-bold text-duo-gray-400">Mejor Combo</div>
          </div>
        </div>

        {correctCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-duo-green/15 border border-duo-green/30 text-duo-green font-black text-sm">
            <Sparkles className="w-4 h-4" />
            +{earnedXp} XP {earnedGems > 0 ? `· +${earnedGems} 💎` : ''}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={startGame}
            className="flex-1 py-3 rounded-2xl bg-duo-green text-white font-black border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
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
    <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 font-black text-sm px-3 py-1 rounded-xl ${timeLeft <= 10 ? 'bg-red-500/15 text-red-500 animate-pulse' : 'bg-duo-blue/10 text-duo-blue'}`}>
          <Timer className="w-4 h-4" /> {timeLeft}s
        </div>
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <span className="flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-500">
              <Zap className="w-3.5 h-3.5" /> {combo} combo
            </span>
          )}
          <span className="font-black text-base text-duo-gray-800 dark:text-white">{score} pts</span>
        </div>
      </div>

      {question && (
        <>
          <div
            className={`relative py-8 rounded-3xl border-2 flex flex-col items-center justify-center transition-colors ${
              feedback === 'correct'
                ? 'bg-duo-green/15 border-duo-green'
                : feedback === 'wrong'
                  ? 'bg-red-500/15 border-red-500'
                  : 'bg-duo-gray-100/70 dark:bg-[#131f24] border-duo-gray-200 dark:border-[#2c3f49]'
            }`}
          >
            <div className="text-7xl font-black text-duo-gray-800 dark:text-white select-none">
              {question.kana}
            </div>
            <button
              onClick={() => sound.speakJapanese(question.kana, 0.9)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-[#1e2f38] border border-duo-gray-200 dark:border-[#2c3f49] text-xs font-bold text-duo-blue cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" /> Escuchar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {question.options.map(opt => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="py-4 rounded-2xl bg-white dark:bg-[#1f313b] border-2 border-b-4 border-duo-gray-200 dark:border-[#2e4450] hover:border-duo-blue text-xl font-black text-duo-gray-800 dark:text-white active:translate-y-0.5 transition-all cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
