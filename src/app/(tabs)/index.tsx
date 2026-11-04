import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { ErrorState, LoadingState } from '@/components/load-state';
import { PokemonGrid } from '@/components/pokemon-grid';
import { Colors, Spacing } from '@/constants/theme';
import { useCatalogue } from '@/hooks/use-catalogue';
import { describeLoadError } from '@/services/pokeapi';

export default function PokemonListScreen() {
  const catalogue = useCatalogue();
  const title = (
    <AppText variant="title" style={styles.title}>
      All Pokémon
    </AppText>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {catalogue.data !== undefined ? (
        <PokemonGrid pokemon={catalogue.data} header={title} />
      ) : (
        <View style={styles.stateContainer}>
          {title}
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
  // Interim top spacing (screen padding token): the Figma Y=140 includes the search field from #3.
  title: {
    paddingTop: Spacing.screen,
  },
  stateContainer: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
  },
});
