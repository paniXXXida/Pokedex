/** The six base stats in display order; keys are the stat names used by PokeAPI. */
export const STATS = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'special-attack', label: 'Special Attack' },
  { key: 'special-defense', label: 'Special Defense' },
  { key: 'speed', label: 'Speed' },
] as const;

export type StatKey = (typeof STATS)[number]['key'];

export type PokemonStats = Record<StatKey, number>;

/** The highest possible base stat: bars are drawn on a 0–255 scale (Detail and Compare). */
export const MAX_BASE_STAT = 255;

/** Bar length as a fraction of the track, clamped to 0–1. */
export function statFraction(value: number, max: number = MAX_BASE_STAT): number {
  return Math.min(Math.max(value / max, 0), 1);
}
