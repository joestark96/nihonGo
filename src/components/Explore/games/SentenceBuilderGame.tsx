import React, { useState, useMemo } from 'react';
import { Volume2, RotateCcw, Trophy, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { sound } from '../../../services/sound';
import { recordMinigameScore } from '../../../utils/gameRecords';

interface SentenceBuilderGameProps {
  onAwardReward: (xp: number, gems: number) => void;
  onExit: () => void;
}

interface SentenceChallenge {
  id: string;
  spanish: string;
  tokens: string[];
  distractor: string;
  audioText: string;
  tip: string;
}

const SENTENCE_POOL: SentenceChallenge[] = [
  {
    id: 'sb-1',
    spanish: 'Soy estudiante.',
    tokens: ['わたし', 'は', 'がくせい', 'です'],
    distractor: 'を',
    audioText: 'わたしはがくせいです',
    tip: '「は」 marca el tema ("yo") y 「です」 cierra la oración.'
  },
  {
    id: 'sb-2',
    spanish: 'Bebo café.',
    tokens: ['コーヒー', 'を', 'のみます'],
    distractor: 'で',
    audioText: 'コーヒーをのみます',
    tip: '「を」 marca el objeto directo de la acción.'
  },
  {
    id: 'sb-3',
    spanish: 'Estudio en la biblioteca.',
    tokens: ['としょかん', 'で', 'べんきょうします'],
    distractor: 'に',
    audioText: 'としょかんでべんきょうします',
    tip: '「で」 indica el lugar donde ocurre una acción.'
  },
  {
    id: 'sb-4',
    spanish: 'Voy a Japón.',
    tokens: ['にほん', 'に', 'いきます'],
    distractor: 'を',
    audioText: 'にほんにいきます',
    tip: '「に」 marca el destino con verbos de movimiento.'
  },
  {
    id: 'sb-5',
    spanish: 'Me levanto a las siete.',
    tokens: ['しちじ', 'に', 'おきます'],
    distractor: 'で',
    audioText: 'しちじにおきます',
    tip: 'Las horas específicas llevan la partícula 「に」.'
  },
  {
    id: 'sb-6',
    spanish: 'Leo un libro en casa.',
    tokens: ['うち', 'で', 'ほん', 'を', 'よみます'],
    distractor: 'に',
    audioText: 'うちでほんをよみます',
    tip: 'Lugar de acción (で) + objeto directo (を) + verbo.'
  },
  {
    id: 'sb-7',
    spanish: 'Mañana no voy a la escuela.',
    tokens: ['あした', 'がっこう', 'に', 'いきません'],
    distractor: 'を',
    audioText: 'あしたがっこうにいきません',
    tip: 'Tiempo relativo (あした) nunca lleva 「に」, pero el destino (がっこう) sí.'
  },
  {
    id: 'sb-8',
    spanish: 'Este libro es interesante.',
    tokens: ['この', 'ほん', 'は', 'おもしろい', 'です'],
    distractor: 'これ',
    audioText: 'このほんはおもしろいです',
    tip: 'Delante de un sustantivo se usa 「この」, nunca 「これ」.'
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

export const SentenceBuilderGame: React.FC<SentenceBuilderGameProps> = ({ onAwardReward, onExit }) => {
  const [rounds, setRounds] = useState<SentenceChallenge[]>(() => shuffle(SENTENCE_POOL).slice(0, 5));
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [checked, setChecked] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = rounds[roundIdx];

  const bankChips = useMemo(() => {
    if (!current) return [];
    return shuffle([...current.tokens, current.distractor]);
  }, [current]);

  const restart = () => {
    sound.playTap();
    setRounds(shuffle(SENTENCE_POOL).slice(0, 5));
    setRoundIdx(0);
    setSelectedIndices([]);
    setChecked(null);
    setCorrectCount(0);
    setFinished(false);
  };

  const handleToggleChip = (idx: number) => {
    if (checked) return;
    sound.playTap();
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleCheck = () => {
    if (!current || selectedIndices.length === 0 || checked) return;
    const built = selectedIndices.map(i => bankChips[i]).join('');
    const target = current.tokens.join('');
    const ok = built === target;
    if (ok) {
      sound.playCorrect();
      sound.speakJapanese(current.audioText, 0.9);
      setCorrectCount(c => c + 1);
      setChecked('correct');
    } else {
      sound.playIncorrect();
      setChecked('wrong');
    }
  };

  const handleNext = () => {
    sound.playTap();
    if (roundIdx + 1 >= rounds.length) {
      setFinished(true);
      sound.playLessonComplete();
      const xp = correctCount * 8 + 10;
      const gems = correctCount >= 4 ? 4 : correctCount >= 2 ? 2 : 0;
      recordMinigameScore('sentence', correctCount);
      onAwardReward(xp, gems);
    } else {
      setRoundIdx(r => r + 1);
      setSelectedIndices([]);
      setChecked(null);
    }
  };

  if (finished) {
    const xp = correctCount * 8 + 10;
    const gems = correctCount >= 4 ? 4 : correctCount >= 2 ? 2 : 0;
    return (
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 border-2 border-amber-400/40 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-2xl font-black text-duo-gray-800 dark:text-white">¡Constructor Completado!</h3>
        <p className="text-sm font-bold text-duo-gray-500 dark:text-gray-300">
          Armaste correctamente {correctCount} de {rounds.length} oraciones.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-duo-green/15 border border-duo-green/30 text-duo-green font-black text-sm">
          <Sparkles className="w-4 h-4" /> +{xp} XP {gems > 0 ? `· +${gems} 💎` : ''}
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={restart}
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
    <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-500">
            Ronda {roundIdx + 1} / {rounds.length}
          </span>
          <h3 className="text-xl font-black text-duo-gray-800 dark:text-white">🧩 Constructor Express</h3>
        </div>
        <button
          onClick={onExit}
          className="text-xs font-extrabold text-duo-gray-400 hover:text-duo-gray-600 dark:hover:text-gray-200 px-3 py-1.5 rounded-xl border border-duo-gray-200 dark:border-[#2c3f49] cursor-pointer"
        >
          Volver
        </button>
      </div>

      {current && (
        <>
          <div className="p-4 rounded-2xl bg-duo-gray-100/80 dark:bg-[#131f24] border border-duo-gray-200 dark:border-[#2c3f49] flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-black uppercase text-duo-gray-400">Traduce al japonés</div>
              <div className="text-lg font-black text-duo-gray-800 dark:text-white">{current.spanish}</div>
            </div>
            <button
              onClick={() => sound.speakJapanese(current.audioText, 0.85)}
              className="p-2.5 rounded-xl bg-duo-blue/10 text-duo-blue border border-duo-blue/30 cursor-pointer"
              title="Escuchar pista"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Zona de construcción */}
          <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-duo-gray-200 dark:border-[#2e4450] flex flex-wrap gap-2 items-center">
            {selectedIndices.length === 0 ? (
              <span className="text-xs font-bold text-duo-gray-400">Toca las piezas abajo en el orden correcto...</span>
            ) : (
              selectedIndices.map(idx => (
                <button
                  key={`sel-${idx}`}
                  onClick={() => handleToggleChip(idx)}
                  className="px-3 py-1.5 rounded-xl bg-duo-blue text-white font-black text-sm border-b-2 border-duo-blue-dark cursor-pointer"
                >
                  {bankChips[idx]}
                </button>
              ))
            )}
          </div>

          {/* Banco de piezas */}
          <div className="flex flex-wrap gap-2 justify-center py-1">
            {bankChips.map((chip, idx) => {
              const used = selectedIndices.includes(idx);
              return (
                <button
                  key={`bank-${idx}`}
                  disabled={used || Boolean(checked)}
                  onClick={() => handleToggleChip(idx)}
                  className={`px-3.5 py-2 rounded-xl border-2 border-b-4 font-black text-sm transition-all cursor-pointer ${
                    used
                      ? 'opacity-25 bg-duo-gray-100 dark:bg-[#131f24] border-duo-gray-200 dark:border-[#2c3f49]'
                      : 'bg-white dark:bg-[#1f313b] border-duo-gray-200 dark:border-[#2e4450] text-duo-gray-800 dark:text-white hover:border-duo-blue'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {checked && (
            <div
              className={`p-3.5 rounded-2xl border-2 text-sm font-bold space-y-1 ${
                checked === 'correct'
                  ? 'bg-duo-green/10 border-duo-green text-duo-green'
                  : 'bg-red-500/10 border-red-500 text-red-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black">
                {checked === 'correct' ? (
                  <><CheckCircle2 className="w-4 h-4" /> ¡Correcto!</>
                ) : (
                  <><XCircle className="w-4 h-4" /> Era: {current.tokens.join('')}</>
                )}
              </div>
              <p className="text-xs text-duo-gray-600 dark:text-gray-300">{current.tip}</p>
            </div>
          )}

          {!checked ? (
            <button
              disabled={selectedIndices.length === 0}
              onClick={handleCheck}
              className={`w-full py-3 rounded-2xl font-black text-sm border-b-4 transition-all cursor-pointer ${
                selectedIndices.length > 0
                  ? 'bg-duo-green text-white border-duo-green-dark active:border-b-0 active:translate-y-1'
                  : 'bg-duo-gray-200 dark:bg-[#23343d] text-duo-gray-400 border-transparent cursor-not-allowed'
              }`}
            >
              COMPROBAR
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl bg-duo-blue text-white font-black text-sm border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 cursor-pointer"
            >
              {roundIdx + 1 >= rounds.length ? 'Ver Resultado' : 'Siguiente Oración 👉'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
