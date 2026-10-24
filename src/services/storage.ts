export function saveLatestLevelCompleted(level: number): void {
  window.localStorage.setItem('latestLevelCompleted', String(level));
}

export function getLatestLevelCompleted(): number {
  return Number(window.localStorage.getItem('latestLevelCompleted'));
}
