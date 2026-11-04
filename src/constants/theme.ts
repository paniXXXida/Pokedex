/**
 * Design tokens from the Figma design (see "Theme tokens" and "Type colours" in specs/product.md).
 * The app has one light theme; dark mode is out of scope.
 */

export const Colors = {
  midnight: '#0E0940',
  purple: '#5631E8',
  daylight: '#EDF6FF',
  silver: '#DBDAE6',
  cardImageBackground: '#F6F6FF',
  white: '#FFFFFF',
  /** Inactive tab icon and label on Android (sampled from the Figma navigation bar). */
  androidTabInactive: '#67678C',
  /** iOS options sheet (Figma): row background, separator lines, Cancel, icons and Cancel label, row labels. */
  iosSheetRow: '#F0F0F0',
  iosSheetSeparator: '#DADADA',
  iosSheetCancel: '#FEFEFE',
  iosAction: '#006DF8',
  iosSheetLabel: '#000000',
  /** Dimmed screen behind the options sheet (agreed value; not in Figma). */
  backdrop: 'rgba(0, 0, 0, 0.3)',
} as const;

/** Keys are the type names used by PokeAPI. */
export const TypeColors = {
  normal: '#9099A2',
  fighting: '#CE3F6A',
  flying: '#93A9E2',
  poison: '#AB6AC8',
  ground: '#D87645',
  rock: '#C4BA85',
  bug: '#8FBF2B',
  ghost: '#546AA6',
  steel: '#5A8FA1',
  fire: '#FF4F68',
  water: '#4D90D6',
  grass: '#64BC55',
  electric: '#FFCF00',
  psychic: '#830CB9',
  ice: '#7DE0D0',
  dragon: '#0670BE',
  dark: '#5C5262',
  fairy: '#EB90E6',
  unknown: '#B6B6B6',
  shadow: '#5B5265',
} as const;

/** Family names registered with Expo Font in src/hooks/use-app-fonts.ts. */
export const Fonts = {
  regular: 'Rubik-Regular',
  medium: 'Rubik-Medium',
  semiBold: 'Rubik-SemiBold',
  bold: 'Rubik-Bold',
} as const;

export const Spacing = {
  screen: 24,
  gap: 16,
  searchInset: 16,
} as const;

export const Radius = {
  card: 8,
  badge: 4,
  chip: 99,
  /** iOS options sheet groups and Cancel. */
  sheet: 16,
} as const;

/** Card shadow: #303773 at 15%, offset 0/2, blur 15. */
export const Shadow = {
  card: '0px 2px 15px rgba(48, 55, 115, 0.15)',
} as const;
