export interface DailyQuestStats {
  lessonsCompleted: number;
  xpEarned: number;
  maintainedHearts: boolean;
}

/**
 * Returns YYYY-MM-DD in the user's LOCAL timezone.
 * Avoids UTC mismatch where evenings (after 6 PM in Mexico/UTC-6) turn into tomorrow.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

/**
 * Returns true if the user has a positive streakDays count, but their lastActiveDate
 * is older than yesterday (meaning they missed at least one full day).
 */
export function isStreakBroken(lastActiveDate: string, streakDays: number): boolean {
  if (streakDays <= 0) return false;
  if (!lastActiveDate) return true;
  const today = getLocalDateKey();
  const yesterday = getYesterdayDateKey();
  return lastActiveDate !== today && lastActiveDate !== yesterday;
}

/**
 * Retrieves today's accumulated lesson, XP, and heart metrics for daily quests.
 */
export function getDailyQuestStats(dateKey: string = getLocalDateKey()): DailyQuestStats {
  try {
    const raw = localStorage.getItem(`genki_daily_stats_${dateKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        lessonsCompleted: Number(parsed.lessonsCompleted) || 0,
        xpEarned: Number(parsed.xpEarned) || 0,
        maintainedHearts: Boolean(parsed.maintainedHearts)
      };
    }
  } catch {
    // fallback on storage error
  }
  return { lessonsCompleted: 0, xpEarned: 0, maintainedHearts: false };
}

/**
 * Records completed lesson activity into today's local bucket.
 */
export function recordDailyLessonActivity(earnedXp: number, currentHearts: number): DailyQuestStats {
  const dateKey = getLocalDateKey();
  const current = getDailyQuestStats(dateKey);
  const updated: DailyQuestStats = {
    lessonsCompleted: current.lessonsCompleted + 1,
    xpEarned: current.xpEarned + earnedXp,
    maintainedHearts: current.maintainedHearts || currentHearts >= 3
  };
  try {
    localStorage.setItem(`genki_daily_stats_${dateKey}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

