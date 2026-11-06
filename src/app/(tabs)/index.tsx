import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EmptyState, ErrorState, LoadingState } from '@/components/load-state';
import { PokemonGrid } from '@/components/pokemon-grid';
import { SearchField } from '@/components/search-field';
import { Colors, Spacing } from '@/constants/theme';
import { useCatalogueSearch } from '@/hooks/use-catalogue-search';
import { describeLoadError } from '@/services/pokeapi';

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
  const { catalogue, gridRef, rawQuery, changeQuery, isSearching, results } = useCatalogueSearch();

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
