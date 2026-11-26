import React, { useState, useEffect } from 'react';
import { BookOpen, Volume2, Eye, EyeOff, CheckCircle2, Sparkles, ArrowLeft, Clock } from 'lucide-react';
import { GRADED_STORIES, GradedStory } from '../../data/storiesData';
import { sound } from '../../services/sound';

interface StoriesViewProps {
  onAwardReward: (xp: number, gems: number) => void;
}

const STORIES_STORAGE_KEY = 'nihongo_stories_read_v1';

function loadReadStoryIds(): string[] {
  try {
    const raw = localStorage.getItem(STORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const StoriesView: React.FC<StoriesViewProps> = ({ onAwardReward }) => {
  const [readIds, setReadIds] = useState<string[]>(loadReadStoryIds);
  const [filter, setFilter] = useState<'all' | 'very-easy' | 'easy' | 'medium' | 'hard'>('all');
  const [activeStory, setActiveStory] = useState<GradedStory | null>(null);
  const [showKanji, setShowKanji] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showSpanish, setShowSpanish] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(readIds));
    } catch {
      // ignore
    }
  }, [readIds]);

  const filteredStories = GRADED_STORIES.filter(s => {
    if (filter === 'very-easy') return s.difficultyLabel === 'Muy Fácil';
    if (filter === 'easy') return s.difficultyLabel === 'Fácil';
    if (filter === 'medium') return s.difficultyLabel === 'Medio';
    if (filter === 'hard') return s.difficultyLabel === 'Avanzado';
    return true;
  });

  const openStory = (story: GradedStory) => {
    sound.playTap();
    setActiveStory(story);
    setAnswers({});
    setJustCompleted(false);
  };

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (!activeStory || answers[qIdx] !== undefined) return;
    const isCorrect = optIdx === activeStory.questions[qIdx].correctIndex;
    if (isCorrect) sound.playCorrect();
    else sound.playIncorrect();

    const nextAnswers = { ...answers, [qIdx]: optIdx };
    setAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length === activeStory.questions.length) {
      const allCorrect = activeStory.questions.every((q, i) => nextAnswers[i] === q.correctIndex);
      if (allCorrect && !readIds.includes(activeStory.id)) {
        sound.playLessonComplete();
        setReadIds(prev => [...prev, activeStory.id]);
        setJustCompleted(true);
        onAwardReward(30, 5);
      }
    }
  };

  const playFullStory = (story: GradedStory) => {
    const fullText = story.paragraphs.map(p => p.audioText).join(' ');
    sound.speakJapanese(fullText, 0.88);
  };

  if (activeStory) {
    const isAlreadyRead = readIds.includes(activeStory.id);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              sound.playTap();
              setActiveStory(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-black text-duo-gray-500 dark:text-gray-300 px-3 py-1.5 rounded-xl border border-duo-gray-200 dark:border-[#2c3f49] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Lista de cuentos
          </button>
          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-duo-purple/15 text-duo-purple">
            Nv.{activeStory.level} · {activeStory.difficultyLabel}
          </span>
        </div>

        {/* Portada del cuento */}
        <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-2xl mb-1">{activeStory.emoji}</div>
              <h3 className="text-xl font-black text-duo-gray-800 dark:text-white">
                {activeStory.title}
              </h3>
              <p className="text-sm font-black text-duo-blue">
                {activeStory.japaneseTitle}{' '}
                <span className="text-xs font-bold text-duo-gray-400">({activeStory.romajiTitle})</span>
              </p>
            </div>
            <button
              onClick={() => playFullStory(activeStory)}
              className="px-3 py-2 rounded-2xl bg-duo-blue text-white font-black text-xs border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-0.5 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Escuchar todo
            </button>
          </div>

          {/* Controles de lectura: Kanji / Romaji / Traducción */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => { sound.playTap(); setShowKanji(k => !k); }}
              className={`py-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 cursor-pointer ${
                showKanji
                  ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                  : 'border-duo-gray-200 dark:border-[#2c3f49] text-duo-gray-400'
              }`}
            >
              {showKanji ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} Kanji (漢字)
            </button>
            <button
              onClick={() => { sound.playTap(); setShowRomaji(r => !r); }}
              className={`py-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 cursor-pointer ${
                showRomaji
                  ? 'border-duo-blue bg-duo-blue/10 text-duo-blue'
                  : 'border-duo-gray-200 dark:border-[#2c3f49] text-duo-gray-400'
              }`}
            >
              {showRomaji ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} Romaji
            </button>
            <button
              onClick={() => { sound.playTap(); setShowSpanish(s => !s); }}
              className={`py-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 cursor-pointer ${
                showSpanish
                  ? 'border-duo-green bg-duo-green/10 text-duo-green'
                  : 'border-duo-gray-200 dark:border-[#2c3f49] text-duo-gray-400'
              }`}
            >
              {showSpanish ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} Español
            </button>
          </div>
        </div>

        {/* Párrafos */}
        <div className="space-y-3">
          {activeStory.paragraphs.map((p, pIdx) => (
            <div
              key={pIdx}
              className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-black text-duo-gray-800 dark:text-white leading-relaxed">
                  {showKanji ? p.japanese : p.kanaOnly}
                </p>
                <button
                  onClick={() => sound.speakJapanese(p.audioText, 0.88)}
                  className="p-2 rounded-xl bg-duo-blue/10 text-duo-blue shrink-0 cursor-pointer"
                  title="Escuchar párrafo"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {showRomaji && (
                <p className="text-xs font-bold text-duo-blue/90">{p.romaji}</p>
              )}
              {showSpanish && (
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 pt-1 border-t border-duo-gray-100 dark:border-[#253740]">
                  {p.spanish}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Preguntas de comprensión */}
        <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-duo-gray-800 dark:text-white">
              📝 Comprensión de lectura
            </h4>
            {isAlreadyRead && (
              <span className="inline-flex items-center gap-1 text-xs font-black text-duo-green">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completado
              </span>
            )}
          </div>

          {activeStory.questions.map((q, qIdx) => {
            const chosen = answers[qIdx];
            return (
              <div key={qIdx} className="space-y-2">
                <p className="text-sm font-black text-duo-gray-800 dark:text-white">{q.prompt}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    let cls =
                      'border-duo-gray-200 dark:border-[#2e4450] bg-white dark:bg-[#1f313b] text-duo-gray-800 dark:text-white';
                    if (chosen !== undefined) {
                      if (optIdx === q.correctIndex) cls = 'border-duo-green bg-duo-green/15 text-duo-green';
                      else if (optIdx === chosen) cls = 'border-red-500 bg-red-500/15 text-red-500';
                    }
                    return (
                      <button
                        key={opt}
                        disabled={chosen !== undefined}
                        onClick={() => handleAnswer(qIdx, optIdx)}
                        className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold cursor-pointer ${cls}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {chosen !== undefined && (
                  <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300">{q.explanation}</p>
                )}
              </div>
            );
          })}

          {justCompleted && (
            <div className="p-3 rounded-2xl bg-duo-green/15 border border-duo-green/30 text-duo-green font-black text-xs flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> ¡Cuento completado! +30 XP · +5 💎
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#1a2930] border-2 border-duo-gray-200 dark:border-[#2c3f49] rounded-3xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-duo-purple/15 border border-duo-purple/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-duo-purple" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-duo-purple">
              Cuentos Graduados (物語)
            </div>
            <div className="text-base font-black text-duo-gray-800 dark:text-white">
              {readIds.length} / {GRADED_STORIES.length} Cuentos leídos
            </div>
          </div>
        </div>
      </div>

      {/* Filtro de dificultad */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {([
          { id: 'all', label: 'Todos (12)' },
          { id: 'very-easy', label: 'Muy Fácil' },
          { id: 'easy', label: 'Fácil' },
          { id: 'medium', label: 'Medio' },
          { id: 'hard', label: 'Avanzado' }
        ] as const).map(f => (
          <button
            key={f.id}
            onClick={() => { sound.playTap(); setFilter(f.id); }}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-black border-2 cursor-pointer ${
              filter === f.id
                ? 'border-duo-purple bg-duo-purple/15 text-duo-purple'
                : 'border-duo-gray-200 dark:border-[#2c3f49] bg-white dark:bg-[#1a2930] text-duo-gray-500 dark:text-gray-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredStories.map(story => {
          const isRead = readIds.includes(story.id);
          return (
            <button
              key={story.id}
              onClick={() => openStory(story)}
              className="w-full text-left bg-white dark:bg-[#1a2930] border-2 border-b-4 border-duo-gray-200 dark:border-[#2c3f49] hover:border-duo-purple rounded-3xl p-4 flex items-center gap-3.5 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-duo-gray-100 dark:bg-[#131f24] flex items-center justify-center text-2xl shrink-0">
                {story.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black text-duo-purple uppercase">
                    Nv.{story.level} · {story.difficultyLabel} · {story.jlptTag}
                  </span>
                  {isRead && <CheckCircle2 className="w-4 h-4 text-duo-green shrink-0" />}
                </div>
                <h3 className="text-base font-black text-duo-gray-800 dark:text-white truncate">
                  {story.title} <span className="text-xs font-bold text-duo-blue">({story.japaneseTitle})</span>
                </h3>
                <p className="text-xs font-bold text-duo-gray-500 dark:text-gray-300 line-clamp-2 mt-0.5">
                  {story.summary}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-duo-gray-400 mt-1">
                  <Clock className="w-3 h-3" /> ~{story.estimatedMinutes} min · +30 XP
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
