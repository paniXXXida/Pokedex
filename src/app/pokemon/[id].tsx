import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { Colors } from '@/constants/theme';
import { parsePokemonId } from '@/utils/pokemon-id';

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokemonId = parsePokemonId(id);

  if (pokemonId === null) {
    return (
      <ScreenPlaceholder title="Pokémon not found" note="This link does not point to a Pokémon.">
        <Pressable accessibilityRole="button" onPress={goBack}>
          <AppText variant="medium" style={styles.link}>
            Back
          </AppText>
        </Pressable>
      </ScreenPlaceholder>
    );
  }

  return <ScreenPlaceholder title={`Pokémon ${pokemonId}`} note="Details come in issue #5." />;
}

/** Opened from a link with nothing to go back to: go to the catalogue instead. */
function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

const styles = StyleSheet.create({
  link: {
    color: Colors.purple,
  },
});
