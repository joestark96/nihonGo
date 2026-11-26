const RECORDS_KEY = 'nihongo_minigame_records_v1';

export type MinigameId =
  | 'kana-blitz'
  | 'memory'
  | 'sentence'
  | 'kanji-dojo'
  | 'kanji-compounds'
  | 'radical-hunter'
  | 'kanji-draw';

export function getMinigameRecords(): Partial<Record<MinigameId, number>> {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Saves a score if it beats the current personal best for `gameId` (or if `lowerIsBetter` is true, e.g. memory attempts).
 * Returns `true` if a new personal record was set.
 */
export function recordMinigameScore(
  gameId: MinigameId,
  value: number,
  lowerIsBetter: boolean = false
): boolean {
  try {
    const records = getMinigameRecords();
    const prev = records[gameId];
    const isNewBest =
      prev === undefined || (lowerIsBetter ? value < prev : value > prev);
    if (isNewBest) {
      records[gameId] = value;
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    }
    return isNewBest;
  } catch {
    return false;
  }
}
