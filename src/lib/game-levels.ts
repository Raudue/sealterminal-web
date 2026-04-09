// Seal levels — mirrors multiprompter/src/shared/types.ts
const SEAL_LEVELS = [
  { rank: 1, fishRequired: 0 },
  { rank: 2, fishRequired: 25 },
  { rank: 3, fishRequired: 75 },
  { rank: 4, fishRequired: 150 },
  { rank: 5, fishRequired: 300 },
  { rank: 6, fishRequired: 500 },
  { rank: 7, fishRequired: 800 },
  { rank: 8, fishRequired: 1200 },
  { rank: 9, fishRequired: 1800 },
  { rank: 10, fishRequired: 2600 },
  { rank: 11, fishRequired: 3600 },
  { rank: 12, fishRequired: 5000 },
];

export function getLevelForFish(fish: number): number {
  for (let i = SEAL_LEVELS.length - 1; i >= 0; i--) {
    if (fish >= SEAL_LEVELS[i].fishRequired) return SEAL_LEVELS[i].rank;
  }
  return 1;
}
