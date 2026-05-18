export interface FastingStage {
  id: string;
  rangeHours: [number, number]; // [start, end) — end is exclusive; last is Infinity
}

export const STAGES: FastingStage[] = [
  { id: 'fed', rangeHours: [0, 4] },
  { id: 'early-fast', rangeHours: [4, 12] },
  { id: 'metabolic-shift', rangeHours: [12, 16] },
  { id: 'fat-burning', rangeHours: [16, 18] },
  { id: 'ketosis', rangeHours: [18, 24] },
  { id: 'autophagy', rangeHours: [24, 48] },
  { id: 'deep-autophagy', rangeHours: [48, 72] },
  { id: 'prolonged', rangeHours: [72, Infinity] }
];

export function stageForHours(hours: number): FastingStage {
  const found = STAGES.find(
    (s) => hours >= s.rangeHours[0] && hours < s.rangeHours[1]
  );
  return found ?? STAGES[STAGES.length - 1];
}

export function nextStage(current: FastingStage): FastingStage | undefined {
  const idx = STAGES.findIndex((s) => s.id === current.id);
  if (idx < 0 || idx >= STAGES.length - 1) return undefined;
  return STAGES[idx + 1];
}
