import { router } from 'expo-router';
import { type ReactElement, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { CARD_FOOTER_HEIGHT, PokemonCard } from '@/components/pokemon-card';
import { PokemonOptionsSheet } from '@/components/pokemon-options-sheet';
import { Spacing } from '@/constants/theme';
import type { CatalogueEntry } from '@/services/pokeapi';

const COLUMNS = 2;

type PokemonGridProps = {
  pokemon: CatalogueEntry[];
  /** Scrolls with the grid above the first row, for example the screen title. */
  header: ReactElement;
};

/**
 * Two-column virtualized grid of Pokémon cards with the options menu, shared by List, Search
 * and Favorites. A card opens Detail; "⋮" opens the options sheet.
 */
export function PokemonGrid({ pokemon, header }: PokemonGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [menuPokemon, setMenuPokemon] = useState<CatalogueEntry | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // (available width − 2 × 24 − 16) / 2, rounded down so two cards always fit in a row.
  const cardWidth = Math.floor((windowWidth - 2 * Spacing.screen - Spacing.gap) / COLUMNS);
  // Every row is one card high plus the 16 gap below it.
  const rowLength = cardWidth + CARD_FOOTER_HEIGHT + Spacing.gap;

  function openMenu(entry: CatalogueEntry) {
    setMenuPokemon(entry);
    setMenuVisible(true);
  }

  return (
    <>
      <FlatList
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
          <View
            onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
            style={styles.header}>
            {header}
          </View>
        }
        // All rows have the same height, so their positions are calculated instead of measured.
        // With columns, `index` is the row index; offsets start below the measured header.
        getItemLayout={(_, index) => ({
          length: rowLength,
          offset: headerHeight + rowLength * index,
          index,
        })}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
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
  router.push({ pathname: '/pokemon/[id]', params: { id: String(entry.id) } });
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
  },
  // Figma: 16 between the title and the first row.
  header: {
    paddingBottom: Spacing.gap,
  },
  // Figma: 16 between the cards of a row and between rows.
  row: {
    gap: Spacing.gap,
    marginBottom: Spacing.gap,
  },
});
