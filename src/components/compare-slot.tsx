import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { ErrorState, LoadingState } from '@/components/load-state';
import { CARD_FOOTER_HEIGHT, PokemonCard } from '@/components/pokemon-card';
import { Colors, Fonts, Radius, Shadow, Spacing } from '@/constants/theme';
import type { CompareSide } from '@/hooks/use-compare-selection';
import type { CatalogueEntry } from '@/services/pokeapi';

type CompareSlotProps = {
  entry: CatalogueEntry | null;
  /** The stats of this slot: their own loading and error state below the card. */
  side: CompareSide;
  /** Same width as a list card, so the slot looks like one. */
  width: number;
  /** "left" or "right", for screen readers. */
  position: string;
  /** Opens the picker for this slot, both when it is empty and to change it. */
  onPress: () => void;
};

/**
 * One Compare slot (no Figma design, compare.md). Empty: a white card with "+" and
 * "Select Pokémon". Filled: the list card without "⋮" and a "Change" label.
 */
export function CompareSlot({ entry, side, width, position, onPress }: CompareSlotProps) {
  return (
    <View style={{ width }}>
      {entry === null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Select Pokémon for the ${position} side`}
          onPress={onPress}
          style={[styles.emptyCard, { height: width + CARD_FOOTER_HEIGHT }]}>
          <AppText variant="title" style={styles.plus}>
            +
          </AppText>
          <AppText variant="medium" style={styles.emptyLabel}>
            Select Pokémon
          </AppText>
        </Pressable>
      ) : (
        <>
          <PokemonCard pokemon={entry} width={width} onPress={onPress} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change the Pokémon on the ${position} side`}
            hitSlop={8}
            onPress={onPress}
            style={styles.change}>
            <AppText style={styles.changeLabel}>Change</AppText>
          </Pressable>
        </>
      )}
      {side.status === 'loading' && <LoadingState style={styles.state} />}
      {side.status === 'error' && (
        <ErrorState
          title="Could not load the stats"
          message={side.message}
          retrying={side.retrying}
          onRetry={side.retry}
          style={styles.state}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Same white card, radius and shadow as the list card.
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
    boxShadow: Shadow.card,
  },
  plus: {
    color: Colors.purple,
    fontSize: 40,
    lineHeight: 48,
  },
  emptyLabel: {
    fontSize: 14,
    lineHeight: 16.8,
  },
  change: {
    alignSelf: 'center',
    marginTop: 12,
  },
  changeLabel: {
    color: Colors.purple,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 16.8,
  },
  // Sized by its content instead of `flex: 1`, which would collapse in the scrolling screen.
  state: {
    flex: 0,
    marginTop: Spacing.gap,
  },
});
