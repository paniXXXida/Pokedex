import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EmptyState, ErrorState, LoadingState } from '@/components/load-state';
import { PokemonGrid } from '@/components/pokemon-grid';
import { SearchField } from '@/components/search-field';
import { Colors, Spacing } from '@/constants/theme';
import { useCatalogueSearch } from '@/hooks/use-catalogue-search';
import { useCompareSelection } from '@/hooks/use-compare-selection';
import { type CatalogueEntry, describeLoadError } from '@/services/pokeapi';
import { type CompareSlot, parseCompareSlot } from '@/utils/compare-stats';

/** Same field position as the List screen (Figma X=16), here 16 below the stack header. */
const SEARCH_FIELD_MARGIN = 16;
const SEARCH_FIELD_TOP = 16;
/** Same gap as the List screen between the field and the title or results. */
const LIST_TOP_GAP = 32;

export default function ComparePickerScreen() {
  const { slot } = useLocalSearchParams<{ slot: string }>();
  const compareSlot = parseCompareSlot(slot);

  if (compareSlot === null) {
    return (
      <ErrorState
        title="Slot not found"
        message="This link does not point to a Compare slot."
        retrying={false}
        onRetry={leave}
        actionLabel="Back"
      />
    );
  }
  return <Picker slot={compareSlot} />;
}

/** The complete catalogue with search; a tap puts the Pokémon in `slot` and goes back. */
function Picker({ slot }: { slot: CompareSlot }) {
  const { select } = useCompareSelection();
  const { catalogue, gridRef, rawQuery, changeQuery, isSearching, results } = useCatalogueSearch();
  // A second tap during the back animation must not select again or go back twice.
  const picked = useRef(false);

  function pick(entry: CatalogueEntry) {
    if (picked.current) return;
    picked.current = true;
    select(slot, entry);
    leave();
  }

  const listTop = (
    <View style={styles.listTop}>
      {!isSearching && (
        <AppText variant="title" style={styles.title}>
          Select Pokémon
        </AppText>
      )}
    </View>
  );

  return (
    // The stack header covers the top; the bottom keeps the last row above the home indicator.
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <View style={styles.searchBar}>
        <SearchField value={rawQuery} onChangeText={changeQuery} />
      </View>
      {results !== undefined ? (
        <PokemonGrid
          ref={gridRef}
          pokemon={results}
          header={listTop}
          empty={<EmptyState title="No Pokémon found" />}
          onSelect={pick}
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

/** Back to Compare; opened from a link with nothing to go back to, go to Compare instead. */
function leave() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/compare');
  }
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
  title: {
    marginBottom: Spacing.gap,
  },
  stateContainer: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
  },
});
