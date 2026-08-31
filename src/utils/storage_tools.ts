export const LocalStorageKey = {
  LastGameDate: "lastGameDate",
  GameWon: 'gameWon',
  GuessIndices: 'guessIndices',
  Date: 'date',
  GameHistory: 'history',
  ShowHints: 'showHints',
  HintsShown: 'hintsShown',
  Cheater: 'google-analytics::initialised',
  PlayStreak: 'playStreak',
  GamePointsHistory: 'gamePointsHistory',
} as const;

export function readNumberFromStorage(key: string): number | null {
    try {
        const value = JSON.parse(localStorage.getItem(key) ?? 'null');
        console.log(`value: ${value}`);
        return typeof value === 'number' && Number.isFinite(value) ? value : null;
    } catch {
        return null;
    }
}

export function readNumberArrayFromStorage(key: string): number[] {
  try {
    const array = JSON.parse(
      localStorage.getItem(key) ?? '[]'
    );

    return Array.isArray(array)
      && array.every(value => typeof value === 'number')
      ? array
      : [];
  } catch {
    return []
  }
}

export function readStringArrayFromStorage(key: string): string[] {
  try {
    const array = JSON.parse(
      localStorage.getItem(key) ?? '[]'
    );

    return Array.isArray(array)
      ? array
      : [];
  } catch {
    return []
  }
}

export function readBooleanFromStorage(key: string): boolean {
  return localStorage.getItem(key) == 'true';
}

export function getAverageScore() {
  const allScores = readNumberArrayFromStorage(LocalStorageKey.GameHistory);
  return (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1);
}

export function getDate(deltaDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + deltaDays);
  return date.toLocaleDateString('en-CA');
}