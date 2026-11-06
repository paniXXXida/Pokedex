import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Fonts, Spacing } from '@/constants/theme';
import type { Pokemon } from '@/services/pokeapi';
import {
  formatHeight,
  formatPokemonName,
  formatPokemonNumber,
  formatWeight,
} from '@/utils/pokemon-format';

/** Figma: the label column is 100 wide. */
const LABEL_WIDTH = 100;

/**
 * The About tab, from the already loaded `/pokemon/{id}` data. Built as rows (label + value),
 * not two columns as in Figma, so a value that wraps cannot shift the other rows.
 */
export function PokemonAbout({ pokemon }: { pokemon: Pokemon }) {
  const rows = [
    { label: 'Name', value: formatPokemonName(pokemon.name) },
    { label: 'ID', value: formatPokemonNumber(pokemon.id) },
    {
      label: 'Base',
      value: pokemon.baseExperience === null ? '—' : `${pokemon.baseExperience} XP`,
    },
    { label: 'Weight', value: formatWeight(pokemon.weight) },
    { label: 'Height', value: formatHeight(pokemon.height) },
    { label: 'Types', value: pokemon.types.map(formatPokemonName).join(', ') },
    { label: 'Abilities', value: pokemon.abilities.map(formatPokemonName).join(', ') },
  ];

  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <AppText style={[styles.text, styles.label]}>{row.label}</AppText>
          <AppText style={[styles.text, styles.value]}>{row.value}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: 16 between rows and between label and value.
  list: {
    gap: Spacing.gap,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.gap,
  },
  // Figma: Rubik 14 with line height 125%.
  text: {
    fontSize: 14,
    lineHeight: 17.5,
  },
  label: {
    width: LABEL_WIDTH,
    fontFamily: Fonts.semiBold,
  },
  value: {
    flex: 1,
    opacity: 0.65,
  },
});
