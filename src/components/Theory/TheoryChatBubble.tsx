import React from 'react';
import {
  Volume2,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Puzzle,
  Headphones,
  Mic
} from 'lucide-react';
import { sound } from '../../services/sound';
import { SpeechPracticeButton } from '../SpeechPracticeButton';
import { ChatMessage, ChatQuiz, ChatWordBuild } from './theoryChatBuilder';

interface TheoryChatBubbleProps {
  msg: ChatMessage;
  senseiAvatar: string;
  senseiName: string;
  senseiVoiceId: string;
  showRomaji: boolean;
  quizAnswer: number | undefined;
  wordBuilderSelected: string[];
  wordBuilderSubmitted: boolean;
  onSelectQuizOption: (msgId: string, quiz: ChatQuiz, optIdx: number) => void;
  onRetryQuiz: (msgId: string) => void;
  onToggleChip: (msgId: string, chipId: string) => void;
  onCheckWordBuild: (msgId: string, wb: ChatWordBuild) => void;
  onRetryWordBuild: (msgId: string) => void;
}

export const TheoryChatBubble: React.FC<TheoryChatBubbleProps> = ({
  msg,
  senseiAvatar,
  senseiName,
  senseiVoiceId,
  showRomaji,
  quizAnswer,
  wordBuilderSelected,
  wordBuilderSubmitted,
  onSelectQuizOption,
  onRetryQuiz,
  onToggleChip,
  onCheckWordBuild,
  onRetryWordBuild
}) => {
  if (msg.sender === 'user') {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[78%] px-3.5 py-2 rounded-2xl rounded-tr-sm bg-duo-blue text-white font-bold text-xs shadow-xs">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-white dark:bg-[#18272e] border border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-2xs">
        {senseiAvatar}
      </div>

      <div className="max-w-[88%] flex flex-col gap-1.5">
        <div
          className={`p-3.5 rounded-2xl rounded-tl-sm border shadow-2xs text-xs leading-relaxed ${
            msg.isFeedbackSuccess === true
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-bold'
              : msg.isFeedbackSuccess === false
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100 font-bold'
              : msg.kind === 'lesson-card'
              ? 'bg-white dark:bg-[#18272e] border-indigo-300 dark:border-indigo-700 text-gray-800 dark:text-gray-100 font-semibold'
              : msg.kind === 'word-build' || msg.kind === 'quiz' || msg.kind === 'listen-pick'
              ? 'bg-purple-50/90 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-gray-800 dark:text-gray-100 font-bold'
              : msg.kind === 'speak'
              ? 'bg-pink-50/80 dark:bg-pink-950/30 border-pink-300 dark:border-pink-700 text-gray-800 dark:text-gray-100 font-bold'
              : 'bg-white dark:bg-[#18272e] border-gray-200 dark:border-[#283842] text-gray-800 dark:text-gray-100 font-semibold'
          }`}
        >
          {msg.kind === 'quiz' && (
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 mb-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Mini-Quiz</span>
            </div>
          )}
          {msg.kind === 'listen-pick' && (
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 mb-1">
              <Headphones className="w-3.5 h-3.5" />
              <span>Reto Auditivo</span>
            </div>
          )}
          {msg.kind === 'word-build' && (
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 mb-1">
              <Puzzle className="w-3.5 h-3.5" />
              <span>Construye la Frase</span>
            </div>
          )}
          {msg.kind === 'speak' && (
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-pink-600 dark:text-pink-400 mb-1">
              <Mic className="w-3.5 h-3.5" />
              <span>Práctica Oral</span>
            </div>
          )}

          <p className={msg.kind === 'lesson-card' ? 'text-sm font-black text-indigo-700 dark:text-indigo-300 whitespace-pre-line' : 'whitespace-pre-line'}>
            {msg.text}
          </p>

          {msg.subText && (
            <p className="mt-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
              {msg.subText}
            </p>
          )}

          {msg.bullets && msg.bullets.length > 0 && (
            <ul className="mt-2.5 flex flex-col gap-1.5 pl-1 border-l-2 border-indigo-300 dark:border-indigo-700">
              {msg.bullets.map((b, bIdx) => (
                <li key={`${msg.id}-b-${bIdx}`} className="pl-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200 leading-snug">
                  • {b}
                </li>
              ))}
            </ul>
          )}

          {msg.example && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-sky-50/80 dark:bg-[#131f24] border border-sky-200 dark:border-sky-800/60">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-black font-['Noto_Sans_JP'] text-gray-900 dark:text-white leading-snug">
                    {msg.example.japanese}
                  </p>
                  {showRomaji && msg.example.romaji && (
                    <p className="text-[11px] font-bold text-duo-blue mt-0.5">{msg.example.romaji}</p>
                  )}
                  <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mt-1">
                    🇪🇸 {msg.example.spanish}
                  </p>
                </div>

                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      sound.speakJapanese(msg.example!.audioText || msg.example!.japanese, 0.9, senseiVoiceId)
                    }
                    className="p-2 rounded-xl bg-duo-blue hover:bg-duo-blue-dark text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
                    title={`Escuchar con ${senseiName}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      sound.speakJapanese(msg.example!.audioText || msg.example!.japanese, 0.7, senseiVoiceId)
                    }
                    className="px-1.5 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-[10px] font-black text-sky-700 dark:text-sky-300 cursor-pointer"
                    title="Lento"
                  >
                    🐢
                  </button>
                </div>
              </div>

              {msg.kind === 'speak' && (
                <div className="mt-2.5 pt-2 border-t border-sky-200/70 dark:border-sky-800/50 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-pink-600 dark:text-pink-300">
                    Pulsa el micrófono y léelo en voz alta:
                  </span>
                  <SpeechPracticeButton
                    targetJapanese={msg.example.japanese}
                    targetFurigana={msg.example.audioText || msg.example.japanese}
                    compact
                  />
                </div>
              )}
            </div>
          )}

          {msg.tip && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-1.5 text-[11px] font-medium text-amber-900 dark:text-amber-100">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>{msg.tip}</span>
            </div>
          )}

          {msg.quiz && (
            <div className="mt-2.5 flex flex-col gap-2">
              {msg.quiz.audioText ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => sound.speakJapanese(msg.quiz!.audioText!, 0.9, senseiVoiceId)}
                    className="flex-1 py-2 px-3 rounded-xl bg-duo-blue hover:bg-duo-blue-dark text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Escuchar Frase</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sound.speakJapanese(msg.quiz!.audioText!, 0.7, senseiVoiceId)}
                    className="py-2 px-3 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200 font-black text-xs cursor-pointer"
                  >
                    🐢
                  </button>
                </div>
              ) : (
                <p className="text-xs font-black text-purple-950 dark:text-purple-100 font-['Noto_Sans_JP']">
                  {msg.quiz.prompt}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                {msg.quiz.options.map((opt, optIdx) => {
                  const answered = quizAnswer !== undefined;
                  const isPicked = quizAnswer === optIdx;
                  const isCorrectOpt = optIdx === msg.quiz!.correctIndex;

                  let btnStyle =
                    'bg-white dark:bg-[#18272e] border-gray-200 dark:border-[#283842] text-gray-800 dark:text-gray-100 hover:border-purple-400';
                  if (answered) {
                    if (isCorrectOpt) {
                      btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                    } else if (isPicked && !isCorrectOpt) {
                      btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200';
                    } else {
                      btnStyle = 'bg-gray-100/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={`${msg.id}-opt-${optIdx}`}
                      type="button"
                      disabled={answered}
                      onClick={() => onSelectQuizOption(msg.id, msg.quiz!, optIdx)}
                      className={`w-full text-left px-3 py-2 rounded-xl border-2 text-xs font-bold font-['Noto_Sans_JP'] transition-all flex items-center justify-between gap-2 ${
                        answered ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                      } ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {answered && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                      {answered && isPicked && !isCorrectOpt && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {quizAnswer !== undefined && quizAnswer !== msg.quiz.correctIndex && (
                <button
                  type="button"
                  onClick={() => onRetryQuiz(msg.id)}
                  className="self-start px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 font-black text-[11px] flex items-center gap-1 cursor-pointer hover:brightness-95 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reintentar</span>
                </button>
              )}
            </div>
          )}

          {msg.wordBuild && (() => {
            const wb = msg.wordBuild;
            const builtStr = wordBuilderSelected
              .map(id => wb.bankChips.find(c => c.id === id)?.word || '')
              .join('');
            const isExactMatch = builtStr === wb.targetTokens.join('');

            return (
              <div className="mt-2.5 flex flex-col gap-2.5">
                <div className="p-2 rounded-xl bg-white dark:bg-[#131f24] border border-purple-200 dark:border-purple-800/60 text-xs font-black text-purple-900 dark:text-purple-100">
                  🇪🇸 «{wb.spanishPrompt}»
                </div>

                <div className="min-h-[44px] p-2 rounded-xl bg-white dark:bg-[#18272e] border-2 border-dashed border-purple-300 dark:border-purple-700 flex flex-wrap gap-1.5 items-center">
                  {wordBuilderSelected.length === 0 ? (
                    <span className="text-[11px] font-semibold text-gray-400 italic">
                      Toca las fichas de abajo en orden...
                    </span>
                  ) : (
                    wordBuilderSelected.map(chipId => {
                      const chip = wb.bankChips.find(c => c.id === chipId);
                      if (!chip) return null;
                      return (
                        <button
                          key={`sel-${chipId}`}
                          type="button"
                          disabled={wordBuilderSubmitted}
                          onClick={() => onToggleChip(msg.id, chipId)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs font-['Noto_Sans_JP'] shadow-2xs cursor-pointer"
                        >
                          {chip.word}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {wb.bankChips.map(chip => {
                    const isUsed = wordBuilderSelected.includes(chip.id);
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        disabled={isUsed || wordBuilderSubmitted}
                        onClick={() => onToggleChip(msg.id, chip.id)}
                        className={`px-2.5 py-1.5 rounded-xl border-2 text-xs font-bold font-['Noto_Sans_JP'] transition-all ${
                          isUsed
                            ? 'bg-gray-100 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-700 text-transparent select-none cursor-default'
                            : 'bg-white dark:bg-[#18272e] border-gray-200 dark:border-[#283842] text-gray-800 dark:text-gray-100 hover:border-purple-400 cursor-pointer shadow-2xs'
                        }`}
                      >
                        {chip.word}
                      </button>
                    );
                  })}
                </div>

                {!wordBuilderSubmitted ? (
                  <button
                    type="button"
                    disabled={wordBuilderSelected.length === 0}
                    onClick={() => onCheckWordBuild(msg.id, wb)}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-black text-xs transition-all cursor-pointer"
                  >
                    Comprobar Oración ✓
                  </button>
                ) : !isExactMatch ? (
                  <button
                    type="button"
                    onClick={() => onRetryWordBuild(msg.id)}
                    className="self-start px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 font-black text-[11px] flex items-center gap-1 cursor-pointer hover:brightness-95 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reintentar oración</span>
                  </button>
                ) : null}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
