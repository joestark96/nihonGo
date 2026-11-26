import React, { useState } from 'react';
import { Gamepad2, MapPin, Zap, Layers, Puzzle, Sparkles } from 'lucide-react';
import { sound } from '../../services/sound';
import { KanaBlitzGame } from './games/KanaBlitzGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { SentenceBuilderGame } from './games/SentenceBuilderGame';
import { JapanMapView } from './JapanMapView';

interface ExplorePageProps {
  onAwardReward: (xp: number, gems: number) => void;
}

type ExploreSubTab = 'games' | 'map';
type ActiveGame = null | 'kana-blitz' | 'memory' | 'sentence';

export const ExplorePage: React.FC<ExplorePageProps> = ({ onAwardReward }) => {
  const [subTab, setSubTab] = useState<ExploreSubTab>('games');
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-4">
      {/* Header + Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-duo-gray-800 dark:text-white tracking-tight">
            Explorar Japón
          </h2>
          <p className="text-xs font-bold text-duo-gray-400">
            Minijuegos arcade y ruta interactiva de sellos
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-500 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" /> Gana XP
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-duo-gray-100 dark:bg-[#18272e] border border-duo-gray-200 dark:border-[#283842]">
        <button
          onClick={() => {
            sound.playTap();
            setSubTab('games');
          }}
          className={`py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'games'
              ? 'bg-white dark:bg-[#233741] text-duo-blue shadow-sm'
              : 'text-duo-gray-500 dark:text-gray-400'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> Minijuegos
        </button>
        <button
          onClick={() => {
            sound.playTap();
            setSubTab('map');
            setActiveGame(null);
          }}
          className={`py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'map'
              ? 'bg-white dark:bg-[#233741] text-rose-500 shadow-sm'
              : 'text-duo-gray-500 dark:text-gray-400'
          }`}
        >
          <MapPin className="w-4 h-4" /> Mapa de Japón
        </button>
      </div>

      {subTab === 'map' ? (
        <JapanMapView onAwardReward={onAwardReward} />
      ) : activeGame === 'kana-blitz' ? (
        <KanaBlitzGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : activeGame === 'memory' ? (
        <MemoryMatchGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : activeGame === 'sentence' ? (
        <SentenceBuilderGame onAwardReward={onAwardReward} onExit={() => setActiveGame(null)} />
      ) : (
        <div className="space-y-3">
          {/* Card 1: Kana Blitz */}
          <button
            onClick={() => {
              sound.playTap();
              setActiveGame('kana-blitz');
            }}
            className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-duo-blue rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-duo-blue/15 border border-duo-blue/30 flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-duo-blue" />
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
            </div>
          </button>

          {/* Card 2: Parejas Rápidas */}
          <button
            onClick={() => {
              sound.playTap();
              setActiveGame('memory');
            }}
            className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-duo-purple rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-duo-purple/15 border border-duo-purple/30 flex items-center justify-center shrink-0">
              <Layers className="w-7 h-7 text-duo-purple" />
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
            </div>
          </button>

          {/* Card 3: Constructor Express */}
          <button
            onClick={() => {
              sound.playTap();
              setActiveGame('sentence');
            }}
            className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-amber-500 rounded-3xl p-4 flex items-center gap-4 transition-all active:translate-y-0.5 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Puzzle className="w-7 h-7 text-amber-500" />
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
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
