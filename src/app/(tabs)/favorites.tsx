import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { EmptyState, ErrorState, LoadingState, RefreshError } from '@/components/load-state';
import { PokemonGrid } from '@/components/pokemon-grid';
import { Colors, Spacing } from '@/constants/theme';
import { useFavorites } from '@/hooks/use-favorites';

export default function FavoritesScreen() {
  // Reads only SQLite, so the screen also works while the catalogue fails.
  const favorites = useFavorites();

  const title = (
    <AppText variant="title" style={styles.title}>
      My favorites
    </AppText>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {favorites.data !== undefined ? (
        <PokemonGrid
          pokemon={favorites.data}
          header={
            <View style={styles.listTop}>
              {title}
              {/* A refresh failed: the old list stays visible, marked as possibly outdated. */}
              {favorites.isError && (
                <RefreshError
                  message="Could not refresh favorites. The list may be out of date."
                  retrying={favorites.isFetching}
                  onRetry={() => favorites.refetch()}
                />
              )}
            </View>
          }
          empty={
            <EmptyState
              title="No favorites yet"
              message="Tap ⋮ on a Pokémon and choose Add to favorites."
            />
          }
        />
      ) : (
        <View style={styles.stateContainer}>
          <View style={styles.listTop}>{title}</View>
          {favorites.isError ? (
            <ErrorState
              title="Could not load favorites"
              message="Could not read the favorites saved on this phone."
              retrying={favorites.isFetching}
              onRetry={() => favorites.refetch()}
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
  // Assumption (favorites.md): the Favorites mockup was not measured; the title starts 24 below
  // the safe area until it is compared with the design.
  listTop: {
    paddingTop: Spacing.screen,
  },
  // Figma (Home): 16 between the title and the first row.
  title: {
    marginBottom: Spacing.gap,
  },
  stateContainer: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
  },
});
