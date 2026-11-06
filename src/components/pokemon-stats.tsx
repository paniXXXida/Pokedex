import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { type PokemonStats as Stats, STATS, statFraction } from '@/utils/pokemon-stats';

/**
 * The Stats tab: six rows with the base stat and a bar. Bar length = value / 255 (the highest
 * possible base stat), so bars are comparable between Pokémon.
 */
export function PokemonStats({ stats }: { stats: Stats }) {
  return (
    <View style={styles.list}>
      {STATS.map(({ key, label }) => (
        <View key={key} style={styles.row}>
          <View style={styles.labels}>
            <AppText style={[styles.text, styles.label]}>{label}</AppText>
            <AppText style={[styles.text, styles.value]}>{stats[key]}</AppText>
          </View>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${statFraction(stats[key]) * 100}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: 24 between rows, 7 between the text and the bar.
  list: {
    gap: 24,
  },
  row: {
    gap: 7,
  },
  labels: {
    flexDirection: 'row',
  },
  // Figma: Rubik 14 with line height 125%; label and value each take half the width.
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 17.5,
  },
  label: {
    fontFamily: Fonts.semiBold,
  },
  value: {
    textAlign: 'right',
    opacity: 0.65,
  },
  // Figma: 4 high, radius 99, track Shades/Grey, bar Purple.
  track: {
    height: 4,
    overflow: 'hidden',
    borderRadius: Radius.chip,
    backgroundColor: Colors.grey,
  },
  bar: {
    height: 4,
    borderRadius: Radius.chip,
    backgroundColor: Colors.purple,
  },
});
