export interface FastingStage {
  id: string;
  name: string;
  rangeHours: [number, number]; // [start, end) — end is exclusive; last is Infinity
  summary: string;
  benefits: string[];
}

export const STAGES: FastingStage[] = [
  {
    id: 'fed',
    name: 'Fed state',
    rangeHours: [0, 4],
    summary:
      'Your body is digesting and absorbing the last meal. Insulin is elevated and energy comes from food.',
    benefits: [
      'Nutrients are being absorbed and stored',
      'Muscle protein synthesis is active'
    ]
  },
  {
    id: 'early-fast',
    name: 'Early fast',
    rangeHours: [4, 12],
    summary:
      'Insulin starts to drop. Your body shifts to using stored glycogen for energy.',
    benefits: [
      'Insulin levels begin to fall',
      'Glycogen stores are tapped for fuel',
      'Digestive system gets a break'
    ]
  },
  {
    id: 'metabolic-shift',
    name: 'Metabolic shift',
    rangeHours: [12, 16],
    summary:
      'Glycogen is mostly depleted. Your liver starts converting fat into ketones.',
    benefits: [
      'Fat burning ramps up (lipolysis)',
      'Early ketone production begins',
      'Human growth hormone starts rising'
    ]
  },
  {
    id: 'fat-burning',
    name: 'Fat burning',
    rangeHours: [16, 18],
    summary:
      'You’re running primarily on fat. Ketone levels climb noticeably.',
    benefits: [
      'Improved insulin sensitivity',
      'Steady energy from fat stores',
      'Mild appetite suppression'
    ]
  },
  {
    id: 'ketosis',
    name: 'Ketosis',
    rangeHours: [18, 24],
    summary:
      'You enter sustained ketosis. Brain and muscles use ketones efficiently.',
    benefits: [
      'Mental clarity and focus',
      'Stable energy without crashes',
      'Inflammation markers begin to drop'
    ]
  },
  {
    id: 'autophagy',
    name: 'Autophagy',
    rangeHours: [24, 48],
    summary:
      'Cells begin recycling old proteins and damaged components — your body’s self-clean cycle.',
    benefits: [
      'Cellular cleanup (autophagy) increases',
      'Growth hormone surges',
      'Stronger anti-inflammatory effects'
    ]
  },
  {
    id: 'deep-autophagy',
    name: 'Deep autophagy',
    rangeHours: [48, 72],
    summary:
      'Autophagy intensifies. Stem cell activity and immune renewal begin.',
    benefits: [
      'Peak autophagy activity',
      'Stem cell regeneration begins',
      'Insulin sensitivity at its best'
    ]
  },
  {
    id: 'prolonged',
    name: 'Prolonged fast',
    rangeHours: [72, Infinity],
    summary:
      'Extended fast — significant immune reset and deep metabolic effects. Best done with medical guidance.',
    benefits: [
      'Immune system regeneration',
      'Maximum growth hormone',
      'Profound metabolic reset'
    ]
  }
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
