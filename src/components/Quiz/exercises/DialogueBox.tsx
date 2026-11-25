import React, { useRef, useEffect } from 'react';
import { BookOpen, Volume2, Eye, EyeOff } from 'lucide-react';
import { DialogueLine } from '../../../types';
import { sound } from '../../../services/sound';
import { SpeechPracticeButton } from '../../SpeechPracticeButton';
import { getSpeakerAvatar, getSpeakerChatTheme } from '../quizFormatters';

interface DialogueBoxProps {
  title?: string;
  context?: string;
  lines: DialogueLine[];
  showRomaji: boolean;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  activeLineIdx: number | null;
  onSetActiveLineIdx: (idx: number | null) => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  title,
  context,
  lines,
  showRomaji,
  showTranslation,
  onToggleTranslation,
  activeLineIdx,
  onSetActiveLineIdx
}) => {
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeLineIdx !== null && activeLineIdx >= 0) {
      lineRefs.current[activeLineIdx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeLineIdx]);

  const uniqueSpeakers = Array.from(new Set(lines.map(l => l.speaker)));

  return (
    <div className="mb-5 bg-gray-50 dark:bg-[#18272e] border-2 border-duo-blue/40 dark:border-[#283842] rounded-3xl p-4 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-gray-200 dark:border-[#283842]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-duo-blue text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-4 h-4 stroke-[2.5px]" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-black text-duo-blue uppercase tracking-wide">
              {title || 'Diálogo Introductorio de la Lección (会話)'}
            </h3>
            {context && (
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{context}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playTap();
              sound.speakDialogueSequence(lines, 0.9, idx => {
                onSetActiveLineIdx(idx);
                lineRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              });
            }}
            className="px-2.5 py-1.5 bg-duo-blue hover:bg-duo-blue-dark text-white rounded-xl font-black text-[11px] flex items-center gap-1 shadow-[0_3px_0_0_#1899d6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Escuchar todo el diálogo con voces por personaje"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Escuchar Todo</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              sound.speakDialogueSequence(lines, 0.70, idx => {
                onSetActiveLineIdx(idx);
                lineRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              });
            }}
            className="px-2 py-1.5 bg-duo-blue-light/80 dark:bg-duo-blue/20 border border-duo-blue text-duo-blue-dark dark:text-duo-blue rounded-xl font-black text-[11px] flex items-center gap-1 hover:brightness-105 transition-all cursor-pointer"
            title="Escuchar lento con voces por personaje"
          >
            <span>🐢</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onToggleTranslation();
            }}
            className="px-2 py-1.5 bg-white dark:bg-[#22343d] border border-gray-300 dark:border-[#364954] text-gray-600 dark:text-gray-300 rounded-xl font-bold text-[11px] flex items-center gap-1 hover:border-duo-blue transition-all cursor-pointer"
            title="Mostrar u ocultar traducción al español"
          >
            {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>ES</span>
          </button>
        </div>
      </div>

      {/* Participants Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {uniqueSpeakers.map((spk, sIdx) => {
            const theme = getSpeakerChatTheme(sIdx);
            const avatar = getSpeakerAvatar(spk, sIdx);
            return (
              <span
                key={`legend-${spk}`}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-2xs ${theme.badge}`}
              >
                <span>{avatar}</span>
                <span>{spk}</span>
              </span>
            );
          })}
        </div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
          Toca un mensaje para escucharlo 🔊
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto scroll-smooth p-3 rounded-2xl bg-slate-100/80 dark:bg-[#0f191e] border border-gray-200/80 dark:border-[#24343d]">
        {lines.map((line, lIdx) => {
          const isActiveLine = activeLineIdx === lIdx;
          const speakerIdx = uniqueSpeakers.indexOf(line.speaker);
          const theme = getSpeakerChatTheme(speakerIdx >= 0 ? speakerIdx : 0);
          const avatar = getSpeakerAvatar(line.speaker, speakerIdx >= 0 ? speakerIdx : 0);

          const playLine = () => {
            onSetActiveLineIdx(lIdx);
            sound.speakJapanese(line.audioText, 0.9, line.speaker);
            lineRefs.current[lIdx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          };

          return (
            <div
              key={`dlg-line-${lIdx}`}
              ref={el => { lineRefs.current[lIdx] = el; }}
              onClick={playLine}
              className={`flex items-start gap-2.5 cursor-pointer group scroll-mt-2 ${
                theme.isRight ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base shadow-sm flex-shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${theme.avatarBg}`}
                title={line.speaker}
              >
                {avatar}
              </div>

              <div
                className={`max-w-[82%] p-3 border-2 shadow-xs transition-all flex flex-col gap-1 ${
                  isActiveLine ? theme.activeBubble : `${theme.bubble} hover:brightness-98`
                }`}
              >
                <div
                  className={`flex items-center justify-between gap-3 ${
                    theme.isRight ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${theme.badge}`}>
                    {line.speaker}
                  </span>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <SpeechPracticeButton
                      targetJapanese={line.japanese}
                      targetFurigana={line.audioText}
                      compact
                    />
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        playLine();
                      }}
                      className={`p-1.5 rounded-xl transition-colors flex-shrink-0 ${theme.audioBtn}`}
                      title="Escuchar esta línea"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isActiveLine ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </div>

                <p className="text-base md:text-lg font-bold font-['Noto_Sans_JP'] text-gray-900 dark:text-gray-100 leading-snug mt-0.5">
                  {line.japanese}
                </p>

                {line.romaji && showRomaji && (
                  <p className={`text-[11px] font-bold ${theme.romaji}`}>{line.romaji}</p>
                )}

                {showTranslation && (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 pt-1 mt-0.5 border-t border-gray-200/60 dark:border-gray-700/50">
                    {line.spanish}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
