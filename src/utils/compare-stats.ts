import {
  MAX_BASE_STAT,
  MAX_TOTAL,
  type PokemonStats,
  STATS,
  statFraction,
  statTotal,
} from '@/utils/pokemon-stats';

/** The two sides of Compare. */
export type CompareSlot = 'left' | 'right';

/** Returns the slot from the picker's route param, or null if it is not a slot. */
export function parseCompareSlot(param: string | string[] | undefined): CompareSlot | null {
  return param === 'left' || param === 'right' ? param : null;
}

/** One row of Compare: both values, their bar lengths and which side is higher. */
export type CompareRow = {
  key: string;
  label: string;
  left: number;
  right: number;
  /** Bar lengths as a fraction of the track (0–255 for a stat, 0–1530 for Total). */
  leftFraction: number;
  rightFraction: number;
  /** The side with the higher value; null when both are equal. */
  higher: CompareSlot | null;
};

/** The six stats in display order, then Total (the sum of the six). */
export function compareRows(left: PokemonStats, right: PokemonStats): CompareRow[] {
  const rows = STATS.map(({ key, label }) =>
    compareRow(key, label, left[key], right[key], MAX_BASE_STAT),
  );
  rows.push(compareRow('total', 'Total', statTotal(left), statTotal(right), MAX_TOTAL));
  return rows;
}

function compareRow(
  key: string,
  label: string,
  left: number,
  right: number,
  max: number,
): CompareRow {
  let higher: CompareSlot | null = null;
  if (left > right) higher = 'left';
  if (right > left) higher = 'right';
  return {
    key,
    label,
    left,
    right,
    leftFraction: statFraction(left, max),
    rightFraction: statFraction(right, max),
    higher,
  };
}
