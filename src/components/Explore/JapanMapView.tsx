import React, { useState, useEffect } from 'react';
import { Lock, Volume2, Stamp, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import japanMap from '@svg-maps/japan';
import { JAPAN_REGIONS, JapanRegion } from '../../data/japanMapData';
import { sound } from '../../services/sound';

interface SvgMapLocation {
  id: string;
  name: string;
  path: string;
}

const mapLocations = (japanMap as { locations: SvgMapLocation[] }).locations;

interface JapanMapViewProps {
  onAwardReward: (xp: number, gems: number) => void;
}

const STAMPS_STORAGE_KEY = 'nihongo_japan_stamps_v1';

function loadStampedIds(): string[] {
  try {
    const raw = localStorage.getItem(STAMPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const JapanMapView: React.FC<JapanMapViewProps> = ({ onAwardReward }) => {
  const [stampedIds, setStampedIds] = useState<string[]>(loadStampedIds);
  const [selectedId, setSelectedId] = useState<string>('kanto');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [challengeError, setChallengeError] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STAMPS_STORAGE_KEY, JSON.stringify(stampedIds));
    } catch {
      // ignore storage quota errors
    }
  }, [stampedIds]);

  const isRegionUnlocked = (region: JapanRegion): boolean => {
    if (region.order === 1) return true;
    const prevRegion = JAPAN_REGIONS.find(r => r.order === region.order - 1);
    return prevRegion ? stampedIds.includes(prevRegion.id) : false;
  };

  const selectedRegion = JAPAN_REGIONS.find(r => r.id === selectedId) || JAPAN_REGIONS[0];
  const isSelectedStamped = stampedIds.includes(selectedRegion.id);
  const isSelectedUnlocked = isRegionUnlocked(selectedRegion);

  const handleSelectRegion = (region: JapanRegion) => {
    sound.playTap();
    setSelectedId(region.id);
    setSelectedOption(null);
    setChallengeError(false);
    setJustUnlocked(null);
    if (isRegionUnlocked(region)) {
      sound.speakJapanese(region.cityJapanese, 0.9);
    }
  };

  const handleAnswerChallenge = (idx: number) => {
    if (!isSelectedUnlocked || isSelectedStamped) return;
    setSelectedOption(idx);
    if (idx === selectedRegion.challenge.correctIndex) {
      sound.playCorrect();
      sound.playLessonComplete();
      setChallengeError(false);
      setStampedIds(prev => (prev.includes(selectedRegion.id) ? prev : [...prev, selectedRegion.id]));
      setJustUnlocked(selectedRegion.id);
      onAwardReward(25, 5);
    } else {
      sound.playIncorrect();
      setChallengeError(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progreso de Sellos Eki */}
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-xl">
            🗾
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-rose-500">
              8 Regiones · Ciudades Clave
            </div>
            <div className="text-base font-black text-duo-gray-800 dark:text-white">
              {stampedIds.length} / {JAPAN_REGIONS.length} Sellos (駅スタンプ)
            </div>
          </div>
        </div>
        <div className="flex -space-x-1">
          {JAPAN_REGIONS.map(r => (
            <span
              key={r.id}
              title={r.stampTitle}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white dark:border-[#1a2930] ${
                stampedIds.includes(r.id)
                  ? 'bg-amber-400/25 scale-100'
                  : 'bg-duo-gray-200 dark:bg-[#23343d] opacity-40 grayscale'
              }`}
            >
              {r.stampEmoji}
            </span>
          ))}
        </div>
      </div>

      {/* Mapa SVG interactivo */}
      <div className="bg-gradient-to-b from-sky-100 to-blue-100/80 dark:from-[#0e2431] dark:to-[#132e3d] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between px-2 pt-1 mb-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-300">
            <Compass className="w-3.5 h-3.5" /> Toca una región para explorar
          </span>
          <span className="text-[11px] font-bold text-sky-800/70 dark:text-sky-300/70">日本地図</span>
        </div>

        <svg
          viewBox="30 0 412 430"
          className="w-full h-auto select-none drop-shadow-sm"
          role="img"
          aria-label="Mapa interactivo de las regiones de Japón"
        >
          {/* Regiones geográficas reales (47 prefecturas agrupadas en 8 regiones) */}
          {JAPAN_REGIONS.map(region => {
            const unlocked = isRegionUnlocked(region);
            const stamped = stampedIds.includes(region.id);
            const isSelected = region.id === selectedId;
            const prefLocations = mapLocations.filter(loc =>
              region.prefectureIds.includes(loc.id)
            );

            return (
              <g
                key={region.id}
                onClick={() => handleSelectRegion(region)}
                className="cursor-pointer"
              >
                {prefLocations.map(loc => (
                  <path
                    key={loc.id}
                    d={loc.path}
                    fill={
                      !unlocked
                        ? '#cbd5e1'
                        : stamped
                          ? region.accentColor
                          : isSelected
                            ? region.accentColor
                            : '#ffffff'
                    }
                    fillOpacity={!unlocked ? 0.6 : stamped ? 0.85 : isSelected ? 0.72 : 0.95}
                    stroke={isSelected ? '#f59e0b' : unlocked ? region.accentColor : '#64748b'}
                    strokeWidth={isSelected ? 1.5 : 0.85}
                    strokeLinejoin="round"
                  />
                ))}
              </g>
            );
          })}

          {/* Líneas de ruta Shinkansen entre regiones */}
          {JAPAN_REGIONS.slice(0, -1).map((reg, i) => {
            const next = JAPAN_REGIONS[i + 1];
            const unlocked = isRegionUnlocked(next);
            return (
              <line
                key={`route-${reg.id}-${next.id}`}
                x1={reg.pinX}
                y1={reg.pinY}
                x2={next.pinX}
                y2={next.pinY}
                stroke={unlocked ? '#58cc02' : '#94a3b8'}
                strokeWidth="2.2"
                strokeDasharray={unlocked ? '0' : '4 4'}
                strokeOpacity={unlocked ? 0.8 : 0.5}
              />
            );
          })}

          {/* Pines, sellos y etiquetas de las 8 regiones */}
          {JAPAN_REGIONS.map(region => {
            const unlocked = isRegionUnlocked(region);
            const stamped = stampedIds.includes(region.id);
            const isSelected = region.id === selectedId;

            return (
              <g
                key={`pin-${region.id}`}
                onClick={() => handleSelectRegion(region)}
                className="cursor-pointer"
              >
                <circle
                  cx={region.pinX}
                  cy={region.pinY}
                  r={isSelected ? 14 : 11.5}
                  fill={stamped ? '#fef3c7' : unlocked ? '#ffffff' : '#334155'}
                  stroke={isSelected ? '#f59e0b' : unlocked ? region.accentColor : '#475569'}
                  strokeWidth="2.5"
                />
                <text
                  x={region.pinX}
                  y={region.pinY + 4}
                  textAnchor="middle"
                  fontSize={stamped ? '13' : '10'}
                  fontWeight="bold"
                  fill={unlocked ? '#0f172a' : '#f8fafc'}
                >
                  {stamped ? region.stampEmoji : unlocked ? region.order : '🔒'}
                </text>

                <text
                  x={region.labelX}
                  y={region.labelY}
                  textAnchor={region.labelAnchor}
                  fontSize="11"
                  fontWeight="900"
                  fill={isSelected ? '#b45309' : unlocked ? '#0f172a' : '#475569'}
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  paintOrder="stroke"
                >
                  {region.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selector rápido de regiones por si quiere saltar rápido */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {JAPAN_REGIONS.map(region => {
          const unlocked = isRegionUnlocked(region);
          const stamped = stampedIds.includes(region.id);
          const isSelected = region.id === selectedId;
          return (
            <button
              key={`pill-${region.id}`}
              onClick={() => handleSelectRegion(region)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300'
                  : unlocked
                    ? 'border-duo-gray-200 dark:border-[#2c3f49] bg-white dark:bg-[#1a2930] text-duo-gray-700 dark:text-gray-200'
                    : 'border-duo-gray-200 dark:border-[#2c3f49] bg-duo-gray-100 dark:bg-[#131f24] text-duo-gray-400'
              }`}
            >
              <span>{stamped ? region.stampEmoji : unlocked ? `${region.order}.` : '🔒'}</span>
              <span>{region.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tarjeta de detalle de la región seleccionada */}
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-duo-blue/15 text-duo-blue">
                Región {selectedRegion.order} · {selectedRegion.city}
              </span>
              {isSelectedStamped && (
                <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg bg-duo-green/15 text-duo-green">
                  <Stamp className="w-3 h-3" /> {selectedRegion.stampEmoji} Sellada
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-duo-gray-800 dark:text-white mt-1">
              {selectedRegion.name} — {selectedRegion.japanese}
            </h3>
            <p className="text-xs font-bold text-duo-gray-400">
              {selectedRegion.reading} · {selectedRegion.romaji}
            </p>
          </div>
          <button
            onClick={() => sound.speakJapanese(selectedRegion.cityJapanese, 0.9)}
            className="p-2.5 rounded-2xl bg-duo-blue text-white border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-0.5 cursor-pointer"
            title="Escuchar pronunciación"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {!isSelectedUnlocked ? (
          <div className="p-4 rounded-2xl bg-duo-gray-100 dark:bg-[#131f24] border border-duo-gray-200 dark:border-[#2c3f49] flex items-center gap-3">
            <Lock className="w-5 h-5 text-duo-gray-400 shrink-0" />
            <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300">
              Región bloqueada. Consigue el sello de{' '}
              <span className="text-duo-blue font-black">
                {JAPAN_REGIONS.find(r => r.order === selectedRegion.order - 1)?.name}
              </span>{' '}
              para abrir esta ruta del Shinkansen.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-duo-gray-600 dark:text-gray-300 leading-relaxed">
              {selectedRegion.summary}
            </p>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs font-bold text-amber-800 dark:text-amber-200">
              💡 <span className="font-black">Dato cultural:</span> {selectedRegion.culturalFact}
            </div>

            {/* Vocabulario útil de la región */}
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-duo-gray-400">
                Palabras clave de {selectedRegion.city}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {selectedRegion.usefulVocab.map(word => (
                  <button
                    key={word.japanese}
                    onClick={() => sound.speakJapanese(word.reading, 0.9)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-duo-gray-100/70 dark:bg-[#131f24] border border-duo-gray-200 dark:border-[#2c3f49] hover:border-duo-blue text-left cursor-pointer"
                  >
                    <div>
                      <span className="font-black text-duo-gray-800 dark:text-white mr-2">{word.japanese}</span>
                      <span className="text-xs font-bold text-duo-gray-400">({word.reading})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-duo-blue">{word.spanish}</span>
                      <Volume2 className="w-3.5 h-3.5 text-duo-blue" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reto para obtener el sello */}
            {!isSelectedStamped ? (
              <div className="pt-2 border-t border-duo-gray-200 dark:border-[#2c3f49] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-duo-green">
                    🎫 Reto para desbloquear sello (+25 XP · +5 💎)
                  </span>
                </div>
                <p className="text-sm font-black text-duo-gray-800 dark:text-white">
                  {selectedRegion.challenge.prompt}
                </p>
                <div className="space-y-2">
                  {selectedRegion.challenge.options.map((opt, idx) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswerChallenge(idx)}
                      className={`w-full p-3 rounded-2xl border-2 text-left text-sm font-bold transition-all cursor-pointer ${
                        selectedOption === idx && challengeError
                          ? 'border-red-500 bg-red-500/10 text-red-500'
                          : 'border-duo-gray-200 dark:border-[#2e4450] bg-white dark:bg-[#1f313b] text-duo-gray-800 dark:text-white hover:border-duo-blue'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {challengeError && (
                  <p className="text-xs font-bold text-red-500">
                    Casi — revisa el vocabulario clave arriba e inténtalo de nuevo.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-duo-green/10 border border-duo-green/30 space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-black text-duo-green">
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedRegion.stampEmoji} {selectedRegion.stampTitle} obtenido
                  {justUnlocked === selectedRegion.id && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs">
                      <Sparkles className="w-3.5 h-3.5" /> +25 XP · +5 💎
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-duo-gray-600 dark:text-gray-300">
                  {selectedRegion.challenge.explanation}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
