import React, { useState } from 'react';
import { Zap, Layers, Puzzle, Sparkles, Flame, Factory, Search, PenTool, Trophy } from 'lucide-react';
import { sound } from '../../services/sound';
import { getMinigameRecords, MinigameId } from '../../utils/gameRecords';
import { KanaBlitzGame } from './games/KanaBlitzGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { SentenceBuilderGame } from './games/SentenceBuilderGame';
import { KanjiDojoGame } from './games/KanjiDojoGame';
import { KanjiCompoundsGame } from './games/KanjiCompoundsGame';
import { RadicalHunterGame } from './games/RadicalHunterGame';
import { KanjiBlindDrawGame } from './games/KanjiBlindDrawGame';

interface ExplorePageProps {
  onAwardReward: (xp: number, gems: number) => void;
}

type ActiveGame = null | MinigameId;

export const ExplorePage: React.FC<ExplorePageProps> = ({ onAwardReward }) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const records = getMinigameRecords();

  const renderRecordBadge = (id: MinigameId, suffix: string) => {
    const val = records[id];
    if (val === undefined) return null;
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300 mt-1">
        <Trophy className="w-3 h-3" /> Récord: {val} {suffix}
      </span>
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-duo-gray-800 dark:text-white tracking-tight">
            Minijuegos Arcade
          </h2>
          <p className="text-xs font-bold text-duo-gray-400">
            Practica kana, vocabulario, gramática y kanji jugando
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-500 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" /> Gana XP
        </span>
      </div>

      {activeGame === 'kana-blitz' ? (
        <KanaBlitzGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : activeGame === 'memory' ? (
        <MemoryMatchGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : activeGame === 'sentence' ? (
        <SentenceBuilderGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : activeGame === 'kanji-dojo' ? (
        <KanjiDojoGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : activeGame === 'kanji-compounds' ? (
        <KanjiCompoundsGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : activeGame === 'radical-hunter' ? (
        <RadicalHunterGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : activeGame === 'kanji-draw' ? (
        <KanjiBlindDrawGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-duo-gray-400 px-1">
              Kana, Vocabulario y Gramática
            </div>

            <button
              onClick={() => {
                sound.playTap();
                setActiveGame('kana-blitz');
              }}
              className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-duo-blue rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-duo-blue/15 border border-duo-blue/30 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-duo-blue" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-duo-gray-800 dark:text-white">Kana Blitz</h3>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-duo-blue/15 text-duo-blue">
                    45 seg
                  </span>
                </div>
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 mt-0.5">
                  Contrarreloj de Hiragana y Katakana con multiplicador de combos.
                </p>
                {renderRecordBadge('kana-blitz', 'pts')}
              </div>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setActiveGame('memory');
              }}
              className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-duo-purple rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-duo-purple/15 border border-duo-purple/30 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6 text-duo-purple" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-duo-gray-800 dark:text-white">Parejas Rápidas</h3>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-duo-purple/15 text-duo-purple">
                    Vocabulario
                  </span>
                </div>
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 mt-0.5">
                  Une 6 parejas japonés ↔ español escuchando cada palabra al tocarla.
                </p>
                {renderRecordBadge('memory', 'intentos')}
              </div>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setActiveGame('sentence');
              }}
              className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-amber-500 rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Puzzle className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-duo-gray-800 dark:text-white">Constructor Express</h3>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-500">
                    Partículas
                  </span>
                </div>
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 mt-0.5">
                  Ordena 5 oraciones clave esquivando partículas trampa.
                </p>
                {renderRecordBadge('sentence', '/ 5')}
              </div>
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-rose-500 px-1">
              Juegos de Kanji (漢字)
            </div>

            <button
              onClick={() => {
                sound.playTap();
                setActiveGame('kanji-dojo');
              }}
              className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-rose-500 rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-duo-gray-800 dark:text-white">Kanji Dojo</h3>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-500">
                    N5 – N3
                  </span>
                </div>
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 mt-0.5">
                  Duelo de 10 kanjis por significado, lectura o palabra compuesta.
                </p>
                {renderRecordBadge('kanji-dojo', '/ 10')}
              </div>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setActiveGame('kanji-compounds');
              }}
              className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-indigo-500 rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center shrink-0">
                <Factory className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-duo-gray-800 dark:text-white">Fábrica de Compuestos</h3>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-500">
                    Jukugo
                  </span>
                </div>
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 mt-0.5">
                  Combina 2 kanjis (ej. 学 + 生 = 学生) para formar palabras reales.
                </p>
                {renderRecordBadge('kanji-compounds', '/ 6')}
              </div>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setActiveGame('radical-hunter');
              }}
              className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-emerald-500 rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-duo-gray-800 dark:text-white">Cazador de Radicales</h3>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-500">
                    Visual
                  </span>
                </div>
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 mt-0.5">
                  Encuentra los 3 kanjis que comparten un radical (氵, 木, 口...).
                </p>
                {renderRecordBadge('radical-hunter', 'XP')}
              </div>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setActiveGame('kanji-draw');
              }}
              className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-sky-500 rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center shrink-0">
                <PenTool className="w-6 h-6 text-sky-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-duo-gray-800 dark:text-white">Dibuja a Ciegas</h3>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-500">
                    Trazos
                  </span>
                </div>
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 mt-0.5">
                  Traza el kanji de memoria siguiendo solo su significado y lectura.
                </p>
                {renderRecordBadge('kanji-draw', '/ 5')}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
