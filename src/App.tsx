import React, { useState, useEffect, useRef } from 'react';
import { setupIonicReact, IonApp, IonContent } from '@ionic/react';
import { UserProfile, Unit, Flashcard, LessonNode } from './types';
import { genkiCurriculum } from './data/genkiCurriculum';
import { initialFlashcards } from './data/flashcardsData';
import { dbService } from './services/db';
import { sound } from './services/sound';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { RoadmapPage } from './pages/RoadmapPage';
import { TheoryPage } from './pages/TheoryPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { KanaPage } from './pages/KanaPage';
import { ReadingsPage } from './pages/ReadingsPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { WritingPage } from './pages/WritingPage';
import { SpeakingPage } from './pages/SpeakingPage';
import { ProfilePage } from './pages/ProfilePage';
import { MasteryPage } from './pages/MasteryPage';
import { JlptTowerPage } from './pages/JlptTowerPage';
import { GlobalDownloadBanner } from './components/Audio/GlobalDownloadBanner';
import { LandingPage } from './pages/LandingPage';
import { Capacitor } from '@capacitor/core';
import { getLocalDateKey, recordDailyLessonActivity, isStreakBroken } from './utils/dateUtils';
import { notificationService } from './services/notificationService';

// Ionic core CSS
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

setupIonicReact({
  mode: 'ios' // Sleek uniform aesthetic
});

