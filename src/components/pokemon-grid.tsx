import { router } from 'expo-router';
import { type ReactElement, type Ref, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, useWindowDimensions, View } from 'react-native';

import { CARD_FOOTER_HEIGHT, PokemonCard } from '@/components/pokemon-card';
import { PokemonOptionsSheet } from '@/components/pokemon-options-sheet';
import { Spacing } from '@/constants/theme';
import type { CatalogueEntry } from '@/services/pokeapi';

const COLUMNS = 2;

type PokemonGridProps = {
  pokemon: CatalogueEntry[];
  /**
   * Scrolls with the grid above the first row, for example the screen title. Its height is
   * measured, so it includes its own spacing to the first row and may change (Search hides the
   * title); `getItemLayout` then uses the new height.
   */
  header: ReactElement;
  /** Shown below the header when `pokemon` is empty, for example "No Pokémon found". */
  empty?: ReactElement;
  /** The underlying list, for example to scroll back to the top when the results change. */
  ref?: Ref<FlatList<CatalogueEntry>>;
};

/**
 * Two-column virtualized grid of Pokémon cards with the options menu, shared by List, Search
 * and Favorites. A card opens Detail; "⋮" opens the options sheet. Dragging the grid closes the
 * keyboard, and taps on cards work while it is open.
 */
export function PokemonGrid({ pokemon, header, empty, ref }: PokemonGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [menuPokemon, setMenuPokemon] = useState<CatalogueEntry | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // (available width − 2 × 24 − 16) / 2, rounded down so two cards always fit in a row.
  const cardWidth = Math.floor((windowWidth - 2 * Spacing.screen - Spacing.gap) / COLUMNS);
  // Every row is one card high plus the 16 gap below it.
  const rowLength = cardWidth + CARD_FOOTER_HEIGHT + Spacing.gap;

  function openMenu(entry: CatalogueEntry) {
    Keyboard.dismiss();
    setMenuPokemon(entry);
    setMenuVisible(true);
  }

  return (
    <>
      <FlatList
        ref={ref}
        data={pokemon}
        numColumns={COLUMNS}
        keyExtractor={(entry) => String(entry.id)}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            width={cardWidth}
            onPress={openPokemon}
            onOptionsPress={openMenu}
          />
        )}
        ListHeaderComponent={
          <View onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
            {header}
          </View>
        }
        ListEmptyComponent={empty}
        // All rows have the same height, so their positions are calculated instead of measured.
        // With columns, `index` is the row index; offsets start below the measured header.
        getItemLayout={(_, index) => ({
          length: rowLength,
          offset: headerHeight + rowLength * index,
          index,
        })}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        // The first tap on a card or "⋮" works while the keyboard is open.
        keyboardShouldPersistTaps="handled"
      />
      <PokemonOptionsSheet
        pokemon={menuPokemon}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onOpenPokemon={openPokemon}
      />
    </>
  );
}

function openPokemon(entry: CatalogueEntry) {
  Keyboard.dismiss();
  router.push({ pathname: '/pokemon/[id]', params: { id: String(entry.id) } });
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
  },
  // Figma: 16 between the cards of a row and between rows.
  row: {
    gap: Spacing.gap,
    marginBottom: Spacing.gap,
  },
});
