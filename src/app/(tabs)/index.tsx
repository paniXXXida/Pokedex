import { useMemo, useRef, useState } from 'react';
import { type FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EmptyState, ErrorState, LoadingState } from '@/components/load-state';
import { PokemonGrid } from '@/components/pokemon-grid';
import { SearchField } from '@/components/search-field';
import { Colors, Spacing } from '@/constants/theme';
import { useCatalogue } from '@/hooks/use-catalogue';
import { type CatalogueEntry, describeLoadError } from '@/services/pokeapi';
import { filterByName, normalizeSearchText } from '@/utils/pokemon-search';

/** Figma: the field sits at X=16 on both platforms; its width follows the screen. */
const SEARCH_FIELD_MARGIN = 16;
/**
 * Assumption (search.md): 16 below the real safe area. The mockups' status bar heights were not
 * measured, so Figma's Y=60 (iOS) / Y=68 (Android) cannot be converted exactly.
 */
const SEARCH_FIELD_TOP = 16;
/** iOS Home: field bottom 108, title block 140. Also used on Android and above search results. */
const LIST_TOP_GAP = 32;

export default function PokemonListScreen() {
  const catalogue = useCatalogue();
  const gridRef = useRef<FlatList<CatalogueEntry>>(null);
  // The query exactly as typed; only its normalised form is used for searching.
  const [rawQuery, setRawQuery] = useState('');
  const searchText = normalizeSearchText(rawQuery);
  const isSearching = searchText !== '';

  // Filtered on the phone from the complete index: no API request per keystroke.
  const results = useMemo(
    () => (catalogue.data === undefined ? undefined : filterByName(catalogue.data, searchText)),
    [catalogue.data, searchText],
  );

  function changeQuery(text: string) {
    // New results start at the top, also after scrolling deep into the full list.
    if (normalizeSearchText(text) !== searchText) {
      gridRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
    setRawQuery(text);
  }

  // Scrolls with the grid. The title is hidden while searching (search.md).
  const listTop = (
    <View style={styles.listTop}>
      {!isSearching && (
        <AppText variant="title" style={styles.title}>
          All Pokémon
        </AppText>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.searchBar}>
        <SearchField value={rawQuery} onChangeText={changeQuery} />
      </View>
      {results !== undefined ? (
        <PokemonGrid
          ref={gridRef}
          pokemon={results}
          header={listTop}
          empty={<EmptyState title="No Pokémon found" />}
        />
      ) : (
        <View style={styles.stateContainer}>
          {listTop}
          {catalogue.isError ? (
            <ErrorState
              title="Could not load the Pokémon list"
              message={describeLoadError(catalogue.error)}
              retrying={catalogue.isFetching}
              onRetry={() => catalogue.refetch()}
            />
          ) : (
            <LoadingState />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.daylight,
  },
  // Drawn above the grid, so cards scroll under the field and its shadow.
  searchBar: {
    zIndex: 1,
    paddingHorizontal: SEARCH_FIELD_MARGIN,
    paddingTop: SEARCH_FIELD_TOP,
  },
  listTop: {
    paddingTop: LIST_TOP_GAP,
  },
  // Figma: 16 between the title and the first row.
  title: {
    marginBottom: Spacing.gap,
  },
  stateContainer: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
  },
});