export const App: React.FC = () => {
  const isNative = Capacitor.isNativePlatform();
  const [viewMode, setViewMode] = useState<'app' | 'landing'>(() => {
    if (isNative) return 'app';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('app') === 'true' || window.location.hash === '#app') {
        return 'app';
      }
      const saved = localStorage.getItem('nihongo_view_mode');
      if (saved === 'app') return 'app';
    }
    return 'landing';
  });

  const handleEnterApp = () => {
    setViewMode('app');
    try {
      localStorage.setItem('nihongo_view_mode', 'app');
    } catch {}
  };

  const handleReturnToLanding = () => {
    setViewMode('landing');
    try {
      localStorage.setItem('nihongo_view_mode', 'landing');
    } catch {}
  };

  const [activeTab, setActiveTab] = useState<NavTab>('roadmap');
  const [profile, setProfile] = useState<UserProfile>({
    id: 'local_user',
    username: 'Estudiante Genki',
    xp: 0,
    streakDays: 0,
    lastActiveDate: '',
    hearts: 5,
    maxHearts: 5,
    gems: 50,
    soundEnabled: true,
    furiganaMode: 'always',
    showRomaji: true,
    darkMode: false,
    preferredVoiceId: 'mary'
  });

  const [units, setUnits] = useState<Unit[]>(genkiCurriculum);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [loading, setLoading] = useState(true);
  const [theoryUnitId, setTheoryUnitId] = useState<number>(0);
  const [nextHeartMinutes, setNextHeartMinutes] = useState<number | null>(null);
  const ionContentRef = useRef<HTMLIonContentElement>(null);
  const tabHistoryRef = useRef<NavTab[]>(['roadmap']);
  const isPoppingBackRef = useRef(false);
  const activeTabRef = useRef<NavTab>('roadmap');

  // Track tab navigation history & handle Android hardware/gesture back button
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (isPoppingBackRef.current) {
      isPoppingBackRef.current = false;
      return;
    }
    const hist = tabHistoryRef.current;
    if (hist[hist.length - 1] !== activeTab) {
      hist.push(activeTab);
      if (hist.length > 20) hist.shift();
    }
  }, [activeTab]);

  useEffect(() => {
    (window as any).__handleNihongoBack = () => {
      const ev = new CustomEvent('nihongo-back', { cancelable: true });
      const notCancelled = window.dispatchEvent(ev);
      if (!notCancelled) {
        return true;
      }
      const hist = tabHistoryRef.current;
      if (hist.length > 1) {
        hist.pop();
        const prevTab = hist[hist.length - 1] || 'roadmap';
        isPoppingBackRef.current = true;
        setActiveTab(prevTab);
        return true;
      }
      if (activeTabRef.current !== 'roadmap') {
        tabHistoryRef.current = ['roadmap'];
        isPoppingBackRef.current = true;
        setActiveTab('roadmap');
        return true;
      }
      return false;
    };

    return () => {
      delete (window as any).__handleNihongoBack;
    };
  }, []);

  // Gestión de scroll: resetear al inicio si nos movemos a otra pestaña distinta del roadmap
  useEffect(() => {
    if (activeTab !== 'roadmap') {
      const resetScrollToTop = () => {
        ionContentRef.current?.scrollToTop(0);
        ionContentRef.current?.getScrollElement().then(el => {
          if (el) el.scrollTop = 0;
        });
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      resetScrollToTop();
      const timer = setTimeout(resetScrollToTop, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScrollToTop = () => {
      ionContentRef.current?.scrollToTop(0);
      ionContentRef.current?.getScrollElement().then(el => {
        if (el) el.scrollTop = 0;
      });
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    window.addEventListener('scroll-to-top', handleScrollToTop);
    return () => window.removeEventListener('scroll-to-top', handleScrollToTop);
  }, []);

  const HEART_REGEN_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  const HEART_REGEN_KEY = 'genki_heart_regen_ts';

  const handleOpenTheory = (unitId: number) => {
    setTheoryUnitId(unitId);
    setActiveTab('theory');
  };

  // Initialize SQLite and load user state on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await dbService.init();

        // 1. Load user profile & apply offline 1-hour heart regeneration + streak expiration check
        let userProf = await dbService.getUserProfile();
        let profModified = false;

        // Reset broken streak if lastActiveDate is older than yesterday
        if (isStreakBroken(userProf.lastActiveDate, userProf.streakDays)) {
          userProf = { ...userProf, streakDays: 0 };
          profModified = true;
        }

        if (userProf.hearts < userProf.maxHearts) {
          const rawTs = localStorage.getItem(HEART_REGEN_KEY);
          const now = Date.now();
          if (rawTs) {
            const lastTs = Number(rawTs);
            const elapsed = now - lastTs;
            if (elapsed >= HEART_REGEN_MS) {
              const recovered = Math.floor(elapsed / HEART_REGEN_MS);
              const newHearts = Math.min(userProf.maxHearts, userProf.hearts + recovered);
              userProf = { ...userProf, hearts: newHearts };
              profModified = true;
              if (newHearts >= userProf.maxHearts) {
                localStorage.removeItem(HEART_REGEN_KEY);
              } else {
                localStorage.setItem(HEART_REGEN_KEY, String(lastTs + recovered * HEART_REGEN_MS));
              }
            }
          } else if (userProf.lastActiveDate && userProf.lastActiveDate !== getLocalDateKey()) {
            // Last active on a previous day and no pending regen timestamp -> full recovery
            userProf = { ...userProf, hearts: userProf.maxHearts };
            profModified = true;
            localStorage.removeItem(HEART_REGEN_KEY);
          } else {
            localStorage.setItem(HEART_REGEN_KEY, String(now));
          }
        } else {
          localStorage.removeItem(HEART_REGEN_KEY);
        }

        // 2. Load lesson progress and sync with units
        const progressMap = await dbService.getLessonProgress();

        // If profile was reset (0 XP and 0 completed stars), ensure streakDays is 0
        const hasAnyCompleted = Object.values(progressMap).some(p => p.stars > 0);
        if (userProf.xp === 0 && !hasAnyCompleted && userProf.streakDays > 0) {
          userProf = { ...userProf, streakDays: 0, lastActiveDate: '' };
          profModified = true;
        }

        if (profModified) {
          await dbService.saveUserProfile(userProf);
        }

        setProfile(userProf);
        sound.setEnabled(userProf.soundEnabled);
        sound.setDefaultVoice(userProf.preferredVoiceId || 'mary');
        if (userProf.darkMode) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
        setUnits(prevUnits => {
          return prevUnits.map(unit => {
            let maxUnlockedIdx = -1;
            unit.nodes.forEach((n, i) => {
              if (progressMap[n.id]?.unlocked || n.unlocked) {
                maxUnlockedIdx = i;
              }
            });
            return {
              ...unit,
              nodes: unit.nodes.map((node, idx) => {
                const saved = progressMap[node.id];
                if (saved) {
                  return {
                    ...node,
                    unlocked: saved.unlocked || idx <= maxUnlockedIdx,
                    completedSteps: saved.completedSteps,
                    stars: saved.stars
                  };
                }
                if (idx <= maxUnlockedIdx) {
                  return {
                    ...node,
                    unlocked: true
                  };
                }
                return node;
              })
            };
          });
        });

        // 3. Load flashcard SRS
        const srsMap = await dbService.getFlashcardSRSMap();
        setFlashcards(prevCards => {
          return prevCards.map(card => {
            const srs = srsMap[card.id];
            if (srs) {
              return {
                ...card,
                srsLevel: srs.srsLevel,
                intervalDays: srs.intervalDays,
                nextReviewDate: srs.nextReviewDate,
                timesReviewed: srs.timesReviewed,
                timesCorrect: srs.timesCorrect
              };
            }
            return card;
          });
        });

        // 4. Ensure notification reminder is active if user enabled it
        if (notificationService.isEnabled()) {
          notificationService.scheduleDailyReminder(notificationService.getReminderTime()).catch(() => {});
        }
      } catch (err) {
        console.error('Error loading data from SQLite:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sound toggle handler
  const handleSoundToggle = async () => {
    const newSoundState = !profile.soundEnabled;
    sound.setEnabled(newSoundState);
    const updated = { ...profile, soundEnabled: newSoundState };
    setProfile(updated);
    await dbService.saveUserProfile(updated);
  };

  // Romaji toggle handler
  const handleToggleRomaji = async () => {
    sound.playTap();
    const updated: UserProfile = { ...profile, showRomaji: !profile.showRomaji };
    setProfile(updated);
    await dbService.saveUserProfile(updated);
  };

  // Dark mode toggle handler
  const handleToggleDarkMode = async () => {
    sound.playTap();
    const newDarkMode = !profile.darkMode;
    const updated: UserProfile = { ...profile, darkMode: newDarkMode };
    setProfile(updated);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    await dbService.saveUserProfile(updated);
  };

  // Automatic 1-hour heart regeneration check, live countdown & background resume streak check
  useEffect(() => {
    const syncStateOnTickOrResume = async () => {
      // 1. Check if streak expired while app was open or in background
      if (isStreakBroken(profile.lastActiveDate, profile.streakDays)) {
        const updated = { ...profile, streakDays: 0 };
        setProfile(updated);
        await dbService.saveUserProfile(updated);
        return;
      }

      // 2. Check heart regeneration
      if (profile.hearts >= profile.maxHearts) {
        setNextHeartMinutes(null);
        localStorage.removeItem(HEART_REGEN_KEY);
        return;
      }

      const now = Date.now();
      let rawTs = localStorage.getItem(HEART_REGEN_KEY);
      if (!rawTs) {
        if (profile.lastActiveDate && profile.lastActiveDate !== getLocalDateKey()) {
          const updated = { ...profile, hearts: profile.maxHearts };
          setProfile(updated);
          await dbService.saveUserProfile(updated);
          localStorage.removeItem(HEART_REGEN_KEY);
          setNextHeartMinutes(null);
          return;
        }
        rawTs = String(now);
        localStorage.setItem(HEART_REGEN_KEY, rawTs);
      }

      const lastTs = Number(rawTs);
      const elapsed = now - lastTs;

      if (elapsed >= HEART_REGEN_MS) {
        const recovered = Math.floor(elapsed / HEART_REGEN_MS);
        const newHearts = Math.min(profile.maxHearts, profile.hearts + recovered);
        const updated = { ...profile, hearts: newHearts };
        setProfile(updated);
        await dbService.saveUserProfile(updated);

        if (newHearts >= profile.maxHearts) {
          localStorage.removeItem(HEART_REGEN_KEY);
          setNextHeartMinutes(null);
        } else {
          const nextStart = lastTs + recovered * HEART_REGEN_MS;
          localStorage.setItem(HEART_REGEN_KEY, String(nextStart));
          const remMs = Math.max(0, HEART_REGEN_MS - (now - nextStart));
          setNextHeartMinutes(Math.max(1, Math.ceil(remMs / 60000)));
        }
      } else {
        const remMs = Math.max(0, HEART_REGEN_MS - elapsed);
        setNextHeartMinutes(Math.max(1, Math.ceil(remMs / 60000)));
      }
    };

    syncStateOnTickOrResume();
    const timer = window.setInterval(syncStateOnTickOrResume, 15000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncStateOnTickOrResume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', syncStateOnTickOrResume);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', syncStateOnTickOrResume);
    };
  }, [profile]);

  // Deduct heart on wrong answer
  const handleDeductHeart = async () => {
    if (profile.hearts <= 0) return;
    if (!localStorage.getItem(HEART_REGEN_KEY)) {
      localStorage.setItem(HEART_REGEN_KEY, String(Date.now()));
    }
    const updated = { ...profile, hearts: profile.hearts - 1 };
    setProfile(updated);
    await dbService.saveUserProfile(updated);
  };

  // Refill hearts using gems (balanced cost: 100 gems)
  const handleRefillHearts = async () => {
    if (profile.gems < 100) return;
    localStorage.removeItem(HEART_REGEN_KEY);
    setNextHeartMinutes(null);
    const updated = {
      ...profile,
      hearts: profile.maxHearts,
      gems: profile.gems - 100
    };
    setProfile(updated);
    await dbService.saveUserProfile(updated);
  };

  // Claim daily quest reward
  const handleClaimQuestReward = async (xpReward: number, gemReward: number) => {
    const updated: UserProfile = {
      ...profile,
      xp: profile.xp + xpReward,
      gems: profile.gems + gemReward
    };
    setProfile(updated);
    await dbService.saveUserProfile(updated);
  };

  // Change preferred character voice
  const handleChangeVoice = async (voiceId: string) => {
    sound.setDefaultVoice(voiceId);
    const charProf = sound.getCharacterProfile(voiceId);
    sound.speakJapanese(charProf.samplePhrase, 0.9, voiceId);
    const updated: UserProfile = {
      ...profile,
      preferredVoiceId: voiceId
    };
    setProfile(updated);
    await dbService.saveUserProfile(updated);
  };

  // Complete a lesson node: mark completed, award XP, unlock next node in curriculum
  const handleCompleteLesson = async (nodeId: string, earnedXp: number, stars: number) => {
    const today = getLocalDateKey();
    const baseStreak = isStreakBroken(profile.lastActiveDate, profile.streakDays) ? 0 : profile.streakDays;
    const shouldIncrementStreak = baseStreak === 0 || profile.lastActiveDate !== today;
    recordDailyLessonActivity(earnedXp, profile.hearts);

    // 1. Update Profile (XP + balanced gems + streak)
    const earnedGems = stars >= 3 ? 8 : 5;
    const updatedProfile: UserProfile = {
      ...profile,
      xp: profile.xp + earnedXp,
      gems: profile.gems + earnedGems,
      streakDays: shouldIncrementStreak ? baseStreak + 1 : baseStreak,
      lastActiveDate: today
    };
    setProfile(updatedProfile);
    await dbService.saveUserProfile(updatedProfile);

    // 2. Update node and find next node to unlock
    let foundCurrent = false;
    let nextNodeToUnlock: { nodeId: string; unitId: number } | null = null;
    const isWb = (n: LessonNode) => n.title.toLowerCase().includes('workbook') || n.id.includes('wb');
    const isCurrentNodeWb = units.some(u => u.nodes.some(n => n.id === nodeId && isWb(n)));

    const newUnits = units.map(unit => {
      const newNodes = unit.nodes.map(node => {
        if (node.id === nodeId) {
          foundCurrent = true;
          return {
            ...node,
            stars: Math.max(node.stars, stars),
            completedSteps: node.totalSteps
          };
        }
        // Desbloquear según el tipo (libro de texto desbloquea siguiente lección de texto; workbook desbloquea siguiente workbook)
        if (foundCurrent && !nextNodeToUnlock && !node.unlocked && (isCurrentNodeWb ? isWb(node) : !isWb(node))) {
          nextNodeToUnlock = { nodeId: node.id, unitId: unit.id };
          return {
            ...node,
            unlocked: true
          };
        }
        return node;
      });
      return { ...unit, nodes: newNodes };
    });

    setUnits(newUnits);

    // 3. Save completed node to SQLite (if it's a curriculum node, not a practice session)
    const currentUnit = units.find(u => u.nodes.some(n => n.id === nodeId));
    if (currentUnit) {
      await dbService.saveLessonNodeProgress(nodeId, currentUnit.id, true, 3, 3, stars);
    }

    // 4. Save next unlocked node to SQLite if applicable
    if (nextNodeToUnlock) {
      await dbService.saveLessonNodeProgress(
        (nextNodeToUnlock as { nodeId: string; unitId: number }).nodeId,
        (nextNodeToUnlock as { nodeId: string; unitId: number }).unitId,
        true,
        0,
        3,
        0
      );
    }
  };

  // Skip a unit or multiple units/lessons up to target
  const handleSkipUnit = async (unitId: number, targetNodeId?: string, skippedNodeIds?: string[]) => {
    const toSkipSet = new Set(skippedNodeIds || []);
    let nodesToPersist: { node: LessonNode; unitId: number }[] = [];
    let unlockedTargetNodeId: string | null = null;
    let unlockedTargetUnitId: number | null = null;
    let newUnits: Unit[] = [];

    if (toSkipSet.size > 0) {
      newUnits = units.map(unit => {
        let unitChanged = false;
        const newNodes = unit.nodes.map(node => {
          if (toSkipSet.has(node.id)) {
            unitChanged = true;
            const updated: LessonNode = {
              ...node,
              unlocked: true,
              completedSteps: node.totalSteps,
              stars: Math.max(node.stars, 1)
            };
            nodesToPersist.push({ node: updated, unitId: unit.id });
            return updated;
          }
          if (targetNodeId && node.id === targetNodeId) {
            unitChanged = true;
            unlockedTargetNodeId = node.id;
            unlockedTargetUnitId = unit.id;
            const updated: LessonNode = { ...node, unlocked: true };
            nodesToPersist.push({ node: updated, unitId: unit.id });
            return updated;
          }
          return node;
        });

        // Si la unidad es la objetivo y no se especificó un nodo individual, desbloquear su primer nodo
        if (!targetNodeId && unit.id === unitId) {
          if (newNodes.length > 0 && !newNodes[0].unlocked) {
            unitChanged = true;
            unlockedTargetNodeId = newNodes[0].id;
            unlockedTargetUnitId = unit.id;
            newNodes[0] = { ...newNodes[0], unlocked: true };
            nodesToPersist.push({ node: newNodes[0], unitId: unit.id });
          }
        }

        return unitChanged ? { ...unit, nodes: newNodes } : unit;
      });
    } else {
      // Fallback: saltar una sola unidad desbloqueada
      const unitIndex = units.findIndex(u => u.id === unitId);
      if (unitIndex === -1) return;

      const targetUnit = units[unitIndex];
      const isUnlocked = targetUnit.nodes.some(n => n.unlocked);
      if (!isUnlocked) return;

      const updatedNodes = targetUnit.nodes.map(n => ({
        ...n,
        unlocked: true,
        completedSteps: n.totalSteps,
        stars: Math.max(n.stars, 1)
      }));

      newUnits = units.map((unit, idx) => {
        if (idx === unitIndex) {
          return { ...unit, nodes: updatedNodes };
        }
        if (idx === unitIndex + 1 && unit.nodes.length > 0) {
          unlockedTargetNodeId = unit.nodes[0].id;
          unlockedTargetUnitId = unit.id;
          const newNodes = [...unit.nodes];
          newNodes[0] = { ...newNodes[0], unlocked: true };
          return { ...unit, nodes: newNodes };
        }
        return unit;
      });

      updatedNodes.forEach(n => nodesToPersist.push({ node: n, unitId }));
    }

    setUnits(newUnits);

    // Persistir nodos actualizados a SQLite
    for (const item of nodesToPersist) {
      await dbService.saveLessonNodeProgress(
        item.node.id,
        item.unitId,
        true,
        item.node.completedSteps,
        item.node.totalSteps,
        item.node.stars
      );
    }
    if (unlockedTargetNodeId && unlockedTargetUnitId !== null) {
      await dbService.saveLessonNodeProgress(
        unlockedTargetNodeId,
        unlockedTargetUnitId,
        true,
        0,
        3,
        0
      );
    }

    // Calcular XP y gemas balanceadas para prueba de salto (evita inflar logros y economía)
    const skippedCount = toSkipSet.size > 0 ? toSkipSet.size : 1;
    const gainedXp = skippedCount > 6 ? 80 : 50;
    const gainedGems = skippedCount > 6 ? 15 : 10;

    const today = getLocalDateKey();
    const baseStreak = isStreakBroken(profile.lastActiveDate, profile.streakDays) ? 0 : profile.streakDays;
    const shouldIncrementStreak = baseStreak === 0 || profile.lastActiveDate !== today;
    recordDailyLessonActivity(gainedXp, profile.hearts);

    const updatedProfile: UserProfile = {
      ...profile,
      xp: profile.xp + gainedXp,
      gems: profile.gems + gainedGems,
      streakDays: shouldIncrementStreak ? baseStreak + 1 : baseStreak,
      lastActiveDate: today
    };
    setProfile(updatedProfile);
    await dbService.saveUserProfile(updatedProfile);

    sound.playLessonComplete();

    // Notificar al roadmap para enfocar la nueva lección disponible
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('focus-roadmap-active-node'));
    }, 400);
  };

  // Rate a flashcard in SRS
  const handleRateCard = async (cardId: string, category: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    await dbService.updateFlashcardSRS(cardId, category, rating);

    // Also award +2 XP for studying flashcards
    const updatedProfile: UserProfile = {
      ...profile,
      xp: profile.xp + 2
    };
    setProfile(updatedProfile);
    await dbService.saveUserProfile(updatedProfile);

    // Refresh local state
    const srsMap = await dbService.getFlashcardSRSMap();
    setFlashcards(prev => prev.map(c => {
      if (c.id === cardId && srsMap[cardId]) {
        return {
          ...c,
          srsLevel: srsMap[cardId].srsLevel,
          intervalDays: srsMap[cardId].intervalDays,
          nextReviewDate: srsMap[cardId].nextReviewDate
        };
      }
      return c;
    }));
  };

  // Reset database progress
  const handleResetProgress = async () => {
    await dbService.resetAllProgress();
    window.location.reload();
  };

  if (viewMode === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <IonApp className="font-['Nunito',sans-serif]">
      <IonContent ref={ionContentRef} fullscreen className="bg-gray-50 dark:bg-[#131f24] transition-colors duration-200">
        <div className="min-h-screen bg-gray-50 dark:bg-[#131f24] text-gray-800 dark:text-gray-100 flex flex-col transition-colors duration-200">
          {/* Top Status Bar (Duolingo style) */}
          <TopBar
            profile={profile}
            nextHeartMinutes={nextHeartMinutes}
            onSoundToggle={handleSoundToggle}
            onOpenLanding={!isNative ? handleReturnToLanding : undefined}
          />

          {/* Active Tab Screen */}
          <main className="flex-1">
            {activeTab === 'roadmap' && (
              <RoadmapPage
                units={units}
                userProfile={profile}
                onCompleteLesson={handleCompleteLesson}
                onSkipUnit={handleSkipUnit}
                onDeductHeart={handleDeductHeart}
                onOpenTheory={handleOpenTheory}
              />
            )}
            {activeTab === 'theory' && (
              <TheoryPage
                initialUnitId={theoryUnitId}
                onBackToRoadmap={() => setActiveTab('roadmap')}
                units={units}
                userProfile={profile}
                onCompleteLesson={handleCompleteLesson}
                onDeductHeart={handleDeductHeart}
              />
            )}
            {activeTab === 'flashcards' && (
              <FlashcardsPage
                cards={flashcards}
                onRateCard={handleRateCard}
                showRomaji={profile.showRomaji}
                maxUnlockedLesson={units.reduce((max, u) => {
                  const uMax = u.nodes.reduce(
                    (nMax, n) => (n.unlocked ? Math.max(nMax, n.lessonNumber ?? u.id) : nMax),
                    0
                  );
                  return Math.max(max, uMax);
                }, 0)}
              />
            )}
            {activeTab === 'kanas' && (
              <KanaPage showRomaji={profile.showRomaji} />
            )}
            {activeTab === 'readings' && (
              <ReadingsPage units={units} showRomaji={profile.showRomaji} />
            )}
            {activeTab === 'vocabulary' && (
              <VocabularyPage showRomaji={profile.showRomaji} onNavigateTab={setActiveTab} />
            )}
            {activeTab === 'writing' && (
              <WritingPage showRomaji={profile.showRomaji} />
            )}
            {activeTab === 'speaking' && (
              <SpeakingPage units={units} showRomaji={profile.showRomaji} />
            )}
            {activeTab === 'mastery' && (
              <MasteryPage
                cards={flashcards}
                units={units}
                onRateCard={handleRateCard}
                showRomaji={profile.showRomaji}
                onNavigateTab={setActiveTab}
              />
            )}
            {activeTab === 'jlpt' && (
              <JlptTowerPage onAwardReward={handleClaimQuestReward} />
            )}
            {activeTab === 'profile' && (
              <ProfilePage
                profile={profile}
                units={units}
                nextHeartMinutes={nextHeartMinutes}
                onRefillHearts={handleRefillHearts}
                onResetProgress={handleResetProgress}
                onToggleRomaji={handleToggleRomaji}
                onToggleDarkMode={handleToggleDarkMode}
                onClaimQuestReward={handleClaimQuestReward}
                onChangeVoice={handleChangeVoice}
                onNavigateTab={setActiveTab}
              />
            )}
          </main>

          {/* Persistent Background Download Banner across all tabs */}
          <GlobalDownloadBanner
            currentTab={activeTab}
            onNavigateToProfile={() => setActiveTab('profile')}
          />

          {/* Bottom Navigation */}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </IonContent>
    </IonApp>
  );
};

export default App;

