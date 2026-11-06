import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Colors, Fonts, Radius, TypeColors } from '@/constants/theme';
import { formatPokemonName } from '@/utils/pokemon-format';

/** Figma: a 12 pt dot in the type colour. */
const DOT_SIZE = 12;

/** A type chip from the Detail design: the type's colour dot and its name. */
export function TypeChip({ type }: { type: string }) {
  return (
    <View style={styles.chip}>
      <View style={[styles.dot, { backgroundColor: typeColor(type) }]} />
      <AppText style={styles.label}>{formatPokemonName(type)}</AppText>
    </View>
  );
}

/** A type the palette does not know (a new type in PokeAPI) gets the "Unknown" colour. */
function typeColor(type: string): string {
  return isTypeName(type) ? TypeColors[type] : TypeColors.unknown;
}

function isTypeName(type: string): type is keyof typeof TypeColors {
  return Object.hasOwn(TypeColors, type);
}

const styles = StyleSheet.create({
  // Figma: padding L 12, T 4, R 14, B 4; gap 8; radius 99; Midnight at 8%.
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 4,
    borderRadius: Radius.chip,
    backgroundColor: Colors.typeChip,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
});
